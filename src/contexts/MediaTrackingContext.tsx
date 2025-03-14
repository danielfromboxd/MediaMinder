
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { TMDBMovie, TMDBTVShow } from '@/services/tmdbService';
import { OpenLibraryBook } from '@/services/openLibraryService';

// Media types
export type MediaType = 'movie' | 'tvshow' | 'book';

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
  addMedia: (media: TMDBMovie | TMDBTVShow | OpenLibraryBook, type: MediaType, status: MediaStatus) => void;
  updateMediaStatus: (mediaId: string, status: MediaStatus) => void;
  updateMediaRating: (mediaId: string, rating: number) => void;
  removeMedia: (mediaId: string) => void;
  getMediaByStatus: (status: MediaStatus) => TrackedMedia[];
  isMediaTracked: (originalId: number | string, type: MediaType) => boolean;
  getTrackedMediaItem: (originalId: number | string, type: MediaType) => TrackedMedia | null;
  getAllMedia: () => TrackedMedia[];
}

const MediaTrackingContext = createContext<MediaTrackingContextType | undefined>(undefined);

export const MediaTrackingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [trackedMedia, setTrackedMedia] = useState<TrackedMedia[]>([]);

  // Load tracked media from localStorage when component mounts or user changes
  useEffect(() => {
    if (user) {
      const storedMedia = localStorage.getItem(`tracked_media_${user.email}`);
      if (storedMedia) {
        setTrackedMedia(JSON.parse(storedMedia));
      }
    } else {
      setTrackedMedia([]);
    }
  }, [user]);

  // Save tracked media to localStorage whenever it changes
  useEffect(() => {
    if (user && trackedMedia.length > 0) {
      localStorage.setItem(`tracked_media_${user.email}`, JSON.stringify(trackedMedia));
    }
  }, [trackedMedia, user]);

  const addMedia = (
    media: TMDBMovie | TMDBTVShow | OpenLibraryBook, 
    type: MediaType, 
    status: MediaStatus
  ) => {
    const now = new Date().toISOString();
    
    // Get the correct media ID based on type
    const mediaId = type === 'book' ? (media as OpenLibraryBook).key : (media as TMDBMovie | TMDBTVShow).id;
    
    // Create a unique ID as a string
    const uniqueId = `${type}_${mediaId}`;
    
    // Check if media already exists by its unique ID
    const exists = trackedMedia.some(item => item.id === uniqueId);
    
    if (exists) {
      // Update existing media without adding a duplicate
      setTrackedMedia(prevMedia =>
        prevMedia.map(item =>
          item.id === uniqueId
            ? { ...item, status, updatedAt: now }
            : item
        )
      );
    } else {
      // Add new media
      const newMedia: TrackedMedia = {
        id: uniqueId,
        mediaId: mediaId,
        type,
        title: type === 'book' ? (media as OpenLibraryBook).title : type === 'movie' ? (media as TMDBMovie).title : (media as TMDBTVShow).name,
        posterPath: type === 'book' ? (media as OpenLibraryBook).cover_i?.toString() : (media as TMDBMovie | TMDBTVShow).poster_path,
        status,
        addedAt: now,
        updatedAt: now
      };
      
      setTrackedMedia(prevMedia => [...prevMedia, newMedia]);
    }
  };

  const updateMediaStatus = (mediaId: string, status: MediaStatus) => {
    setTrackedMedia(prevMedia =>
      prevMedia.map(item =>
        item.id === mediaId
          ? { ...item, status, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const updateMediaRating = (mediaId: string, rating: number) => {
    setTrackedMedia(prevMedia =>
      prevMedia.map(item =>
        item.id === mediaId
          ? { ...item, rating, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const removeMedia = (mediaId: string) => {
    setTrackedMedia(prevMedia => prevMedia.filter(item => item.id !== mediaId));
  };

  const getMediaByStatus = (status: MediaStatus) => {
    return trackedMedia.filter(item => item.status === status);
  };

  const isMediaTracked = (originalId: number | string, type: MediaType) => {
    const uniqueId = `${type}_${originalId}`;
    return trackedMedia.some(item => item.id === uniqueId);
  };

  const getTrackedMediaItem = (originalId: number | string, type: MediaType) => {
    const uniqueId = `${type}_${originalId}`;
    return trackedMedia.find(item => item.id === uniqueId) || null;
  };

  const getAllMedia = () => {
    return trackedMedia;
  };

  return (
    <MediaTrackingContext.Provider
      value={{
        trackedMedia,
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
