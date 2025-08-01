import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { faPlay, faHeart, faPlus, faShare, faCommentDots, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/MovieDetail.css';
import CardPreview from './CardPreview';

const tabs = ['Tập phim', 'Gallery', 'Diễn viên', 'Đề xuất'];

const MovieDetail = () => {
  const { slug } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);
  const [relatedSeasons, setRelatedSeasons] = useState([]);
  const [suggestedAnimes, setSuggestedAnimes] = useState([]);
  const [previewAnime, setPreviewAnime] = useState(null);
  const [previewCoords, setPreviewCoords] = useState({ top: null, left: null, showLeft: false });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`https://phimapi.com/phim/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.movie) {
          setMovie({
            ...data.movie,
            episodes: data.episodes
          });
        } else setError('Không tìm thấy phim!');
      })
      .catch(() => setError('Lỗi khi tải dữ liệu phim!'))
      .finally(() => setLoading(false));
  }, [slug]);

  // Lấy các phần khác cùng bộ
  useEffect(() => {
    if (!movie?.origin_name) return;
    fetch('https://phimapi.com/v1/api/danh-sach/hoat-hinh?page=1&country=nhat-ban')
      .then(res => res.json())
      .then(data => {
        if (data?.data?.items) {
          const others = data.data.items.filter(item =>
            item.origin_name === movie.origin_name && item._id !== movie._id
          );
          setRelatedSeasons(others);
        }
      });
  }, [movie]);

  // Lấy 6 phim bất kỳ từ API
  useEffect(() => {
    fetch('https://phimapi.com/v1/api/danh-sach/hoat-hinh?page=1&country=nhat-ban')
      .then(res => res.json())
      .then(data => {
        if (data?.data?.items) {
          let items = data.data.items.filter(item => !movie || item._id !== movie._id);
          for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
          }
          setSuggestedAnimes(items.slice(0, 6));
        }
      });
  }, [movie]);

  if (loading) return (
    <div className="movie-loading-container">
      <div className="movie-loading-spinner"></div>
    </div>
  );
  if (error) return <div style={{color:'#fff',padding:'3rem'}}>{error}</div>;
  if (!movie) return null;

  return (
    <div className="movie-detail-container">
      {/* Banner */}
      <div className="movie-banner" style={{ backgroundImage: `url(${movie.thumb_url})` }}>
        <div className="movie-banner-overlay" />
        <div className="movie-banner-dot-overlay" />
        <div className="movie-banner-content">
          <div className="movie-banner-poster">
            <img src={movie.poster_url} alt={movie.name} />
          </div>
          <div className="movie-banner-info">
            <h1 className="movie-title">{movie.name}</h1>
            <h2 className="movie-origin-title">{movie.origin_name}</h2>
            <div className="movie-banner-actions">
              <button
                className="movie-btn play"
                onClick={() => {
                  if (
                    movie.episodes &&
                    movie.episodes[0] &&
                    movie.episodes[0].server_data &&
                    movie.episodes[0].server_data[0] &&
                    movie.episodes[0].server_data[0].link_m3u8
                  ) {
                    const url = encodeURIComponent(movie.episodes[0].server_data[0].link_m3u8);
                    navigate(`/watch/${url}`, { state: { slug } });
                  }
                }}
              >
                <FontAwesomeIcon icon={faPlay} /> Xem Ngay
              </button>
              <button className="movie-btn">
                <FontAwesomeIcon icon={faHeart} /> Yêu thích
              </button>
              <button className="movie-btn">
                <FontAwesomeIcon icon={faPlus} /> Thêm vào
              </button>
              <button className="movie-btn">
                <FontAwesomeIcon icon={faShare} /> Chia sẻ
              </button>
              <button className="movie-btn">
                <FontAwesomeIcon icon={faCommentDots} /> Bình luận
              </button>
              <div className="movie-rating">
                <FontAwesomeIcon icon={faStar} /> {movie.tmdb?.vote_average || '9.0'} <span>Đánh giá</span>
              </div>
            </div>
            <div className="movie-banner-tags">
              {movie.imdb?.id && (
                <span className="movie-tag imdb">IMDb {movie.imdb?.rating || 'N/A'}</span>
              )}
              <span className="movie-tag t13">{movie.quality}</span>
              <span className="movie-tag year">{movie.year}</span>
              {movie.episode_total && (
                <span className="movie-tag season">Phần {movie.season || 1}</span>
              )}
              {movie.episode_current && (
                <span className="movie-tag episode">{movie.episode_current}</span>
              )}
            </div>
            <div className="movie-banner-genres">
              {movie.category && movie.category.map((cat, i) => (
                <span className="movie-genre" key={i}>{cat.name}</span>
              ))}
            </div>
            <div className="movie-banner-status">
              <span className="movie-status">
                {movie.status === 'ongoing'
                  ? `Đang chiếu${movie.episode_current ? `: ${movie.episode_current}` : ''}`
                  : movie.status}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="movie-tabs">
        {tabs.map((tab, idx) => (
          <button
            key={tab}
            className={`movie-tab${activeTab === idx ? ' active' : ''}`}
            onClick={() => setActiveTab(idx)}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Tab content */}
      <div className="movie-tab-content">
        {activeTab === 0 && (
          <div className="movie-episodes">
            {movie.episodes && movie.episodes.length > 0 ? (
              movie.episodes.map((server, idx) => (
                <div key={idx} className="movie-episode-server">
                  <div className="movie-episode-server-name">{server.server_name}</div>
                  <div className="movie-episode-list">
                    {server.server_data && server.server_data.length > 0 ? (
                      server.server_data.map((ep, i) => (
                        <button
                          className="movie-episode-btn"
                          key={i}
                          onClick={() => {
                            if (ep.link_m3u8) {
                              const url = encodeURIComponent(ep.link_m3u8);
                              navigate(`/watch/${url}`, { state: { slug } });
                            }
                          }}
                        >
                          {ep.name}
                        </button>
                      ))
                    ) : (
                      <div className="movie-episode-empty">Không có tập phim</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="movie-episode-empty">Không có tập phim</div>
            )}
          </div>
        )}
        {activeTab === 1 && (
          <div className="movie-gallery">
            <h3>Gallery</h3>
            <div className="gallery-images">
              {movie.poster_url && (
                <img src={movie.poster_url} alt="Poster" className="gallery-poster" />
              )}
              {movie.thumb_url && (
                <img src={movie.thumb_url} alt="Thumbnail" className="gallery-thumb" />
              )}
            </div>
          </div>
        )}
        {activeTab === 2 && (
          <div className="movie-actors">
            <h3>Diễn viên:</h3>
            {movie.actor && movie.actor.length > 0 ? (
              <ul className="actor-list">
                {movie.actor.map((name, idx) => (
                  <li key={idx} className="actor-item">{name}</li>
                ))}
              </ul>
            ) : (
              <div className="movie-actor-empty">Không có thông tin diễn viên.</div>
            )}
          </div>
        )}
        {activeTab === 3 && (
          <div className="movie-suggested-animes">
            <h3 style={{marginBottom: '1.5rem'}}>Đề xuất phim khác:</h3>
            <div className="anime-grid">
              {suggestedAnimes.map(anime => (
                <div
                  key={anime.slug}
                  className="anime-card"
                  onMouseEnter={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const previewWidth = 340;
                    const margin = 16;
                    let left = rect.right + margin;
                    let showLeft = false;
                    if (left + previewWidth > window.innerWidth) {
                      left = rect.left - previewWidth - margin;
                      showLeft = true;
                    }
                    setPreviewAnime(anime);
                    setPreviewCoords({
                      top: rect.top,
                      left,
                      showLeft,
                    });
                  }}
                  onMouseLeave={() => setPreviewAnime(null)}
                  style={{ position: 'relative' }}
                >
                  <div
                    className="anime-poster"
                    style={{
                      backgroundImage: `url(https://phimimg.com/${anime.poster_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="anime-overlay">
                      <button
                        className="play-button"
                        onClick={() => navigate(`/movie/${anime.slug}`)}
                      >
                        <FontAwesomeIcon icon={faPlay} />
                      </button>
                    </div>
                  </div>
                  <div className="anime-info">
                    <h3 className="anime-title">{anime.name}</h3>
                    <p className="anime-subtitle">{anime.origin_name}</p>
                  </div>
                </div>
              ))}
            </div>
            {previewAnime && (
              <CardPreview
                anime={previewAnime}
                top={previewCoords.top}
                left={previewCoords.left}
                showLeft={previewCoords.showLeft}
              />
            )}
          </div>
        )}
      </div>
      {/* Mô tả phim */}
      <div className="movie-description-block">
        <h3>Giới thiệu:</h3>
        <p>{movie.content}</p>
      </div>
    </div>
  );
};

export default MovieDetail; 