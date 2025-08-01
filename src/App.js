import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import AnimeGrid from './components/AnimeGrid';
import Footer from './components/Footer';
import CategoryPage from './components/CategoryPage';
import MovieDetail from './components/MovieDetail';
import Watch from './pages/Watch';
import NativeBanner1 from './components/NativeBanner1';
import AdBanner from './components/AdBanner';
import './styles/App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Header />
          <NativeBanner1 />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<AnimeGrid />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/movie/:slug" element={<MovieDetail />} />
              <Route path="/watch/:url" element={<Watch />} />
            </Routes>
          </main>
          <Footer />
          <AdBanner />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
