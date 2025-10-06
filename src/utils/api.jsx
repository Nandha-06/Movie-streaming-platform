// API utility functions with caching for better performance
const API_KEY = '4e44d9029b1270a757cddc766a1bcb63';
const BASE_URL = 'https://api.themoviedb.org/3';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple in-memory cache
const cache = new Map();

const getCacheKey = (endpoint, params = '') => `${endpoint}:${params}`;

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  if (cached) {
    cache.delete(key); // Remove expired cache
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

export const fetchMovies = async (type = 'popular', page = 1) => {
  let endpoint = `/movie/${type}`;
  if (type === 'trending') {
    endpoint = '/trending/movie/day';
  } else if (type === 'trending_week') {
    endpoint = '/trending/movie/week';
  }
  const params = `page=${page}`;
  const cacheKey = getCacheKey(endpoint, params);

  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(
      `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the response
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
};

export const fetchMovieDetails = async (movieId) => {
  const endpoint = `/movie/${movieId}`;
  const cacheKey = getCacheKey(endpoint);

  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(
      `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the response (no filtering for individual movie details)
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

export const fetchTVDetails = async (tvId) => {
  const endpoint = `/tv/${tvId}`;
  const cacheKey = getCacheKey(endpoint);

  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(
      `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the response (no filtering for individual TV details)
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching TV details:', error);
    throw error;
  }
};

export const fetchTVShows = async (type = 'popular', page = 1) => {
  let endpoint = `/tv/${type}`;
  if (type === 'trending_week') {
    endpoint = '/trending/tv/week';
  }
  const params = `page=${page}`;
  const cacheKey = getCacheKey(endpoint, params);

  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(
      `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the response
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    throw error;
  }
};

export const fetchMultipleTVPages = async (type = 'popular', pages = 3) => {
  const endpoint = `/tv/${type}`;
  const allResults = [];
  const pagesToFetch = [];
  const pageData = [];
  try {
    // First, check which pages need to be fetched
    for (let page = 1; page <= pages; page++) {
      const params = `page=${page}`;
      const cacheKey = getCacheKey(endpoint, params);

      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        allResults.push(...cachedData.results);
        pageData.push(cachedData);
      } else {
        pagesToFetch.push({ page, cacheKey });
      }
    }

    // Fetch uncached pages
    if (pagesToFetch.length > 0) {
      const pagePromises = pagesToFetch.map(({ page }) =>
        fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US&page=${page}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`API error: ${response.status}`);
            }
            return response.json();
          })
      );

      const responses = await Promise.all(pagePromises);

      // Process responses and cache them
      responses.forEach((data, index) => {
        const { cacheKey } = pagesToFetch[index];
        allResults.push(...data.results);
        setCachedData(cacheKey, data);
        pageData.push(data);
      });
    }

    return {
      results: allResults,
      total_pages: pages,
      total_results: allResults.length
    };
  } catch (error) {
    console.error('Error fetching multiple TV pages:', error);
    throw error;
  }
};

export const searchMulti = async (query, page = 1) => {
  const endpoint = '/search/multi';
  const params = `query=${encodeURIComponent(query)}&page=${page}`;
  const cacheKey = getCacheKey(endpoint, params);

  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(
      `${BASE_URL}${endpoint}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter to include only movies and TV shows, exclude people
    const filteredResults = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');

    const filteredData = {
      ...data,
      results: filteredResults
    };

    // Apply drama filtering to movie results only
    const movieResults = filteredData.results.filter(item => item.media_type === 'movie');
    const tvResults = filteredData.results.filter(item => item.media_type !== 'movie');
    const dramaFilteredMovies = filterDramaMovies({ results: movieResults }).results;

    const finalFilteredData = {
      ...filteredData,
      results: [...dramaFilteredMovies, ...tvResults].filter(item => item.media_type === 'movie' ? true : true) // Keep all for now
    };

    // Cache the filtered response
    setCachedData(cacheKey, finalFilteredData);
    return finalFilteredData;
  } catch (error) {
    console.error('Error searching multi:', error);
    throw error;
  }
};

// Clear cache utility (useful for debugging or forced refresh)
export const clearCache = () => {
   cache.clear();
};

export const fetchGenres = async () => {
  const endpoint = '/genre/movie/list';
  const cacheKey = getCacheKey(endpoint);

  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData.genres;
  }

  try {
    const response = await fetch(
      `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the response
    setCachedData(cacheKey, data);
    return data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
};

export const fetchDiscoverMovies = async (params) => {
  const endpoint = '/discover/movie';
  // Convert params object to query string
  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    language: 'en-US',
    ...params
  }).toString();
  const cacheKey = getCacheKey(endpoint, queryParams);

  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(
      `${BASE_URL}${endpoint}?${queryParams}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the response
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching discover movies:', error);
    throw error;
  }
};

export const fetchDiscoverTV = async (params) => {
  const endpoint = '/discover/tv';
  // Convert params object to query string
  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    language: 'en-US',
    ...params
  }).toString();
  const cacheKey = getCacheKey(endpoint, queryParams);

  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(
      `${BASE_URL}${endpoint}?${queryParams}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the response
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching discover TV:', error);
    throw error;
  }
};

