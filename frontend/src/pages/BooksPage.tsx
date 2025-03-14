import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchInput from '@/components/SearchInput';
import { Button } from "@/components/ui/button";
import { useBookSearch } from '@/hooks/useOpenLibrary';
import { getBookCoverUrl } from '@/services/openLibraryService';
import { useMediaTracking, MediaStatus } from '@/contexts/MediaTrackingContext';
import { toast } from '@/components/ui/use-toast';
import StarRating from '@/components/StarRating';
import { PlusCircle, Trash2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MediaStatusBadge from '@/components/MediaStatusBadge';

const BooksPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  
  const { data, isLoading, error } = useBookSearch(searchQuery, isSearching);
  const { 
    addMedia, 
    updateMediaStatus, 
    updateMediaRating, 
    removeMedia, 
    isMediaTracked, 
    getTrackedMediaItem 
  } = useMediaTracking();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
  };

  const handleBookClick = (book: any) => {
    setSelectedBook(book);
  };

  const closeDialog = () => {
    setSelectedBook(null);
  };

  const handleAddBook = (book: any, status: MediaStatus) => {
    // For books, we need to modify the book object to include cover_i as poster_path for tracking
    const bookWithPoster = {
      ...book,
      poster_path: book.cover_i
    };
    addMedia(bookWithPoster, 'book', status);
    toast({
      title: "Book added",
      description: `${book.title} has been added to your ${status.replace('_', ' ')} list.`,
    });
  };

  const handleUpdateStatus = (bookId: string, status: MediaStatus) => {
    updateMediaStatus(bookId, status);
    toast({
      title: "Status updated",
      description: `Book status has been updated to ${status.replace('_', ' ')}.`,
    });
  };

  const handleUpdateRating = (bookId: string, rating: number) => {
    updateMediaRating(bookId, rating);
    toast({
      title: "Rating updated",
      description: `You rated this book ${rating} out of 5 stars.`,
    });
  };

  const handleRemoveBook = (bookId: string, title: string) => {
    removeMedia(bookId);
    toast({
      title: "Book removed",
      description: `${title} has been removed from your collection.`,
      variant: "destructive",
    });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Books</h1>
        
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for books..."
              />
            </div>
            <Button type="submit" disabled={searchQuery.length < 3}>
              Search
            </Button>
          </div>
        </form>
        
        {isLoading && (
          <div className="text-center py-8">
            <p>Loading books...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <p className="text-red-500">Error: {error.message}</p>
          </div>
        )}
        
        {data && data.docs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.docs.map((book) => {
              const isTracked = isMediaTracked(book.key, 'book');
              const trackedItem = isTracked ? getTrackedMediaItem(book.key, 'book') : null;
              
              return (
                <div 
                  key={book.key} 
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div 
                    className="h-48 bg-gray-100 flex items-center justify-center cursor-pointer relative"
                    onClick={() => handleBookClick(book)}
                  >
                    {book.cover_i ? (
                      <img 
                        src={getBookCoverUrl(book.cover_i)} 
                        alt={book.title}
                        className="h-full object-contain"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm p-4 text-center">No cover available</div>
                    )}
                    
                    {trackedItem && (
                      <div className="absolute top-2 right-2">
                        <MediaStatusBadge status={trackedItem.status} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 
                      className="font-semibold text-lg line-clamp-1 cursor-pointer"
                      onClick={() => handleBookClick(book)}
                    >
                      {book.title}
                    </h3>
                    {book.author_name && (
                      <p className="text-gray-600 text-sm line-clamp-1">
                        By {book.author_name.join(', ')}
                      </p>
                    )}
                    {book.first_publish_year && (
                      <p className="text-gray-500 text-xs mt-1">
                        Published: {book.first_publish_year}
                      </p>
                    )}
                    
                    {trackedItem ? (
                      <div className="mt-3 space-y-2">
                        {trackedItem.rating && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Your rating:</span>
                            <StarRating rating={trackedItem.rating} size="sm" />
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleBookClick(book)}
                          >
                            Details
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRemoveBook(trackedItem.id, book.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        className="w-full mt-3" 
                        size="sm"
                        onClick={() => handleAddBook(book, 'want_to_view')}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" /> Add to collection
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !isLoading && (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              {isSearching ? (
                <p className="text-gray-500">No books found. Try a different search term.</p>
              ) : (
                <p className="text-gray-500">Search for books to start tracking your reading!</p>
              )}
            </div>
          )
        )}
        
        {/* Book Details Dialog */}
        <Dialog open={selectedBook !== null} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="sm:max-w-3xl">
            {selectedBook && (
              <div className="max-h-[80vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl">{selectedBook.title}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3 flex-shrink-0">
                    {selectedBook.cover_i ? (
                      <img 
                        src={getBookCoverUrl(selectedBook.cover_i, "L")} 
                        alt={selectedBook.title}
                        className="w-full rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-400">No cover available</p>
                      </div>
                    )}
                    
                    {/* Book tracking controls */}
                    <div className="mt-4 space-y-4">
                      {isMediaTracked(selectedBook.key, 'book') ? (
                        <>
                          {/* Status selector */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Status:</label>
                            <Select 
                              defaultValue={getTrackedMediaItem(selectedBook.key, 'book')?.status}
                              onValueChange={(value) => handleUpdateStatus(
                                `book_${selectedBook.key}`, 
                                value as MediaStatus
                              )}
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
                          
                          {/* Rating control */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Your Rating:</label>
                            <StarRating 
                              rating={getTrackedMediaItem(selectedBook.key, 'book')?.rating || 0} 
                              onChange={(rating) => handleUpdateRating(`book_${selectedBook.key}`, rating)}
                            />
                          </div>
                          
                          {/* Remove button */}
                          <Button 
                            variant="destructive" 
                            className="w-full"
                            onClick={() => {
                              handleRemoveBook(`book_${selectedBook.key}`, selectedBook.title);
                              closeDialog();
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove from collection
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            className="w-full" 
                            onClick={() => handleAddBook(selectedBook, 'want_to_view')}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" /> Add to Want to Read
                          </Button>
                          <Button 
                            className="w-full"
                            variant="outline"
                            onClick={() => handleAddBook(selectedBook, 'in_progress')}
                          >
                            Add as Reading
                          </Button>
                          <Button 
                            className="w-full"
                            variant="outline" 
                            onClick={() => handleAddBook(selectedBook, 'finished')}
                          >
                            Add as Finished
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="md:w-2/3">
                    <div className="space-y-4">
                      {selectedBook.author_name && (
                        <div>
                          <h3 className="font-semibold">Author(s)</h3>
                          <p>{selectedBook.author_name.join(', ')}</p>
                        </div>
                      )}
                      
                      {selectedBook.first_publish_year && (
                        <div>
                          <h3 className="font-semibold">First Published</h3>
                          <p>{selectedBook.first_publish_year}</p>
                        </div>
                      )}
                      
                      {selectedBook.publisher && (
                        <div>
                          <h3 className="font-semibold">Publisher</h3>
                          <p>{Array.isArray(selectedBook.publisher) ? selectedBook.publisher.join(', ') : selectedBook.publisher}</p>
                        </div>
                      )}
                      
                      {selectedBook.subject && (
                        <div>
                          <h3 className="font-semibold">Subjects</h3>
                          <div className="flex flex-wrap gap-1">
                            {selectedBook.subject.slice(0, 10).map((subject: string, i: number) => (
                              <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {subject}
                              </span>
                            ))}
                            {selectedBook.subject.length > 10 && (
                              <span className="text-xs text-gray-500">+{selectedBook.subject.length - 10} more</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* If we have more detailed info about the book */}
                      {selectedBook.description && (
                        <div>
                          <h3 className="font-semibold">Description</h3>
                          <p className="text-gray-700">
                            {typeof selectedBook.description === 'string' 
                              ? selectedBook.description 
                              : Array.isArray(selectedBook.description)
                                ? selectedBook.description[0]
                                : selectedBook.description.value || 'No description available.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BooksPage;
