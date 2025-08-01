import React, { useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';
import { MdReplay10, MdForward10, MdPlayArrow, MdPause, MdVolumeUp, MdVolumeOff, MdSettings, MdPictureInPictureAlt, MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import '../styles/CustomVideoPlayer.css';

const formatTime = (sec) => {
  if (isNaN(sec)) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
};

const icons = {
  play: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15" stroke="#fff" strokeWidth="2" fill="none"/><polygon points="13,10 24,16 13,22" fill="#fff"/></svg>
  ),
  pause: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15" stroke="#fff" strokeWidth="2" fill="none"/><rect x="12" y="11" width="3" height="10" fill="#fff"/><rect x="17" y="11" width="3" height="10" fill="#fff"/></svg>
  ),
  backward: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke="#fff" strokeWidth="2" fill="none"/>
      <path d="M16 7a9 9 0 1 0 9 9" stroke="#fff" strokeWidth="2" fill="none"/>
      <path d="M13 7h3v3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <text x="9" y="23" fontSize="13" fill="#fff" fontWeight="bold">10</text>
    </svg>
  ),
  forward: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke="#fff" strokeWidth="2" fill="none"/>
      <path d="M16 7a9 9 0 1 1-9 9" stroke="#fff" strokeWidth="2" fill="none"/>
      <path d="M19 7h-3v3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <text x="15" y="23" fontSize="13" fill="#fff" fontWeight="bold">10</text>
    </svg>
  ),
  volume: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 9v6h4l5 5V4L7 9H3z" fill="#fff"/></svg>
  ),
  next: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 6v12l10-6-10-6z" fill="#fff"/></svg>
  ),
  cc: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="12" rx="2" stroke="#fff" strokeWidth="2" fill="none"/><text x="6" y="17" fontSize="10" fill="#fff">CC</text></svg>
  ),
  pip: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="#fff" strokeWidth="2" fill="none"/><rect x="13" y="13" width="6" height="4" rx="1" fill="#fff"/></svg>
  ),
  settings: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="4" stroke="#fff" strokeWidth="2" fill="none"/></svg>
  ),
  fullscreen: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#fff" strokeWidth="2" fill="none"/><path d="M8 8V6h4M16 8V6h-4M8 16v2h4M16 16v2h-4" stroke="#fff" strokeWidth="2"/></svg>
  ),
};

const PLAYBACK_RATES = [0.5, 1, 1.25, 1.5, 2];

