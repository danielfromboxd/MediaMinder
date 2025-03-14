
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Book, Tv, Film, Settings, LogOut, ChevronUp, ChevronDown, LayoutList } from 'lucide-react';
import Logo from './Logo';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const toggleNavigation = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-64 min-h-screen border-r p-4">
      <div className="mb-8">
        <Logo />
      </div>
      
      <div className="mb-4">
        <button 
          onClick={toggleNavigation} 
          className="nav-section flex items-center justify-between w-full"
        >
          <span>NAVIGATION</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      
      {isOpen && (
        <nav className="space-y-1">
          <Link 
            to="/home" 
            className={`sidebar-link ${location.pathname === '/home' ? 'active' : ''}`}
          >
            <Home size={20} />
            <span>HOME</span>
          </Link>
          <Link 
            to="/tracker" 
            className={`sidebar-link ${location.pathname === '/tracker' ? 'active' : ''}`}
          >
            <LayoutList size={20} />
            <span>TRACKER</span>
          </Link>
          <Link 
            to="/books" 
            className={`sidebar-link ${location.pathname === '/books' ? 'active' : ''}`}
          >
            <Book size={20} />
            <span>BOOKS</span>
          </Link>
          <Link 
            to="/series" 
            className={`sidebar-link ${location.pathname === '/series' ? 'active' : ''}`}
          >
            <Tv size={20} />
            <span>SERIES</span>
          </Link>
          <Link 
            to="/movies" 
            className={`sidebar-link ${location.pathname === '/movies' ? 'active' : ''}`}
          >
            <Film size={20} />
            <span>MOVIES</span>
          </Link>
          <Link 
            to="/settings" 
            className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span>SETTINGS</span>
          </Link>
          <Link 
            to="/logout" 
            className="sidebar-link"
          >
            <LogOut size={20} />
            <span>LOG OUT</span>
          </Link>
        </nav>
      )}
    </div>
  );
};

export default Sidebar;