export const fetchMultipleMoviePages = async (type = 'popular', pages = 3) => {
  let endpoint = `/movie/${type}`;
  if (type === 'trending') {
    endpoint = '/trending/movie/day';
  }
  const allResults = [];
  const pagesToFetch = [];
  const pageData = [];
  try {
    // First, check which pages need to be fetched
    for (let page = 1; page <= pages; page++) {
      const params = `page=${page}`;
      const cacheKey = getCacheKey(endpoint, params);

      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        allResults.push(...cachedData.results);
        pageData.push(cachedData);
      } else {
        pagesToFetch.push({ page, cacheKey });
      }
    }

    // Fetch uncached pages
    if (pagesToFetch.length > 0) {
      const pagePromises = pagesToFetch.map(({ page }) =>
        fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US&page=${page}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`API error: ${response.status}`);
            }
            return response.json();
          })
      );

      const responses = await Promise.all(pagePromises);

      // Process responses and cache them
      responses.forEach((data, index) => {
        const { cacheKey } = pagesToFetch[index];
        allResults.push(...data.results);
        setCachedData(cacheKey, data);
        pageData.push(data);
      });
    }

    // Apply appropriate filters based on movie type
    let filteredResults = applyMovieFiltersForMultiplePages(allResults, type);

    // Filter out duplicates by id
    const seen = new Set();
    filteredResults = filteredResults.filter(item => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });

    return {
      results: filteredResults,
      total_pages: pages,
      total_results: filteredResults.length
    };
  } catch (error) {
    console.error('Error fetching multiple movie pages:', error);
    throw error;
  }
}

// Format rating to 1 decimal place
export const formatRating = (rating) => {
    if (!rating || rating === 0) return "N/A";
    return parseFloat(rating).toFixed(1);
};

// Drama genre ID in TMDB API
const DRAMA_GENRE_ID = 18;

// Filter out drama movies from movie list
export const filterDramas = (movies) => {
    if (!movies || !Array.isArray(movies)) return movies;
    return movies.filter(movie => {
        // Check if movie has genres and if any genre is Drama (ID: 18)
        if (movie.genres && movie.genres.length > 0) {
            return !movie.genres.some(genre => genre.id === DRAMA_GENRE_ID);
        }
        // If no genre info, include the movie (better to show than hide)
        return true;
    });
};

// Filter dramas from API response data
export const filterDramaMovies = (data) => {
    if (!data || !data.results) return data;
    return {
        ...data,
        results: filterDramas(data.results)
    };
};

// Filter upcoming movies to include movies releasing in the next 12 months
export const filterUpcomingMovies = (data) => {
    if (!data || !data.results) return data;

    const currentDate = new Date();
    const today = new Date(currentDate.toISOString().split('T')[0]); // Get today's date

    // Set the cutoff date to 12 months from now
    const twelveMonthsFromNow = new Date(today);
    twelveMonthsFromNow.setFullYear(twelveMonthsFromNow.getFullYear() + 1);

    const filteredResults = data.results.filter(movie => {
        if (!movie.release_date) return false;

        const releaseDate = new Date(movie.release_date);
        // Include movies releasing between today and 12 months from now
        return releaseDate >= today && releaseDate <= twelveMonthsFromNow;
    });

    return {
        ...data,
        results: filteredResults
    };
};

// Apply appropriate filters based on movie type
const applyMovieFilters = (data, type) => {
    let filteredData = data;

    // Apply upcoming movies filtering FIRST for "upcoming" type to get more candidates
    if (type === 'upcoming') {
        filteredData = filterUpcomingMovies(filteredData);
    }

    // Apply drama filtering to all movie types
    filteredData = filterDramaMovies(filteredData);

    return filteredData;
};

// Apply appropriate filters for multiple pages (returns just the filtered results array)
const applyMovieFiltersForMultiplePages = (results, type) => {
    // Convert results array to data object format for filtering
    const dataObject = { results };

    // Apply the same filters as single page requests
    const filteredData = applyMovieFilters(dataObject, type);

    return filteredData.results;
};

