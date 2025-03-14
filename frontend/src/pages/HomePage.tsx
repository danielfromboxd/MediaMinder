import React from 'react';
import Sidebar from '@/components/Sidebar';
import { Link } from 'react-router-dom';
import { Book, Tv, Film, Search, EyeIcon, BookOpenIcon, CheckIcon, Sparkles, TrendingUp } from 'lucide-react';
import { useMediaTracking } from '@/contexts/MediaTrackingContext';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/services/tmdbService';
import { getBookCoverUrl } from '@/services/openLibraryService';
import MediaStatusBadge from '@/components/MediaStatusBadge';
import StarRating from '@/components/StarRating';

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

  const popularThisWeek = [
    {
      id: 'pop-1',
      title: 'Dune: Part Two',
      type: 'movie',
      posterPath: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
      popularity: 9.9
    },
    {
      id: 'pop-2',
      title: 'House of the Dragon',
      type: 'tvshow',
      posterPath: '/z2yahl2uefxDCl0nogcRBstwruJ.jpg',
      popularity: 9.8
    },
    {
      id: 'pop-3',
      title: 'Fourth Wing',
      type: 'book',
      posterPath: '16004483',
      popularity: 9.7
    },
    {
      id: 'pop-4',
      title: 'Fallout',
      type: 'tvshow',
      posterPath: '/6oTAAGhBJxaYKh3TswDVRLdKtIo.jpg',
      popularity: 9.6
    },
    {
      id: 'pop-5',
      title: 'The Three-Body Problem',
      type: 'book',
      posterPath: '20564245',
      popularity: 9.5
    },
    {
      id: 'pop-6',
      title: 'Deadpool & Wolverine',
      type: 'movie',
      posterPath: '/yNLdJrKCGHCWtkIKIz8ejGFxNyZ.jpg',
      popularity: 9.4
    }
  ];

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
            <TrendingUp className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-semibold">Popular This Week</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularThisWeek.map(media => (
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
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://via.placeholder.com/150?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 text-sm p-4 text-center">No image available</div>
                  )}
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {media.popularity.toFixed(1)}
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
                      <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
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
            {renderMediaList(wantToViewMedia, "Want to View", <EyeIcon className="h-6 w-6 text-blue-500" />)}
            {renderMediaList(inProgressMedia, "In Progress", <BookOpenIcon className="h-6 w-6 text-amber-500" />)}
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
