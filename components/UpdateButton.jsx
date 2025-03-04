import React from 'react';
import './UpdateButton.css';

const UpdateButton = () => {
  return (
    // Depth 0: COMPONENT_SET (Update button)
    <div className="update-button-container">
      {/* Depth 1: COMPONENT (Property 1=Press) */}
      <button className="update-button press">
        {/* Depth 2: TEXT (Update) */}
        <span className="update-button-text">Update</span>
      </button>

      {/* Depth 1: COMPONENT (Property 1=Hover) */}
      <button className="update-button hover">
        {/* Depth 2: TEXT (Update) */}
        <span className="update-button-text">Update</span>
      </button>

      {/* Depth 1: COMPONENT (Property 1=Default) */}
      <button className="update-button default">
        {/* Depth 2: TEXT (Update) */}
        <span className="update-button-text">Update</span>
      </button>
    </div>
  );
};

export default UpdateButton;