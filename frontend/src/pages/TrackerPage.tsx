import React, { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import { useMediaTracking, TrackedMedia, MediaStatus } from '@/contexts/MediaTrackingContext';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/services/tmdbService';
import { getBookCoverUrl } from '@/services/openLibraryService';
import MediaStatusBadge from '@/components/MediaStatusBadge';
import StarRating from '@/components/StarRating';
import FilterBar, { MediaFilter } from '@/components/FilterBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Tv, Film, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { getStatusDisplayText } from '@/utils/statusUtils';

const TrackerPage = () => {
  const { isLoggedIn } = useAuth();
  const { trackedMedia, updateMediaStatus, updateMediaRating, removeMedia } = useMediaTracking();
  
  // Initialize filter state
  const [filter, setFilter] = useState<MediaFilter>({
    status: 'all',
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });
  
  // Initialize media type filter
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'book' | 'movie' | 'tvshow'>('all');

  // Apply filters and sorting
  const filteredMedia = useMemo(() => {
    if (!trackedMedia.length) return [];
    
    let filtered = [...trackedMedia];
    
    // Filter by status if not 'all'
    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(item => item.status === filter.status);
    }
    
    // Filter by media type if not 'all'
    if (mediaTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === mediaTypeFilter);
    }
    
    // Sort the results
    if (filter.sortBy) {
      filtered.sort((a, b) => {
        // Special case for rating, which might be undefined
        if (filter.sortBy === 'rating') {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return filter.sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
        }
        
        // For string comparison (title)
        if (filter.sortBy === 'title') {
          return filter.sortOrder === 'asc' 
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        }
        
        // For date comparison (addedAt, updatedAt)
        const dateA = new Date(a[filter.sortBy as 'addedAt' | 'updatedAt']).getTime();
        const dateB = new Date(b[filter.sortBy as 'addedAt' | 'updatedAt']).getTime();
        return filter.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
    
    return filtered;
  }, [trackedMedia, filter, mediaTypeFilter]);

  const getMediaImageSrc = (media: TrackedMedia) => {
    if (media.type === 'book' && media.posterPath) {
      return getBookCoverUrl(Number(media.posterPath));
    } else if ((media.type === 'movie' || media.type === 'tvshow') && media.posterPath) {
      return getImageUrl(media.posterPath);
    }
    return null;
  };

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <Book className="h-4 w-4 text-blue-500" />;
      case 'movie':
        return <Film className="h-4 w-4 text-purple-500" />;
      case 'tvshow':
        return <Tv className="h-4 w-4 text-indigo-500" />;
      default:
        return null;
    }
  };

  const handleStatusChange = (mediaId: string, status: any) => {
    updateMediaStatus(mediaId, status);
  };

  const handleRatingChange = (mediaId: string, rating: number) => {
    updateMediaRating(mediaId, rating);
  };

  const handleDeleteMedia = (mediaId: string, title: string) => {
    removeMedia(mediaId);
    toast({
      title: "Media removed",
      description: `${title} has been removed from your collection.`,
      variant: "destructive",
    });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Media Tracker</h1>
        
        {isLoggedIn ? (
          <>
            <Tabs defaultValue="all" className="mb-6">
              <TabsList className="grid w-full grid-cols-4 mb-2">
                <TabsTrigger value="all" onClick={() => setMediaTypeFilter('all')}>
                  All
                </TabsTrigger>
                <TabsTrigger value="books" onClick={() => setMediaTypeFilter('book')}>
                  <Book className="h-4 w-4 mr-2" /> Books
                </TabsTrigger>
                <TabsTrigger value="movies" onClick={() => setMediaTypeFilter('movie')}>
                  <Film className="h-4 w-4 mr-2" /> Movies
                </TabsTrigger>
                <TabsTrigger value="tvshows" onClick={() => setMediaTypeFilter('tvshow')}>
                  <Tv className="h-4 w-4 mr-2" /> TV Shows
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <FilterBar filter={filter} onFilterChange={setFilter} />
            
            {filteredMedia.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredMedia.map(media => (
                  <div 
                    key={media.id} 
                    className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex"
                  >
                    <div className="w-24 h-32 bg-gray-100 flex-shrink-0">
                      {media.posterPath ? (
                        <img 
                          src={getMediaImageSrc(media)} 
                          alt={media.title}
                          className="h-full object-cover w-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          {getMediaTypeIcon(media.type)}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            {getMediaTypeIcon(media.type)}
                            <h3 className="font-semibold text-lg">{media.title}</h3>
                          </div>
                          
                          <div className="mt-2 flex flex-wrap gap-2">
                            <div className="mr-4">
                              <p className="text-xs text-gray-500 mb-1">Status</p>
                              <select 
                                className="text-sm p-1 border rounded"
                                value={media.status}
                                onChange={(e) => handleStatusChange(media.id, e.target.value as MediaStatus)}
                              >
                                <option value="want_to_view">
                                  {getStatusDisplayText('want_to_view', media.type)}
                                </option>
                                <option value="in_progress">
                                  {getStatusDisplayText('in_progress', media.type)}
                                </option>
                                <option value="finished">
                                  {getStatusDisplayText('finished', media.type)}
                                </option>
                              </select>
                            </div>
                            
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Your Rating</p>
                              <StarRating 
                                rating={media.rating || 0} 
                                onChange={(rating) => handleRatingChange(media.id, rating)}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <div className="text-xs text-gray-500">
                            <div>Added: {new Date(media.addedAt).toLocaleDateString()}</div>
                            <div>Updated: {new Date(media.updatedAt).toLocaleDateString()}</div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => handleDeleteMedia(media.id, media.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <p className="text-gray-500">No media found with the current filters.</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-500">Log in to view your tracked media!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackerPage;
