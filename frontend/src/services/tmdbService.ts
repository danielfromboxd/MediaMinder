
/**
 * TMDB API Service
 * Docs: https://developer.themoviedb.org/docs
 */

// TMDB API requires an API key
// This is a public API key - it's meant to be included in client-side code
const TMDB_API_KEY = "***REMOVED***";
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

  return response.json();
};

export const getImageUrl = (path: string | null, size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w342"): string | null => {
  if (!path) return null;
  return `${TMDB_IMAGE_URL}/${size}${path}`;
};
