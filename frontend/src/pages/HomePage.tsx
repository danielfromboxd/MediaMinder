import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Link } from 'react-router-dom';
import { Book, Tv, Film, Search, EyeIcon, BookOpenIcon, CheckIcon, Sparkles, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { useMediaTracking } from '@/contexts/MediaTrackingContext';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl, getRecentMovies, getRecentTVShows } from '@/services/tmdbService';
import { getBookCoverUrl, getRecentBooks } from '@/services/openLibraryService';
import MediaStatusBadge from '@/components/MediaStatusBadge';
import StarRating from '@/components/StarRating';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


const HomePage = () => {
  const { isLoggedIn, user } = useAuth();
  const { getMediaByStatus, getAllMedia } = useMediaTracking();
  
  const wantToViewMedia = getMediaByStatus('want_to_view');
  const inProgressMedia = getMediaByStatus('in_progress');
  const finishedMedia = getMediaByStatus('finished');
  
  const bookCount = isLoggedIn ? getMediaByStatus('want_to_view').filter(m => m.type === 'book').length + 
                               getMediaByStatus('in_progress').filter(m => m.type === 'book').length + 
                               getMediaByStatus('finished').filter(m => m.type === 'book').length : 0;
  
  const seriesCount = isLoggedIn ? getMediaByStatus('want_to_view').filter(m => m.type === 'tvshow').length + 
                                 getMediaByStatus('in_progress').filter(m => m.type === 'tvshow').length + 
                                 getMediaByStatus('finished').filter(m => m.type === 'tvshow').length : 0;
  
  const moviesCount = isLoggedIn ? getMediaByStatus('want_to_view').filter(m => m.type === 'movie').length + 
                                 getMediaByStatus('in_progress').filter(m => m.type === 'movie').length + 
                                 getMediaByStatus('finished').filter(m => m.type === 'movie').length : 0;

  const generateRecommendedMedia = () => {
    const allMedia = getAllMedia();
    if (allMedia.length === 0) {
      return [
        {
          id: 'rec-1',
          title: 'The Hunger Games',
          type: 'book',
          posterPath: '12646537',
          popularity: 9.8
        },
        {
          id: 'rec-2',
          title: 'Brooklyn Nine-Nine',
          type: 'tvshow',
          posterPath: '/qYjAdP0n62dJ9WLl8WGeQj7CGPH.jpg',
          popularity: 9.5
        },
        {
          id: 'rec-3',
          title: 'Inception',
          type: 'movie',
          posterPath: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
          popularity: 9.7
        },
        {
          id: 'rec-4',
          title: 'The Great Gatsby',
          type: 'book',
          posterPath: '8436903',
          popularity: 9.2
        }
      ];
    }

    return allMedia
      .filter(media => media.rating && media.rating >= 4)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 4);
  };

  // Add state for popular media
  const [newQuarterItems, setNewQuarterItems] = useState<any[]>([]);
  const [isLoadingNewQuarter, setIsLoadingNewQuarter] = useState(true);

  // Add a state for controlling refresh
  const [forceRefresh, setForceRefresh] = useState(false);

  // Update the fetchNewItems function
  const fetchNewItems = async () => {
    setIsLoadingNewQuarter(true);
    try {
      // Get recently released/new media with force refresh parameter
      const [moviesData, showsData, booksData] = await Promise.all([
        getRecentMovies(forceRefresh),
        getRecentTVShows(forceRefresh),
        getRecentBooks(forceRefresh)
      ]);
      
      // Reset force refresh flag
      if (forceRefresh) setForceRefresh(false);
      
      // Format movies
      const formattedMovies = moviesData.map(movie => ({
        id: `movie_${movie.id}`,
        title: movie.title,
        type: 'movie',
        mediaType: 'movie',
        imageUrl: getImageUrl(movie.poster_path),
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      }));
      
      // Format TV shows
      const formattedShows = showsData.map(show => ({
        id: `tvshow_${show.id}`,
        title: show.name,
        type: 'tvshow',
        mediaType: 'tvshow',
        imageUrl: getImageUrl(show.poster_path),
        year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
      }));
      
      // Format books
      const formattedBooks = booksData.map(book => {
        // Get the work ID (for details page navigation)
        let bookId = '';
        if (book.key) {
          bookId = book.key.split('/').pop() || '';
        }
        
        return {
          id: `book_${bookId}`,
          title: book.title,
          type: 'book',
          mediaType: 'book',
          imageUrl: getBookCoverUrl(book, "M"),
          year: book.first_publish_year,
          cover_i: book.cover_i,
          cover_edition_key: book.cover_edition_key,
          key: book.key
        };
      });
      
      // Increase from 6 to 8 total items with balanced distribution
      const maxItems = 8; // Changed from 6 to 8
      let combined = [];
      
      // Target distribution: 2 books, 3 series, 3 movies
      // First, add up to 2 books
      const booksToAdd = Math.min(formattedBooks.length, 2);
      combined.push(...formattedBooks.slice(0, booksToAdd));
      
      // Then add up to 3 TV shows
      const showsToAdd = Math.min(formattedShows.length, 3);
      combined.push(...formattedShows.slice(0, showsToAdd));
      
      // Then add up to 3 movies
      const moviesToAdd = Math.min(formattedMovies.length, 3);
      combined.push(...formattedMovies.slice(0, moviesToAdd));
      
      // If we still don't have 8 items, fill with any available media
      const remainingSlots = maxItems - combined.length;
      if (remainingSlots > 0) {
        // Add any remaining books
        if (formattedBooks.length > booksToAdd) {
          const additionalBooks = Math.min(formattedBooks.length - booksToAdd, remainingSlots);
          combined.push(...formattedBooks.slice(booksToAdd, booksToAdd + additionalBooks));
        }
        
        // If still needed, add more shows
        const currentCount = combined.length;
        if (currentCount < maxItems && formattedShows.length > showsToAdd) {
          const additionalShows = Math.min(formattedShows.length - showsToAdd, maxItems - currentCount);
          combined.push(...formattedShows.slice(showsToAdd, showsToAdd + additionalShows));
        }
        
        // If still needed, add more movies
        const finalCount = combined.length;
        if (finalCount < maxItems && formattedMovies.length > moviesToAdd) {
          const additionalMovies = Math.min(formattedMovies.length - moviesToAdd, maxItems - finalCount);
          combined.push(...formattedMovies.slice(moviesToAdd, moviesToAdd + additionalMovies));
        }
      }
      
      // Sort by newest first
      combined = combined.sort((a, b) => {
        if (!a.year) return 1;
        if (!b.year) return -1;
        return b.year - a.year;
      });
      
      // Make sure we stay under the max items
      setNewQuarterItems(combined.slice(0, maxItems));
    } catch (error) {
      console.error('Failed to fetch new items:', error);
      setNewQuarterItems([]);
    } finally {
      setIsLoadingNewQuarter(false);
    }
  };

  // Fetch new content when component mounts
  useEffect(() => {
    fetchNewItems();
  }, []);

  const recommendedMedia = isLoggedIn ? generateRecommendedMedia() : [];

  const getMediaImageSrc = (media: any) => {
    if (media.type === 'book') {
      // If we have cover_i directly available, use it first
      if (media.cover_i) {
        return getBookCoverUrl(media.cover_i);
      }
      
      // If we have posterPath formatted as a number, use it
      const numericPosterPath = parseInt(media.posterPath);
      if (!isNaN(numericPosterPath)) {
        return getBookCoverUrl(numericPosterPath);
      }
      
      // Try as a direct URL if it looks like a complete URL
      if (media.posterPath?.startsWith('http')) {
        return media.posterPath;
      }
      
      // Last resort: try to parse coverData
      try {
        if (media.coverData) {
          const coverData = JSON.parse(media.coverData);
          if (coverData.cover_i) {
            return getBookCoverUrl(coverData.cover_i);
          }
        }
      } catch (e) {
        console.warn("Failed to parse cover data", e);
      }
      
      // Final attempt with what we have
      return getBookCoverUrl(media.posterPath || media.cover_i || media);
    } else if ((media.type === 'movie' || media.type === 'tvshow') && media.posterPath) {
      return getImageUrl(media.posterPath);
    }
    return 'https://via.placeholder.com/150?text=No+Image';
  };

  const getMediaLink = (media: any) => {
    // Use the mediaId (external API ID) for linking to detail pages
    // If mediaId is not available, fall back to the current behavior
    let externalId = media.mediaId || media.id;
    
    // If it still has a prefix, strip it
    if (typeof externalId === 'string' && (
        externalId.includes('movie_') || 
        externalId.includes('book_') || 
        externalId.includes('tvshow_')
      )) {
      externalId = externalId.split('_')[1];
    }
    
    if (media.type === 'book') return `/books/detail/${externalId}`;
    if (media.type === 'movie') return `/movies/detail/${externalId}`;
    if (media.type === 'tvshow') return `/series/detail/${externalId}`;
    return '/home';
  };

  const renderMediaList = (mediaList: any[], title: string, icon: React.ReactNode) => {
    if (mediaList.length === 0) {
      return null;
    }

    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaList.map(media => (
            <Link 
              key={media.id} 
              to={getMediaLink(media)}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-40 bg-gray-100 flex items-center justify-center">
                {media.posterPath ? (
                  <img 
                    src={getMediaImageSrc(media)} 
                    alt={media.title}
                    className="h-full object-cover w-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="text-gray-400 text-sm p-4 text-center">No image available</div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-md line-clamp-1">{media.title}</h3>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-xs">
                    {media.type === 'book' ? 'Book' : media.type === 'movie' ? 'Movie' : 'TV Show'}
                  </div>
                  {media.rating && <StarRating rating={media.rating} size="sm" />}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/books" className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-200">
            <div className="flex items-center mb-4">
              <Book className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold">Books</h2>
            </div>
            <p className="text-gray-600">Track your reading progress and discover new books.</p>
            <div className="mt-4">
              <span className="text-2xl font-bold">{bookCount}</span> books in your collection
            </div>
            <div className="mt-4 flex items-center text-blue-500 text-sm font-medium">
              <Search className="h-4 w-4 mr-1" />
              Search OpenLibrary
            </div>
          </Link>
          
          <Link to="/series" className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-200">
            <div className="flex items-center mb-4">
              <Tv className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold">Series</h2>
            </div>
            <p className="text-gray-600">Keep up with your favorite TV shows and series.</p>
            <div className="mt-4">
              <span className="text-2xl font-bold">{seriesCount}</span> series in your watchlist
            </div>
            <div className="mt-4 flex items-center text-blue-500 text-sm font-medium">
              <Search className="h-4 w-4 mr-1" />
              Search TMDB
            </div>
          </Link>
          
          <Link to="/movies" className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-200">
            <div className="flex items-center mb-4">
              <Film className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold">Movies</h2>
            </div>
            <p className="text-gray-600">Organize your movie collection and watchlist.</p>
            <div className="mt-4">
              <span className="text-2xl font-bold">{moviesCount}</span> movies in your collection
            </div>
            <div className="mt-4 flex items-center text-blue-500 text-sm font-medium">
              <Search className="h-4 w-4 mr-1" />
              Search TMDB
            </div>
          </Link>
        </div>
        
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-red-500" />
              <h2 className="text-2xl font-semibold">New This Quarter</h2>
            </div>
            <button 
              onClick={() => {
                setForceRefresh(true);
                fetchNewItems();
              }}
              className="text-sm text-blue-500 hover:underline flex items-center"
              disabled={isLoadingNewQuarter}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </button>
          </div>
          {isLoadingNewQuarter ? (
            // Show loading skeleton while data is being fetched
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : newQuarterItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {newQuarterItems.map(media => (
                <Link 
                  key={media.id} 
                  to={getMediaLink(media)}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                    {media.imageUrl ? (
                      <img 
                        src={media.imageUrl} 
                        alt={media.title}
                        className="h-full object-cover w-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-sm p-4 text-center">No image available</div>
                    )}
                    {/* Release year */}
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {media.year || 'New'}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-md line-clamp-1">{media.title}</h3>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-xs flex items-center">
                        {media.type === 'book' ? 'Book' : media.type === 'movie' ? 'Movie' : 'TV Show'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // If API calls failed, show a message
            <p className="text-gray-500">Unable to load new content. Please try again later.</p>
          )}
        </div>
        
        {isLoggedIn && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-amber-500" />
              <h2 className="text-2xl font-semibold">Recommended for You</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommendedMedia.map(media => (
                <Link 
                  key={media.id} 
                  to={getMediaLink(media)}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                    {media.posterPath ? (
                      <img 
                        src={getMediaImageSrc(media)} 
                        alt={media.title}
                        className="h-full object-cover w-full"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm p-4 text-center">No image available</div>
                    )}
                    {media.popularity && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {media.popularity.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-md line-clamp-1">{media.title}</h3>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-xs flex items-center">
                        {media.type === 'book' ? 'Book' : media.type === 'movie' ? 'Movie' : 'TV Show'}
                      </div>
                      {media.rating && <StarRating rating={media.rating} size="sm" />}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {isLoggedIn ? (
          <>
            {renderMediaList(wantToViewMedia, "Want to Read/Watch", <EyeIcon className="h-6 w-6 text-blue-500" />)}
            {renderMediaList(inProgressMedia, "In Progress", <BookOpenIcon className="h-6 w-6 text-purple-500" />)}
            {renderMediaList(finishedMedia, "Finished", <CheckIcon className="h-6 w-6 text-green-500" />)}
            
            {wantToViewMedia.length === 0 && inProgressMedia.length === 0 && finishedMedia.length === 0 && recommendedMedia.length === 0 && (
              <div className="mt-8 bg-gray-50 p-8 rounded-lg text-center">
                <p className="text-gray-500">No media tracked yet. Start by searching for books, movies, or TV shows!</p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-8 bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-500">Log in to start tracking your media!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
