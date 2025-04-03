import { TrackedMedia, MediaType } from '@/contexts/MediaTrackingContext';
import { getMovieDetails, getTVShowDetails } from '@/services/tmdbService';
import { getBookDetails } from '@/services/openLibraryService';
import { fetchWithProxy } from '@/services/openLibraryService';

// Track when we last fetched recommendations (to avoid repeated API calls)
let lastFetchTimestamp: number | null = null;
let cachedRecommendations: any[] = [];

interface GenrePreference {
  id: number;
  name: string;
  score: number;
  count: number;
  mediaType: 'movie' | 'tvshow';
}

interface SubjectPreference {
  name: string;
  score: number;
  count: number;
}

interface UserPreferences {
  genres: GenrePreference[];
  subjects: SubjectPreference[];
  favoriteBooks: string[];
  favoriteMovies: number[];
  favoriteTVShows: number[];
}

/**
 * Analyzes user's tracked media to build a preference profile
 */
export const analyzeUserPreferences = async (
  trackedMedia: TrackedMedia[]
): Promise<UserPreferences> => {
  // Initialize empty preferences
  const genres: Record<string, GenrePreference> = {};
  const subjects: Record<string, SubjectPreference> = {};
  const favoriteBooks: string[] = [];
  const favoriteMovies: number[] = [];
  const favoriteTVShows: number[] = [];
  
  // Only consider rated or finished media for better recommendations
  const significantMedia = trackedMedia.filter(
    media => media.rating && media.rating >= 3 || media.status === 'finished'
  );
  
  // Process each media item to extract preferences
  for (const media of significantMedia) {
    try {
      // Calculate a weight based on rating (if available) or status
      const ratingWeight = media.rating ? media.rating / 5 : 0.5;
      const statusWeight = media.status === 'finished' ? 1.0 : 
                          media.status === 'in_progress' ? 0.7 : 0.3;
      
      // Combined weight (max 1.0)
      const weight = Math.min(ratingWeight * statusWeight * 1.2, 1.0);
      
      // Process based on media type
      if (media.type === 'movie') {
        // Track this as a favorite if highly rated
        if (media.rating && media.rating >= 4) {
          const movieId = typeof media.mediaId === 'string' ? 
            parseInt(media.mediaId) : media.mediaId as number;
          favoriteMovies.push(movieId);
        }
        
        // Fetch genres for this movie
        try {
          const movieId = typeof media.mediaId === 'string' ? 
            parseInt(media.mediaId) : media.mediaId as number;
          
          const movieDetails = await getMovieDetails(movieId);
          
          // Process genres if we got valid details
          if (movieDetails && movieDetails.genres) {
            movieDetails.genres.forEach(genre => {
              const genreKey = `movie_${genre.id}`;
              if (!genres[genreKey]) {
                genres[genreKey] = { 
                  id: genre.id, 
                  name: genre.name, 
                  score: 0, 
                  count: 0,
                  mediaType: 'movie'
                };
              }
              
              // Increment score and count
              genres[genreKey].score += weight;
              genres[genreKey].count += 1;
            });
          }
        } catch (error) {
          console.warn(`Error processing genres for movie ${media.title}:`, error);
          // Continue processing other media
        }
      } 
      else if (media.type === 'tvshow') {
        // Track this as a favorite if highly rated
        if (media.rating && media.rating >= 4) {
          const showId = typeof media.mediaId === 'string' ? 
            parseInt(media.mediaId) : media.mediaId as number;
          favoriteTVShows.push(showId);
        }
        
        // Fetch genres for this TV show
        try {
          const showId = typeof media.mediaId === 'string' ? 
            parseInt(media.mediaId) : media.mediaId as number;
          
          const showDetails = await getTVShowDetails(showId);
          
          // Process genres if we got valid details
          if (showDetails && showDetails.genres) {
            showDetails.genres.forEach(genre => {
              const genreKey = `tvshow_${genre.id}`;
              if (!genres[genreKey]) {
                genres[genreKey] = { 
                  id: genre.id, 
                  name: genre.name, 
                  score: 0, 
                  count: 0,
                  mediaType: 'tvshow'
                };
              }
              
              // Increment score and count
              genres[genreKey].score += weight;
              genres[genreKey].count += 1;
            });
          }
        } catch (error) {
          console.warn(`Error processing genres for TV show ${media.title}:`, error);
          // Continue processing other media
        }
      } 
      else if (media.type === 'book') {
        // Track this as a favorite if highly rated
        if (media.rating && media.rating >= 4) {
          favoriteBooks.push(media.mediaId.toString());
        }
        
        // Convert mediaId to proper format for OpenLibrary
        let bookId = media.mediaId.toString();
        if (!bookId.startsWith('/works/') && !bookId.includes('/')) {
          bookId = `/works/${bookId}`;
        }
        
        // Fetch book details to get subjects
        const bookDetails = await getBookDetails(bookId);
        
        // Process subjects
        const bookSubjects = bookDetails.subjects || [];
        bookSubjects.forEach((subject: string) => {
          // Normalize subject
          const normalizedSubject = subject.toLowerCase().trim();
          
          if (!subjects[normalizedSubject]) {
            subjects[normalizedSubject] = { 
              name: subject, 
              score: 0, 
              count: 0 
            };
          }
          
          // Increment score and count
          subjects[normalizedSubject].score += weight;
          subjects[normalizedSubject].count += 1;
        });
      }
    } catch (error) {
      console.warn(`Error processing preferences for ${media.title}:`, error);
    }
  }
  
  // Convert objects to arrays and sort by score
  const sortedGenres = Object.values(genres)
    .sort((a, b) => b.score - a.score);
  
  const sortedSubjects = Object.values(subjects)
    .sort((a, b) => b.score - a.score);
    
  return {
    genres: sortedGenres,
    subjects: sortedSubjects,
    favoriteBooks,
    favoriteMovies,
    favoriteTVShows
  };
};

