/**
 * TMDB API Service
 * Docs: https://developer.themoviedb.org/docs
 */

// TMDB API requires an API key
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p";

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  genres?: { id: number; name: string }[];
  runtime?: number;
  budget?: number;
  revenue?: number;
  status?: string;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
  overview: string;
  vote_average: number;
  genres?: { id: number; name: string }[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  networks?: { id: number; name: string; logo_path: string }[];
}

export interface TMDBSearchResponse<T> {
  page: number;
  results: T[];
  total_results: number;
  total_pages: number;
}

export const searchMovies = async (query: string): Promise<TMDBSearchResponse<TMDBMovie>> => {
  const response = await fetch(
    `${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
  );

  if (!response.ok) {
    throw new Error("Failed to search movies");
  }

  return response.json();
};

export const searchTVShows = async (query: string): Promise<TMDBSearchResponse<TMDBTVShow>> => {
  const response = await fetch(
    `${TMDB_API_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
  );

  if (!response.ok) {
    throw new Error("Failed to search TV shows");
  }

  return response.json();
};

export const getMovieDetails = async (id: number): Promise<TMDBMovie> => {
  const response = await fetch(`${TMDB_API_URL}/movie/${id}?api_key=${TMDB_API_KEY}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch movie details");
  }

  return response.json();
};

export const getTVShowDetails = async (id: number): Promise<TMDBTVShow> => {
  const response = await fetch(`${TMDB_API_URL}/tv/${id}?api_key=${TMDB_API_KEY}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch TV show details");
  }

  const data = await response.json();
  return data;
};

export const getImageUrl = (path: string | null, size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w342"): string | null => {
  if (!path) return null;
  return `${TMDB_IMAGE_URL}/${size}${path}`;
};

/*
export const getTrendingMovies = async (timeWindow: 'day' | 'week' = 'week'): Promise<TMDBMovie[]> => {
  const response = await fetch(
    `${TMDB_API_URL}/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch trending movies");
  }

  const data = await response.json();
  return data.results;
};

export const getTrendingTVShows = async (timeWindow: 'day' | 'week' = 'week'): Promise<TMDBTVShow[]> => {
  const response = await fetch(
    `${TMDB_API_URL}/trending/tv/${timeWindow}?api_key=${TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch trending TV shows");
  }

  const data = await response.json();
  return data.results;
};
*/

export const getRecentMovies = async (forceRefresh: boolean = false): Promise<TMDBMovie[]> => {
  // Calculate current quarter dates
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  
  // Create a cache key for this quarter
  const cacheKey = `recent_movies_Q${currentQuarter}_${currentYear}`;
  
  // Only use cache if not forcing refresh
  if (!forceRefresh) {
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Date.now() - parsed.timestamp < 3600000) { // 1 hour cache
          console.log("Using cached recent movies");
          return parsed.data;
        }
      } catch (e) {}
    }
  }
  
  // Calculate quarter start and end dates
  const quarterStartMonth = (currentQuarter - 1) * 3;
  const quarterStartDate = new Date(currentYear, quarterStartMonth, 1);
  const quarterEndDate = new Date(currentYear, quarterStartMonth + 3, 0);
  
  // Format dates for API
  const fromDate = quarterStartDate.toISOString().split('T')[0];
  const toDate = quarterEndDate.toISOString().split('T')[0];
  
  // Get movies released in the current quarter
  const response = await fetch(
    `${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&page=1&primary_release_date.gte=${fromDate}&primary_release_date.lte=${toDate}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recent movies");
  }

  const data = await response.json();
  const movies = data.results;
  
  // Save to cache
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({
      data: movies,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn("Failed to cache movies:", e);
  }
  
  return movies;
};

export const getRecentTVShows = async (forceRefresh: boolean = false): Promise<TMDBTVShow[]> => {
  // Calculate current quarter dates
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  
  // Create a cache key for this quarter
  const cacheKey = `recent_tvshows_Q${currentQuarter}_${currentYear}`;
  
  // Only use cache if not forcing refresh
  if (!forceRefresh) {
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Date.now() - parsed.timestamp < 3600000) { // 1 hour cache
          console.log("Using cached recent TV shows");
          return parsed.data;
        }
      } catch (e) {}
    }
  }
  
  // Calculate quarter start and end dates
  const quarterStartMonth = (currentQuarter - 1) * 3;
  const quarterStartDate = new Date(currentYear, quarterStartMonth, 1);
  const quarterEndDate = new Date(currentYear, quarterStartMonth + 3, 0);
  
  // Format dates for API
  const fromDate = quarterStartDate.toISOString().split('T')[0];
  const toDate = quarterEndDate.toISOString().split('T')[0];
  
  // Get TV shows that premiered in the current quarter
  const response = await fetch(
    `${TMDB_API_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&first_air_date.gte=${fromDate}&first_air_date.lte=${toDate}&include_null_first_air_dates=false`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recent TV shows");
  }

  const data = await response.json();
  const shows = data.results;
  
  // Save to cache
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({
      data: shows,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn("Failed to cache TV shows:", e);
  }
  
  return shows;
};
