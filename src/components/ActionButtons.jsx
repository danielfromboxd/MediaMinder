import React, { useState } from 'react';
import './ActionButtons.css';

const ActionButtons = ({ onButtonClick }) => {
  const [hoveredButton, setHoveredButton] = useState(null);
  
  const handleMouseEnter = (buttonType) => {
    setHoveredButton(buttonType);
  };
  
  const handleMouseLeave = () => {
    setHoveredButton(null);
  };
  
  const handleClick = (buttonType) => {
    if (onButtonClick) {
      onButtonClick(buttonType);
    }
  };

  return (
    // Depth 0: COMPONENT_SET (Action buttons)
    <div className="action-buttons">
      {/* Depth 1: COMPONENT (Property 1=Default/HoverWTV/HoverInProgress/HoverFinished) */}
      <div className={`action-buttons-row ${hoveredButton ? `hover-${hoveredButton}` : 'default'}`}>
        {/* Depth 2: FRAME (Want to View button) */}
        <div 
          className={`action-button want-to-view ${hoveredButton === 'wtv' ? 'hovered' : ''}`}
          onMouseEnter={() => handleMouseEnter('wtv')}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick('want-to-view')}
        >
          {/* Depth 3: TEXT (Want to view) */}
          <span className="button-text">WANT TO VIEW</span>
        </div>
        
        {/* Depth 2: FRAME (In Progress button) */}
        <div 
          className={`action-button in-progress ${hoveredButton === 'progress' ? 'hovered' : ''}`}
          onMouseEnter={() => handleMouseEnter('progress')}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick('in-progress')}
        >
          {/* Depth 3: TEXT (In Progress) */}
          <span className="button-text">IN PROGRESS</span>
        </div>
        
        {/* Depth 2: FRAME (Finished button) */}
        <div 
          className={`action-button finished ${hoveredButton === 'finished' ? 'hovered' : ''}`}
          onMouseEnter={() => handleMouseEnter('finished')}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick('finished')}
        >
          {/* Depth 3: TEXT (Finished) */}
          <span className="button-text">FINISHED</span>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;