import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import CustomVideoPlayer from '../components/CustomVideoPlayer';

const Watch = () => {
  const { url } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const decodedUrl = decodeURIComponent(url);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(true);

  // Lấy slug từ state hoặc query
  const slug = location.state?.slug || new URLSearchParams(location.search).get('slug');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetch(`https://phimapi.com/phim/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.movie) {
          setMovie({ ...data.movie, episodes: data.episodes });
        } else setError('Không tìm thấy phim!');
      })
      .catch(() => setError('Lỗi khi tải dữ liệu phim!'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    setSuggestedLoading(true);
    fetch('https://phimapi.com/v1/api/danh-sach/hoat-hinh?page=1&country=nhat-ban')
      .then(res => res.json())
      .then(data => {
        if (data?.data?.items) {
          let items = data.data.items;
          if (movie && movie.slug) {
            items = items.filter(item => item.slug !== movie.slug);
          }
          for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
          }
          setSuggested(items.slice(0, 3));
        } else {
          setSuggested([]);
        }
      })
      .finally(() => setSuggestedLoading(false));
  }, [movie]);

  // Tìm tên tập đang xem dựa trên decodedUrl
  let currentEpName = movie && movie.episodes
    ? (() => {
        for (const server of movie.episodes) {
          for (const ep of server.server_data || []) {
            if (ep.link_m3u8 === decodedUrl) return ep.name;
          }
        }
        return null;
      })()
    : null;
  if (!currentEpName && movie && movie.episode_current) currentEpName = movie.episode_current;

  // Hàm tự động chuyển tập khi hết video
  const handleNextEpisode = () => {
    if (!movie || !movie.episodes) return;
    let found = false;
    for (let s = 0; s < movie.episodes.length; s++) {
      const server = movie.episodes[s];
      for (let e = 0; e < (server.server_data || []).length; e++) {
        const ep = server.server_data[e];
        if (ep.link_m3u8 === decodedUrl) {
          // Tìm tập tiếp theo trong cùng server
          if (e + 1 < server.server_data.length) {
            const nextEp = server.server_data[e + 1];
            if (nextEp.link_m3u8) {
              navigate(`/watch/${encodeURIComponent(nextEp.link_m3u8)}`, { state: { slug } });
              return;
            }
          } else {
            // Nếu hết server này, chuyển sang server tiếp theo (nếu có)
            for (let ns = s + 1; ns < movie.episodes.length; ns++) {
              const nextServer = movie.episodes[ns];
              if (nextServer.server_data && nextServer.server_data.length > 0) {
                const nextEp = nextServer.server_data[0];
                if (nextEp.link_m3u8) {
                  navigate(`/watch/${encodeURIComponent(nextEp.link_m3u8)}`, { state: { slug } });
                  return;
                }
              }
            }
          }
          found = true;
          break;
        }
      }
      if (found) break;
    }
    // Nếu không tìm thấy tập tiếp theo, có thể thông báo hoặc không làm gì
  };

  return (
    <div style={{ background: '#14151a', minHeight: '100vh', padding: '0 30px 48px 30px' }}>
      <div style={{ display: 'flex', maxWidth: 1600, margin: '0 auto', gap: 32, paddingTop: 32 }}>
        {/* Player + Info */}
        <div style={{ flex: 8, minWidth: 0 }}>
          <div style={{ background: '#191a20', borderRadius: 18, boxShadow: '0 4px 32px #000a', padding: 0, overflow: 'hidden' }}>
            <div style={{ aspectRatio: '16/9', width: '100%', background: '#000' }}>
              <CustomVideoPlayer src={decodedUrl} onEnded={handleNextEpisode} />
            </div>
          </div>
          {/* Info phim */}
          {slug && (
            <div style={{ marginTop: 32, background: '#191a20', borderRadius: 18, padding: '2.2rem 2.5rem', color: '#fff', boxShadow: '0 2px 16px #0006' }}>
              {loading ? (
                <div className="loading-spinner" style={{margin:'2rem auto'}}></div>
              ) : error ? (
                <div style={{color:'#fff',padding:'2rem'}}>{error}</div>
              ) : movie ? (
                <>
                  <h1 style={{ fontSize: '2.1rem', color: '#ffe082', marginBottom: 12 }}>{movie.name}</h1>
                  <div style={{ display: 'flex', gap: 24, marginBottom: 16, fontSize: '1.1rem', color: '#ffe082cc', flexWrap: 'wrap' }}>
                    <span>Năm: {movie.year}</span>
                    <span>Thể loại: {movie.category && movie.category.map(c => c.name).join(', ')}</span>
                    <span>
                      {currentEpName
                        ? (currentEpName.toLowerCase().startsWith('tập')
                            ? currentEpName
                            : `Tập: ${currentEpName}`)
                        : 'Tập: N/A'}
                    </span>
                  </div>
                  <div style={{ fontSize: '1rem', lineHeight: 1.6, color: '#eee' }}>{movie.content}</div>
                  <div style={{ marginTop: 24, display: 'flex', gap: 18 }}>
                    <button style={{ background: '#ffe082', color: '#222', border: 'none', borderRadius: 12, padding: '0.7rem 2.2rem', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 2px 8px #0002' }}>Yêu thích</button>
                    <button style={{ background: '#23242a', color: '#ffe082', border: 'none', borderRadius: 12, padding: '0.7rem 2.2rem', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 2px 8px #0002' }}>Thêm vào</button>
                    <button style={{ background: '#23242a', color: '#ffe082', border: 'none', borderRadius: 12, padding: '0.7rem 2.2rem', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 2px 8px #0002' }}>Chia sẻ</button>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
        {/* Danh sách tập */}
        <div className="hide-scrollbar" style={{ flex: 4, background: '#191a20', borderRadius: 18, padding: 24, minWidth: 0, maxHeight: 600, overflowY: 'auto', boxShadow: '0 2px 16px #0006', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: '#ffe082', marginBottom: 18, fontSize: '1.25rem', fontWeight: 600 }}>Danh sách tập</h3>
          {loading ? (
            <div className="loading-spinner" style={{margin:'2rem auto'}}></div>
          ) : error ? (
            <div style={{color:'#fff',padding:'2rem'}}>{error}</div>
          ) : movie && movie.episodes && movie.episodes.length > 0 ? (
            movie.episodes.map((server, idx) => (
              <div key={idx} style={{marginBottom: 18}}>
                <div style={{color:'#ffe082', fontWeight:600, marginBottom:6}}>{server.server_name.replace(/#.*$/, '').trim()}</div>
                <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                  {server.server_data && server.server_data.length > 0 ? (
                    server.server_data.map((ep, i) => {
                      const isCurrent = ep.link_m3u8 === decodedUrl;
                      return (
                        <button
                          key={i}
                          style={{
                            background: isCurrent ? '#ffe082' : '#23242a',
                            color: isCurrent ? '#222' : '#ffe082',
                            border: 'none',
                            borderRadius: 8,
                            padding: '0.5rem 1.2rem',
                            fontWeight: 600,
                            fontSize: '1rem',
                            marginBottom: 6,
                            cursor: 'pointer',
                            position: 'relative',
                            boxShadow: isCurrent ? '0 2px 8px #ffe08255' : undefined
                          }}
                          onClick={() => {
                            if (ep.link_m3u8) {
                              navigate(`/watch/${encodeURIComponent(ep.link_m3u8)}`, { state: { slug } });
                            }
                          }}
                        >
                          {ep.name}
                          {isCurrent && (
                            <span style={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              background: '#ffe082',
                              color: '#222',
                              borderRadius: 8,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              boxShadow: '0 2px 8px #ffe08255'
                            }}>
                              Đang xem
                            </span>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div style={{color:'#fff',opacity:0.7,fontSize:'1.08rem'}}>Không có tập phim</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{color:'#fff',opacity:0.7,fontSize:'1.08rem'}}>Danh sách tập sẽ hiển thị ở đây.</div>
          )}

          {/* Đề xuất phim khác */}
          <div style={{ marginTop: 32 }}>
            <h2 style={{ color: '#ffe082', fontSize: '1.15rem', margin: '1.5rem 0 1.2rem 0' }}>Đề xuất phim khác</h2>
            <div style={{ display: 'flex', gap: 18, minHeight: 170 }}>
              {suggestedLoading ? (
                <div className="loading-spinner" style={{margin:'auto'}}></div>
              ) : suggested.length === 0 ? (
                <div style={{color:'#fff',opacity:0.7,fontSize:'1.08rem',margin:'auto'}}>Không có đề xuất</div>
              ) : suggested.map(anime => (
                <div
                  key={anime.slug}
                  style={{
                    width: 150,
                    height: 250,
                    background: '#23242a',
                    borderRadius: 18,
                    boxShadow: '0 4px 18px #0006',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                  }}
                  onClick={() => navigate(`/movie/${anime.slug}`)}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-7px) scale(1.04)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <img
                    src={`https://phimimg.com/${anime.poster_url}`}
                    alt={anime.name}
                    style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: '18px 18px 0 0', display: 'block' }}
                  />
                  <div style={{
                    color: '#ffe082',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    padding: '10px 10px 0 10px',
                    textAlign: 'center',
                    flex: 1,
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                    lineHeight: 1.22,
                  }}>
                    {anime.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch; 