import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchInput from '@/components/SearchInput';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { X, Clock, Calendar, Star, DollarSign, TrendingUp, PlayCircle, PlusCircle, Trash2 } from "lucide-react";
import { useMovieSearch, useMovieDetails } from '@/hooks/useTMDB';
import { getImageUrl, TMDBMovie } from '@/services/tmdbService';
import { useMediaTracking, MediaStatus } from '@/contexts/MediaTrackingContext';
import { toast } from '@/components/ui/use-toast';
import StarRating from '@/components/StarRating';
import { getStatusDisplayText } from '@/utils/statusUtils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MediaStatusBadge from '@/components/MediaStatusBadge';

const MoviesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  
  const { data, isLoading, error } = useMovieSearch(searchQuery, isSearching);
  const { data: movieDetails, isLoading: isLoadingDetails } = useMovieDetails(selectedMovieId);
  
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

  const handleMovieClick = (id: number) => {
    setSelectedMovieId(id);
  };

  const closeDialog = () => {
    setSelectedMovieId(null);
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatMinutes = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleAddMovie = (movie: TMDBMovie, status: MediaStatus) => {
    addMedia(movie, 'movie', status);
    toast({
      title: "Movie added",
      description: `${movie.title} has been added to your ${getStatusDisplayText(status, 'movie')} list.`,
    });
  };

  const handleUpdateStatus = (movieId: string, status: MediaStatus) => {
    updateMediaStatus(movieId, status);
    toast({
      title: "Status updated",
      description: `Movie status has been updated to ${getStatusDisplayText(status, 'movie')}.`,
    });
  };

  const handleUpdateRating = (movieId: string, rating: number) => {
    updateMediaRating(movieId, rating);
    toast({
      title: "Rating updated",
      description: `You rated this movie ${rating} out of 5 stars.`,
    });
  };

  const handleRemoveMovie = (movieId: string, title: string) => {
    removeMedia(movieId);
    toast({
      title: "Movie removed",
      description: `${title} has been removed from your collection.`,
      variant: "destructive",
    });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Movies</h1>
        
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies..."
              />
            </div>
            <Button type="submit" disabled={searchQuery.length < 3}>
              Search
            </Button>
          </div>
        </form>
        
        {isLoading && (
          <div className="text-center py-8">
            <p>Loading movies...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <p className="text-red-500">Error: {error.message}</p>
          </div>
        )}
        
        {data && data.results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.results.map((movie) => {
              const isTracked = isMediaTracked(String(movie.id), 'movie');
              const trackedItem = isTracked ? getTrackedMediaItem(String(movie.id), 'movie') : null;
              
              return (
                <div 
                  key={movie.id} 
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div 
                    className="h-56 bg-gray-100 flex items-center justify-center cursor-pointer relative"
                    onClick={() => handleMovieClick(movie.id)}
                  >
                    {movie.poster_path ? (
                      <img 
                        src={getImageUrl(movie.poster_path)} 
                        alt={movie.title}
                        className="h-full object-cover w-full"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm p-4 text-center">No poster available</div>
                    )}
                    
                    {trackedItem && (
                      <div className="absolute top-2 right-2">
                        <MediaStatusBadge status={trackedItem.status} mediaType="movie" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 
                      className="font-semibold text-lg line-clamp-1 cursor-pointer"
                      onClick={() => handleMovieClick(movie.id)}
                    >
                      {movie.title}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">
                      Released: {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
                    </p>
                    <div className="mt-2 flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 text-sm">{movie.vote_average.toFixed(1)}/10</span>
                    </div>
                    
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
                            onClick={() => handleMovieClick(movie.id)}
                          >
                            Details
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRemoveMovie(trackedItem.id, movie.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        className="w-full mt-3" 
                        size="sm"
                        onClick={() => handleAddMovie(movie, 'want_to_view')}
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
                <p className="text-gray-500">No movies found. Try a different search term.</p>
              ) : (
                <p className="text-gray-500">Search for movies to start tracking your watchlist!</p>
              )}
            </div>
          )
        )}

        {/* Movie Details Dialog */}
        <Dialog open={selectedMovieId !== null} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="sm:max-w-3xl">
            {isLoadingDetails ? (
              <div className="py-8 text-center">
                <p>Loading movie details...</p>
              </div>
            ) : movieDetails ? (
              <div className="max-h-[80vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                  <div className="flex justify-between items-start">
                    <DialogTitle className="text-2xl">{movieDetails.title}</DialogTitle>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm mt-1">
                    {movieDetails.genres?.map(genre => (
                      <span key={genre.id} className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </DialogHeader>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3 flex-shrink-0">
                    {movieDetails.poster_path ? (
                      <img 
                        src={getImageUrl(movieDetails.poster_path, "w500")} 
                        alt={movieDetails.title}
                        className="w-full rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-400">No poster available</p>
                      </div>
                    )}
                    
                    {/* Movie tracking controls */}
                    <div className="mt-4 space-y-4">
                      {isMediaTracked(movieDetails.id, 'movie') ? (
                        <>
                          {/* Status selector */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Status:</label>
                            <Select 
                              defaultValue={getTrackedMediaItem(movieDetails.id, 'movie')?.status}
                              onValueChange={(value) => handleUpdateStatus(
                                `movie_${movieDetails.id}`, 
                                value as MediaStatus
                              )}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="want_to_view">Want to Watch</SelectItem>
                                <SelectItem value="in_progress">Currently Watching</SelectItem>
                                <SelectItem value="finished">Finished Watching</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Rating control */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Your Rating:</label>
                            <StarRating 
                              rating={getTrackedMediaItem(movieDetails.id, 'movie')?.rating || 0} 
                              onChange={(rating) => handleUpdateRating(`movie_${movieDetails.id}`, rating)}
                            />
                          </div>
                          
                          {/* Remove button */}
                          <Button 
                            variant="destructive" 
                            className="w-full"
                            onClick={() => {
                              handleRemoveMovie(`movie_${movieDetails.id}`, movieDetails.title);
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
                            onClick={() => handleAddMovie(movieDetails, 'want_to_view')}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" /> Add to Want to Watch
                          </Button>
                          <Button 
                            className="w-full"
                            variant="outline"
                            onClick={() => handleAddMovie(movieDetails, 'in_progress')}
                          >
                            Add as Currently Watching
                          </Button>
                          <Button 
                            className="w-full"
                            variant="outline" 
                            onClick={() => handleAddMovie(movieDetails, 'finished')}
                          >
                            Add as Watched
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="md:w-2/3">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-gray-500 h-4 w-4" />
                        <span className="text-sm">Released: {movieDetails.release_date ? new Date(movieDetails.release_date).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="text-gray-500 h-4 w-4" />
                        <span className="text-sm">Runtime: {formatMinutes(movieDetails.runtime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="text-yellow-500 h-4 w-4" />
                        <span className="text-sm">Rating: {movieDetails.vote_average.toFixed(1)}/10</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PlayCircle className="text-gray-500 h-4 w-4" />
                        <span className="text-sm">Status: {movieDetails.status || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="text-gray-500 h-4 w-4" />
                        <span className="text-sm">Budget: {formatCurrency(movieDetails.budget)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="text-gray-500 h-4 w-4" />
                        <span className="text-sm">Revenue: {formatCurrency(movieDetails.revenue)}</span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <h3 className="font-semibold mb-2">Overview</h3>
                      <p className="text-gray-700">{movieDetails.overview || 'No overview available.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-red-500">Failed to load movie details.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MoviesPage;
