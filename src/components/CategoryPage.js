import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/AnimeGrid.css';
import CardPreview from './CardPreview';

const APP_DOMAIN_CDN_IMAGE = 'https://phimimg.com/';
const API_ENDPOINT = 'https://phimapi.com/v1/api/danh-sach/hoat-hinh';

const categoryNames = {
  'phieu-luu': 'Phiêu Lưu',
  'gia-dinh': 'Gia Đình',
  'khoa-hoc': 'Khoa Học',
  'vien-tuong': 'Viễn Tưởng',
  'hai-huoc': 'Hài Hước',
  'hanh-dong': 'Hành động',
};

function getPageNumbers(current, total) {
  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4);
    else if (end === total) start = Math.max(1, end - 4);
  }
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
}

const CategoryPage = () => {
  const { slug } = useParams();
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [previewAnime, setPreviewAnime] = useState(null);
  const [previewCoords, setPreviewCoords] = useState({ top: null, left: null, showLeft: false });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_ENDPOINT}?page=${currentPage}&country=nhat-ban&category=${slug}`);
        setAnimes(res.data.data.items);
        setTotalPages(res.data.data.params.pagination.totalPages);
        setError(null);
      } catch (err) {
        setError('Failed to fetch anime data. Please try again later.');
        setAnimes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [slug, currentPage]);

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

  return (
    <div className="anime-grid-container">
      <h2 className="category-title category-page-title">{categoryNames[slug] || slug}</h2>
      <div className="anime-grid">
        {animes.map(anime => (
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
      {previewAnime && (
        <CardPreview
          anime={previewAnime}
          top={previewCoords.top}
          left={previewCoords.left}
          showLeft={previewCoords.showLeft}
        />
      )}
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        {getPageNumbers(currentPage, totalPages).map(page => (
          <button
            key={page}
            className={`pagination-btn page-number${page === currentPage ? ' active' : ''}`}
            onClick={() => setCurrentPage(page)}
            disabled={page === currentPage}
          >
            {page}
          </button>
        ))}
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default CategoryPage; 