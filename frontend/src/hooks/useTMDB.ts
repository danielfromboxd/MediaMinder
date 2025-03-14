
import { useQuery } from "@tanstack/react-query";
import { 
  searchMovies, 
  searchTVShows,
  getMovieDetails,
  getTVShowDetails,
  TMDBSearchResponse, 
  TMDBMovie, 
  TMDBTVShow 
} from "@/services/tmdbService";

export const useMovieSearch = (query: string, enabled: boolean = true) => {
  return useQuery<TMDBSearchResponse<TMDBMovie>, Error>({
    queryKey: ["movies", query],
    queryFn: () => searchMovies(query),
    enabled: enabled && query.length > 2,
  });
};

export const useTVShowSearch = (query: string, enabled: boolean = true) => {
  return useQuery<TMDBSearchResponse<TMDBTVShow>, Error>({
    queryKey: ["tvshows", query],
    queryFn: () => searchTVShows(query),
    enabled: enabled && query.length > 2,
  });
};

export const useMovieDetails = (id: number | null) => {
  return useQuery<TMDBMovie, Error>({
    queryKey: ["movie", id],
    queryFn: () => getMovieDetails(id!),
    enabled: id !== null,
  });
};

export const useTVShowDetails = (id: number | null) => {
  return useQuery<TMDBTVShow, Error>({
    queryKey: ["tvshow", id],
    queryFn: () => getTVShowDetails(id!),
    enabled: id !== null,
  });
};