/**
 * Fetches recommended movies based on preferences
 */
const getRecommendedMovies = async (
  preferences: UserPreferences,
  alreadyTrackedIds: string[]
): Promise<any[]> => {
  try {
    // Get top movie genres from preferences
    const movieGenres = preferences.genres
      .filter(g => g.mediaType === 'movie')
      .slice(0, 3);
    
    if (movieGenres.length === 0 && preferences.favoriteMovies.length === 0) {
      return [];
    }
    
    // Try recommendations based on favorite movies first
    let results: any[] = [];
    
    if (preferences.favoriteMovies.length > 0) {
      const randomFavorite = preferences.favoriteMovies[
        Math.floor(Math.random() * preferences.favoriteMovies.length)
      ];
      
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${randomFavorite}/recommendations?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&page=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        results = data.results || [];
      }
    }
    
    // If we don't have enough recommendations, try by genre
    if (results.length < 5 && movieGenres.length > 0) {
      const topGenreId = movieGenres[0].id;
      
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${topGenreId}&page=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Append new results, avoiding duplicates
        const newResults = data.results || [];
        const existingIds = new Set(results.map(r => r.id));
        
        for (const movie of newResults) {
          if (!existingIds.has(movie.id)) {
            results.push(movie);
          }
        }
      }
    }
    
    // Filter out already tracked movies
    results = results.filter(movie => {
      const movieId = `movie_${movie.id}`;
      return !alreadyTrackedIds.includes(movieId) && 
             !alreadyTrackedIds.includes(movie.id.toString());
    });
    
    // Format movie results
    return results.slice(0, 4).map(movie => ({
      id: `movie_${movie.id}`,
      title: movie.title,
      type: 'movie',
      mediaType: 'movie',
      posterPath: movie.poster_path,
      relevance: movie.vote_average / 10, // Convert TMDB rating (0-10) to 0-1 scale
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
    }));
  } catch (error) {
    console.error('Error getting movie recommendations:', error);
    return [];
  }
};

/**
 * Fetches recommended TV shows based on preferences
 */
const getRecommendedTVShows = async (
  preferences: UserPreferences,
  alreadyTrackedIds: string[]
): Promise<any[]> => {
  try {
    // Get top TV show genres from preferences
    const tvGenres = preferences.genres
      .filter(g => g.mediaType === 'tvshow')
      .slice(0, 3);
    
    if (tvGenres.length === 0 && preferences.favoriteTVShows.length === 0) {
      return [];
    }
    
    // Try recommendations based on favorite shows first
    let results: any[] = [];
    
    if (preferences.favoriteTVShows.length > 0) {
      const randomFavorite = preferences.favoriteTVShows[
        Math.floor(Math.random() * preferences.favoriteTVShows.length)
      ];
      
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${randomFavorite}/recommendations?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&page=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        results = data.results || [];
      }
    }
    
    // If we don't have enough recommendations, try by genre
    if (results.length < 5 && tvGenres.length > 0) {
      const topGenreId = tvGenres[0].id;
      
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${topGenreId}&page=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Append new results, avoiding duplicates
        const newResults = data.results || [];
        const existingIds = new Set(results.map(r => r.id));
        
        for (const show of newResults) {
          if (!existingIds.has(show.id)) {
            results.push(show);
          }
        }
      }
    }
    
    // Filter out already tracked shows
    results = results.filter(show => {
      const showId = `tvshow_${show.id}`;
      return !alreadyTrackedIds.includes(showId) && 
             !alreadyTrackedIds.includes(show.id.toString());
    });
    
    // Format TV show results
    return results.slice(0, 4).map(show => ({
      id: `tvshow_${show.id}`,
      title: show.name,
      type: 'tvshow',
      mediaType: 'tvshow',
      posterPath: show.poster_path,
      relevance: show.vote_average / 10, // Convert TMDB rating (0-10) to 0-1 scale
      year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
    }));
  } catch (error) {
    console.error('Error getting TV show recommendations:', error);
    return [];
  }
};

