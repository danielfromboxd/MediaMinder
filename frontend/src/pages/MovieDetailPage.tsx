import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { useMediaTracking, MediaStatus } from '@/contexts/MediaTrackingContext';
import { getImageUrl, getMovieDetails } from '@/services/tmdbService';
import StarRating from '@/components/StarRating';
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getStatusDisplayText } from '@/utils/statusUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Star, DollarSign, TrendingUp, PlayCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { 
    getAllMedia, 
    addMedia, 
    updateMediaStatus, 
    updateMediaRating, 
    removeMedia, 
    isMediaTracked, 
    getTrackedMediaItem 
  } = useMediaTracking();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      // Find the movie in our tracked media
      const allMedia = getAllMedia();
      
      // First try to find the movie in tracked media using multiple ID formats
      const trackedMovie = allMedia.find(
        media => media.type === 'movie' && (
          media.mediaId.toString() === id || 
          media.mediaId.toString() === `movie_${id}` || 
          media.id === id
        )
      );
      
      if (trackedMovie) {
        // Ensure the movie object has the correct ID format
        setMovie({
          ...trackedMovie,
          id: trackedMovie.mediaId
        });
        setLoading(false);
      } else {
        // FETCH FROM API DIRECTLY
        try {
          // Clean up the ID
          let movieId = id;
          
          // Handle movie_123 format from New This Quarter
          if (typeof id === 'string' && id.includes('movie_')) {
            movieId = id.replace('movie_', '');
          }
          
          console.log("Fetching movie details for:", movieId);
          const movieDetails = await getMovieDetails(Number(movieId));
          
          if (movieDetails) {
            setMovie({
              ...movieDetails,
              type: 'movie'
            });
            setLoading(false);
          } else {
            setError("Movie not found");
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching movie details:", error);
          setError("Failed to load movie details");
          setLoading(false);
        }
      }
    };
    
    fetchMovieDetails();
  }, [id, getAllMedia]);

  const isTracked = movie ? isMediaTracked(movie.id, 'movie') : false;
  const trackedItem = isTracked ? getTrackedMediaItem(movie?.id, 'movie') : null;

  const handleAddMovie = (status: MediaStatus) => {
    if (!movie) return;
    
    const movieData = {
      ...movie,
      poster_path: movie.posterPath || movie.poster_path
    };
    
    const success = addMedia(movieData, 'movie', status);
    
    // Update the local state immediately to reflect tracked status
    if (success) {
      // Keep the current movie object but mark it as tracked
      setMovie({...movie}); // Force a re-render
      
      // Refresh page without actually navigating away
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
    
    toast({
      title: "Movie added",
      description: `${movie.title} has been added to your ${getStatusDisplayText(status, 'movie')} list.`,
    });
  };

  const handleUpdateStatus = (status: MediaStatus) => {
    if (!trackedItem) return;
    
    updateMediaStatus(trackedItem.id, status);
    toast({
      title: "Status updated",
      description: `Movie status has been updated to ${getStatusDisplayText(status, 'movie')}.`,
    });
  };

  const handleUpdateRating = (rating: number) => {
    if (!trackedItem) return;
    
    updateMediaRating(trackedItem.id, rating);
    toast({
      title: "Rating updated",
      description: `You rated this movie ${rating} out of 5 stars.`,
    });
  };

  const handleRemoveMovie = () => {
    if (!trackedItem) return;
    
    removeMedia(trackedItem.id);
    toast({
      title: "Movie removed",
      description: `${movie?.title} has been removed from your collection.`,
      variant: "destructive",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8">
          <p>Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-500">{error || "Movie not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <div className="rounded-lg overflow-hidden shadow-md">
              {movie.posterPath || movie.poster_path ? (
                <img 
                  src={getImageUrl(movie.posterPath || movie.poster_path)}
                  alt={movie.title}
                  className="w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                  }}
                />
              ) : (
                <div className="bg-gray-100 h-[450px] flex items-center justify-center">
                  <p className="text-gray-400">No poster available</p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              {isTracked ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status:</label>
                    <Select 
                      defaultValue={trackedItem?.status}
                      onValueChange={(value) => handleUpdateStatus(value as MediaStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="want_to_view">Want to watch</SelectItem>
                        <SelectItem value="in_progress">Currently watching</SelectItem>
                        <SelectItem value="finished">Finished watching</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Rating:</label>
                    <StarRating 
                      rating={trackedItem?.rating || 0} 
                      onChange={handleUpdateRating}
                    />
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleRemoveMovie}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove from collection
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    className="w-full" 
                    onClick={() => handleAddMovie('want_to_view')}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" /> Add to Want to watch
                  </Button>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => handleAddMovie('in_progress')}
                  >
                    Add as Currently watching
                  </Button>
                  <Button 
                    className="w-full"
                    variant="outline" 
                    onClick={() => handleAddMovie('finished')}
                  >
                    Add as Watched
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
            
            {movie.release_date && (
              <p className="text-gray-500 mb-4">
                Release Date: {movie.release_date}
              </p>
            )}

            {/* Add genres display */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map(genre => (
                    <span key={genre.id} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add movie stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {movie.vote_average && (
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500 h-4 w-4" />
                  <span className="text-sm">Rating: {movie.vote_average.toFixed(1)}/10</span>
                </div>
              )}
              
              {movie.runtime && (
                <div className="flex items-center gap-2">
                  <Clock className="text-gray-500 h-4 w-4" />
                  <span className="text-sm">Runtime: {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                </div>
              )}
              
              {movie.status && (
                <div className="flex items-center gap-2">
                  <PlayCircle className="text-gray-500 h-4 w-4" />
                  <span className="text-sm">Status: {movie.status}</span>
                </div>
              )}
              
              {movie.budget > 0 && (
                <div className="flex items-center gap-2">
                  <DollarSign className="text-gray-500 h-4 w-4" />
                  <span className="text-sm">Budget: {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'USD',
                    maximumFractionDigits: 0
                  }).format(movie.budget)}</span>
                </div>
              )}
              
              {movie.revenue > 0 && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-gray-500 h-4 w-4" />
                  <span className="text-sm">Revenue: {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'USD',
                    maximumFractionDigits: 0 
                  }).format(movie.revenue)}</span>
                </div>
              )}
            </div>
            
            <Separator className="my-4" />
            
            {movie.overview && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Overview</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {movie.overview}
                </p>
              </div>
            )}
            
            {movie.popularity && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Popularity</h2>
                <div className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full inline-block">
                  {movie.popularity.toFixed(1)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Higher values indicate more popular content on TMDB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
