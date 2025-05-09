import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchInput from '@/components/SearchInput';
import { Button } from "@/components/ui/button";
import { useBookSearch } from '@/hooks/useOpenLibrary';
import { getBookCoverUrl, getBookDetails } from '@/services/openLibraryService';
import { useMediaTracking, MediaStatus } from '@/contexts/MediaTrackingContext';
import { toast } from '@/components/ui/use-toast';
import StarRating from '@/components/StarRating';
import { PlusCircle, Trash2, X, Book } from "lucide-react";
import { getStatusDisplayText } from '@/utils/statusUtils';
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
  const [ratingUpdateCounter, setRatingUpdateCounter] = useState(0);
  const [detailedBookData, setDetailedBookData] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [bookCache, setBookCache] = useState<Record<string, any>>({});

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

  const handleBookClick = async (book: any) => {
    setSelectedBook(book);
    setIsLoadingDetails(true);
    
    // Show the dialog immediately with basic information
    setDetailedBookData({
      ...book,
      // Use any data we already have
      title: book.title,
      author_name: book.author_name || [],
      cover_i: book.cover_i
    });
    
    try {
      // Get the full book ID
      const bookId = book.key;
      console.log("Fetching details for:", bookId);
      
      // Load the full details in the background
      getBookDetails(bookId)
        .then(bookDetails => {
          setDetailedBookData(prev => ({
            ...prev,
            ...bookDetails,
            // Preserve the search data fields that might be more reliable
            title: prev.title || bookDetails.title,
            author_name: prev.author_name || bookDetails.author_name,
            cover_i: prev.cover_i || bookDetails.cover_i
          }));
          setIsLoadingDetails(false);
        })
        .catch(err => {
          console.error("Failed to load details:", err);
          setIsLoadingDetails(false);
        });
    } catch (error) {
      console.error("Error setting up book details fetch:", error);
      setIsLoadingDetails(false);
    }
  };

  const closeDialog = () => {
    setSelectedBook(null);
    setDetailedBookData(null);
  };

  const handleAddBook = async (book: any, status: MediaStatus) => {
    // Store all possible cover sources
    const bookWithCoverData = {
      ...book,
      // Store cover IDs in posterPath for backward compatibility
      poster_path: book.cover_i || (book.cover_edition_key ? `olid:${book.cover_edition_key}` : null),
      // Store raw cover data for better cover loading
      coverData: JSON.stringify({
        cover_i: book.cover_i,
        cover_edition_key: book.cover_edition_key,
        isbn: book.isbn
      })
    };
    
    // Await the addMedia operation
    await addMedia(bookWithCoverData, 'book', status);
    
    toast({
      title: "Book added",
      description: `${book.title} has been added to your ${getStatusDisplayText(status, 'book')} list.`,
    });
    
    // Force a re-render by updating the ratingUpdateCounter
    setRatingUpdateCounter(prev => prev + 1);
  };

  const handleUpdateStatus = (bookId: string, status: MediaStatus) => {
    updateMediaStatus(bookId, status);
    toast({
      title: "Status updated",
      description: `Book status has been updated to ${getStatusDisplayText(status, 'book')}.`,
    });
  };

  const handleUpdateRating = async (bookId: string, rating: number) => {
    // Always ensure the proper full ID format for books
    const fullBookId = bookId.includes('_') ? bookId : `book_${selectedBook.key}`;
    
    console.log(`Rating book: ${fullBookId} with rating: ${rating}`);
    
    try {
      // If not already tracked, add with 'none' status
      if (!isMediaTracked(selectedBook.key, 'book')) {
        // Book isn't tracked, add it first
        console.log("Book not tracked, adding first");
        
        // Add the book and wait for it to complete
        await addMedia(selectedBook, 'book', 'none');
      }
      
      // Get the tracked item to ensure we have the correct ID
      const trackedItem = getTrackedMediaItem(selectedBook.key, 'book');
      
      if (!trackedItem) {
        console.error("Tracked item not found after adding/checking");
        toast({
          title: "Error",
          description: "Failed to update rating. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Use the tracked item's ID to update the rating
      const mediaId = trackedItem.id;
      
      // Update rating (always use await)
      await updateMediaRating(mediaId, rating);
      
      // Force refresh by incrementing counter
      setRatingUpdateCounter(prev => prev + 1);
      
      toast({
        title: "Rating updated",
        description: `You rated this book ${rating} out of 5 stars.`,
      });
    } catch (err) {
      console.error("Error rating book:", err);
      toast({
        title: "Error",
        description: "Failed to update rating. Please try again.",
        variant: "destructive",
      });
    }
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
            {data.docs.map((book) => {
              const isTracked = isMediaTracked(book.key, 'book');
              const trackedItem = isTracked ? getTrackedMediaItem(book.key, 'book') : null;
              
              return (
                <div 
                  key={book.key} 
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div 
                    className="aspect-ratio-[2/3] w-full bg-gray-100 flex items-center justify-center cursor-pointer relative"
                    onClick={() => handleBookClick(book)}
                  >
                    {book.cover_i ? (
                      <img 
                        src={getBookCoverUrl(book.cover_i)} 
                        alt={book.title}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <img 
                        src="https://placehold.co/233x350/F3F4F6/ABB1BC?text=No+cover+available" 
                        alt="No cover available"
                        className="h-full w-full object-contain"
                      />
                    )}
                    
                    {trackedItem && (
                      <div className="absolute top-2 right-2">
                        <MediaStatusBadge status={trackedItem.status} mediaType="book" />
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
                        <PlusCircle className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline md:hidden">Add</span>
                        <span className="hidden md:inline lg:hidden xl:inline">Add to list</span>
                        <span className="inline sm:hidden lg:inline xl:hidden">Add</span>
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
                  <div className="flex justify-between items-start">
                    <DialogTitle className="text-2xl">{selectedBook.title}</DialogTitle>
                  </div>
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
                                <SelectItem value="in_progress">Currently Reading</SelectItem>
                                <SelectItem value="finished">Finished Reading</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Rating control */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Your Rating:</label>
                            <StarRating 
                              key={`rating-${ratingUpdateCounter}`}
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
                          {/* Single add button with dropdown */}
                          <div className="space-y-2">
                            <p className="text-sm text-gray-500">Add this book to your collection to rate it</p>
                            <Select 
                              onValueChange={(status) => {
                                handleAddBook(selectedBook, status as MediaStatus);
                                // Force refresh after adding
                                setRatingUpdateCounter(prev => prev + 1);
                              }}
                            >
                              <SelectTrigger>
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
                    <div className="space-y-4">
                      {/* Author information - always visible immediately */}
                      {(detailedBookData?.author_name || selectedBook.author_name) && (
                        <div>
                          <h3 className="font-semibold">Author(s)</h3>
                          <p>{(detailedBookData?.author_name || selectedBook.author_name).join(', ')}</p>
                        </div>
                      )}
                      
                      {/* Publication date - always visible immediately */}
                      {(selectedBook.first_publish_year) && (
                        <div>
                          <h3 className="font-semibold">First Published</h3>
                          <p>{selectedBook.first_publish_year}</p>
                        </div>
                      )}
                      
                      {/* Loading indicator for additional details */}
                      {isLoadingDetails && (
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2"></div>
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6"></div>
                        </div>
                      )}
                      
                      {/* Additional details that load later */}
                      {!isLoadingDetails && (
                        <>
                          {/* Updated publish date with full info */}
                          {(detailedBookData?.first_publish_date || detailedBookData?.publish_date) && (
                            <div>
                              <h3 className="font-semibold">First Published</h3>
                              <p>
                                {detailedBookData?.first_publish_date || 
                                 (detailedBookData?.publish_date && (Array.isArray(detailedBookData.publish_date) ? 
                                   detailedBookData.publish_date[0] : detailedBookData.publish_date))}
                              </p>
                            </div>
                          )}
                          
                          {/* Publisher information */}
                          {detailedBookData?.publisher && (
                            <div>
                              <h3 className="font-semibold">Publisher</h3>
                              <p>{Array.isArray(detailedBookData.publisher) ? 
                                detailedBookData.publisher.join(', ') : 
                                detailedBookData.publisher}</p>
                            </div>
                          )}
                          
                          {/* Subjects display */}
                          {(detailedBookData?.subjects || detailedBookData?.subject) && (
                            <div>
                              <h3 className="font-semibold">Subjects</h3>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(detailedBookData?.subjects || detailedBookData?.subject || [])
                                  .slice(0, 10)
                                  .map((subject: string, i: number) => (
                                    <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                      {subject}
                                    </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Description */}
                          {detailedBookData?.description && (
                            <div>
                              <h3 className="font-semibold">Description</h3>
                              <p className="text-gray-700">
                                {typeof detailedBookData.description === 'string' 
                                  ? detailedBookData.description 
                                  : detailedBookData.description.value || 'No description available.'}
                              </p>
                            </div>
                          )}
                        </>
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
