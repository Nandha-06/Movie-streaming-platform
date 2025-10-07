import { useEffect, useState, useCallback } from "react"
import "./movie.css"
import { useParams, useLocation, Link, useNavigate } from "react-router-dom"
import { fetchMovieDetails, fetchTVDetails, formatRating, fetchMovieLogos, fetchSimilarMedia, fetchCredits, fetchCollectionDetails, fetchMovieTrailers } from "../../utils/api"
import { useAuth } from "../../context/AuthContext"
import { addToLiked, removeFromLiked, addToWatchLater, removeFromWatchLater, getUserData } from "../../utils/userActions"

const Movie = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const isTV = location.pathname.includes('/tv/')
    const { user } = useAuth()

    const [currentMovieDetail, setMovie] = useState(null)
    const [movieLogo, setMovieLogo] = useState(null)
    const [similarMedia, setSimilarMedia] = useState([])
    const [credits, setCredits] = useState({ cast: [], crew: [] })
    const [collection, setCollection] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isLiked, setIsLiked] = useState(false)
    const [isInWatchlist, setIsInWatchlist] = useState(false)
    const [showTrailerModal, setShowTrailerModal] = useState(false)
    const [trailerData, setTrailerData] = useState(null)
    const [trailerLoading, setTrailerLoading] = useState(false)
    const [showAuthPrompt, setShowAuthPrompt] = useState(false)
    const { id } = useParams()

    const loadMovieDetails = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = isTV ? await fetchTVDetails(id) : await fetchMovieDetails(id)
            setMovie(data)
            window.scrollTo(0, 0)
        } catch (err) {
            setError(`Failed to load ${isTV ? 'TV show' : 'movie'} details`)
            console.error(`Error loading ${isTV ? 'TV show' : 'movie'} details:`, err)
        } finally {
            setLoading(false)
        }
    }, [id, isTV])

    const loadMovieLogo = useCallback(async () => {
        if (isTV || !currentMovieDetail) return

        try {
            const logos = await fetchMovieLogos(id)
            if (logos && logos.length > 0) {
                const bestLogo = logos.sort((a, b) => (b.width || 0) - (a.width || 0))[0]
                setMovieLogo(bestLogo)
            } else {
                // No logo found, clear the state
                setMovieLogo(null)
            }
        } catch (err) {
            console.error('Error loading movie logo:', err)
            // Clear logo on error
            setMovieLogo(null)
        }
    }, [id, isTV, currentMovieDetail])

    const loadSimilarMedia = useCallback(async () => {
        try {
            console.log(`Fetching ${isTV ? 'TV show' : 'movie'} recommendations for ID: ${id}`)
            const data = await fetchSimilarMedia(id, isTV)
            console.log('Recommendations response:', data)
            setSimilarMedia(data.results.slice(0, 12))
        } catch (err) {
            console.error('Error loading recommendations:', err)
        }
    }, [id, isTV])

    const loadCredits = useCallback(async () => {
        try {
            console.log(`Fetching ${isTV ? 'TV show' : 'movie'} credits for ID: ${id}`)
            const data = await fetchCredits(id, isTV)
            console.log('Credits response:', data)
            setCredits({
                cast: data.cast || [],
                crew: data.crew || []
            })
        } catch (err) {
            console.error('Error loading credits:', err)
        }
    }, [id, isTV])

    const loadCollection = useCallback(async () => {
        if (!currentMovieDetail?.belongs_to_collection || isTV) {
            setCollection(null)
            return
        }

        try {
            const collectionData = await fetchCollectionDetails(currentMovieDetail.belongs_to_collection.id)
            setCollection(collectionData)
        } catch (err) {
            console.error('Error loading collection:', err)
            setCollection(null)
        }
    }, [currentMovieDetail, isTV])

    // Check if movie is liked or in watchlist
    useEffect(() => {
        const checkUserActions = async () => {
            if (user) {
                try {
                    const userData = await getUserData(user.uid)
                    if (userData) {
                        setIsLiked(userData.likedMovies?.includes(id) || false)
                        setIsInWatchlist(userData.watchLater?.includes(id) || false)
                    }
                } catch (error) {
                    console.error('Error checking user actions:', error)
                }
            } else {
                setIsLiked(false)
                setIsInWatchlist(false)
            }
        }

        checkUserActions()
    }, [user, id])

    // Reset states when movie ID changes
    useEffect(() => {
        setMovie(null)
        setMovieLogo(null)
        setSimilarMedia([])
        setCredits({ cast: [], crew: [] })
        setCollection(null)
        setLoading(true)
        setError(null)
    }, [id])

    useEffect(() => {
        loadMovieDetails()
        loadSimilarMedia()
        loadCredits()
    }, [loadMovieDetails, loadSimilarMedia, loadCredits])

    useEffect(() => {
        if (currentMovieDetail && !isTV) {
            loadMovieLogo()
            loadCollection()
        } else if (isTV) {
            // Clear logo for TV shows
            setMovieLogo(null)
            setCollection(null)
        }
    }, [currentMovieDetail, loadMovieLogo, loadCollection, isTV])

    const handleLike = async () => {
        if (!user) {
            setShowAuthPrompt(true)
            return
        }

        try {
            if (isLiked) {
                await removeFromLiked(user.uid, id)
                setIsLiked(false)
            } else {
                await addToLiked(user.uid, id)
                setIsLiked(true)
            }
        } catch (error) {
            console.error('Error updating like:', error)
        }
    }

    const handleShare = async () => {
        const url = window.location.href
        const title = (currentMovieDetail.title || currentMovieDetail.name) || 'Check this out!'

        try {
            if (navigator.share) {
                // Use Web Share API if available
                await navigator.share({
                    title: title,
                    text: `Check out this ${isTV ? 'TV show' : 'movie'}: ${title}`,
                    url: url
                })
            } else {
                // Fallback to clipboard
                await navigator.clipboard.writeText(url)
                // Could show a toast notification here
                console.log('URL copied to clipboard!')
            }
        } catch (error) {
            console.error('Error sharing:', error)
        }
    }

    const handleWatchlist = async () => {
        if (!user) {
            setShowAuthPrompt(true)
            return
        }

        try {
            if (isInWatchlist) {
                await removeFromWatchLater(user.uid, id)
                setIsInWatchlist(false)
            } else {
                await addToWatchLater(user.uid, id)
                setIsInWatchlist(true)
            }
        } catch (error) {
            console.error('Error updating watchlist:', error)
        }
    }

    const handleTrailerClick = async () => {
        setShowTrailerModal(true)
        setTrailerLoading(true)
        setTrailerData(null)

        try {
            const trailers = await fetchMovieTrailers(id, isTV)
            if (trailers && trailers.length > 0) {
                // Sort by official and use the first one
                const sortedTrailers = trailers.sort((a, b) => {
                    if (a.official && !b.official) return -1
                    if (!a.official && b.official) return 1
                    return 0
                })
                setTrailerData(sortedTrailers[0])
            }
        } catch (error) {
            console.error('Error loading trailer:', error)
        } finally {
            setTrailerLoading(false)
        }
    }

    const closeTrailerModal = () => {
        setShowTrailerModal(false)
        setTrailerData(null)
        setTrailerLoading(false)
    }

    if (error) {
        return (
            <div className="movie-error">
                <h2>{error}</h2>
                <button onClick={loadMovieDetails}>Retry</button>
            </div>
        )
    }

    if (loading || !currentMovieDetail) {
        return (
            <div className="movie-loading">
                <div className="loading-spinner">Loading...</div>
            </div>
        )
    }

    return (
        <div className="movie-page">
            {/* Main Content Area */}
            <div className="movie-content">
                {/* Left Side - Video Player Area */}
                <div className="movie-main">
                    {/* Video/Backdrop Section */}
                    <div className="movie-player">
                        <img 
                            src={`https://image.tmdb.org/t/p/original${currentMovieDetail.backdrop_path || ""}`} 
                            alt={(currentMovieDetail.title || currentMovieDetail.name) || ''}
                        />
                        <div className="movie-player__overlay">
                            <button className="play-button">
                                <i className="fas fa-play"></i>
                            </button>
                            <div className="movie-player__info">
                                <span className="quality-badge">HD</span>
                                <span className="duration">{currentMovieDetail.runtime ? `${currentMovieDetail.runtime}min` : ''}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="movie-actions">
                        <button className={`action-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike} title="Like">
                            <i className="fas fa-heart"></i>
                        </button>
                        <button className={`action-btn ${isInWatchlist ? 'watchlist-added' : ''}`} onClick={handleWatchlist} title="Watch Later">
                            <span className="watch-plus">+</span>
                        </button>
                        <button className="action-btn" onClick={handleShare} title="Share">
                            <i className="fas fa-share-alt"></i>
                        </button>
                        <button className="action-btn trailer-btn" title="Trailer" onClick={handleTrailerClick}>
                            <i className="fab fa-youtube"></i> Trailer
                        </button>
                    </div>

                    {/* Movie Logo Section - Always render to maintain spacing */}
                    <div className="movie-title-section">
                        {movieLogo && (
                            <img
                                className="movie-logo"
                                src={`https://image.tmdb.org/t/p/original${movieLogo.file_path}`}
                                alt={`${currentMovieDetail.title || currentMovieDetail.name} logo`}
                            />
                        )}
                    </div>

                    {/* Movie Info Section */}
                    <div className="movie-info">
                        <div className="movie-info__poster">
                            <img 
                                src={`https://image.tmdb.org/t/p/w500${currentMovieDetail.poster_path || ""}`} 
                                alt={(currentMovieDetail.title || currentMovieDetail.name) || ''}
                            />
                        </div>
                        <div className="movie-info__details">
                            <h2 className="movie-info__title">
                                {currentMovieDetail.title || currentMovieDetail.name}
                            </h2>
                            <p className="movie-info__tagline">{currentMovieDetail.tagline}</p>
                            
                            <div className="movie-info__meta">
                                <div className="meta-item">
                                    <span className="meta-label">Year:</span>
                                    <span className="meta-value">
                                        {(currentMovieDetail.release_date || currentMovieDetail.first_air_date || '').substring(0, 4)}
                                    </span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Certificate:</span>
                                    <span className="meta-value">
                                        {currentMovieDetail.adult ? 'R' : 'PG-13'}
                                    </span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Country:</span>
                                    <span className="meta-value">
                                        {currentMovieDetail.production_countries?.[0]?.name || 'United States'}
                                    </span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Language:</span>
                                    <span className="meta-value">
                                        {currentMovieDetail.original_language?.toUpperCase() || 'EN'}
                                    </span>
                                </div>
                            </div>

                            <div className="movie-info__genres">
                                <span className="meta-label">Genre:</span>
                                {currentMovieDetail.genres?.map((genre, index) => (
                                    <span key={genre.id}>
                                        {genre.name}
                                        {index < currentMovieDetail.genres.length - 1 && ' | '}
                                    </span>
                                ))}
                            </div>



                            <div className="movie-info__rating">
                                <div className="rating-stars">
                                    {[...Array(10)].map((_, i) => (
                                        <i 
                                            key={i} 
                                            className={`fas fa-star ${i < Math.round(currentMovieDetail.vote_average) ? 'active' : ''}`}
                                        ></i>
                                    ))}
                                </div>
                                <span className="rating-value">{formatRating(currentMovieDetail.vote_average)}/10</span>
                            </div>
                        </div>
                    </div>

                    {/* Collection Section */}
                    {collection && (
                        <div className="collection-section">
                            <h3>Part of a Collection</h3>
                            <Link 
                                to={`/collection/${collection.id}`}
                                className="collection-card"
                            >
                                <img 
                                    src={collection.poster_path 
                                        ? `https://image.tmdb.org/t/p/w500${collection.poster_path}` 
                                        : 'https://via.placeholder.com/500x750?text=No+Image'
                                    }
                                    alt={collection.name}
                                    className="collection-poster"
                                />
                                <div className="collection-info">
                                    <h4>{collection.name}</h4>
                                    <p>{collection.parts.length} Movies</p>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* Cast and Crew Section */}
                    {(credits.cast.length > 0 || credits.crew.length > 0) && (
                        <div className="credits-section">
                            {/* Cast */}
                            {credits.cast.length > 0 && (
                                <div className="credits-cast">
                                    <h3>Cast</h3>
                                    <div className="cast-scroll">
                                        {credits.cast.slice(0, 15).map(person => (
                                            <Link 
                                                key={person.id} 
                                                to={`/person/${person.id}`}
                                                className="cast-member"
                                            >
                                                {person.profile_path ? (
                                                    <img 
                                                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                                        alt={person.name}
                                                    />
                                                ) : (
                                                    <div className="image-spacer"></div>
                                                )}
                                                <p className="cast-name">{person.name}</p>
                                                <p className="cast-character">{person.character}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Crew */}
                            {credits.crew.length > 0 && (
                                <div className="credits-crew">
                                    <h3>Crew</h3>
                                    <div className="crew-scroll">
                                        {credits.crew
                                            .filter(person => ['Director', 'Producer', 'Writer', 'Screenplay', 'Executive Producer'].includes(person.job))
                                            .slice(0, 15)
                                            .map((person, index) => (
                                                <Link 
                                                    key={`${person.id}-${index}`}
                                                    to={`/person/${person.id}`}
                                                    className="crew-member"
                                                >
                                                    {person.profile_path ? (
                                                        <img 
                                                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                                            alt={person.name}
                                                        />
                                                    ) : (
                                                        <div className="image-spacer"></div>
                                                    )}
                                                    <p className="crew-name">{person.name}</p>
                                                    <p className="crew-job">{person.job}</p>
                                                </Link>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cast Section */}
                    {currentMovieDetail.credits?.cast && (
                        <div className="movie-cast">
                            <h3>Credits:</h3>
                            <div className="cast-scroll">
                                {currentMovieDetail.credits.cast.slice(0, 10).map(person => (
                                    <div key={person.id} className="cast-member">
                                        <img 
                                            src={person.profile_path 
                                                ? `https://image.tmdb.org/t/p/w185${person.profile_path}` 
                                                : 'https://via.placeholder.com/185x278?text=No+Image'
                                            }
                                            alt={person.name}
                                        />
                                        <p className="cast-name">{person.name}</p>
                                        <p className="cast-character">{person.character}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Similar Movies */}
                <div className="movie-sidebar">
                    <h3 className="sidebar-title">Recommended {isTV ? 'TV Shows' : 'Movies'}</h3>
                    <div className="similar-movies">
                        {similarMedia.length > 0 ? (
                            similarMedia.map(item => (
                                <Link 
                                    key={item.id} 
                                    to={`/${isTV ? 'tv' : 'movie'}/${item.id}`}
                                    className="similar-item"
                                >
                                    <img 
                                        src={item.poster_path 
                                            ? `https://image.tmdb.org/t/p/w300${item.poster_path}` 
                                            : 'https://via.placeholder.com/300x450?text=No+Image'
                                        } 
                                        alt={item.title || item.name}
                                    />
                                    <div className="similar-item__info">
                                        <p className="similar-item__title">{item.title || item.name}</p>
                                        <p className="similar-item__year">
                                            {(item.release_date || item.first_air_date || '').substring(0, 4)}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p style={{color: '#999', textAlign: 'center', padding: '20px'}}>
                                No recommendations found
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Trailer Modal */}
            {showTrailerModal && (
                <div className="trailer-modal-overlay" onClick={closeTrailerModal}>
                    <div className="trailer-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="trailer-modal-close" onClick={closeTrailerModal}>
                            <i className="fas fa-times"></i>
                        </button>
                        <div className="trailer-modal-content">
                            {trailerLoading ? (
                                <div className="trailer-loading">
                                    <div className="loading-spinner">Loading trailer...</div>
                                </div>
                            ) : trailerData ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${trailerData.key}?autoplay=1&rel=0&modestbranding=1`}
                                    title={`${currentMovieDetail.title || currentMovieDetail.name} Trailer`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="trailer-iframe"
                                ></iframe>
                            ) : (
                                <div className="trailer-error">
                                    <p>No trailer available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Auth Prompt Modal */}
            {showAuthPrompt && (
                <div className="auth-prompt-overlay" onClick={() => setShowAuthPrompt(false)}>
                    <div className="auth-prompt" onClick={(e) => e.stopPropagation()}>
                        <button className="auth-prompt-close" onClick={() => setShowAuthPrompt(false)}>
                            <i className="fas fa-times"></i>
                        </button>
                        <h2>Sign in required</h2>
                        <p>Please sign in to like movies and add them to your watchlist</p>
                        <div className="auth-prompt-buttons">
                            <button onClick={() => navigate('/signin')} className="auth-prompt-signin">
                                Sign In
                            </button>
                            <button onClick={() => navigate('/signup')} className="auth-prompt-signup">
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Movie