const CustomVideoPlayer = ({ src, onEnded }) => {
  const videoRef = useRef();
  const containerRef = useRef();
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [lastVolume, setLastVolume] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [qualityLevels, setQualityLevels] = useState([]);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const hlsRef = useRef(null);
  const [hover, setHover] = useState(false);
  const [volumeHover, setVolumeHover] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeout = useRef();

  useEffect(() => {
    const video = videoRef.current;
    let hls;
    if (video) {
      if (src && src.endsWith('.m3u8') && Hls.isSupported()) {
        hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function (_, data) {
          if (data.levels && data.levels.length > 0) {
            setQualityLevels(data.levels);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }
    }
    const update = () => setCurrent(video.currentTime);
    const loaded = () => setDuration(video.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onLoadStart = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    video && video.addEventListener('timeupdate', update);
    video && video.addEventListener('loadedmetadata', loaded);
    video && video.addEventListener('play', onPlay);
    video && video.addEventListener('pause', onPause);
    video && video.addEventListener('loadstart', onLoadStart);
    video && video.addEventListener('canplay', onCanPlay);
    return () => {
      if (hls) hls.destroy();
      hlsRef.current = null;
      video && video.removeEventListener('timeupdate', update);
      video && video.removeEventListener('loadedmetadata', loaded);
      video && video.removeEventListener('play', onPlay);
      video && video.removeEventListener('pause', onPause);
      video && video.removeEventListener('loadstart', onLoadStart);
      video && video.removeEventListener('canplay', onCanPlay);
    };
  }, [src]);

  // Playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Quality change
  const handleQualityChange = (idx) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = idx;
      setCurrentQuality(idx);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const percent = e.target.value;
    video.currentTime = (percent / 100) * duration;
    setCurrent(video.currentTime);
  };

  const handleVolume = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = parseFloat(e.target.value);
    video.volume = vol;
    setVolume(vol);
    if (vol === 0) {
      video.muted = true;
      setMuted(true);
    } else {
      video.muted = false;
      setMuted(false);
      setLastVolume(vol);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.muted) {
      setLastVolume(volume);
      video.muted = true;
      setMuted(true);
      setVolume(0);
    } else {
      video.muted = false;
      setMuted(false);
      video.volume = lastVolume || 1;
      setVolume(lastVolume || 1);
    }
  };

  const seek = (sec) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + sec));
    setCurrent(video.currentTime);
  };

  // Fullscreen
  const handleFullscreen = () => {
    const container = containerRef.current;
    if (container.requestFullscreen) container.requestFullscreen();
    else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
    else if (container.mozRequestFullScreen) container.mozRequestFullScreen();
    else if (container.msRequestFullscreen) container.msRequestFullscreen();
  };

  // PiP
  const handlePiP = () => {
    const video = videoRef.current;
    if (video.requestPictureInPicture) video.requestPictureInPicture();
  };

  // Theo dõi trạng thái fullscreen
  useEffect(() => {
    const handleFsChange = () => {
      const fsElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      setIsFullscreen(!!fsElement && (fsElement === containerRef.current));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
    };
  }, []);

  const handleExitFullscreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  };

  // Tự động ẩn controls cả khi không fullscreen
  useEffect(() => {
    const resetTimer = () => {
      setShowControls(true);
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
      hideControlsTimeout.current = setTimeout(() => setShowControls(false), 2500);
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', resetTimer);
      container.addEventListener('mousedown', resetTimer);
      container.addEventListener('touchstart', resetTimer);
      container.addEventListener('keydown', resetTimer);
    }
    resetTimer();
    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
      if (container) {
        container.removeEventListener('mousemove', resetTimer);
        container.removeEventListener('mousedown', resetTimer);
        container.removeEventListener('touchstart', resetTimer);
        container.removeEventListener('keydown', resetTimer);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="custom-player-container"
      style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', background: 'none', padding: 0 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <video
        ref={videoRef}
        onClick={togglePlay}
        onEnded={onEnded}
        style={{ width: '100%', background: '#000', display: 'block' }}
        autoPlay
        controls={false}
      />
      {!playing && !loading && (
        <button
          className="center-play-btn"
          onClick={togglePlay}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.45)',
            border: 'none',
            borderRadius: '50%',
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            cursor: 'pointer',
            boxShadow: '0 2px 12px #0008',
          }}
          aria-label="Play"
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="23" stroke="#ffe082" strokeWidth="3" fill="rgba(0,0,0,0.25)"/>
            <polygon points="20,16 36,24 20,32" fill="#ffe082"/>
          </svg>
        </button>
      )}
      {loading && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', fontSize: '1.2rem' }}>
          <div className="loading-spinner"></div>
        </div>
      )}
      <div
        className="custom-controls custom-controls-row"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          pointerEvents: playing && !hover ? 'none' : 'auto',
          opacity: showControls && (playing || !playing) && !loading ? 1 : 0,
          transition: 'opacity 0.25s',
        }}
      >
        <div className="custom-controls-left" style={{flex: 1, display: 'flex', alignItems: 'center'}}>
          <button onClick={togglePlay} title="Play/Pause" className="icon-btn">
            {playing ? <MdPause size={22} color="#fff" /> : <MdPlayArrow size={22} color="#fff" />}
          </button>
          <button onClick={() => seek(-10)} title="Tua lùi 10s" className="icon-btn"><MdReplay10 size={22} color="#fff" /></button>
          <button onClick={() => seek(10)} title="Tua tới 10s" className="icon-btn"><MdForward10 size={22} color="#fff" /></button>
          <div style={{ position: 'relative' }} onMouseEnter={() => setVolumeHover(true)} onMouseLeave={() => setVolumeHover(false)}>
            <button className="icon-btn" onClick={toggleMute} title={muted ? 'Bật tiếng' : 'Tắt tiếng'}>
              {muted || volume === 0 ? <MdVolumeOff size={20} color="#fff" /> : <MdVolumeUp size={20} color="#fff" />}
            </button>
            {volumeHover && (
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolume}
                className="volume-bar"
                style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', width: '50px', height: '100px', writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' }}
              />
            )}
          </div>
          <span className="custom-time current" style={{marginLeft: 8}}>{formatTime(current)} / {formatTime(duration)}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={duration ? (current / duration) * 100 : 0}
            onChange={handleSeek}
            className="progress-bar"
            style={{ flex: 1, marginLeft: 16, marginRight: 16 }}
          />
        </div>
        <div className="custom-controls-right">
          <button className="icon-btn" title="Picture in Picture" onClick={handlePiP}><MdPictureInPictureAlt size={18} color="#fff" /></button>
          <div className="settings-wrapper">
            <button className="icon-btn" title="Cài đặt" onClick={() => setShowSettings(v => !v)}><MdSettings size={18} color="#fff" /></button>
            {showSettings && (
              <div className="settings-menu">
                <div className="settings-section">
                  <div className="settings-label">Tốc độ phát</div>
                  <div className="settings-options">
                    {PLAYBACK_RATES.map(rate => (
                      <button
                        key={rate}
                        className={`settings-option${playbackRate === rate ? ' active' : ''}`}
                        onClick={() => setPlaybackRate(rate)}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
                {qualityLevels.length > 1 && (
                  <div className="settings-section">
                    <div className="settings-label">Chất lượng</div>
                    <div className="settings-options">
                      <button
                        className={`settings-option${currentQuality === 'auto' ? ' active' : ''}`}
                        onClick={() => handleQualityChange(-1)}
                      >
                        Auto
                      </button>
                      {qualityLevels.map((q, idx) => (
                        <button
                          key={q.height}
                          className={`settings-option${currentQuality === idx ? ' active' : ''}`}
                          onClick={() => handleQualityChange(idx)}
                        >
                          {q.height}p
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {isFullscreen ? (
            <button className="icon-btn" title="Thu nhỏ" onClick={handleExitFullscreen}>
              <MdFullscreenExit size={18} color="#fff" />
            </button>
          ) : (
            <button className="icon-btn" title="Toàn màn hình" onClick={handleFullscreen}><MdFullscreen size={18} color="#fff" /></button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;