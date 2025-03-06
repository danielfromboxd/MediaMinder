import React, { useState, useEffect } from 'react';
import { NavigationSelector, DetailedMediaView as DetailedMediaViewComponent } from '../components';
import '../styles/detailedMediaView.css';

const DetailedMediaViewPage = ({ mediaType: initialMediaType = 'book', mediaId = '1' }) => {
  // State to store the media type and data
  const [mediaType, setMediaType] = useState(initialMediaType);
  const [mediaData, setMediaData] = useState(null);
  
  // In a real application, we would get these parameters from the URL
  // For example: /media/book/123 or /media/movie/456
  
  useEffect(() => {
    // This would be replaced with actual API calls in the future
    // For now, we'll use dummy data based on the media type
    
    // Simulate API loading
    const loadMediaData = () => {
      // Dummy data for different media types
      const dummyData = {
        book: {
          mediaType: 'book',
          title: 'The Great Book',
          metadata: '2022 • English • Fiction • 320 pages',
          summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vitae eros commodo, commodo eros vel, sollicitudin quam. Etiam aliquam dui ut cursus auctor. Curabitur eget porta turpis, ac convallis mi. Suspendisse blandit arcu felis, non tempus ex luctus eu. Maecenas fringilla pretium mi, ornare rhoncus justo ultrices vel.',
          poster: '',
          status: 'want-to-view'
        },
        movie: {
          mediaType: 'movie',
          title: 'Awesome Movie',
          metadata: '2023 • English • Action • 2h 15m',
          summary: 'A thrilling action movie with spectacular visual effects. The protagonist must overcome numerous obstacles to save the world from impending doom.',
          poster: '',
          cast: ['Actor One', 'Actor Two', 'Actor Three', 'Actor Four'],
          status: 'in-progress'
        },
        series: {
          mediaType: 'series',
          title: 'Epic Series',
          metadata: '2021-2023 • English • Drama • 3 seasons',
          summary: 'An epic drama series following the lives of several interconnected characters as they navigate complex relationships and challenging situations.',
          poster: '',
          cast: ['Actor One', 'Actor Two', 'Actor Three', 'Actor Four'],
          status: 'finished'
        }
      };
      
      // Set the media data based on the media type
      setMediaData(dummyData[mediaType] || dummyData.book);
    };
    
    loadMediaData();
  }, [mediaType, mediaId]);
  
  // Handle media type change (for demonstration purposes)
  const handleMediaTypeChange = (type) => {
    setMediaType(type);
  };

  // Handle rating change
  const handleRatingChange = (rating) => {
    console.log(`Rating changed for ${mediaType} (ID: ${mediaId}):`, rating);
    // In a real application, this would update the rating in the database
  };

  // Handle action button click
  const handleActionButtonClick = (action) => {
    console.log(`Action ${action} clicked for ${mediaType} (ID: ${mediaId})`);
    // In a real application, this would update the status in the database
  };

  // If media data is not loaded yet, show loading
  if (!mediaData) {
    return <div className="loading">Loading media details...</div>;
  }

  return (
    // Depth 0: FRAME (Detailed media view)
    <div className="detailed-media-view-page">
      {/* Depth 1: INSTANCE (Navigation Selector) */}
      <div className="navigation-sidebar">
        <NavigationSelector defaultOpen={true} />
      </div>

      <div className="content-area">
        {/* Depth 1: FRAME (Site title + logo) */}
        <div className="site-header">
          {/* Depth 2: RECTANGLE (Logo) */}
          <div className="site-logo">
            <img src="/assets/logo.svg" alt="Media Minder Logo" />
          </div>
          {/* Depth 2: TEXT (MEDIA MINDER) */}
          <h1 className="site-title">MEDIA<br />MINDER</h1>
        </div>
        
        {/* Media Type Selector (for demonstration purposes) */}
        <div className="media-type-selector">
          <button 
            className={`type-button ${mediaType === 'book' ? 'active' : ''}`}
            onClick={() => handleMediaTypeChange('book')}
          >
            Book
          </button>
          <button 
            className={`type-button ${mediaType === 'movie' ? 'active' : ''}`}
            onClick={() => handleMediaTypeChange('movie')}
          >
            Movie
          </button>
          <button 
            className={`type-button ${mediaType === 'series' ? 'active' : ''}`}
            onClick={() => handleMediaTypeChange('series')}
          >
            Series
          </button>
        </div>

        {/* Depth 1: INSTANCE (Detailed Media View) */}
        <div className="media-view-container">
          <DetailedMediaViewComponent 
            mediaType={mediaData.mediaType}
            title={mediaData.title}
            metadata={mediaData.metadata}
            summary={mediaData.summary}
            poster={mediaData.poster}
            cast={mediaData.cast}
            status={mediaData.status}
            onRatingChange={handleRatingChange}
            onActionButtonClick={handleActionButtonClick}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailedMediaViewPage;