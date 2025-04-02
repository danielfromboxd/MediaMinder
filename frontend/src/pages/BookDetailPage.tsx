import React, { useEffect, useState, useRef } from 'react';
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
  const coverUrlRef = useRef<string | null>(null);

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
        
        // NEW CODE: Extract cover ID from posterPath if present
        if (trackedBook.posterPath && trackedBook.posterPath.includes('/b/id/')) {
          const coverId = trackedBook.posterPath.split('/b/id/')[1].split('-')[0];
          setBook(prev => ({
            ...prev,
            cover_i: coverId
          }));
        }
        
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
          
          // NEW CODE: Make an additional API call to get editions (which contain cover info)
          if (bookDetails) {
            try {
              const editionsUrl = `https://openlibrary.org${bookDetails.key}/editions.json?limit=1`;
              console.log("Fetching editions for cover info:", editionsUrl);
              
              const editionsResponse = await fetch(editionsUrl);
              if (editionsResponse.ok) {
                const editionsData = await editionsResponse.json();
                
                if (editionsData.entries && editionsData.entries.length > 0) {
                  const firstEdition = editionsData.entries[0];
                  
                  // Add cover information from the edition
                  if (firstEdition.covers && firstEdition.covers.length > 0) {
                    bookDetails.cover_i = firstEdition.covers[0];
                    console.log("Found cover ID:", firstEdition.covers[0]);
                  }
                  
                  if (firstEdition.cover_i) {
                    bookDetails.cover_i = firstEdition.cover_i;
                    console.log("Found edition cover_i:", firstEdition.cover_i);
                  }
                }
              }
            } catch (editionError) {
              console.error("Failed to fetch edition data for covers:", editionError);
            }
            
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
    
    const originalCoverId = book.cover_i; // Store this to preserve it
    
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
        // Update the book object with the new status AND preserve cover_i
        setBook(prev => ({
          ...prev,
          status: newItem.status,
          cover_i: originalCoverId // Make sure to preserve the cover ID
        }));
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

  if (book?.cover_i && !coverUrlRef.current) {
    coverUrlRef.current = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
    console.log("Set permanent cover URL:", coverUrlRef.current);
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
              {coverUrlRef.current ? (
                <img 
                  src={coverUrlRef.current}
                  alt={book.title}
                  className="w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.style.display = 'none';
                    document.getElementById('cover-placeholder')!.style.display = 'flex';
                  }}
                />
              ) : (
                <div 
                  id="cover-placeholder"
                  className="bg-gray-100 h-[450px] flex items-center justify-center"
                >
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
          
          {/* Book details */}
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            
            {/* Author information - show name from either source */}
            {(book.author_name || book.authors) && (
              <div className="mb-4">
                <h3 className="font-semibold">Author(s)</h3>
                <p>{book.author_name ? book.author_name.join(', ') : 'Unknown'}</p>
              </div>
            )}
            
            {/* Publication date with standardized wording */}
            {(book.first_publish_date || book.publish_date || book.first_publish_year) && (
              <div className="mb-4">
                <h3 className="font-semibold">First Published</h3>
                <p>
                  {book.first_publish_date || 
                   (book.publish_date && (Array.isArray(book.publish_date) ? book.publish_date[0] : book.publish_date)) ||
                   book.first_publish_year}
                </p>
              </div>
            )}
            
            {/* Publisher information */}
            {book.publisher && (
              <div className="mb-4">
                <h3 className="font-semibold">Publisher</h3>
                <p>{Array.isArray(book.publisher) ? book.publisher.join(', ') : book.publisher}</p>
              </div>
            )}
            
            {/* Subjects display */}
            {(book.subjects?.length > 0) && (
              <div className="mb-4">
                <h3 className="font-semibold">Subjects</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {book.subjects.slice(0, 10).map((subject: string, i: number) => (
                    <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {subject}
                    </span>
                  ))}
                  {book.subjects.length > 10 && (
                    <span className="text-xs text-gray-500">+{book.subjects.length - 10} more</span>
                  )}
                </div>
              </div>
            )}
            
            {/* Debug information - keep this for development */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-sm mb-2">Available Book Data (Debug):</h3>
              <details>
                <summary className="text-xs text-blue-500 cursor-pointer">Show Raw Data</summary>
                <pre className="text-xs overflow-x-auto mt-2">
                  {JSON.stringify(book, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
