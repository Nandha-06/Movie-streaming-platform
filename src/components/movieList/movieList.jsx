import React, {useEffect, useState, useMemo, useCallback} from "react"
import "./movieList.css"
import { useParams, Link } from "react-router-dom"
import Cards from "../card/card"
import { fetchMultipleMoviePages } from "../../utils/api"

const MovieList = () => {

    const [movieList, setMovieList] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const {type} = useParams()

    const currentType = useMemo(() => type || "popular", [type])

    const loadMovies = useCallback(async (pageCount = 3, reset = true) => {
        try {
            console.log(`Loading ${pageCount} pages for ${currentType}, reset: ${reset}`);
            if (reset) {
                setLoading(true)
            } else {
                setLoadingMore(true)
            }
            setError(null)

            const data = await fetchMultipleMoviePages(currentType, pageCount)
            console.log(`Received ${data.results.length} movies from ${pageCount} pages`);

            if (reset) {
                setMovieList(data.results)
            } else {
                setMovieList(prevList => [...prevList, ...data.results])
            }

            console.log(`Has more pages: ${data.results.length === pageCount * 20}`);
        } catch (err) {
            setError(`Failed to load ${currentType} movies`)
            console.error(`Error loading ${currentType} movies:`, err)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [currentType])


    useEffect(() => {
        loadMovies()
    }, [loadMovies])

    // Memoize movie cards to prevent unnecessary re-renders
    const movieCards = useMemo(() => {
        return movieList.map(movie => (
            <Cards key={movie.id} movie={movie} />
        ))
    }, [movieList])

    if (error) {
    return (
        <div className="movie__list" style={currentType === 'trending' ? { marginTop: '2.5rem' } : undefined}>
                <h2 className="list__title">{currentType.toUpperCase()}</h2>
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={loadMovies}>Retry</button>
                </div>
            </div>
        )
    }

    return (
        <div className="movie__list" style={currentType === 'trending' ? { marginTop: '2.5rem' } : undefined}>
            {currentType !== 'trending' && (
                <Link to={`/movies/${currentType}`} style={{textDecoration: "none", color: "inherit"}}>
                    <h2 className="list__title" style={{textTransform: "capitalize"}}>{currentType.replace('_', ' ')}<span style={{fontSize: "0.8em", cursor: "pointer"}}>›</span></h2>
                </Link>
            )}
            <div className="list__cards">
                {loading ? (
                    // Show loading skeletons
                    Array.from({ length: 20 }).map((_, index) => (
                        <Cards key={`skeleton-${index}`} movie={null} />
                    ))
                ) : (
                    <>
                        {movieCards}
                        {loadingMore && (
                            // Show loading skeletons for additional movies
                            Array.from({ length: 20 }).map((_, index) => (
                                <Cards key={`loading-${index}`} movie={null} />
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default MovieList
