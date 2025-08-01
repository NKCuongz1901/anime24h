import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Banner from './Banner';
import CardPreview from './CardPreview';
import MovieCollectionContainer from './MovieCollectionContainer';
import '../styles/AnimeGrid.css';

const APP_DOMAIN_CDN_IMAGE = 'https://phimimg.com/';
const API_ENDPOINT = 'https://phimapi.com/v1/api/danh-sach/hoat-hinh';

const categories = [
  { name: 'Hành Động', slug: 'hanh-dong' },
  { name: 'Phiêu Lưu', slug: 'phieu-luu' },
  { name: 'Gia Đình', slug: 'gia-dinh' },
  { name: 'Khoa Học', slug: 'khoa-hoc' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong' },
  { name: 'Hài Hước', slug: 'hai-huoc' },
];

const AnimeGrid = () => {
  const [bannerAnimes, setBannerAnimes] = useState([]);
  const [categoryAnimes, setCategoryAnimes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [previewAnime, setPreviewAnime] = useState(null);
  const [previewCoords, setPreviewCoords] = useState({ top: null, left: null, showLeft: false });

  // Fetch banner data (always page=1)
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await axios.get(
          `${API_ENDPOINT}?page=1&country=nhat-ban`
        );
        setBannerAnimes(response.data.data.items);
      } catch (err) {
        setBannerAnimes([]);
      }
    };
    fetchBanner();
  }, []);

  // Fetch anime for each category
  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchAllCategories = async () => {
      try {
        const results = await Promise.all(
          categories.map(async (cat) => {
            const res = await axios.get(
              `${API_ENDPOINT}?page=1&country=nhat-ban&category=${cat.slug}`
            );
            return { slug: cat.slug, items: res.data.data.items };
          })
        );
        const animeByCategory = {};
        results.forEach(r => {
          animeByCategory[r.slug] = r.items;
        });
        setCategoryAnimes(animeByCategory);
      } catch (err) {
        setError('Failed to fetch anime data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllCategories();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Banner luôn lấy page=1
  const bannerAnime = bannerAnimes[0];
  const relatedAnimes = bannerAnimes.slice(1, 11);

  return (
    <div className="anime-grid-container">
      <Banner anime={bannerAnime} relatedAnimes={relatedAnimes} />
      <MovieCollectionContainer
        title="Tuyển tập Doraemon"
        apiUrl="https://phimapi.com/v1/api/danh-sach/hoat-hinh?page=1&country=nhat-ban&keyword=doraemon"
      />
      {categories.map(cat => (
        <div key={cat.slug} className="category-section">
          <div className="category-title-row">
            <h2 className="category-title">{cat.name}</h2>
            <button className="category-arrow-btn" onClick={() => navigate(`/category/${cat.slug}`)}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          <div className="anime-grid">
            {(categoryAnimes[cat.slug] || []).slice(0, 6).map(anime => (
              <div
                key={anime.slug}
                className="anime-card"
                onMouseEnter={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const previewWidth = 400;
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
                    margin,
                    previewWidth,
                  });
                }}
                onMouseLeave={() => setPreviewAnime(null)}
                style={{ position: 'relative' }}
              >
                <div
                  className="anime-poster"
                  style={{ 
                    backgroundImage: `url(${APP_DOMAIN_CDN_IMAGE}${anime.poster_url})`,
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
        </div>
      ))}
      {previewAnime && (
        <CardPreview
          anime={previewAnime}
          top={previewCoords.top}
          left={previewCoords.left}
          showLeft={previewCoords.showLeft}
          margin={previewCoords.margin}
          previewWidth={previewCoords.previewWidth}
        />
      )}
    </div>
  );
};

export default AnimeGrid; 