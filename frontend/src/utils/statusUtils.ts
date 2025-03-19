import { MediaStatus, MediaType } from '@/contexts/MediaTrackingContext';

/**
 * Returns appropriate display text for a media status based on the media type
 */
export const getStatusDisplayText = (status: MediaStatus, mediaType?: MediaType): string => {
  switch (status) {
    case 'want_to_view':
      return mediaType === 'book' ? 'Want to read' : 'Want to watch';
      
    case 'in_progress':
      return mediaType === 'book' ? 'Currently reading' : 'Currently watching';
      
    case 'finished':
      return mediaType === 'book' ? 'Finished reading' : 'Finished watching';
      
    default:
      // For type safety, cast to string before using replace
      return String(status).replace('_', ' '); 
  }
};

/**
 * Returns generic display text for media status (for filter controls)
 */
export const getGenericStatusDisplayText = (status: MediaStatus): string => {
  switch (status) {
    case 'want_to_view':
      return 'To-do';
      
    case 'in_progress':
      return 'In progress';
      
    case 'finished':
      return 'Finished';
      
    default:
      return String(status).replace('_', ' ');
  }
};