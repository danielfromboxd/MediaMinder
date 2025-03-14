import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { useMediaTracking, MediaStatus } from '@/contexts/MediaTrackingContext';
import { getImageUrl } from '@/services/tmdbService';
import StarRating from '@/components/StarRating';
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    // Find the series in our tracked media
    const allMedia = getAllMedia();
    const trackedSeries = allMedia.find(
      media => media.type === 'tvshow' && 
      (media.id === id || media.id === `tvshow_${id}`)
    );
    
    if (trackedSeries) {
      setSeries(trackedSeries);
      setLoading(false);
    } else {
      // For non-tracked series or popular items, create a placeholder
      const popularSeriesData = [
        {
          id: 'pop-2',
          title: 'House of the Dragon',
          type: 'tvshow',
          posterPath: '/z2yahl2uefxDCl0nogcRBstwruJ.jpg',
          popularity: 9.8,
          first_air_date: '2022-08-21',
          overview: 'The prequel series finds the Targaryen dynasty at the absolute apex of its power, with more than 15 dragons under their yoke. Most empires—real and imagined—crumble from such heights. In the case of the Targaryens, their slow fall begins almost 193 years before the events of Game of Thrones, when King Viserys Targaryen breaks with a century of tradition by naming his daughter Rhaenyra heir to the Iron Throne. But when Viserys later fathers a son, the court is shocked when Rhaenyra retains her status as his heir, and seeds of division sow friction across the realm.'
        },
        {
          id: 'pop-4',
          title: 'Fallout',
          type: 'tvshow',
          posterPath: '/6oTAAGhBJxaYKh3TswDVRLdKtIo.jpg',
          popularity: 9.6,
          first_air_date: '2024-04-11',
          overview: 'In a retrofuturistic world devastated by nuclear war, a woman must leave the safety of her underground vault to search for her missing father, and is forced to build an unlikely alliance with a bounty hunter who happens to wear an Iron Man helmet.'
        },
        {
          id: 'rec-2',
          title: 'Brooklyn Nine-Nine',
          type: 'tvshow',
          posterPath: '/qYjAdP0n62dJ9WLl8WGeQj7CGPH.jpg',
          popularity: 9.5,
          first_air_date: '2013-09-17',
          overview: 'A single-camera ensemble comedy following the lives of an eclectic group of detectives in a New York precinct, including one slacker who is forced to shape up when he gets a new boss.'
        }
      ];
      
      const foundSeries = popularSeriesData.find(s => 
        s.id === id || 
        s.posterPath === id
      );
      
      if (foundSeries) {
        setSeries(foundSeries);
        setLoading(false);
      } else {
        setError("TV series not found");
        setLoading(false);
      }
    }
  }, [id, getAllMedia]);

  const isTracked = series ? isMediaTracked(series.id, 'tvshow') : false;
  const trackedItem = isTracked ? getTrackedMediaItem(series?.id, 'tvshow') : null;

  const handleAddSeries = (status: MediaStatus) => {
    if (!series) return;
    
    addMedia({
      ...series,
      poster_path: series.posterPath || series.poster_path
    }, 'tvshow', status);
    
    toast({
      title: "Series added",
      description: `${series.title} has been added to your ${status.replace('_', ' ')} list.`,
    });
  };

  const handleUpdateStatus = (status: MediaStatus) => {
    if (!trackedItem) return;
    
    updateMediaStatus(trackedItem.id, status);
    toast({
      title: "Status updated",
      description: `Series status has been updated to ${status.replace('_', ' ')}.`,
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
                    onClick={() => handleAddSeries('want_to_view')}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" /> Add to Want to Watch
                  </Button>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => handleAddSeries('in_progress')}
                  >
                    Add as Watching
                  </Button>
                  <Button 
                    className="w-full"
                    variant="outline" 
                    onClick={() => handleAddSeries('finished')}
                  >
                    Add as Finished
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{series.title}</h1>
            
            {series.first_air_date && (
              <p className="text-gray-500 mb-6">
                First Air Date: {series.first_air_date}
              </p>
            )}
            
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
                <div className="bg-red-500 text-white text-sm px-3 py-1 rounded-full inline-block">
                  {series.popularity.toFixed(1)} / 10
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
