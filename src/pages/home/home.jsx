import React, { useEffect, useState, useMemo, useRef, useCallback } from "react"
import "./home.css"
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import { Link } from "react-router-dom";
import Cards from "../../components/card/card";
import { fetchMovies, fetchTVShows, fetchDiscoverMovies, fetchDiscoverTV, formatRating, filterDramaMovies } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { getUserData } from "../../utils/userActions";

const Home = () => {
     const { user } = useAuth();

     // Continue Watching state
     const [continueWatching, setContinueWatching] = useState([])
     const [continueWatchingLoading, setContinueWatchingLoading] = useState(false)

     // Movies state
     const [trendingMovies, setTrendingMovies] = useState([])
     const [popularMovies, setPopularMovies] = useState([])
     const [topRatedMovies, setTopRatedMovies] = useState([])
     const [actionThrillers, setActionThrillers] = useState([])
     const [comedyMovies, setComedyMovies] = useState([])
     const [dramaMovies, setDramaMovies] = useState([])
     const [horrorMovies, setHorrorMovies] = useState([])
     const [scifiMovies, setScifiMovies] = useState([])

    // TV Shows state
    const [trendingTV, setTrendingTV] = useState([])
    const [popularTV, setPopularTV] = useState([])
    const [topRatedTV, setTopRatedTV] = useState([])
    const [actionAdventureTV, setActionAdventureTV] = useState([])
    const [comedyTV, setComedyTV] = useState([])
    const [dramaTV, setDramaTV] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [animationMs, setAnimationMs] = useState(500) // Animation duration
    const intervalRef = useRef() // Ref to store interval ID
    const autoPlayTimeoutRef = useRef() // Ref to store resume timeout ID

    // Create refs for all scroll sections
    const continueWatchingRef = useRef()
    const trendingMoviesRef = useRef()
    const popularMoviesRef = useRef()
    const topRatedMoviesRef = useRef()
    const actionThrillersRef = useRef()
    const comedyMoviesRef = useRef()
    const dramaMoviesRef = useRef()
    const horrorMoviesRef = useRef()
    const scifiMoviesRef = useRef()
    const trendingTVRef = useRef()
    const popularTVRef = useRef()
    const topRatedTVRef = useRef()
    const actionAdventureTVRef = useRef()
    const comedyTVRef = useRef()
    const dramaTVRef = useRef()

    useEffect(() => {
        const loadMoviesAndTVShows = async () => {
            try {
                setLoading(true)
                setError(null)

                // Load all movies data
                const [
                    trendingMoviesData,
                    popularMoviesData,
                    topRatedMoviesData,
                    actionThrillersData,
                    comedyMoviesData,
                    dramaMoviesData,
                    horrorMoviesData,
                    scifiMoviesData
                ] = await Promise.all([
                    fetchMovies('trending_week'), // Will need to update API
                    fetchMovies('popular'),
                    fetchMovies('top_rated'),
                    fetchDiscoverMovies({ with_genres: '28' }), // Action
                    fetchDiscoverMovies({ with_genres: '35' }), // Comedy
                    fetchDiscoverMovies({ with_genres: '18' }), // Drama
                    fetchDiscoverMovies({ with_genres: '27' }), // Horror
                    fetchDiscoverMovies({ with_genres: '878' })  // Sci-Fi
                ])

                // Load all TV shows data
                const [
                    trendingTVData,
                    popularTVData,
                    topRatedTVData,
                    actionAdventureTVData,
                    comedyTVData,
                    dramaTVData
                ] = await Promise.all([
                    fetchTVShows('trending_week'), // Will need to update API
                    fetchTVShows('popular'),
                    fetchTVShows('top_rated'),
                    fetchDiscoverTV({ with_genres: '10759' }), // Action & Adventure
                    fetchDiscoverTV({ with_genres: '35' }), // Comedy
                    fetchDiscoverTV({ with_genres: '18' })  // Drama
                ])

                // Filter out drama movies from movie sections (but not from drama category itself)
                const filteredTrending = filterDramaMovies(trendingMoviesData)
                const filteredPopular = filterDramaMovies(popularMoviesData)
                const filteredTopRated = filterDramaMovies(topRatedMoviesData)
                const filteredAction = filterDramaMovies(actionThrillersData)
                const filteredComedy = filterDramaMovies(comedyMoviesData)
                const filteredHorror = filterDramaMovies(horrorMoviesData)
                const filteredScifi = filterDramaMovies(scifiMoviesData)

                // Set movie states
                setTrendingMovies(filteredTrending.results)
                setPopularMovies(filteredPopular.results)
                setTopRatedMovies(filteredTopRated.results)
                setActionThrillers(filteredAction.results)
                setComedyMovies(filteredComedy.results)
                setDramaMovies(dramaMoviesData.results) // Don't filter drama category
                setHorrorMovies(filteredHorror.results)
                setScifiMovies(filteredScifi.results)

                // Set TV states
                setTrendingTV(trendingTVData.results)
                setPopularTV(popularTVData.results)
                setTopRatedTV(topRatedTVData.results)
                setActionAdventureTV(actionAdventureTVData.results)
                setComedyTV(comedyTVData.results)
                setDramaTV(dramaTVData.results)

            } catch (err) {
                setError('Failed to load content')
                console.error('Error loading content:', err)
            } finally {
                setLoading(false)
            }
        }

        loadMoviesAndTVShows()
    }, [])

    // Load Continue Watching movies for authenticated users
    useEffect(() => {
        const loadContinueWatching = async () => {
            if (!user) {
                setContinueWatching([])
                return
            }

            try {
                setContinueWatchingLoading(true)
                const userData = await getUserData(user.uid)

                if (userData && userData.watchedMovies && userData.watchedMovies.length > 0) {
                    // Get recently watched movies (last 12)
                    const watchedMovieIds = userData.watchedMovies.slice(-12)

                    // Fetch movie details for watched movies
                    const continueWatchingPromises = watchedMovieIds.map(async (movieId) => {
                        try {
                            const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=4e44d9029b1270a757cddc766a1bcb63&language=en-US`)
                            const movieData = await response.json()
                            return movieData
                        } catch (error) {
                            console.error(`Error fetching movie ${movieId}:`, error)
                            return null
                        }
                    })

                    const continueWatchingMovies = (await Promise.all(continueWatchingPromises))
                        .filter(movie => movie !== null)
                        .reverse() // Most recent first

                    setContinueWatching(continueWatchingMovies)
                } else {
                    setContinueWatching([])
                }
            } catch (error) {
                console.error('Error loading continue watching:', error)
                setContinueWatching([])
            } finally {
                setContinueWatchingLoading(false)
            }
        }

        loadContinueWatching()
    }, [user])

    const createSectionScrollComponent = (title, items, linkPath, ref) => (
        items.length > 0 && (
            <div className="now-playing-section">
                <div className="section-header">
                    <Link to={linkPath} style={{textDecoration: "none", color: "inherit"}}>
                        <h2>{title} <span style={{fontSize: "0.8em", cursor: "pointer"}}>›</span></h2>
                    </Link>
                </div>
                <div className="horizontal-scroll-container">
                    <button className="scroll-btn scroll-btn-left" onClick={() => {
                        if (ref.current) {
                            ref.current.scrollBy({ left: -300, behavior: 'smooth' });
                        }
                    }}>
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <div className="horizontal-scroll-content" ref={ref}>
                        {items.slice(0, 12).map(item => (
                            <Cards key={item.id} movie={item} />
                        ))}
                    </div>
                    <button className="scroll-btn scroll-btn-right" onClick={() => {
                        if (ref.current) {
                            ref.current.scrollBy({ left: 300, behavior: 'smooth' });
                        }
                    }}>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        )
    );

    // Memoize carousel items to prevent unnecessary re-renders
    const carouselItems = useMemo(() => {
        if (loading || error || trendingMovies.length === 0) return []

        return trendingMovies.slice(0, 10).map(movie => (
            <Link key={movie.id} style={{textDecoration:"none",color:"white"}} to={`/movie/${movie.id}`} >
                <div className="posterImage">
                    <img src={`https://image.tmdb.org/t/p/original${movie && movie.backdrop_path}`} alt={movie?.original_title || ''} />
                </div>
                <div className="posterImage__overlay">
                    <div className="posterImage__title">{movie ? movie.original_title: ""}</div>
                    <div className="posterImage__runtime">
                        {movie ? movie.release_date : ""}
                        <span className="posterImage__rating">
                            {movie ? formatRating(movie.vote_average) :""}
                            <i className="fas fa-star" />{" "}
                        </span>
                    </div>
                    <div className="posterImage__description">{movie ? movie.overview : ""}</div>
                </div>
            </Link>
        ))
    }, [trendingMovies, loading, error])

    // Auto-play functions
    const startAutoPlay = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        if (carouselItems.length > 0) {
            intervalRef.current = setInterval(() => {
                setSelectedIndex((currentIndex) => {
                    if (currentIndex === carouselItems.length - 1) {
                        setAnimationMs(0) // No animation for wrap
                        setTimeout(() => setAnimationMs(500), 100) // Reset animation
                        return 0
                    } else {
                        setAnimationMs(500) // Normal animation
                        return currentIndex + 1
                    }
                })
            }, 3000)
        }
    }, [carouselItems.length])

    const pauseAutoPlay = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        if (autoPlayTimeoutRef.current) {
            clearTimeout(autoPlayTimeoutRef.current)
            autoPlayTimeoutRef.current = null
        }
    }, [])

    // Auto-play effect
    useEffect(() => {
        if (carouselItems.length > 0) {
            startAutoPlay()
        } else {
            pauseAutoPlay()
        }

        return () => pauseAutoPlay()
    }, [carouselItems.length, startAutoPlay, pauseAutoPlay])

    if (error) {
        return (
            <div className="error-container">
                <h2>{error}</h2>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        )
    }

    return (
        <>
            {/* Hero Banner - Rotating trending movies */}
            <div className="poster">
                <Carousel
                    selectedItem={selectedIndex}
                    onChange={(index) => {
                        setSelectedIndex(index)
                        pauseAutoPlay()
                        autoPlayTimeoutRef.current = setTimeout(() => startAutoPlay(), 5000)
                    }}
                    showThumbs={false}
                    showIndicators={true}
                    transitionTime={animationMs}
                    infiniteLoop={false}
                    showStatus={false}
                    showArrows={false}
                >
                    {carouselItems}
                </Carousel>
                {/* Custom wrap-around arrow buttons */}
                <button
                    className="carousel-arrow carousel-arrow-left"
                    onClick={() => {
                        const newIndex = selectedIndex === 0 ? carouselItems.length - 1 : selectedIndex - 1
                        setSelectedIndex(newIndex)
                        pauseAutoPlay()
                        autoPlayTimeoutRef.current = setTimeout(() => startAutoPlay(), 5000)
                    }}
                    aria-label="Previous movie"
                >
                    ‹
                </button>
                <button
                    className="carousel-arrow carousel-arrow-right"
                    onClick={() => {
                        const newIndex = selectedIndex === carouselItems.length - 1 ? 0 : selectedIndex + 1
                        if (selectedIndex === carouselItems.length - 1) {
                            setAnimationMs(0) // No animation for wrap
                            setTimeout(() => setAnimationMs(500), 100)
                        } else {
                            setAnimationMs(500)
                        }
                        setSelectedIndex(newIndex)
                        pauseAutoPlay()
                        autoPlayTimeoutRef.current = setTimeout(() => startAutoPlay(), 5000)
                    }}
                    aria-label="Next movie"
                >
                    ›
                </button>
            </div>

            {/* Movies Section */}
            {!loading && !error && (
                <>
                    {/* Continue Watching - Only show for authenticated users with watched movies */}
                    {user && continueWatching.length > 0 && (
                        <div className="now-playing-section">
                            <div className="section-header">
                                <Link to="/profile" style={{textDecoration: "none", color: "inherit"}}>
                                    <h2>Continue Watching <span style={{fontSize: "0.8em", cursor: "pointer"}}>›</span></h2>
                                </Link>
                            </div>
                            <div className="horizontal-scroll-container">
                                <button className="scroll-btn scroll-btn-left" onClick={() => {
                                    if (continueWatchingRef.current) {
                                        continueWatchingRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                                    }
                                }}>
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <div className="horizontal-scroll-content" ref={continueWatchingRef}>
                                    {continueWatching.slice(0, 12).map(movie => (
                                        <Cards key={movie.id} movie={movie} />
                                    ))}
                                </div>
                                <button className="scroll-btn scroll-btn-right" onClick={() => {
                                    if (continueWatchingRef.current) {
                                        continueWatchingRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                                    }
                                }}>
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Trending Now */}
                    {createSectionScrollComponent("Trending Now", trendingMovies, "/trending", trendingMoviesRef)}

                    {/* Popular on Netflix */}
                    {createSectionScrollComponent("Popular on Netflix", popularMovies, "/movies/popular", popularMoviesRef)}

                    {/* Top Rated */}
                    {createSectionScrollComponent("Top Rated", topRatedMovies, "/movies/top_rated", topRatedMoviesRef)}

                    {/* Action Thrillers */}
                    {createSectionScrollComponent("Action Thrillers", actionThrillers, "/movies?action=28", actionThrillersRef)}

                    {/* Comedy Movies */}
                    {createSectionScrollComponent("Comedy Movies", comedyMovies, "/movies?genre=35", comedyMoviesRef)}

                    {/* Drama */}
                    {createSectionScrollComponent("Drama", dramaMovies, "/movies?genre=18", dramaMoviesRef)}

                    {/* Horror */}
                    {createSectionScrollComponent("Horror", horrorMovies, "/movies?genre=27", horrorMoviesRef)}

                    {/* Sci-Fi */}
                    {createSectionScrollComponent("Sci-Fi", scifiMovies, "/movies?genre=878", scifiMoviesRef)}
                </>
            )}

            {/* TV Shows Section */}
            {!loading && !error && (
                <>
                    {/* Trending TV Shows */}
                    {createSectionScrollComponent("Trending TV Shows", trendingTV.map(tv => ({...tv, media_type: 'tv'})), "/trending", trendingTVRef)}

                    {/* Popular TV Shows */}
                    {createSectionScrollComponent("Popular TV Shows", popularTV.map(tv => ({...tv, media_type: 'tv'})), "/tv-shows/popular", popularTVRef)}

                    {/* Top Rated TV Shows */}
                    {createSectionScrollComponent("Top Rated TV Shows", topRatedTV.map(tv => ({...tv, media_type: 'tv'})), "/tv-shows/top_rated", topRatedTVRef)}

                    {/* Action & Adventure TV Shows */}
                    {createSectionScrollComponent("Action & Adventure TV Shows", actionAdventureTV.map(tv => ({...tv, media_type: 'tv'})), "/tv-shows?action=10759", actionAdventureTVRef)}

                    {/* Comedy TV Shows */}
                    {createSectionScrollComponent("Comedy TV Shows", comedyTV.map(tv => ({...tv, media_type: 'tv'})), "/tv-shows?genre=35", comedyTVRef)}

                    {/* Drama TV Shows */}
                    {createSectionScrollComponent("Drama TV Shows", dramaTV.map(tv => ({...tv, media_type: 'tv'})), "/tv-shows?genre=18", dramaTVRef)}
                </>
            )}
        </>
    )
}

export default Home
