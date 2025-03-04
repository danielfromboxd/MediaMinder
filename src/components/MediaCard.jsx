import React, { useState } from 'react';
import './MediaCard.css';

const MediaCard = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    // Depth 0: COMPONENT_SET (Media poster and title)
    <div 
      className="media-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Depth 1: COMPONENT (Property 1=Default/Hover) */}
      <div className={`media-container ${isHovered ? 'hover' : 'default'}`}>
        {/* Depth 2: TEXT (Media Name) */}
        <h3 className="media-title">Media Name</h3>
        
        {/* Depth 2: RECTANGLE (Rectangle 1) */}
        <div className="media-placeholder"></div>
      </div>
    </div>
  );
};

export default MediaCard;