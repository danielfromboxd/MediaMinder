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
import { OpenLibraryBook } from '@/services/openLibraryService';

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { 
    getAllMedia, 
    addMedia, 
    updateMediaStatus, 
    updateMediaRating, 
    removeMedia, 
    isMediaTracked, 
    getTrackedMediaItem 
  } = useMediaTracking();

  useEffect(() => {
    // Find the book in our tracked media
    const allMedia = getAllMedia();
    // Accessing the mediaId property instead of key in the comparison:
    const trackedBook = allMedia.find(
      media => media.type === 'book' && 
      (media.id === id || media.mediaId === id)
    );
    
    if (trackedBook) {
      setBook(trackedBook);
      setLoading(false);
    } else {
      // For non-tracked books or popular items, create a placeholder
      const popularBooks = [
        {
          key: '/works/OL28447W',
          title: 'The Lord of the Rings',
          type: 'book',
          cover_edition_key: 'OL33929523M',
          authors: [{ key: '/authors/OL23919A', name: 'J.R.R. Tolkien' }],
        },
        {
          key: '/works/OL1567994W',
          title: 'Pride and Prejudice',
          type: 'book',
          cover_edition_key: 'OL17242841M',
          authors: [{ key: '/authors/OL23699A', name: 'Jane Austen' }],
        },
        {
          key: '/works/OL12429287W',
          title: 'To Kill a Mockingbird',
          type: 'book',
          cover_edition_key: 'OL35583357M',
          authors: [{ key: '/authors/OL34182A', name: 'Harper Lee' }],
        }
      ];
      
      const popularBook = popularBooks.find(b => 
        b.key === id || 
        b.cover_edition_key === id
      );
      
      if (popularBook) {
        setBook(popularBook);
        setLoading(false);
      } else {
        setError("Book not found");
        setLoading(false);
      }
    }
  }, [id, getAllMedia]);

  const isTracked = book ? isMediaTracked(book.key, 'book') : false;
  const trackedItem = isTracked ? getTrackedMediaItem(book?.key, 'book') : null;

  const handleAddBook = (status: MediaStatus) => {
    if (!book) return;
    
    addMedia({
      ...book,
      poster_path: book.cover_edition_key
    }, 'book', status);
    
    toast({
      title: "Book added",
      description: `${book.title} has been added to your ${getStatusDisplayText(status, 'book')} list.`,
    });
  };

  const handleUpdateStatus = (status: MediaStatus) => {
    if (!trackedItem) return;
    
    updateMediaStatus(trackedItem.id, status);
    toast({
      title: "Status updated",
      description: `Book status has been updated to ${getStatusDisplayText(status, 'book')}.`,
    });
  };

  const handleUpdateRating = (rating: number) => {
    if (!trackedItem) return;
    
    updateMediaRating(trackedItem.id, rating);
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="want_to_view">Want to Read</SelectItem>
                        <SelectItem value="in_progress">Reading</SelectItem>
                        <SelectItem value="finished">Finished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Rating:</label>
                    <StarRating 
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
                  <Button 
                    className="w-full" 
                    onClick={() => handleAddBook('want_to_view')}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" /> Add to Want to Read
                  </Button>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => handleAddBook('in_progress')}
                  >
                    Add as Reading
                  </Button>
                  <Button 
                    className="w-full"
                    variant="outline" 
                    onClick={() => handleAddBook('finished')}
                  >
                    Add as Finished
                  </Button>
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
