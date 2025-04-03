import { useState, useEffect, useLayoutEffect } from 'react';

type BreakpointConfig = {
  [key: string]: number;
};

export default function useResponsiveItemCount(
  config: BreakpointConfig = {
    sm: 4,   // < 640px
    md: 6,   // 640px - 768px  
    lg: 8,   // 768px - 1024px
    xl: 10,  // 1024px - 1280px
    '2xl': 12 // > 1280px
  }
) {
  // Get initial count based on window size
  const getInitialCount = () => {
    // Make sure we're in browser environment
    if (typeof window === 'undefined') return config.lg; // Default for SSR
    
    const width = window.innerWidth;
    
    if (width < 640) return config.sm;
    if (width < 768) return config.md;
    if (width < 1024) return config.lg;
    if (width < 1280) return config.xl;
    return config['2xl'];
  };
  
  const [itemCount, setItemCount] = useState(getInitialCount);
  
  // Use useLayoutEffect to ensure this runs before render
  useLayoutEffect(() => {
    // Function to update item count based on window width
    const updateItemCount = () => {
      const width = window.innerWidth;
      
      if (width < 640) {
        setItemCount(config.sm);
      } else if (width < 768) {
        setItemCount(config.md);
      } else if (width < 1024) {
        setItemCount(config.lg);
      } else if (width < 1280) {
        setItemCount(config.xl);
      } else {
        setItemCount(config['2xl']);
      }
    };
    
    // Set initial count
    updateItemCount();
    
    // Add resize listener
    window.addEventListener('resize', updateItemCount);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateItemCount);
  }, [config]);
  
  return itemCount;
}