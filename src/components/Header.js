import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';
import '../styles/Header.css';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <img src={process.env.PUBLIC_URL + '/logo.png'} alt="MAnime Logo" style={{ height: 60, width: 'auto', display: 'block' }} />
        </div>
        
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </form>
      </div>
    </header>
  );
};

export default Header; 