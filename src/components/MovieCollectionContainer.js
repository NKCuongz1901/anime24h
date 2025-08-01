import React, { useEffect, useState } from "react";
import MovieCollectionSection from "./MovieCollectionSection";

function MovieCollectionContainer({ title, apiUrl }) {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchAllPages = async () => {
      let page = 1;
      let allItems = [];
      let hasMore = true;
      while (hasMore) {
        const url = apiUrl.replace(/page=\d+/, `page=${page}`);
        const res = await fetch(url);
        const data = await res.json();
        const items = data.data.items.filter(item => item.name.toLowerCase().includes('doraemon'));
        allItems = allItems.concat(items.map(item => ({
          slug: item.slug,
          name: item.name,
          origin_name: item.origin_name,
          poster: "https://phimimg.com/" + item.poster_url,
          episode: item.episode_current,
          quality: item.quality,
          lang: item.lang,
          year: item.year,
          thumb_url: item.thumb_url,
          time: item.time,
          category: item.category,
        })));
        if (items.length === 0 || page >= data.data.params.pagination.totalPages || allItems.length >= 5) {
          hasMore = false;
        } else {
          page++;
        }
      }
      if (isMounted) setMovies(allItems.slice(0, 5));
    };
    fetchAllPages();
    return () => { isMounted = false; };
  }, [apiUrl]);

  return <MovieCollectionSection title={title} movies={movies} />;
}

export default MovieCollectionContainer; 