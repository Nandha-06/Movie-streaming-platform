import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./Browse.css";
import { useLocation } from "react-router-dom";
import { FiltersBar } from "../../components/header/FiltersBar";
import Cards from "../../components/card/card";
import { fetchMovies, fetchTVShows, fetchDiscoverMovies, fetchDiscoverTV, fetchGenres } from "../../utils/api";

const countryMap = {
  'United States': 'US',
  'United Kingdom': 'GB',
  'France': 'FR',
  'India': 'IN',
  'Germany': 'DE',
  'Italy': 'IT',
  'Spain': 'ES',
  'Canada': 'CA',
  'Australia': 'AU',
  'Japan': 'JP',
  'South Korea': 'KR',
  'China': 'CN',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'Argentina': 'AR',
  'Russia': 'RU',
  'Thailand': 'TH',
  'Turkey': 'TR',
  'Poland': 'PL',
  'Romania': 'RO',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Austria': 'AT',
  'Denmark': 'DK',
  'Norway': 'NO',
  'Sweden': 'SE',
  'South Africa': 'ZA'
};

const sortMap = {
  'Newest First': 'release_date.desc',
  'Oldest First': 'release_date.asc',
  'Highest Rated': 'vote_average.desc',
  'Most Popular': 'popularity.desc',
  'Alphabetical': 'original_title.asc'
};

const Browse = () => {
  const location = useLocation();
  const isTrendingPage = location.pathname === '/trending';
  const isTVPage = location.pathname === '/tv-shows';

  const [media, setMedia] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [genres, setGenres] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const genreMap = useMemo(() => {
    return genres.reduce((acc, genre) => {
      acc[genre.name] = genre.id;
      return acc;
    }, {});
  }, [genres]);

  const buildParams = useCallback((filters, page) => {
    const params = {
      page
    };

    if (filters.genre && filters.genre !== 'All' && genreMap[filters.genre]) {
      params.with_genres = genreMap[filters.genre];
    }

    if (filters.country && filters.country !== 'All' && countryMap[filters.country]) {
      params.with_origin_country = countryMap[filters.country];
    }

    if (filters.released && filters.released !== 'All') {
      if (filters.released === 'Older') {
        params[isTVPage ? 'first_air_date.lte' : 'primary_release_date.lte'] = '2019-12-31';
      } else {
        params[isTVPage ? 'first_air_date_year' : 'primary_release_year'] = filters.released;
      }
    }

    if (filters.imdb && filters.imdb !== 'All') {
      const rating = parseInt(filters.imdb.split('+')[0]);
      params['vote_average.gte'] = rating;
    }

    if (filters.newest && filters.newest !== 'Newest First' && sortMap[filters.newest]) {
      params.sort_by = sortMap[filters.newest];
    }

    // Ignore quality and type for now, as not directly supported or app is movie-focused

    return params;
  }, [genreMap, isTVPage]);

  const loadMedia = useCallback(async (reset = true, currentPage) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      let data;

      if (Object.keys(filters).length === 0) {
        // Initial load: TV shows, trending, or top rated
        if (isTVPage) {
          data = await fetchTVShows('popular', currentPage);
        } else {
          const type = isTrendingPage ? 'trending' : 'top_rated';
          data = await fetchMovies(type, currentPage);
        }
      } else {
        // Filtered: use discover
        const params = buildParams(filters, currentPage);
        if (isTVPage) {
          data = await fetchDiscoverTV(params);
        } else {
          data = await fetchDiscoverMovies(params);
        }
      }

      if (reset) {
        setMedia(data.results);
        setPage(2);
      } else {
        setMedia(prev => [...prev, ...data.results]);
        setPage(prev => prev + 1);
      }

      setHasMore(data.results.length === 20 && data.total_pages > currentPage);
    } catch (err) {
      setError('Failed to load content');
      console.error('Error loading content:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, buildParams, isTrendingPage, isTVPage]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => {
      const updated = {
        ...prev,
        ...newFilters
      };
      // Remove 'All' values
      Object.keys(updated).forEach(key => {
        if (updated[key] === 'All') {
          delete updated[key];
        }
      });
      return updated;
    });
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const genreData = await fetchGenres();
        setGenres(genreData);
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    loadMedia(true, 1);
  }, [filters, loadMedia]);

  const mediaCards = useMemo(() => {
    return media.map(item => (
      <Cards key={item.id} movie={item} />
    ));
  }, [media]);

  if (error) {
    return (
      <div className="browse-page">
      <FiltersBar onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} activeFilters={filters} />
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => loadMedia()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="browse-page">
      <FiltersBar onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} activeFilters={filters} />
      <div className="browse-content">
        {Object.keys(filters).length > 0 && isTrendingPage && (
          <h2 className="browse-title">{isTrendingPage ? 'Trending' : 'TV Shows'}</h2>
        )}
        <div className="list__cards">
          {loading ? (
            Array.from({ length: 20 }).map((_, index) => (
              <Cards key={`skeleton-${index}`} movie={null} />
            ))
          ) : (
            <>
              {mediaCards}
              {loadingMore && (
                Array.from({ length: 20 }).map((_, index) => (
                  <Cards key={`loading-${index}`} movie={null} />
                ))
              )}
            </>
          )}
        </div>
        {!loading && hasMore && (
          <div className="load-more-container">
            <button className="load-more-btn" onClick={() => loadMedia(false, page)}>
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
