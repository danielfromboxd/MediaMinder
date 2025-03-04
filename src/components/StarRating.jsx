import React, { useState } from 'react';
import './StarRating.css';

const StarIcon = ({ filled, color }) => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 1.5L9.79611 5.11803L13.6085 5.69098L10.8042 8.43197L11.4722 12.309L8 10.5L4.52779 12.309L5.19577 8.43197L2.39155 5.69098L6.20389 5.11803L8 1.5Z"
      fill={filled ? color : "#D9D9D9"}
      stroke="#000000"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);

const StarRating = ({ onRatingChange }) => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedRatings, setSelectedRatings] = useState(Array(5).fill(0));

  // Depth 0: COMPONENT_SET (Rating)
  return (
    <div className="star-rating-container">
      {[0, 1, 2, 3, 4].map((rowIndex) => (
        // Depth 1: COMPONENT (Stars={rowIndex}, Estate=Default/Hover)
        <div
          key={rowIndex}
          className={`star-row ${hoveredRow === rowIndex ? 'hovered' : ''}`}
          onMouseEnter={() => setHoveredRow(rowIndex)}
          onMouseLeave={() => setHoveredRow(null)}
          onClick={() => {
            const newRatings = [...selectedRatings];
            newRatings[rowIndex] = hoveredRow === rowIndex ? 5 : 0;
            setSelectedRatings(newRatings);
            if (onRatingChange) {
              onRatingChange(rowIndex, newRatings[rowIndex]);
            }
          }}
        >
          {/* Depth 2: FRAME (Star) */}
          <div className="star-group">
            {[1, 2, 3, 4, 5].map((starIndex) => {
              let color = '#FFD700'; // Yellow for filled stars
              if (selectedRatings[rowIndex] === 3) {
                color = '#FFA500'; // Orange for partial rating
              }
              
              return (
                <StarIcon
                  key={starIndex}
                  filled={starIndex <= selectedRatings[rowIndex]}
                  color={color}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StarRating;