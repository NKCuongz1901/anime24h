import React from 'react';
import ReactDOM from 'react-dom';
import { faPlay, faHeart, faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/CardPreview.css';

const CardPreview = ({ anime, top, left, showLeft, previewWidth = 400, margin = 16 }) => {
  if (!anime || top == null || left == null) return null;
  const style = {
    position: 'fixed',
    top,
    left: showLeft ? undefined : left,
    right: showLeft ? (window.innerWidth - (left + previewWidth + margin)) : undefined,
    zIndex: 9999,
    pointerEvents: 'auto',
    borderRadius: 24,
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    background: '#23273a',
    minWidth: 370,
    maxWidth: 400,
    padding: 0,
    overflow: 'hidden',
  };
  return ReactDOM.createPortal(
    <div className="card-preview" style={style}>
      <img className="card-preview-img" src={`https://phimimg.com/${anime.thumb_url}`} alt={anime.name} />
      <div className="card-preview-content">
        <h3 className="card-preview-title">{anime.name}</h3>
        <h4 className="card-preview-subtitle">{anime.origin_name}</h4>
        <div className="card-preview-tags">
          {anime.imdb_rating && (
            <span className="card-preview-tag imdb">
              <span className="imdb-label">IMDb</span>
              <span className="imdb-score">{anime.imdb_rating}</span>
            </span>
          )}
          {anime.quality && (
            <span className={`card-preview-tag t13`}>{anime.quality}</span>
          )}
          {anime.year && (
            <span className="card-preview-tag year">{anime.year}</span>
          )}
          {anime.time && (
            <span className="card-preview-tag time">{anime.time}</span>
          )}
        </div>
        <div className="card-preview-genres">
          {anime.category && anime.category.map((cat, i) => (
            <span className="card-preview-genre" key={i}>{cat.name}</span>
          ))}
        </div>
        <p className="card-preview-desc">{anime.content}</p>
      </div>
    </div>,
    document.body
  );
};

export default CardPreview; 