import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchInput from '@/components/SearchInput';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { X, Calendar, Star, PlayCircle, Tv, Hash, PlusCircle, Trash2 } from "lucide-react";
import { useTVShowSearch, useTVShowDetails } from '@/hooks/useTMDB';
import { getImageUrl, TMDBTVShow } from '@/services/tmdbService';
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

const SeriesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedShowId, setSelectedShowId] = useState<number | null>(null);
  
  const { data, isLoading, error } = useTVShowSearch(searchQuery, isSearching);
  const { data: showDetails, isLoading: isLoadingDetails } = useTVShowDetails(selectedShowId);
  
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

  const handleShowClick = (id: number) => {
    setSelectedShowId(id);
  };

  const closeDialog = () => {
    setSelectedShowId(null);
  };

  const handleAddShow = (show: TMDBTVShow, status: MediaStatus) => {
    console.log("Show object:", JSON.stringify(show));
    console.log("Status:", status);
    console.log("About to call addMedia with show and status");
    addMedia(show, 'tvshow', status);
    toast({
      title: "TV Show added",
      description: `${show.name} has been added to your ${getStatusDisplayText(status, 'tvshow')} list.`,
    });
  };

  const handleUpdateStatus = (showId: string, status: MediaStatus) => {
    updateMediaStatus(showId, status);
    toast({
      title: "Status updated",
      description: `TV Show status has been updated to ${getStatusDisplayText(status, 'tvshow')}.`,
    });
  };

  const handleUpdateRating = (showId: string, rating: number) => {
    updateMediaRating(showId, rating);
    toast({
      title: "Rating updated",
      description: `You rated this TV Show ${rating} out of 5 stars.`,
    });
  };

  const handleRemoveShow = (showId: string, title: string) => {
    removeMedia(showId);
    toast({
      title: "TV Show removed",
      description: `${title} has been removed from your collection.`,
      variant: "destructive",
    });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Series</h1>
        
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for TV shows..."
              />
            </div>
            <Button type="submit" disabled={searchQuery.length < 3}>
              Search
            </Button>
          </div>
        </form>
        
        {isLoading && (
          <div className="text-center py-8">
            <p>Loading TV shows...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <p className="text-red-500">Error: {error.message}</p>
          </div>
        )}
        
        {data && data.results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.results.map((series) => {
              const isTracked = isMediaTracked(String(series.id), 'tvshow');
              const trackedItem = isTracked ? getTrackedMediaItem(String(series.id), 'tvshow') : null;
              
              return (
                <div 
                  key={series.id} 
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div 
                    className="h-56 bg-gray-100 flex items-center justify-center cursor-pointer relative"
                    onClick={() => handleShowClick(series.id)}
                  >
                    {series.poster_path ? (
                      <img 
                        src={getImageUrl(series.poster_path)} 
                        alt={series.name}
                        className="h-full object-cover w-full"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm p-4 text-center">No poster available</div>
                    )}
                    
                    {trackedItem && (
                      <div className="absolute top-2 right-2">
                        <MediaStatusBadge status={trackedItem.status} mediaType="tvshow" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 
                      className="font-semibold text-lg line-clamp-1 cursor-pointer"
                      onClick={() => handleShowClick(series.id)}
                    >
                      {series.name}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">
                      First aired: {series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'Unknown'}
                    </p>
                    <div className="mt-2 flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 text-sm">{series.vote_average.toFixed(1)}/10</span>
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
                            onClick={() => handleShowClick(series.id)}
                          >
                            Details
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRemoveShow(trackedItem.id, series.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        className="w-full mt-3" 
                        size="sm"
                        onClick={() => handleAddShow(series, 'want_to_view')}
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
                <p className="text-gray-500">No TV shows found. Try a different search term.</p>
              ) : (
                <p className="text-gray-500">Search for TV shows to start tracking your series!</p>
              )}
            </div>
          )
        )}

        {/* TV Show Details Dialog */}
        <Dialog open={selectedShowId !== null} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="sm:max-w-3xl">
            {isLoadingDetails ? (
              <div className="py-8 text-center">
                <p>Loading TV show details...</p>
              </div>
            ) : showDetails ? (
              <div className="max-h-[80vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                  <div className="flex justify-between items-start">
                    <DialogTitle className="text-2xl">{showDetails.name}</DialogTitle>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm mt-1">
                    {showDetails.genres?.map(genre => (
                      <span key={genre.id} className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </DialogHeader>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3 flex-shrink-0">
                    {showDetails.poster_path ? (
                      <img 
                        src={getImageUrl(showDetails.poster_path, "w500")} 
                        alt={showDetails.name}
                        className="w-full rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-400">No poster available</p>
                      </div>
                    )}
                    
                    {/* TV Show tracking controls */}
                    <div className="mt-4 space-y-4">
                      {isMediaTracked(showDetails.id, 'tvshow') ? (
                        <>
                          {/* Status selector */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Status:</label>
                            <Select 
                              defaultValue={getTrackedMediaItem(showDetails.id, 'tvshow')?.status}
                              onValueChange={(value) => handleUpdateStatus(
                                `tvshow_${showDetails.id}`, 
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
                              rating={getTrackedMediaItem(showDetails.id, 'tvshow')?.rating || 0} 
                              onChange={(rating) => handleUpdateRating(`tvshow_${showDetails.id}`, rating)}
                            />
                          </div>
                          
                          {/* Remove button */}
                          <Button 
                            variant="destructive" 
                            className="w-full"
                            onClick={() => {
                              handleRemoveShow(`tvshow_${showDetails.id}`, showDetails.name);
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
                            onClick={() => handleAddShow(showDetails, 'want_to_view')}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" /> Add to Want to Watch
                          </Button>
                          <Button 
                            className="w-full"
                            variant="outline"
                            onClick={() => handleAddShow(showDetails, 'in_progress')}
                          >
                            Add as Currently Watching
                          </Button>
                          <Button 
                            className="w-full"
                            variant="outline" 
                            onClick={() => handleAddShow(showDetails, 'finished')}
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
                        <span className="text-sm">First aired: {showDetails.first_air_date ? new Date(showDetails.first_air_date).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="text-yellow-500 h-4 w-4" />
                        <span className="text-sm">Rating: {showDetails.vote_average.toFixed(1)}/10</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PlayCircle className="text-gray-500 h-4 w-4" />
                        <span className="text-sm">Status: {showDetails.status || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tv className="text-gray-500 h-4 w-4" />
                        <span className="text-sm">Seasons: {showDetails.number_of_seasons || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hash className="text-gray-500 h-4 w-4" />
                        <span className="text-sm">Episodes: {showDetails.number_of_episodes || 'N/A'}</span>
                      </div>
                    </div>

                    {showDetails.networks && showDetails.networks.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-semibold mb-2">Networks</h3>
                        <div className="flex flex-wrap gap-3">
                          {showDetails.networks.map(network => (
                            <div key={network.id} className="flex items-center">
                              {network.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div>
                      <h3 className="font-semibold mb-2">Overview</h3>
                      <p className="text-gray-700">{showDetails.overview || 'No overview available.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-red-500">Failed to load TV show details.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SeriesPage;
