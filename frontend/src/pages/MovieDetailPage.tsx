import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { useMediaTracking, MediaStatus } from '@/contexts/MediaTrackingContext';
import { getImageUrl } from '@/services/tmdbService';
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
    // Find the movie in our tracked media
    const allMedia = getAllMedia();
    const trackedMovie = allMedia.find(
      media => media.type === 'movie' && 
      (media.id === id || media.id === `movie_${id}`)
    );
    
    if (trackedMovie) {
      setMovie(trackedMovie);
      setLoading(false);
    } else {
      // For non-tracked movies or popular items, create a placeholder
      const popularMovies = [
        {
          id: 'pop-1',
          title: 'Dune: Part Two',
          type: 'movie',
          posterPath: '/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
          popularity: 9.9,
          release_date: '2024-03-01',
          overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, Paul endeavors to prevent a terrible future only he can foresee.'
        },
        {
          id: 'pop-6',
          title: 'Deadpool & Wolverine',
          type: 'movie',
          posterPath: '/yNLdJrKCGHCWtkIKIz8ejGFxNyZ.jpg',
          popularity: 9.4,
          release_date: '2024-07-26',
          overview: 'Wolverine is recovering from his injuries when he is approached by Deadpool to join forces to defeat a common enemy.'
        },
        {
          id: 'rec-3',
          title: 'Inception',
          type: 'movie',
          posterPath: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
          popularity: 9.7,
          release_date: '2010-07-16',
          overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.'
        }
      ];
      
      const popularMovie = popularMovies.find(m => 
        m.id === id || 
        m.posterPath === id
      );
      
      if (popularMovie) {
        setMovie(popularMovie);
        setLoading(false);
      } else {
        setError("Movie not found");
        setLoading(false);
      }
    }
  }, [id, getAllMedia]);

  const isTracked = movie ? isMediaTracked(movie.id, 'movie') : false;
  const trackedItem = isTracked ? getTrackedMediaItem(movie?.id, 'movie') : null;

  const handleAddMovie = (status: MediaStatus) => {
    if (!movie) return;
    
    addMedia({
      ...movie,
      poster_path: movie.posterPath || movie.poster_path
    }, 'movie', status);
    
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
              <p className="text-gray-500 mb-6">
                Release Date: {movie.release_date}
              </p>
            )}
            
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
                <div className="bg-red-500 text-white text-sm px-3 py-1 rounded-full inline-block">
                  {movie.popularity.toFixed(1)} / 10
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
