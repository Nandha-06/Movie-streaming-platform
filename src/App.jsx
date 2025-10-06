import React, { memo, Suspense, lazy } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from './components/header/Header';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components for better performance
const Home = lazy(() => import('./pages/home/home'));
const Movie = lazy(() => import('./pages/movieDetail/movie'));
const SearchResults = lazy(() => import('./pages/searchResults/searchResults'));
const MovieCategory = lazy(() => import('./components/movieList/movieList'));
const Browse = lazy(() => import('./pages/browse/Browse'));
const Person = lazy(() => import('./pages/personDetail/person'));
const Collection = lazy(() => import('./pages/collectionDetail/collection'));
const Collections = lazy(() => import('./pages/collections/Collections'));

// Loading component for Suspense fallback
const PageLoader = () => (
    <div className="page-loader">
        <div className="loading-spinner">Loading...</div>
    </div>
);

const App = memo(() => {
  return (
    <ErrorBoundary>
      <div className="App">
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <Header />
              <Suspense fallback={<PageLoader />}>
                  <Routes>
                      <Route index element={<Home />} />
                      <Route path="movie/:id" element={<Movie />} />
                      <Route path="search" element={<SearchResults />} />
                      <Route path="movies/:type" element={<MovieCategory />} />
                      <Route path="movies" element={<Browse />} />
                      <Route path="trending" element={<Browse />} />
                      <Route path="tv-shows" element={<Browse />} />
                      <Route path="tv/:id" element={<Movie />} />
                      <Route path="person/:id" element={<Person />} />
                      <Route path="collections" element={<Collections />} />
                      <Route path="collection/:id" element={<Collection />} />
                      <Route path="/*" element={<div className="error-page"><h1>Page Not Found</h1><p>The page you're looking for doesn't exist.</p></div>} />
                  </Routes>
              </Suspense>
          </Router>
      </div>
    </ErrorBoundary>
  );
});

export default App;
