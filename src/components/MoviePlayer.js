import React from 'react';
import '../styles/MoviePlayer.css';

const MoviePlayer = ({ url }) => {
  return (
    <div className="movie-player-container">
      <div className="movie-player-wrapper">
        <iframe
          src={`https://player.phimapi.com/player/?url=${url}`}
          allowFullScreen
          className="movie-player"
        />
      </div>
    </div>
  );
};

export default MoviePlayer; 