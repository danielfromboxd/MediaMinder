import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { mediaAPI } from '@/services/apiService';
import { TMDBMovie, TMDBTVShow } from '@/services/tmdbService';
import { OpenLibraryBook } from '@/services/openLibraryService';
import { getBookCoverUrl } from '@/services/openLibraryService';

// Media types
export type MediaType = 'movie' | 'book' | 'tvshow';

// Status types
export type MediaStatus = 'want_to_view' | 'in_progress' | 'finished' | 'none';

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
  coverData?: string;
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
  isMediaTracked: (originalId: number | string | undefined, type: MediaType) => boolean;
  getTrackedMediaItem: (originalId: number | string | undefined, type: MediaType) => TrackedMedia | null;
  getAllMedia: () => TrackedMedia[];
}

const MediaTrackingContext = createContext<MediaTrackingContextType | undefined>(undefined);

export function MediaTrackingProvider({ children }: { children: ReactNode }) {
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
      
      // Special handling for books to ensure cover images work
      let posterPath = '';
      let coverImageUrl = ''; // Add direct image URL

      if (type === 'book') {
        const book = media as any;
        
        // Store the cover ID in posterPath, but ALSO compute the full URL
        posterPath = book.cover_i ? 
          `${book.cover_i}` : 
          book.cover_edition_key ? 
            `olid:${book.cover_edition_key}` : '';
        
        // Pre-compute the image URL
        coverImageUrl = getBookCoverUrl({
          cover_i: book.cover_i,
          cover_edition_key: book.cover_edition_key,
          isbn: book.isbn
        }, "M");
      } else {
        posterPath = (media as TMDBMovie | TMDBTVShow).poster_path || '';
      }
      
      // Restructure the data to match backend expectations
      const mediaData = {
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
        poster_path: posterPath,
        image_url: coverImageUrl,  // Add this field
        
        // For books, also store raw cover data
        cover_data: type === 'book' ? JSON.stringify({
          cover_i: (media as any).cover_i,
          cover_edition_key: (media as any).cover_edition_key,
          isbn: (media as any).isbn
        }) : null
      };
      
      console.log("➡️ API Request Data:", JSON.stringify(mediaData));
      
      const response = await mediaAPI.addMedia(mediaData);
      console.log("API Response:", response);
      
      // Fetch the updated media list from the API
      const updatedMedia = await mediaAPI.getUserMedia();
      console.log("Updated media list:", updatedMedia);
      
      // Transform the data to match our interface
      const transformedMedia = updatedMedia.map((item: any) => ({
        id: item.id.toString(),
        mediaId: item.media.external_id,
        type: item.media.type === 'series' ? 'tvshow' : item.media.type as MediaType,
        title: item.media.title,
        posterPath: item.media.image_url || null,
        rating: item.rating,
        status: item.status as MediaStatus,
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
    console.log(`⭐ Starting to update rating for ${mediaId} to ${rating}`);
    try {
      // Extract the actual ID part from the compound ID
      let actualId: string | number;
      let mediaType: MediaType = 'movie'; // Default
      
      if (mediaId.includes('_')) {
        const [typePrefix, id] = mediaId.split('_', 2);
        actualId = id;
        
        // Set media type based on prefix
        if (typePrefix === 'book') mediaType = 'book';
        else if (typePrefix === 'tvshow') mediaType = 'tvshow';
        else mediaType = 'movie';
        
        console.log(`Extracted ID ${actualId} from ${mediaId}, type: ${mediaType}`);
      } else {
        actualId = mediaId;
      }
      
      // Get the tracked media item to get its internal database ID
      const trackedItem = trackedMedia.find(item => {
        if (mediaId.includes('_')) {
          // For compound IDs (movie_123, book_abc), match on mediaId
          return item.mediaId.toString() === actualId.toString();
        } else {
          // For simple IDs, try exact match or mediaId match
          return item.id === mediaId || item.mediaId.toString() === mediaId.toString();
        }
      });
      
      if (!trackedItem) {
        console.error(`Cannot find tracked item with ID: ${mediaId}`);
        return false;
      }
      
      // Use the actual database ID for the API call
      const dbId = trackedItem.id;
      console.log(`Found tracked item with internal DB ID: ${dbId}`);
      
      // Call API with the correct internal database ID
      console.log(`Calling API with ID: ${dbId}, Rating: ${rating}`);
      const result = await mediaAPI.updateMediaRating(parseInt(dbId), rating);
      console.log("API response:", result);
      
      // Update local state
      setTrackedMedia(prev => {
        return prev.map(item => {
          if (item.id === dbId) {
            console.log(`Updating rating for ${item.title} from ${item.rating} to ${rating}`);
            return { ...item, rating };
          }
          return item;
        });
      });
      
      return true;
    } catch (err) {
      console.error('Failed to update rating:', err);
      return false;
    }
  };

  const removeMedia = async (mediaId: string): Promise<boolean> => {
    console.log(`🗑️ Removing media with ID: ${mediaId}`);
    try {
      setIsLoading(true);
      
      // Get the tracked item to find the internal database ID
      let dbId: string | number | null = null;
      let actualId;
      
      if (mediaId.includes('_')) {
        const [_, id] = mediaId.split('_', 2);
        actualId = id;
        
        // Find the internal database ID for this media item
        const trackedItem = trackedMedia.find(item => 
          item.mediaId.toString() === actualId.toString()
        );
        
        if (trackedItem) {
          dbId = trackedItem.id;
          console.log(`Found item with DB ID: ${dbId}`);
        }
      } else {
        // Assume it's already the DB ID
        dbId = mediaId;
      }
      
      if (!dbId) {
        console.error(`Cannot find item to remove with ID: ${mediaId}`);
        setIsLoading(false);
        return false;
      }
      
      // Make API call with the internal database ID
      console.log(`Calling API to delete item with ID: ${dbId}`);
      await mediaAPI.deleteMedia(parseInt(dbId.toString()));
      
      // Update local state
      setTrackedMedia(prev => prev.filter(item => item.id !== dbId));
      
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

  const isMediaTracked = (originalId: number | string | undefined, type: MediaType) => {
    // Return false if ID is undefined or null
    if (originalId === undefined || originalId === null) {
      return false;
    }
    
    // Handle IDs that might be formatted as "type_id" (like "book_123")
    let idToCheck = originalId.toString();
    if (typeof originalId === 'string' && originalId.includes('_')) {
      idToCheck = originalId.split('_')[1];
    }
    
    return trackedMedia.some(item => 
      item.mediaId.toString() === idToCheck.toString() && 
      item.type === type
    );
  };

  const getTrackedMediaItem = (originalId: number | string | undefined, type: MediaType) => {
    if (originalId === undefined || originalId === null) {
      return null;
    }

    let idToCheck = originalId.toString();
    if (typeof originalId === 'string' && originalId.includes('_')) {
      idToCheck = originalId.split('_')[1];
    }

    return trackedMedia.find(item => 
      item.mediaId.toString() === idToCheck.toString() && 
      item.type === type
    ) || null;
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
}

export function useMediaTracking() {
  const context = useContext(MediaTrackingContext);
  if (context === undefined) {
    throw new Error('useMediaTracking must be used within a MediaTrackingProvider');
  }
  return context;
}
