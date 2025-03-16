import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Link } from 'react-router-dom';
import { Book, Tv, Film, Search, EyeIcon, BookOpenIcon, CheckIcon, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { useMediaTracking } from '@/contexts/MediaTrackingContext';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl, getTrendingMovies, getTrendingTVShows, getRecentMovies, getRecentTVShows } from '@/services/tmdbService';
import { getBookCoverUrl, getTrendingBooks, getRecentBooks } from '@/services/openLibraryService';
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
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);

  // Fetch new content when component mounts
  useEffect(() => {
    const fetchNewItems = async () => {
      setIsLoadingPopular(true);
      try {
        // Get recently released/new media
        const [moviesData, showsData, booksData] = await Promise.all([
          getRecentMovies(),
          getRecentTVShows(),
          getRecentBooks()
        ]);
        
        // Format movies (take top 3)
        const formattedMovies = moviesData.slice(0, 3).map(movie => ({
          id: `movie_${movie.id}`,
          title: movie.title,
          type: 'movie',
          mediaType: 'movie',
          imageUrl: getImageUrl(movie.poster_path),
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        }));
        
        // Format TV shows (take top 2)
        const formattedShows = showsData.slice(0, 2).map(show => ({
          id: `tvshow_${show.id}`,
          title: show.name,
          type: 'tvshow',
          mediaType: 'tvshow',
          imageUrl: getImageUrl(show.poster_path),
          year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
        }));
        
        // Format books (take top 2)
        const formattedBooks = booksData.slice(0, 2).map(book => {
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
            imageUrl: getBookCoverUrl(book, "M"),  // Use our improved function
            year: book.first_publish_year,
            
            // Store all possible cover sources for later fallbacks
            cover_i: book.cover_i,
            cover_edition_key: book.cover_edition_key,
            // Store book.key for later OLID extraction if needed
            key: book.key
          };
        });
        
        // Combine all items and sort by newest first
        const combined = [...formattedMovies, ...formattedShows, ...formattedBooks]
          .sort((a, b) => {
            if (!a.year) return 1;
            if (!b.year) return -1;
            return b.year - a.year;
          });
        
        setPopularItems(combined.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch new items:', error);
        setPopularItems([]);
      } finally {
        setIsLoadingPopular(false);
      }
    };
    
    fetchNewItems();
  }, []);

  const recommendedMedia = isLoggedIn ? generateRecommendedMedia() : [];

  const getMediaImageSrc = (media: any) => {
    if (media.type === 'book' && media.posterPath) {
      return getBookCoverUrl(Number(media.posterPath));
    } else if ((media.type === 'movie' || media.type === 'tvshow') && media.posterPath) {
      return getImageUrl(media.posterPath);
    }
    return null;
  };

  const getMediaLink = (media: any) => {
    const mediaId = media.id.includes('_') ? media.id.split('_')[1] : media.id;
    
    if (media.type === 'book') return `/books/detail/${mediaId}`;
    if (media.type === 'movie') return `/movies/detail/${mediaId}`;
    if (media.type === 'tvshow') return `/series/detail/${mediaId}`;
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
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-semibold">New This Quarter</h2>
          </div>
          {isLoadingPopular ? (
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
          ) : popularItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {popularItems.map(media => (
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
                    {/* Replace popularity badge with release year */}
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
            <p className="text-gray-500">Unable to load popular content. Please try again later.</p>
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
