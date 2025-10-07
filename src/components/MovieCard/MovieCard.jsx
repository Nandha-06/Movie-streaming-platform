import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMovieDetails } from '../../utils/api';
import './MovieCard.css';

const MovieCard = ({ movieId, onRemove }) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const data = await fetchMovieDetails(movieId);
        setMovie(data);
      } catch (error) {
        console.error('Error loading movie:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [movieId]);

  if (loading) {
    return <div className="movie-card-loading">Loading...</div>;
  }

  if (!movie) {
    return null;
  }

  return (
    <div className="movie-card">
      <Link to={`/movie/${movieId}`} className="movie-card-link">
        <img
          src={movie.poster_path 
            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` 
            : 'https://via.placeholder.com/300x450?text=No+Image'
          }
          alt={movie.title}
          className="movie-card-poster"
        />
        <div className="movie-card-info">
          <h4>{movie.title}</h4>
          <p>{movie.release_date?.substring(0, 4)}</p>
        </div>
      </Link>
      {onRemove && (
        <button onClick={() => onRemove(movieId)} className="movie-card-remove">
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default MovieCard;
