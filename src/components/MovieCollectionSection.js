import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CardPreview from "./CardPreview";

function Badge({ children, color }) {
  return (
    <span
      style={{
        display: "inline-block",
        minWidth: 44,
        padding: "2px 12px",
        borderRadius: 12,
        background: color || "#222",
        color: "#fff",
        fontWeight: 700,
        fontSize: 14,
        marginRight: 8,
        marginBottom: 4,
        textAlign: "center",
        letterSpacing: 1,
      }}
    >
      {children}
    </span>
  );
}

function Dot() {
  return <span style={{ color: '#666', margin: '0 6px', fontWeight: 700, fontSize: 13 }}>&bull;</span>;
}

export default function MovieCollectionSection({ title, movies }) {
  const [previewMovie, setPreviewMovie] = useState(null);
  const [previewCoords, setPreviewCoords] = useState({ top: null, left: null, showLeft: false, margin: 16, previewWidth: 400 });
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const navigate = useNavigate();

  // Badge màu mẫu
  const badgeColors = ["#3a4256", "#43a047", "#1976d2", "#ffd600", "#e53935"];

  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ color: "#ffe082", fontSize: 28, marginBottom: 24, fontWeight: 700 }}>{title}</h2>
      <div style={{ display: "flex", gap: 32, overflow: "visible", position: "relative" }}>
        {movies.map((movie, idx) => {
          const anime = {
            ...movie,
            poster_url: movie.poster ? movie.poster.replace('https://phimimg.com/', '') : '',
            episode_current: movie.episode,
          };
          const extraInfo = [];
          if (movie.quality) extraInfo.push(movie.quality);
          if (movie.lang) extraInfo.push(movie.lang);
          if (movie.year) extraInfo.push(movie.year);
          const isHovered = hoveredIdx === idx;
          // Lấy slug ưu tiên movie.slug, fallback sang anime.slug nếu có
          const slug = movie.slug || anime.slug;
          return (
            <div
              key={idx}
              style={{
                width: 270,
                background: "#181a20",
                borderRadius: 24,
                border: "3px solid #ffe082",
                boxShadow: isHovered
                  ? "0 8px 32px 0 rgba(255, 224, 130, 0.25), 0 8px 32px 0 rgba(0,0,0,0.35)"
                  : "0 4px 24px rgba(0,0,0,0.25)",
                padding: 0,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                overflow: "visible",
                marginBottom: 32,
                cursor: "pointer",
                transform: isHovered ? "translateY(-12px)" : "translateY(0)",
                transition: "box-shadow 0.25s cubic-bezier(.4,0,.2,1), transform 0.25s cubic-bezier(.4,0,.2,1)"
              }}
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
                setPreviewMovie(anime);
                setPreviewCoords({
                  top: rect.top,
                  left,
                  showLeft,
                  margin,
                  previewWidth
                });
                setHoveredIdx(idx);
              }}
              onMouseLeave={() => {
                setPreviewMovie(null);
                setHoveredIdx(null);
              }}
              onClick={() => {
                if (slug) navigate(`/movie/${slug}`);
              }}
            >
              <div style={{ position: "relative", width: "100%" }}>
                <img
                  src={movie.poster}
                  alt={movie.name}
                  style={{ width: "100%", height: 340, objectFit: "cover", borderRadius: 24, margin: 0 }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "#ffe082",
                    opacity: isHovered ? 0.35 : 0,
                    borderRadius: 24,
                    pointerEvents: "none",
                    zIndex: 2,
                    transition: "opacity 0.25s cubic-bezier(.4,0,.2,1)"
                  }}
                />
              </div>
              <div style={{ width: "100%", textAlign: "left", padding: "18px 18px 12px 18px", marginBottom: 32 }}>
                <h3 style={{ color: "#fff", fontSize: 14, fontWeight: 700, margin: 0, marginBottom: 2, lineHeight: 1.2 }}>{movie.name}</h3>
                {extraInfo.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: "#bdbdbd", fontWeight: 400, marginTop: 12 }}>
                    {extraInfo.map((item, i) => (
                      <React.Fragment key={item}>
                        {i > 0 && <Dot />}
                        <span>{item}</span>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
              <div style={{
                position: "absolute",
                left: -18,
                bottom: -18,
                fontSize: 64,
                fontWeight: 900,
                color: "#ffe082",
                opacity: 0.95,
                textShadow: "2px 4px 16px #000, 0 2px 0 #fff2",
                fontStyle: "italic",
                fontFamily: 'sans-serif',
                zIndex: 2
              }}>{idx + 1}</div>
            </div>
          );
        })}
        {previewMovie && (
          <CardPreview
            anime={previewMovie}
            top={previewCoords.top}
            left={previewCoords.left}
            showLeft={previewCoords.showLeft}
            margin={previewCoords.margin}
            previewWidth={previewCoords.previewWidth}
          />
        )}
      </div>
    </section>
  );
} 