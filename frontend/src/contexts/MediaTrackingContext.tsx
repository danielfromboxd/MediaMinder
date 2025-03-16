import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { mediaAPI } from '@/services/apiService';
import { TMDBMovie, TMDBTVShow } from '@/services/tmdbService';
import { OpenLibraryBook } from '@/services/openLibraryService';

// Media types
export type MediaType = 'movie' | 'book' | 'tvshow';

// Status types
export type MediaStatus = 'want_to_view' | 'in_progress' | 'finished';

// Media item with tracking information
export interface TrackedMedia {
  id: string; // Unique identifier 
  mediaId: string | number; // Original ID from the API
  type: MediaType;
  title: string;
  posterPath?: string | null;
  rating?: number; // 1-5 stars
  status: MediaStatus;
  addedAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

interface MediaTrackingContextType {
  trackedMedia: TrackedMedia[];
  isLoading: boolean;
  error: string | null;
  addMedia: (media: TMDBMovie | TMDBTVShow | OpenLibraryBook, type: MediaType, status: MediaStatus) => Promise<boolean>;
  updateMediaStatus: (mediaId: string, status: MediaStatus) => Promise<boolean>;
  updateMediaRating: (mediaId: string, rating: number) => Promise<boolean>;
  removeMedia: (mediaId: string) => Promise<boolean>;
  getMediaByStatus: (status: MediaStatus) => TrackedMedia[];
  isMediaTracked: (originalId: number | string, type: MediaType) => boolean;
  getTrackedMediaItem: (originalId: number | string, type: MediaType) => TrackedMedia | null;
  getAllMedia: () => TrackedMedia[];
}

const MediaTrackingContext = createContext<MediaTrackingContextType | undefined>(undefined);

export const MediaTrackingProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoggedIn } = useAuth();
  const [trackedMedia, setTrackedMedia] = useState<TrackedMedia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tracked media from API when user is logged in
  useEffect(() => {
    const fetchUserMedia = async () => {
      if (!isLoggedIn) {
        console.log("User not logged in, clearing media data");
        setTrackedMedia([]);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log("Fetching user media...");
        const data = await mediaAPI.getUserMedia();
        console.log("Fetched media data:", data);
        
        if (!data || data.length === 0) {
          console.log("No media found for user");
          setTrackedMedia([]);
          return;
        }
        
        // Check if data has the expected structure
        if (!Array.isArray(data)) {
          console.error("Expected array from API but got:", typeof data);
          setError("Invalid data format received from server");
          return;
        }
        
        // Transform the data to match our TrackedMedia interface
        const transformedMedia = data.map((item: any): TrackedMedia | null => {
          console.log("Processing item:", item);
          
          // Check if item has required properties
          if (!item.media || !item.media.external_id) {
            console.error("Item missing required properties:", item);
            return null;
          }
          
          return {
            id: item.id.toString(),
            mediaId: item.media.external_id,
            type: item.media.type === 'series' ? 'tvshow' : item.media.type as MediaType,
            title: item.media.title,
            posterPath: item.media.image_url || null,
            rating: item.rating,
            status: item.status as MediaStatus,
            addedAt: item.updated_at || new Date().toISOString(),
            updatedAt: item.updated_at || new Date().toISOString()
          };
        }).filter((item): item is TrackedMedia => item !== null);
        
        console.log("Transformed media:", transformedMedia);
        setTrackedMedia(transformedMedia);
      } catch (err: any) {
        console.error('Failed to fetch media:', err);
        setError('Failed to load your tracked media');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserMedia();
  }, [isLoggedIn, user]);

  const addMedia = async (
    media: TMDBMovie | TMDBTVShow | OpenLibraryBook, 
    type: MediaType, 
    status: MediaStatus
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("➡️ Add Media INPUT:", { media, type, status });
      
      // Restructure the data to match backend expectations
      const mediaData = {
        // These are the exact field names expected by the backend
        media_id: type === 'book' ? 
          (media as OpenLibraryBook).key : 
          String((media as TMDBMovie | TMDBTVShow).id),
        media_type: type === 'tvshow' ? 'series' : type,
        status: status,
        
        // Additional fields needed for new media
        title: type === 'book' ? 
          (media as OpenLibraryBook).title : 
          type === 'movie' ? (media as TMDBMovie).title : 
          (media as TMDBTVShow).name,
        poster_path: type === 'book' ? 
          `https://covers.openlibrary.org/b/id/${(media as OpenLibraryBook).cover_i}-M.jpg` : 
          `https://image.tmdb.org/t/p/w500${(media as TMDBMovie | TMDBTVShow).poster_path}`
      };
      
      console.log("➡️ API Request Data:", JSON.stringify(mediaData));
      
      const response = await mediaAPI.addMedia(mediaData);
      console.log("API Response:", response);
      
      const updatedMedia = await mediaAPI.getUserMedia();
      console.log("Updated media list:", updatedMedia);
      
      // Transform the data to match our interface
      const transformedMedia = updatedMedia.map((item: any) => ({
        id: item.id.toString(),
        mediaId: item.media.external_id,
        type: item.media.type,
        title: item.media.title,
        posterPath: item.media.image_url,
        rating: item.rating,
        status: item.status,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      // Update state with the latest data
      setTrackedMedia(transformedMedia);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("Error adding media:", err);
      setError(err.response?.data?.message || 'Failed to add media');
      setIsLoading(false);
      return false;
    }
  };

  const updateMediaStatus = async (mediaId: string, status: MediaStatus): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await mediaAPI.updateMediaStatus(parseInt(mediaId), status);
      
      // Update local state
      setTrackedMedia(prev =>
        prev.map(item =>
          item.id === mediaId
            ? { ...item, status, updatedAt: response.item.updated_at }
            : item
        )
      );
      
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setError(err.response?.data?.message || 'Failed to update status');
      setIsLoading(false);
      return false;
    }
  };

  const updateMediaRating = async (mediaId: string, rating: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await mediaAPI.updateMediaRating(parseInt(mediaId), rating);
      
      // Update local state
      setTrackedMedia(prev =>
        prev.map(item =>
          item.id === mediaId
            ? { ...item, rating, updatedAt: response.item.updated_at }
            : item
        )
      );
      
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error('Failed to update rating:', err);
      setError(err.response?.data?.message || 'Failed to update rating');
      setIsLoading(false);
      return false;
    }
  };

  const removeMedia = async (mediaId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      await mediaAPI.deleteMedia(parseInt(mediaId));
      
      // Update local state
      setTrackedMedia(prev => prev.filter(item => item.id !== mediaId));
      
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error('Failed to remove media:', err);
      setError(err.response?.data?.message || 'Failed to remove media');
      setIsLoading(false);
      return false;
    }
  };

  // Helper functions that don't need to change
  const getMediaByStatus = (status: MediaStatus) => {
    return trackedMedia.filter(item => item.status === status);
  };

  const isMediaTracked = (originalId: number | string, type: MediaType) => {
    return trackedMedia.some(item => item.mediaId.toString() === originalId.toString() && item.type === type);
  };

  const getTrackedMediaItem = (originalId: number | string, type: MediaType) => {
    return trackedMedia.find(item => item.mediaId.toString() === originalId.toString() && item.type === type) || null;
  };

  const getAllMedia = () => {
    return trackedMedia;
  };

  return (
    <MediaTrackingContext.Provider
      value={{
        trackedMedia,
        isLoading,
        error,
        addMedia,
        updateMediaStatus,
        updateMediaRating,
        removeMedia,
        getMediaByStatus,
        isMediaTracked,
        getTrackedMediaItem,
        getAllMedia
      }}
    >
      {children}
    </MediaTrackingContext.Provider>
  );
};

export const useMediaTracking = () => {
  const context = useContext(MediaTrackingContext);
  if (context === undefined) {
    throw new Error('useMediaTracking must be used within a MediaTrackingProvider');
  }
  return context;
};
