import React, { useEffect, useState } from "react"
import "./collection.css"
import { useParams, Link } from "react-router-dom"
import { fetchCollectionDetails } from "../../utils/api"

const Collection = () => {
    const [collection, setCollection] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { id } = useParams()

    useEffect(() => {
        const loadCollection = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await fetchCollectionDetails(id)
                setCollection(data)
                window.scrollTo(0, 0)
            } catch (err) {
                setError("Failed to load collection")
                console.error("Error loading collection:", err)
            } finally {
                setLoading(false)
            }
        }

        loadCollection()
    }, [id])

    if (error) {
        return (
            <div className="collection-error">
                <h2>{error}</h2>
            </div>
        )
    }

    if (loading || !collection) {
        return (
            <div className="collection-loading">
                <div className="loading-spinner">Loading...</div>
            </div>
        )
    }

    const sortedMovies = [...collection.parts].sort((a, b) => 
        new Date(a.release_date) - new Date(b.release_date)
    )

    return (
        <div className="collection-page">
            <div 
                className="collection-header"
                style={{
                    backgroundImage: collection.backdrop_path 
                        ? `url(https://image.tmdb.org/t/p/original${collection.backdrop_path})`
                        : 'none'
                }}
            >
                <div className="collection-header-overlay">
                    <div className="collection-header-content">
                        <h1>{collection.name}</h1>
                        {collection.overview && (
                            <p className="collection-overview">{collection.overview}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="collection-content">
                <div className="collection-grid">
                    {sortedMovies.map(movie => (
                        <Link 
                            key={movie.id}
                            to={`/movie/${movie.id}`}
                            className="collection-movie-card"
                        >
                            <img 
                                src={movie.poster_path 
                                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                                    : 'https://via.placeholder.com/500x750?text=No+Image'
                                }
                                alt={movie.title}
                            />
                            <div className="collection-movie-info">
                                <h3>{movie.title}</h3>
                                <p className="movie-year">
                                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Collection
