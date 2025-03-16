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

export const getRecentMovies = async (): Promise<TMDBMovie[]> => {
  // Get now playing movies (currently in theaters)
  const response = await fetch(
    `${TMDB_API_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recent movies");
  }

  const data = await response.json();
  
  // Filter to only include movies from the last 3 months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  return data.results.filter((movie: TMDBMovie) => {
    if (!movie.release_date) return false;
    const releaseDate = new Date(movie.release_date);
    return releaseDate >= threeMonthsAgo;
  });
};

export const getRecentTVShows = async (): Promise<TMDBTVShow[]> => {
  // Get TV shows airing this week and filter by recent first_air_date
  const response = await fetch(
    `${TMDB_API_URL}/tv/airing_today?api_key=${TMDB_API_KEY}&language=en-US&page=1`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recent TV shows");
  }

  const data = await response.json();
  
  // Filter to only include shows from the last 3 months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  return data.results.filter((show: TMDBTVShow) => {
    if (!show.first_air_date) return false;
    const airDate = new Date(show.first_air_date);
    return airDate >= threeMonthsAgo;
  });
};
