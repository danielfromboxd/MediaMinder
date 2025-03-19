import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { useMediaTracking, MediaStatus } from '@/contexts/MediaTrackingContext';
import { getImageUrl, getTVShowDetails } from '@/services/tmdbService';
import StarRating from '@/components/StarRating';
import { ArrowLeft, PlusCircle, Trash2, Calendar, Clock, Star, TvIcon, BarChart2, PlayCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getStatusDisplayText } from '@/utils/statusUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const SeriesDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [series, setSeries] = useState<any>(null);
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
    const fetchSeriesDetails = async () => {
      // Find the series in our tracked media
      const allMedia = getAllMedia();
      
      const trackedSeries = allMedia.find(
        media => media.type === 'tvshow' && (
          media.mediaId.toString() === id || 
          media.mediaId.toString() === `tvshow_${id}` || 
          media.id === id
        )
      );
      
      if (trackedSeries) {
        // Ensure series object has the correct ID format
        setSeries({
          ...trackedSeries,
          id: trackedSeries.mediaId
        });
        setLoading(false);
      } else {
        // FETCH FROM API DIRECTLY
        try {
          // Clean up the ID
          let seriesId = id;
          
          // Handle tvshow_123 format from New This Quarter
          if (typeof id === 'string' && id.includes('tvshow_')) {
            seriesId = id.replace('tvshow_', '');
          }
          
          console.log("Fetching series details for:", seriesId);
          const seriesDetails = await getTVShowDetails(Number(seriesId));
          
          if (seriesDetails) {
            setSeries({
              ...seriesDetails,
              title: seriesDetails.name, // Ensure it has title property for UI consistency
              type: 'tvshow'
            });
            setLoading(false);
          } else {
            setError("TV series not found");
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching series details:", error);
          setError("Failed to load series details");
          setLoading(false);
        }
      }
    };
    
    fetchSeriesDetails();
  }, [id, getAllMedia]);

  const isTracked = series ? isMediaTracked(series.id, 'tvshow') : false;
  const trackedItem = isTracked ? getTrackedMediaItem(series?.id, 'tvshow') : null;

  // Function to explicitly include title
  const handleAddSeries = (series: any, status: MediaStatus) => {
    console.log("Adding series:", series);
    
    // Make sure series has all required fields
    const seriesData = {
      ...series,
      name: series.title || series.name, // Ensure name is available
      title: series.title || series.name, // Add title explicitly
      poster_path: series.posterPath || series.poster_path
    };
    
    console.log("Adding series to tracking with data:", seriesData);
    const success = addMedia(seriesData, 'tvshow', status);
    
    // Update the local state immediately to reflect tracked status
    if (success) {
      // Keep the current series object but mark it as tracked
      setSeries({...series}); // Force a re-render
      
      // Refresh page without actually navigating away
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
    
    toast({
      title: "Series added",
      description: `${series.title} has been added to your ${getStatusDisplayText(status, 'tvshow')} list.`,
    });
  };

  const handleUpdateStatus = (status: MediaStatus) => {
    if (!trackedItem) return;
    
    updateMediaStatus(trackedItem.id, status);
    toast({
      title: "Status updated",
      description: `Series status has been updated to ${getStatusDisplayText(status, 'tvshow')}.`,
    });
  };

  const handleUpdateRating = (rating: number) => {
    if (!trackedItem) return;
    
    updateMediaRating(trackedItem.id, rating);
    toast({
      title: "Rating updated",
      description: `You rated this series ${rating} out of 5 stars.`,
    });
  };

  const handleRemoveSeries = () => {
    if (!trackedItem) return;
    
    removeMedia(trackedItem.id);
    toast({
      title: "Series removed",
      description: `${series?.title} has been removed from your collection.`,
      variant: "destructive",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8">
          <p>Loading series details...</p>
        </div>
      </div>
    );
  }

  if (error || !series) {
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
            <p className="text-red-500">{error || "Series not found"}</p>
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
              {series.posterPath || series.poster_path ? (
                <img 
                  src={getImageUrl(series.posterPath || series.poster_path)}
                  alt={series.title}
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
                        <SelectItem value="want_to_view">Want to Watch</SelectItem>
                        <SelectItem value="in_progress">Watching</SelectItem>
                        <SelectItem value="finished">Finished</SelectItem>
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
                    onClick={handleRemoveSeries}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove from collection
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    className="w-full" 
                    onClick={() => handleAddSeries(series, 'want_to_view')}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" /> Add to Want to Watch
                  </Button>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => handleAddSeries(series, 'in_progress')}
                  >
                    Add as Watching
                  </Button>
                  <Button 
                    className="w-full"
                    variant="outline" 
                    onClick={() => handleAddSeries(series, 'finished')}
                  >
                    Add as Finished
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{series.title || series.name}</h1>
            
            {series.first_air_date && (
              <p className="text-gray-500 mb-4">
                First Air Date: {series.first_air_date}
              </p>
            )}

            {/* Add genres display */}
            {series.genres && series.genres.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {series.genres.map(genre => (
                    <span key={genre.id} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add series stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {series.vote_average && (
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500 h-4 w-4" />
                  <span className="text-sm">Rating: {series.vote_average.toFixed(1)}/10</span>
                </div>
              )}
              
              {series.episode_run_time && series.episode_run_time.length > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="text-gray-500 h-4 w-4" />
                  <span className="text-sm">Episode Runtime: {series.episode_run_time[0]} min</span>
                </div>
              )}
              
              {series.number_of_seasons && (
                <div className="flex items-center gap-2">
                  <TvIcon className="text-gray-500 h-4 w-4" />
                  <span className="text-sm">Seasons: {series.number_of_seasons}</span>
                </div>
              )}
              
              {series.number_of_episodes && (
                <div className="flex items-center gap-2">
                  <BarChart2 className="text-gray-500 h-4 w-4" />
                  <span className="text-sm">Episodes: {series.number_of_episodes}</span>
                </div>
              )}
              
              {series.status && (
                <div className="flex items-center gap-2">
                  <PlayCircle className="text-gray-500 h-4 w-4" />
                  <span className="text-sm">Status: {series.status}</span>
                </div>
              )}
              
              {series.networks && series.networks.length > 0 && (
                <div className="flex items-center gap-2">
                  <TvIcon className="text-gray-500 h-4 w-4" />
                  <span className="text-sm">Network: {series.networks.map(n => n.name).join(', ')}</span>
                </div>
              )}
            </div>
            
            <Separator className="my-4" />
            
            {series.overview && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Overview</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {series.overview}
                </p>
              </div>
            )}
            
            {series.popularity && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Popularity</h2>
                <div className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full inline-block">
                  {series.popularity.toFixed(1)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Higher values indicate more popular content on TMDB
                </p>
              </div>
            )}
            
            {/* Add seasons information if available */}
            {series.seasons && series.seasons.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Seasons</h2>
                <div className="space-y-2">
                  {series.seasons.map(season => (
                    <div key={season.id} className="p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between">
                        <span className="font-medium">{season.name}</span>
                        <span className="text-gray-500 text-sm">{season.episode_count} episodes</span>
                      </div>
                      {season.air_date && (
                        <div className="text-sm text-gray-500 mt-1">
                          Air date: {new Date(season.air_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesDetailPage;