/**
 * Fetches recommended books based on preferences
 */
const getRecommendedBooks = async (
  preferences: UserPreferences,
  alreadyTrackedIds: string[]
): Promise<any[]> => {
  try {
    // Get top subjects from preferences
    const topSubjects = preferences.subjects.slice(0, 5);
    
    if (topSubjects.length === 0) {
      return [];
    }
    
    // Get recommendations by subject
    let results: any[] = [];
    
    // Try to get books for top 2 subjects
    for (let i = 0; i < Math.min(2, topSubjects.length); i++) {
      const subject = encodeURIComponent(topSubjects[i].name);
      
      try {
        // Use fetchWithProxy instead of direct fetch
        const response = await fetchWithProxy(
          `https://openlibrary.org/subjects/${subject.toLowerCase()}.json?limit=10`
        );
        
        if (response.ok) {
          const data = await response.json();
          const books = data.works || [];
          
          // Add books to results, avoiding duplicates
          const existingKeys = new Set(results.map(b => b.key));
          
          for (const book of books) {
            if (!existingKeys.has(book.key)) {
              results.push(book);
            }
          }
        }
      } catch (error) {
        console.warn(`Error fetching books for subject ${subject}:`, error);
        // Continue with next subject even if one fails
      }
    }
    
    // Filter out already tracked books
    results = results.filter(book => {
      // Extract the key portion from book.key (e.g. /works/OL123W -> OL123W)
      const bookKey = book.key.split('/').pop();
      const bookId = `book_${bookKey}`;
      
      return !alreadyTrackedIds.includes(bookId) && 
             !alreadyTrackedIds.includes(book.key) &&
             !alreadyTrackedIds.includes(bookKey);
    });
    
    // Format book results
    return results.slice(0, 4).map(book => {
      const bookKey = book.key.split('/').pop();
      
      return {
        id: `book_${bookKey}`,
        title: book.title,
        type: 'book',
        mediaType: 'book',
        posterPath: book.cover_i || null,
        cover_i: book.cover_i,
        cover_edition_key: book.cover_edition_key,
        relevance: 0.7, // Default relevance for books
        year: book.first_publish_year,
        key: book.key
      };
    });
  } catch (error) {
    console.error('Error getting book recommendations:', error);
    return [];
  }
};

/**
 * Generates recommendations based on user's media tracking history
 */
