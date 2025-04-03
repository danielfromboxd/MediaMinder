import { useState, useEffect } from 'react';
import { useMediaTracking } from '@/contexts/MediaTrackingContext';
import { generateRecommendations } from '@/services/recommendationService';

export const useRecommendations = (forceRefresh = false) => {
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
        
        setRecommendations(recommendedItems);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [getAllMedia, forceRefresh]);

  return {
    recommendations,
    isLoading,
    error,
    refresh: () => generateRecommendations(getAllMedia(), true).then(setRecommendations)
  };
};