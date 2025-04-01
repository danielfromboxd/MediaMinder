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
  const [ratingUpdateCounter, setRatingUpdateCounter] = useState(0); // Add this line

  const { 
    getAllMedia, 
    addMedia, 
    updateMediaStatus, 
    updateMediaRating, 
    removeMedia, 
    isMediaTracked, 
    getTrackedMediaItem,
    trackedMedia // Add to get trackedMedia for dependencies
  } = useMediaTracking();

  useEffect(() => {
    const fetchSeriesDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true); // Corrected: Use setLoading here
        
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
          setLoading(false); // Corrected: Use setLoading here
        } else {
          setError("TV series not found");
          setLoading(false); // Corrected: Use setLoading here
        }
      } catch (error) {
        console.error("Error fetching series details:", error);
        setError("Failed to load series details");
        setLoading(false); // Corrected: Use setLoading here
      }
    };
    
    fetchSeriesDetails();
  }, [id]);

  const isTracked = series ? isMediaTracked(series.id, 'tvshow') : false;
  const trackedItem = isTracked ? getTrackedMediaItem(series?.id, 'tvshow') : null;

  // Function to explicitly include title
  const handleAddSeries = async (series: any, status: MediaStatus) => {
    console.log("Adding series:", series);
    
    // Make sure series has all required fields
    const seriesData = {
      ...series,
      name: series.title || series.name, // Ensure name is available
      title: series.title || series.name, // Add title explicitly
      poster_path: series.posterPath || series.poster_path
    };
    
    console.log("Adding series to tracking with data:", seriesData);
    const success = await addMedia(seriesData, 'tvshow', status);
    
    // Update the local state immediately to reflect tracked status
    if (success) {
      // Get the newly added item
      const newItem = getTrackedMediaItem(series.id, 'tvshow');
      
      if (newItem) {
        // Update the series object with the new status
        setSeries({
          ...series,
          status: newItem.status
        });
      }
      
      toast({
        title: "Series added",
        description: `${series.title} has been added to your ${getStatusDisplayText(status, 'tvshow')} list.`,
      });
      
      // Force a re-render by updating the ratingUpdateCounter
      setRatingUpdateCounter(prev => prev + 1);
    }
  };

  const handleUpdateStatus = (status: MediaStatus) => {
    if (!series) return;
    
    // Get the tracked item to ensure we have the correct ID
    const trackedItem = getTrackedMediaItem(series.id, 'tvshow');
    
    if (!trackedItem) {
      console.error("Tracked item not found after adding/checking");
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    updateMediaStatus(trackedItem.id, status);
    toast({
      title: "Status updated",
      description: `Series status has been updated to ${getStatusDisplayText(status, 'tvshow')}.`,
    });
    
    // Force a re-render by updating the ratingUpdateCounter
    setRatingUpdateCounter(prev => prev + 1);
  };

  // Updated rating handler that works for both tracked and untracked series
  const handleUpdateRating = async (rating: number) => {
    if (!series) return;

    try {
      // If not tracked yet, add with 'none' status first
      if (!isTracked) {
        const seriesData = {
          ...series,
          name: series.title || series.name,
          title: series.title || series.name,
          poster_path: series.posterPath || series.poster_path,
        };

        // Await the addMedia operation
        const success = await addMedia(seriesData, 'tvshow', 'none');
        if (!success) return;
      }

      // Get the tracked item to ensure we have the correct ID
      const trackedItem = getTrackedMediaItem(series.id, 'tvshow');

      if (!trackedItem) {
        console.error("Tracked item not found after adding/checking");
        toast({
          title: "Error",
          description: "Failed to update rating. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Use the tracked item's ID to update the rating
      const mediaId = trackedItem.id;

      // Await the updateMediaRating operation
      await updateMediaRating(mediaId, rating);

      // Force refresh by incrementing counter
      setRatingUpdateCounter((prev) => prev + 1);

      toast({
        title: "Rating updated",
        description: `You rated this series ${rating} out of 5 stars.`,
      });
    } catch (err) {
      console.error("Error updating series rating:", err);
      toast({
        title: "Error",
        description: "Failed to update rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveSeries = () => {
    if (!series) return;
    
    removeMedia(`tvshow_${series.id}`);
    
    toast({
      title: "Series removed",
      description: `${series.title} has been removed from your collection.`,
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
                      defaultValue={trackedItem?.status || 'none'}
                      onValueChange={(value) => handleUpdateStatus(value as MediaStatus)}
                    >
                      <SelectTrigger className="w-full">
                        {/* Display the status text */}
                        <SelectValue>
                          {trackedItem ? getStatusDisplayText(trackedItem.status, 'tvshow') : "Select status"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="want_to_view">Want to Watch</SelectItem>
                        <SelectItem value="in_progress">Currently Watching</SelectItem>
                        <SelectItem value="finished">Finished Watching</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Rating:</label>
                    <StarRating 
                      key={`series-rating-${ratingUpdateCounter}`}
                      rating={trackedItem?.rating || 0} 
                      onChange={(rating) => handleUpdateRating(rating)}
                    />
                  </div>
                  
                  {/* Delete button */}
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
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Add this series to your collection to rate it</p>
                    <Select 
                      onValueChange={(status) => {
                        handleAddSeries(series, status as MediaStatus);
                        setRatingUpdateCounter(prev => prev + 1);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Add to collection..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="want_to_view">Want to Watch</SelectItem>
                        <SelectItem value="in_progress">Currently Watching</SelectItem>
                        <SelectItem value="finished">Finished Watching</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 opacity-50">
                    <label className="text-sm font-medium">Your Rating:</label>
                    <StarRating rating={0} onChange={() => {}} />
                    <p className="text-xs text-gray-500">Add to collection first to rate</p>
                  </div>
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