// Fetch movie/TV trailers
export const fetchMovieTrailers = async (id, isTV = false) => {
    const endpoint = isTV ? `/tv/${id}/videos` : `/movie/${id}/videos`;
    const cacheKey = getCacheKey(endpoint);

    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await fetch(
            `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Filter to get only trailers (type: Trailer) and prefer official trailers
        const trailers = data.results.filter(video =>
            video.type === 'Trailer' &&
            video.site === 'YouTube' &&
            (video.official || video.type === 'Trailer')
        );

        // If no official trailers found, get any trailer
        const fallbackTrailers = data.results.filter(video =>
            video.type === 'Trailer' && video.site === 'YouTube'
        );

        const finalTrailers = trailers.length > 0 ? trailers : fallbackTrailers;

        // Cache the response
        setCachedData(cacheKey, finalTrailers);
        return finalTrailers;
    } catch (error) {
        console.error(`Error fetching ${isTV ? 'TV' : 'movie'} trailers:`, error);
        throw error;
    }
};

// Fetch movie logos
export const fetchMovieLogos = async (id) => {
    const endpoint = `/movie/${id}/images`;
    const cacheKey = getCacheKey(endpoint);

    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await fetch(
            `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Get logos from the response - TMDB provides logos in the logos array
        const logos = data.logos || [];

        // Filter for English language logos and prefer PNG/SVG formats
        const englishLogos = logos.filter(logo =>
            logo.iso_639_1 === 'en' &&
            (logo.file_path.endsWith('.png') || logo.file_path.endsWith('.svg'))
        );

        // If no English logos found, get any available logo
        const fallbackLogos = logos.filter(logo =>
            logo.file_path.endsWith('.png') || logo.file_path.endsWith('.svg')
        );

        const finalLogos = englishLogos.length > 0 ? englishLogos : fallbackLogos;

        // Cache the response
        setCachedData(cacheKey, finalLogos);
        return finalLogos;
    } catch (error) {
        console.error('Error fetching movie logos:', error);
        throw error;
    }
};

// Fetch similar movies or TV shows
export const fetchSimilarMedia = async (id, isTV = false) => {
    // Use /recommendations for both movies and TV shows
    const endpoint = isTV ? `/tv/${id}/recommendations` : `/movie/${id}/recommendations`;
    const cacheKey = getCacheKey(endpoint);
    const fullUrl = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US&page=1`;
    
    console.log(`Fetching ${isTV ? 'TV show' : 'movie'} recommendations from: ${fullUrl}`);

    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
        console.log('Returning cached recommendations data');
        return cachedData;
    }

    try {
        const response = await fetch(fullUrl);

        if (!response.ok) {
            throw new Error(`API error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`${isTV ? 'TV show' : 'Movie'} recommendations API response for ${isTV ? 'TV' : 'movie'} ${id}:`, data);

        // Cache the response
        setCachedData(cacheKey, data);
        return data;
    } catch (error) {
        console.error(`Error fetching ${isTV ? 'TV show' : 'movie'} recommendations for ID ${id}:`, error);
        throw error;
    }
};

// Fetch cast and crew credits
export const fetchCredits = async (id, isTV = false) => {
    const endpoint = isTV ? `/tv/${id}/credits` : `/movie/${id}/credits`;
    const cacheKey = getCacheKey(endpoint);
    const fullUrl = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`;
    
    console.log(`Fetching ${isTV ? 'TV show' : 'movie'} credits from: ${fullUrl}`);

    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
        console.log('Returning cached credits data');
        return cachedData;
    }

    try {
        const response = await fetch(fullUrl);

        if (!response.ok) {
            throw new Error(`API error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`${isTV ? 'TV show' : 'Movie'} credits API response for ${isTV ? 'TV' : 'movie'} ${id}:`, data);

        // Cache the response
        setCachedData(cacheKey, data);
        return data;
    } catch (error) {
        console.error(`Error fetching ${isTV ? 'TV show' : 'movie'} credits for ID ${id}:`, error);
        throw error;
    }
};

// Fetch person details
export const fetchPersonDetails = async (personId) => {
    const endpoint = `/person/${personId}`;
    const cacheKey = getCacheKey(endpoint);
    const fullUrl = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`;

    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await fetch(fullUrl);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setCachedData(cacheKey, data);
        return data;
    } catch (error) {
        console.error(`Error fetching person details for ID ${personId}:`, error);
        throw error;
    }
};

// Fetch person credits (movies and TV shows they've worked on)
export const fetchPersonCredits = async (personId) => {
    const endpoint = `/person/${personId}/combined_credits`;
    const cacheKey = getCacheKey(endpoint);
    const fullUrl = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`;

    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await fetch(fullUrl);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setCachedData(cacheKey, data);
        return data;
    } catch (error) {
        console.error(`Error fetching person credits for ID ${personId}:`, error);
        throw error;
    }
};

// Fetch collection details
export const fetchCollectionDetails = async (collectionId) => {
    const endpoint = `/collection/${collectionId}`;
    const cacheKey = getCacheKey(endpoint);
    const fullUrl = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`;

    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await fetch(fullUrl);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setCachedData(cacheKey, data);
        return data;
    } catch (error) {
        console.error(`Error fetching collection details for ID ${collectionId}:`, error);
        throw error;
    }
};
