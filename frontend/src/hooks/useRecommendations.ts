import { useState, useEffect } from 'react';
import { useMediaTracking } from '@/contexts/MediaTrackingContext';
import { generateRecommendations } from '@/services/recommendationService';

export const useRecommendations = (forceRefresh = false, maxItems?: number) => {
  const { getAllMedia } = useMediaTracking();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const allMedia = getAllMedia();
        const recommendedItems = await generateRecommendations(allMedia, forceRefresh);
        
        // If maxItems is provided, limit the number of recommendations
        const limitedItems = maxItems ? recommendedItems.slice(0, maxItems) : recommendedItems;
        setRecommendations(limitedItems);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [getAllMedia, forceRefresh, maxItems]); // Make sure maxItems is included here

  // Also include maxItems in the refresh function
  const refresh = async () => {
    setIsLoading(true);
    try {
      const allMedia = getAllMedia();
      const recommendedItems = await generateRecommendations(allMedia, true);
      const limitedItems = maxItems ? recommendedItems.slice(0, maxItems) : recommendedItems;
      setRecommendations(limitedItems);
    } catch (err) {
      console.error('Error refreshing recommendations:', err);
      setError('Failed to refresh recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recommendations,
    isLoading,
    error,
    refresh
  };
};