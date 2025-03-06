import React, { useState } from 'react';
import './NavigationSelector.css';

// Icons for navigation items
import { ReactComponent as HomeIcon } from '../assets/home.svg';
import { ReactComponent as BooksIcon } from '../assets/books.svg';
import { ReactComponent as SeriesIcon } from '../assets/eries.svg';
import { ReactComponent as MoviesIcon } from '../assets/movies.svg';
import { ReactComponent as GearIcon } from '../assets/gear.svg';
import { ReactComponent as SignOutIcon } from '../assets/signout.svg';

const NavigationSelector = ({ defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [hoveredItem, setHoveredItem] = useState(null);

  const toggleNavigation = () => {
    setIsOpen(!isOpen);
  };

  const handleMouseEnter = (item) => {
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  return (
    // Depth 0: COMPONENT_SET (Navigation Selector)
    <div className="navigation-selector">
      {/* Depth 1: COMPONENT (Property 1=Open/Closed, Property 2=Default/Hover) */}
      <div className={`navigation-container ${isOpen ? 'open' : 'closed'}`}>
        {/* Depth 2: FRAME (Navigation) */}
        <div className="navigation-header">
          {/* Depth 3: TEXT (Navigation) */}
          <h2 className="navigation-title">Navigation</h2>
          {/* Depth 3: VECTOR (Polygon 1) */}
          <div 
            className={`navigation-toggle ${isOpen ? 'open' : 'closed'}`}
            onClick={toggleNavigation}
          ></div>
        </div>

        {isOpen && (
          /* Depth 2: FRAME (Pages) */
          <div className="navigation-pages">
            {/* Depth 3: FRAME (Home) */}
            <div 
              className={`navigation-item ${hoveredItem === 'home' ? 'hovered' : ''}`}
              onMouseEnter={() => handleMouseEnter('home')}
              onMouseLeave={handleMouseLeave}
            >
              {/* Depth 4: VECTOR (Vector) */}
              <HomeIcon className="navigation-icon" />
              {/* Depth 4: TEXT (Home) */}
              <span className="navigation-text">Home</span>
            </div>

            {/* Depth 3: VECTOR (Line 4) */}
            <div className="navigation-divider"></div>

            {/* Depth 3: FRAME (Books) */}
            <div 
              className={`navigation-item ${hoveredItem === 'books' ? 'hovered' : ''}`}
              onMouseEnter={() => handleMouseEnter('books')}
              onMouseLeave={handleMouseLeave}
            >
              {/* Depth 4: VECTOR (Vector) */}
              <BooksIcon className="navigation-icon" />
              {/* Depth 4: TEXT (Books) */}
              <span className="navigation-text">Books</span>
            </div>

            {/* Depth 3: VECTOR (Line 1) */}
            <div className="navigation-divider"></div>

            {/* Depth 3: FRAME (Series) */}
            <div 
              className={`navigation-item ${hoveredItem === 'series' ? 'hovered' : ''}`}
              onMouseEnter={() => handleMouseEnter('series')}
              onMouseLeave={handleMouseLeave}
            >
              {/* Depth 4: VECTOR (Vector) */}
              <SeriesIcon className="navigation-icon" />
              {/* Depth 4: TEXT (series) */}
              <span className="navigation-text">series</span>
            </div>

            {/* Depth 3: VECTOR (Line 2) */}
            <div className="navigation-divider"></div>

            {/* Depth 3: FRAME (Movies) */}
            <div 
              className={`navigation-item ${hoveredItem === 'movies' ? 'hovered' : ''}`}
              onMouseEnter={() => handleMouseEnter('movies')}
              onMouseLeave={handleMouseLeave}
            >
              {/* Depth 4: VECTOR (Vector) */}
              <MoviesIcon className="navigation-icon" />
              {/* Depth 4: TEXT (movies) */}
              <span className="navigation-text">movies</span>
            </div>

            {/* Depth 3: VECTOR (Line 3) */}
            <div className="navigation-divider"></div>

            {/* Depth 3: FRAME (Settings) */}
            <div 
              className={`navigation-item ${hoveredItem === 'settings' ? 'hovered' : ''}`}
              onMouseEnter={() => handleMouseEnter('settings')}
              onMouseLeave={handleMouseLeave}
            >
              {/* Depth 4: FRAME (Gear) */}
              <GearIcon className="navigation-icon" />
              {/* Depth 4: TEXT (Settings) */}
              <span className="navigation-text">Settings</span>
            </div>

            {/* Depth 3: VECTOR (Line 5) */}
            <div className="navigation-divider"></div>

            {/* Depth 3: INSTANCE (Log-inout) */}
            <div 
              className={`navigation-item ${hoveredItem === 'logout' ? 'hovered' : ''}`}
              onMouseEnter={() => handleMouseEnter('logout')}
              onMouseLeave={handleMouseLeave}
            >
              {/* Depth 4: FRAME (Frame 2) */}
              <div className="logout-container">
                {/* Depth 5: FRAME (SignOut) */}
                <SignOutIcon className="navigation-icon" />
                {/* Depth 5: TEXT (Log OUT) */}
                <span className="navigation-text">Log OUT</span>
              </div>
            </div>

            {/* Depth 3: VECTOR (Line 6) */}
            <div className="navigation-divider"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationSelector;