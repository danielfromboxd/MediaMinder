import { useState, useEffect } from 'react';
import { OpenLibrarySearchResponse, searchBooks } from '@/services/openLibraryService';

export function useBookSearch(query: string, isSearching: boolean) {
  const [data, setData] = useState<OpenLibrarySearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Reset when search query changes
    if (query.length < 3) {
      setIsLoading(false);
      return;
    }
    
    // Create a timeout ID for debouncing
    const timeoutId = setTimeout(() => {
      if (isSearching && query.length >= 3) {
        setIsLoading(true);
        setError(null);
        
        searchBooks(query)
          .then((results) => {
            setData(results);
            setIsLoading(false);
          })
          .catch((err) => {
            console.error("Book search error:", err);
            setError(err);
            setIsLoading(false);
          });
      }
    }, 500); // 500ms debounce delay
    
    // Clear the timeout if the component unmounts or query changes
    return () => clearTimeout(timeoutId);
  }, [query, isSearching]);

  return { data, isLoading, error };
}
