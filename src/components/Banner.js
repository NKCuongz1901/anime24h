import React, { useState, useEffect } from 'react';
import { faPlay, faHeart, faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/Banner.css';
import { useNavigate } from 'react-router-dom';

const Banner = ({ anime, relatedAnimes }) => {
  // Gộp anime đầu tiên và relatedAnimes thành 1 mảng để dễ quản lý
  const allAnimes = [anime, ...(relatedAnimes || [])].filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const currentAnime = allAnimes[activeIndex];

  // Tự động đổi phim sau mỗi 5 giây
  useEffect(() => {
    if (allAnimes.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(idx => (idx + 1) % allAnimes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [allAnimes.length]);

  if (!currentAnime) return null;

  return (
    <div className="banner" style={{ backgroundImage: `url(https://phimimg.com/${currentAnime.thumb_url})` }}>
      <div className="banner-overlay" />
      <div className="banner-dot-overlay"></div>
      <div className="banner-content">
        <h1 className="banner-title">{currentAnime.name}</h1>
        <h2 className="banner-subtitle">{currentAnime.origin_name}</h2>
        <div className="banner-tags">
          {currentAnime.imdb_rating && (
            <span className="banner-tag imdb">
              <span className="imdb-label">IMDb</span>
              <span className="imdb-score">{currentAnime.imdb_rating}</span>
            </span>
          )}
          {currentAnime.tmdb && (
            <span className="banner-tag tmdb">
              TMDB {currentAnime.tmdb.vote_average && currentAnime.tmdb.vote_average !== 0 ? currentAnime.tmdb.vote_average : 'null'}
            </span>
          )}
          {currentAnime.quality && (
            <span className={`banner-tag${currentAnime.quality === 'T13' ? ' t13' : ''}`}>{currentAnime.quality}</span>
          )}
          {currentAnime.year && (
            <span className="banner-tag">{currentAnime.year}</span>
          )}
          {currentAnime.episode_total && (
            <span className="banner-tag">Phần {currentAnime.episode_total}</span>
          )}
          {currentAnime.episode_current && (
            <span className="banner-tag">{currentAnime.episode_current}</span>
          )}
        </div>
        <div className="banner-genres">
          {currentAnime.category && currentAnime.category.map((cat, i) => (
            <span className="banner-genre" key={i}>{cat.name}</span>
          ))}
        </div>
        <p className="banner-desc">{currentAnime.content}</p>
        <div className="banner-actions">
          <button className="banner-btn play" onClick={() => navigate(`/movie/${currentAnime.slug}`)}>
            <FontAwesomeIcon icon={faPlay} />
          </button>
          <div className="banner-btn-group">
            <button className="banner-btn group">
              <FontAwesomeIcon icon={faHeart} />
            </button>
            <button className="banner-btn group">
              <FontAwesomeIcon icon={faInfo} />
            </button>
          </div>
        </div>
      </div>
      <div className="banner-carousel">
        {allAnimes.map((item, idx) => (
          <img
            key={item.slug}
            src={`https://phimimg.com/${item.poster_url}`}
            alt={item.name}
            className={`banner-carousel-item${idx === activeIndex ? ' active' : ''}`}
            onClick={() => setActiveIndex(idx)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner; 