export const generateRecommendations = async (
  trackedMedia: TrackedMedia[],
  forceRefresh: boolean = false
): Promise<any[]> => {
  // Check cache first if we're not forcing a refresh
  const now = Date.now();
  if (!forceRefresh && lastFetchTimestamp && now - lastFetchTimestamp < 3600000) {
    console.log("Using cached recommendations");
    return cachedRecommendations;
  }
  
  try {
    console.log("Generating recommendations from", trackedMedia.length, "tracked items");
    
    // Return default recommendations if there's no tracked media
    if (!trackedMedia || trackedMedia.length === 0) {
      console.log("No tracked media found, using default recommendations");
      return getDefaultRecommendations();
    }
    
    // Create a list of already tracked media IDs to avoid recommending them
    const alreadyTrackedIds = trackedMedia.map(item => item.mediaId.toString());
    
    // Analyze user preferences - with error handling
    let preferences: UserPreferences;
    try {
      preferences = await analyzeUserPreferences(trackedMedia);
      console.log("Analyzed user preferences:", 
        preferences.genres.length, "genres,", 
        preferences.subjects.length, "subjects");
    } catch (error) {
      console.error("Failed to analyze preferences:", error);
      // Fall back to defaults
      return getDefaultRecommendations();
    }
    
    // If user hasn't tracked enough media with genres/subjects, return popular items
    if (preferences.genres.length === 0 && preferences.subjects.length === 0) {
      console.log("No genre or subject preferences found, using defaults");
      return getDefaultRecommendations();
    }
    
    // Get recommendations for each media type - with individual try/catch blocks
    let movieRecs: any[] = [];
    let tvRecs: any[] = [];
    let bookRecs: any[] = [];
    
    try {
      movieRecs = await getRecommendedMovies(preferences, alreadyTrackedIds);
      console.log("Got", movieRecs.length, "movie recommendations");
    } catch (error) {
      console.error("Failed to get movie recommendations:", error);
    }
    
    try {
      tvRecs = await getRecommendedTVShows(preferences, alreadyTrackedIds);
      console.log("Got", tvRecs.length, "TV show recommendations");
    } catch (error) {
      console.error("Failed to get TV show recommendations:", error);
    }
    
    try {
      bookRecs = await getRecommendedBooks(preferences, alreadyTrackedIds);
      console.log("Got", bookRecs.length, "book recommendations");
    } catch (error) {
      console.error("Failed to get book recommendations:", error);
    }
    
    // Combine all recommendations
    let combinedRecs = [...movieRecs, ...tvRecs, ...bookRecs];
    
    // If we got no recommendations at all, use defaults
    if (combinedRecs.length === 0) {
      console.log("No recommendations found, using defaults");
      return getDefaultRecommendations();
    }
    
    // Process and cache as before
    // Process image URLs
    combinedRecs = combinedRecs.map(item => {
      if (item.type === 'book') {
        // Pre-compute image URLs for books
        return {
          ...item,
          imageUrl: item.cover_i ? 
            `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : 
            item.cover_edition_key ? 
            `https://covers.openlibrary.org/b/olid/${item.cover_edition_key}-M.jpg` :
            null
        };
      } else {
        // Pre-compute image URLs for movies and TV shows
        return {
          ...item,
          imageUrl: item.posterPath ? 
            `https://image.tmdb.org/t/p/w342${item.posterPath}` : 
            null
        };
      }
    });
    
    // Update cache
    lastFetchTimestamp = now;
    cachedRecommendations = combinedRecs.slice(0, 8); // Limit to 8 recommendations
    
    return cachedRecommendations;
  } catch (error) {
    console.error("Critical error generating recommendations:", error);
    return getDefaultRecommendations();
  }
};

/**
 * Returns default recommendations if user hasn't tracked enough media
 */
const getDefaultRecommendations = (): any[] => {
  return [
    {
      id: 'movie_550',
      title: 'Fight Club',
      type: 'movie',
      posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      imageUrl: 'https://image.tmdb.org/t/p/w342/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      relevance: 0.95,
      year: 1999,
    },
    {
      id: 'book_OL82586W',
      title: 'Project Hail Mary',
      type: 'book',
      posterPath: '12522399',
      imageUrl: 'https://covers.openlibrary.org/b/id/12522399-M.jpg',
      relevance: 0.9,
      year: 2021,
    },
    {
      id: 'tvshow_1399',
      title: 'Game of Thrones',
      type: 'tvshow',
      posterPath: '/z9gCSwIObDOD2BEtmUwfasar3xs.jpg',
      imageUrl: 'https://image.tmdb.org/t/p/w342/z9gCSwIObDOD2BEtmUwfasar3xs.jpg',
      relevance: 0.89,
      year: 2011,
    },
    {
      id: 'book_OL27464W',
      title: 'The Hobbit',
      type: 'book',
      posterPath: '10480949',
      imageUrl: 'https://covers.openlibrary.org/b/id/10480949-M.jpg',
      relevance: 0.85,
      year: 1937,
    },
    {
      id: 'movie_680',
      title: 'Pulp Fiction',
      type: 'movie',
      posterPath: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      imageUrl: 'https://image.tmdb.org/t/p/w342/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      relevance: 0.84,
      year: 1994,
    },
    {
      id: 'tvshow_66732',
      title: 'Stranger Things',
      type: 'tvshow',
      posterPath: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
      imageUrl: 'https://image.tmdb.org/t/p/w342/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
      relevance: 0.83,
      year: 2016,
    },
    {
      id: 'tvshow_1396',
      title: 'Breaking Bad',
      type: 'tvshow',
      posterPath: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      imageUrl: 'https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      relevance: 0.82,
      year: 2008,
    },
    {
      id: 'movie_299534',
      title: 'Avengers: Endgame',
      type: 'movie',
      posterPath: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
      imageUrl: 'https://image.tmdb.org/t/p/w342/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
      relevance: 0.81,
      year: 2019,
    }
  ];
};