import React, {useEffect, useState, useCallback} from "react"
import "./movie.css"
import { useParams, useLocation } from "react-router-dom"
import { fetchMovieDetails, fetchTVDetails, formatRating } from "../../utils/api"

const Movie = () => {
    const location = useLocation()
    const isTV = location.pathname.includes('/tv/')

    const [currentMovieDetail, setMovie] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { id } = useParams()

    const loadMovieDetails = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = isTV ? await fetchTVDetails(id) : await fetchMovieDetails(id)
            setMovie(data)
            window.scrollTo(0,0)
        } catch (err) {
            setError(`Failed to load ${isTV ? 'TV show' : 'movie'} details`)
            console.error(`Error loading ${isTV ? 'TV show' : 'movie'} details:`, err)
        } finally {
            setLoading(false)
        }
    }, [id, isTV])

    useEffect(() => {
        loadMovieDetails()
    }, [loadMovieDetails])

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
                <div className="loading-spinner">Loading movie details...</div>
            </div>
        )
    }

    return (
        <div className="movie">
            <div className="movie__intro">
                <img className="movie__backdrop" src={`https://image.tmdb.org/t/p/original${currentMovieDetail.backdrop_path || ""}`} alt={(currentMovieDetail.title || currentMovieDetail.name || currentMovieDetail.original_title) || ''} />
            </div>
            <div className="movie__detail">
                <div className="movie__detailLeft">
                    <div className="movie__posterBox">
                        <img className="movie__poster" src={`https://image.tmdb.org/t/p/original${currentMovieDetail.poster_path || ""}`} alt={(currentMovieDetail.title || currentMovieDetail.name || currentMovieDetail.original_title) || ''} />
                    </div>
                </div>
                <div className="movie__detailRight">
                    <div className="movie__detailRightTop">
                        <div className="movie__name">{(currentMovieDetail.title || currentMovieDetail.name || currentMovieDetail.original_title) || ""}</div>
                        <div className="movie__tagline">{currentMovieDetail.tagline || ""}</div>
                        <div className="movie__rating">
                            {formatRating(currentMovieDetail.vote_average)} <i className="fas fa-star" />
                            <span className="movie__voteCount">({currentMovieDetail.vote_count || 0} votes)</span>
                        </div>
                        <div className="movie__runtime">{currentMovieDetail.runtime ? currentMovieDetail.runtime + " mins" : (currentMovieDetail.number_of_seasons ? `${currentMovieDetail.number_of_seasons} seasons` : "")}</div>
                        <div className="movie__releaseDate">{(currentMovieDetail.release_date || currentMovieDetail.first_air_date) ? `${isTV ? 'First aired:' : 'Release date:'} ${(currentMovieDetail.release_date || currentMovieDetail.first_air_date)}` : ""}</div>
                        <div className="movie__genres">
                            {currentMovieDetail.genres && currentMovieDetail.genres.length > 0
                                ? currentMovieDetail.genres.map(genre => (
                                    <span key={genre.id} className="movie__genre">{genre.name}</span>
                                ))
                                : null
                            }
                        </div>
                    </div>
                    <div className="movie__detailRightBottom">
                        <div className="synopsisText">Synopsis</div>
                        <div>{currentMovieDetail.overview || ""}</div>
                    </div>

                </div>
            </div>
            <div className="movie__links">
                <div className="movie__heading">Useful Links</div>
                {currentMovieDetail.homepage && (
                    <a href={currentMovieDetail.homepage} target="_blank" rel="noopener noreferrer" style={{textDecoration: "none"}}>
                        <p><span className="movie__homeButton movie__Button">Homepage <i className="newTab fas fa-external-link-alt"></i></span></p>
                    </a>
                )}
                {currentMovieDetail.imdb_id && (
                    <a href={`https://www.imdb.com/title/${currentMovieDetail.imdb_id}`} target="_blank" rel="noopener noreferrer" style={{textDecoration: "none"}}>
                        <p><span className="movie__imdbButton movie__Button">IMDb<i className="newTab fas fa-external-link-alt"></i></span></p>
                    </a>
                )}
            </div>
            <div className="movie__heading">Production companies</div>
            <div className="movie__production">
                {currentMovieDetail.production_companies && currentMovieDetail.production_companies.length > 0
                    ? currentMovieDetail.production_companies.map(company => (
                        company.logo_path && (
                            <span key={company.id} className="productionCompanyImage">
                                <img className="movie__productionComapany" src={`https://image.tmdb.org/t/p/original${company.logo_path}`} alt={company.name} />
                                <span>{company.name}</span>
                            </span>
                        )
                    ))
                    : null
                }
            </div>
        </div>
    )
}

export default Movie
