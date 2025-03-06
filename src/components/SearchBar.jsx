import React from 'react';
import './SearchBar.css';
// Import the search icon from assets folder
import { ReactComponent as SearchIcon } from '../assets/searchVector.svg';

const SearchBar = ({ formFactor = 'wide' }) => {
  const isWide = formFactor === 'wide';

  return (
    // Depth 0: COMPONENT_SET (Searchbar)
    <div className="searchbar-container">
      {/* Depth 1: COMPONENT (Formfactor=Wide/Small) */}
      <div className={`searchbar ${isWide ? 'wide' : 'small'}`}>
        {/* Depth 2: FRAME (material-symbols:search) */}
        <SearchIcon className="search-icon" />
        {/* Depth 2: TEXT (Search) */}
        <span className="search-text">Search</span>
      </div>
    </div>
  );
};

export default SearchBar;