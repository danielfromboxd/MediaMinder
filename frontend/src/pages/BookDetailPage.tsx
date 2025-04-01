import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { useMediaTracking, MediaStatus } from '@/contexts/MediaTrackingContext';
import { getImageUrl } from '@/services/tmdbService';
import StarRating from '@/components/StarRating';
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getStatusDisplayText } from '@/utils/statusUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OpenLibraryBook, getBookDetails, getBookCoverUrl } from '@/services/openLibraryService';

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingUpdateCounter, setRatingUpdateCounter] = useState(0); // Add this line

  const { 
    getAllMedia, 
    addMedia, 
    updateMediaStatus, 
    updateMediaRating, 
    removeMedia, 
    isMediaTracked, 
    getTrackedMediaItem,
    trackedMedia // Add to get trackedMedia for dependencies
  } = useMediaTracking();

  useEffect(() => {
    const fetchBookDetails = async () => {
      // Find the book in our tracked media
      const allMedia = getAllMedia();
      let decodedId = id;
      
      // Handle URL-encoded IDs from OpenLibrary (like %2Fworks%2FOL123W)
      if (id && id.includes('%')) {
        decodedId = decodeURIComponent(id);
      }
      
      // Try multiple ways to match the book
      const trackedBook = allMedia.find(media => 
        media.type === 'book' && (
          media.mediaId.toString() === id || 
          media.mediaId.toString() === decodedId ||
          (media.mediaId.toString().includes('/') && media.mediaId.toString().split('/').pop() === id) ||
          media.id === id
        )
      );
      
      if (trackedBook) {
        // Properly format the book object with the ID that isMediaTracked expects
        setBook({
          ...trackedBook,
          key: trackedBook.mediaId
        });
        setLoading(false);
      } else {
        // FETCH FROM API DIRECTLY
        try {
          // Clean up the ID
          let bookId = id;
          
          // Handle book_OL12345W format from New This Quarter
          if (typeof bookId === 'string' && bookId.includes('book_')) {
            bookId = bookId.replace('book_', '');
          }
          
          // If it looks like an OpenLibrary ID without the /works/ prefix, add it back
          if (typeof bookId === 'string' && !bookId.includes('/') && bookId.match(/^OL\d+W$/)) {
            bookId = `/works/${bookId}`;
            console.log("Reformatted to OpenLibrary path:", bookId);
          }
          
          console.log("Fetching book details for:", bookId);
          const bookDetails = await getBookDetails(bookId);
          
          if (bookDetails) {
            setBook(bookDetails);
            setLoading(false);
          } else {
            setError("Book not found");
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching book details:", error);
          setError("Failed to load book details");
          setLoading(false);
        }
      }
    };
    
    fetchBookDetails();
  }, [id, getAllMedia, trackedMedia, ratingUpdateCounter]); // Add trackedMedia and ratingUpdateCounter deps

  const isTracked = book ? isMediaTracked(book.key, 'book') : false;
  const trackedItem = isTracked ? getTrackedMediaItem(book?.key, 'book') : null;

  const handleAddBook = async (status: MediaStatus) => {
    if (!book) return;
    
    const bookData = {
      ...book,
      poster_path: book.cover_i || book.cover_edition_key
    };
    
    const success = await addMedia(bookData, 'book', status);
    
    // Update the local state immediately to reflect tracked status
    if (success) {
      // Get the newly added item
      const newItem = getTrackedMediaItem(book.key, 'book');
      
      if (newItem) {
        // Update the book object with the new status
        setBook({
          ...book,
          status: newItem.status
        });
      }
      
      toast({
        title: "Book added",
        description: `${book.title} has been added to your ${getStatusDisplayText(status, 'book')} list.`,
      });
    }
  };

  const handleUpdateStatus = (status: MediaStatus) => {
    if (!trackedItem) return;
    
    updateMediaStatus(trackedItem.id, status);
    toast({
      title: "Status updated",
      description: `Book status has been updated to ${getStatusDisplayText(status, 'book')}.`,
    });
  };

  // Updated rating handler that works for both tracked and untracked books
  const handleUpdateRating = (rating: number) => {
    if (!book) return;
    
    // If not tracked yet, add with 'none' status first
    if (!isTracked) {
      const bookData = {
        ...book,
        poster_path: book.cover_i || book.cover_edition_key
      };
      
      const success = addMedia(bookData, 'book', 'none');
      if (!success) return;
      
      // Get the newly created ID
      const bookId = `book_${book.key}`;
      updateMediaRating(bookId, rating);
    } else if (trackedItem) {
      updateMediaRating(trackedItem.id, rating);
    }
    
    // Force refresh
    setRatingUpdateCounter(prev => prev + 1);
    
    toast({
      title: "Rating updated",
      description: `You rated this book ${rating} out of 5 stars.`,
    });
  };

  const handleRemoveBook = () => {
    if (!trackedItem) return;
    
    removeMedia(trackedItem.id);
    toast({
      title: "Book removed",
      description: `${book?.title} has been removed from your collection.`,
      variant: "destructive",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8">
          <p>Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-500">{error || "Book not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <div className="rounded-lg overflow-hidden shadow-md">
              {book.cover_edition_key ? (
                <img 
                  src={`https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-L.jpg`}
                  alt={book.title}
                  className="w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                  }}
                />
              ) : (
                <div className="bg-gray-100 h-[450px] flex items-center justify-center">
                  <p className="text-gray-400">No poster available</p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              {isTracked ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status:</label>
                    <Select 
                      defaultValue={trackedItem?.status}
                      onValueChange={(value) => handleUpdateStatus(value as MediaStatus)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="want_to_view">Want to Read</SelectItem>
                        <SelectItem value="in_progress">Currently Reading</SelectItem>
                        <SelectItem value="finished">Finished Reading</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Rating:</label>
                    <StarRating 
                      key={`book-rating-${ratingUpdateCounter}`}
                      rating={trackedItem?.rating || 0} 
                      onChange={handleUpdateRating}
                    />
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleRemoveBook}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove from collection
                  </Button>
                </>
              ) : (
                <>
                  {/* Add to collection dropdown */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Add this book to your collection to rate it</p>
                    <Select 
                      onValueChange={(status) => {
                        handleAddBook(status as MediaStatus);
                        setRatingUpdateCounter(prev => prev + 1);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Add to collection..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="want_to_view">Want to Read</SelectItem>
                        <SelectItem value="in_progress">Currently Reading</SelectItem>
                        <SelectItem value="finished">Finished Reading</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Disabled rating component */}
                  <div className="space-y-2 opacity-50">
                    <label className="text-sm font-medium">Your Rating:</label>
                    <StarRating rating={0} onChange={() => {}} />
                    <p className="text-xs text-gray-500">Add to collection first to rate</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            
            {book.authors && (
              <p className="text-gray-500 mb-6">
                Author: {book.authors.map((author: any) => author.name).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
