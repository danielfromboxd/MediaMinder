import React from 'react';
import './DetailedMediaView.css';
import { ActionButtons, StarRating } from '../index';

// Cast Member component
const CastMember = ({ name }) => (
  // Depth 3: FRAME (Cast member)
  <div className="cast-member">
    {/* Depth 4: TEXT (Cast member) */}
    <p className="cast-member-name">{name}</p>
    {/* Depth 4: RECTANGLE (Rectangle 1) */}
    <div className="cast-member-image"></div>
  </div>
);

// Tag component
const Tag = ({ type }) => {
  let className = "tag";
  let text = "";
  
  switch (type) {
    case "want-to-view":
      className += " want-to-view";
      text = "want to view";
      break;
    case "in-progress":
      className += " in-progress";
      text = "in progress";
      break;
    case "finished":
      className += " finished";
      text = "finished";
      break;
    default:
      break;
  }
  
  return (
    // Depth 3: FRAME (Tag)
    <div className={className}>
      {/* Depth 4: TEXT */}
      <span className="tag-text">{text}</span>
    </div>
  );
};

const DetailedMediaView = ({ 
  mediaType = 'book', // 'book', 'movie', 'series'
  title = '',
  metadata = '',
  summary = '',
  poster = '',
  cast = [],
  status = 'want-to-view', // 'want-to-view', 'in-progress', 'finished'
  onRatingChange,
  onActionButtonClick
}) => {
  // Determine title based on media type if not provided
  const defaultTitle = mediaType === 'book' ? 'Book title' : 
                      mediaType === 'movie' ? 'Movie title' : 'Series title';
  
  // Determine metadata format based on media type if not provided
  const defaultMetadata = mediaType === 'book' ? 'year published • language • genre • pages' : 
                         mediaType === 'movie' ? 'year published • language • genre • duration' : 
                         'year published • language • genre • # seasons';
  
  const displayTitle = title || defaultTitle;
  const displayMetadata = metadata || defaultMetadata;
  
  // Default summary text
  const defaultSummary = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vitae eros commodo, commodo eros vel, sollicitudin quam. Etiam aliquam dui ut cursus auctor. Curabitur eget porta turpis, ac convallis mi. Suspendisse blandit arcu felis, non tempus ex luctus eu. Maecenas fringilla pretium mi, ornare rhoncus justo ultrices vel. Suspendisse pharetra elit nec elit fringilla efficitur. In tempus pharetra urna, quis aliquet nisl elementum at. Nullam at nunc quis enim ultrices bibendum. Ut tincidunt, lacus nec gravida convallis, nunc ligula tempus neque, vitae porta diam urna a erat. Aenean accumsan faucibus viverra. Cras vitae blandit dui, at malesuada eros. Etiam dignissim tristique eros interdum posuere. Donec vulputate dolor a nisl ultricies molestie quis eu nisl. Integer cursus ante nec erat gravida consectetur. Curabitur et ex vitae nisl eleifend fermentum eu eget orci.";
  
  const displaySummary = summary || defaultSummary;
  
  // Handle rating change for a specific row (in this case, we only need one row)
  const handleRatingChange = (rowIndex, rating) => {
    if (onRatingChange) {
      onRatingChange(rating);
    }
  };
  
  return (
    // Depth 0: COMPONENT_SET (Detailed Media View)
    <div className="detailed-media-view">
      {/* Depth 1: COMPONENT (Media Type=Book/Movie/Series) */}
      <div className={`media-container ${mediaType}`}>
        {/* Depth 2: RECTANGLE (Poster) */}
        <div className="media-poster">
          {poster ? <img src={poster} alt={displayTitle} /> : null}
        </div>
        
        <div className="media-content">
          {/* Depth 2: FRAME (Title + info + tags) */}
          <div className="media-header">
            {/* Depth 3: TEXT (Title) */}
            <h1 className="media-title">{displayTitle}</h1>
            
            {/* Depth 3: TEXT (metadata) */}
            <p className="media-metadata">{displayMetadata}</p>
            
            <div className="media-tags">
              {/* Depth 3: FRAME (Tags) */}
              <Tag type="want-to-view" />
              <Tag type="in-progress" />
              <Tag type="finished" />
            </div>
          </div>
          
          {/* Depth 2: TEXT (Summary from API) */}
          <p className="media-summary">{displaySummary}</p>
          
          {/* Show cast section only for movies and series */}
          {(mediaType === 'movie' || mediaType === 'series') && (
            <>
              {/* Depth 2: TEXT (Cast) */}
              <h2 className="cast-title">Cast</h2>
              
              {/* Depth 2: FRAME (Cast tiles) */}
              <div className="cast-container">
                {cast.length > 0 ? 
                  cast.map((member, index) => (
                    <CastMember key={index} name={member} />
                  )) : 
                  <>
                    <CastMember name="Cast member" />
                    <CastMember name="Cast member" />
                    <CastMember name="Cast member" />
                    <CastMember name="Cast member" />
                  </>
                }
              </div>
            </>
          )}
          
          {/* Depth 2: FRAME (Star rating) */}
          <div className="rating-container">
            {/* Using the existing StarRating component */}
            <StarRating onRatingChange={handleRatingChange} />
          </div>
          
          {/* Depth 2: INSTANCE (Action buttons) */}
          <div className="action-buttons-wrapper">
            <ActionButtons onButtonClick={onActionButtonClick} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedMediaView;