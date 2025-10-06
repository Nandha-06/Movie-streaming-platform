import React, { useEffect, useState } from "react"
import "./person.css"
import { useParams, Link } from "react-router-dom"
import { fetchPersonDetails, fetchPersonCredits } from "../../utils/api"

const Person = () => {
    const [personDetail, setPersonDetail] = useState(null)
    const [credits, setCredits] = useState({ cast: [], crew: [] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showCount, setShowCount] = useState(12)
    const { id } = useParams()

    useEffect(() => {
        const loadPersonDetails = async () => {
            try {
                setLoading(true)
                setError(null)
                const [details, creditsData] = await Promise.all([
                    fetchPersonDetails(id),
                    fetchPersonCredits(id)
                ])
                setPersonDetail(details)
                setCredits(creditsData)
                window.scrollTo(0, 0)
            } catch (err) {
                setError("Failed to load person details")
                console.error("Error loading person details:", err)
            } finally {
                setLoading(false)
            }
        }

        loadPersonDetails()
    }, [id])

    if (error) {
        return (
            <div className="person-error">
                <h2>{error}</h2>
            </div>
        )
    }

    if (loading || !personDetail) {
        return (
            <div className="person-loading">
                <div className="loading-spinner">Loading...</div>
            </div>
        )
    }

    const allKnownFor = [...(credits.cast || []), ...(credits.crew || [])]
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    
    const knownFor = allKnownFor.slice(0, showCount)
    const hasMore = allKnownFor.length > showCount

    return (
        <div className="person-page">
            <div className="person-content">
                <div className="person-sidebar">
                    <img 
                        src={personDetail.profile_path 
                            ? `https://image.tmdb.org/t/p/w500${personDetail.profile_path}` 
                            : 'https://via.placeholder.com/500x750?text=No+Image'
                        }
                        alt={personDetail.name}
                        className="person-image"
                    />
                    <div className="person-info">
                        <h3>Personal Info</h3>
                        <div className="info-item">
                            <strong>Known For</strong>
                            <p>{personDetail.known_for_department}</p>
                        </div>
                        <div className="info-item">
                            <strong>Birthday</strong>
                            <p>{personDetail.birthday || 'N/A'}</p>
                        </div>
                        <div className="info-item">
                            <strong>Place of Birth</strong>
                            <p>{personDetail.place_of_birth || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="person-main">
                    <h1>{personDetail.name}</h1>
                    
                    <div className="person-biography">
                        <h2>Biography</h2>
                        <p>{personDetail.biography || 'No biography available.'}</p>
                    </div>

                    <div className="person-known-for">
                        <h2>Known For</h2>
                        <div className="known-for-grid">
                            {knownFor.map(item => {
                                const isTV = item.media_type === 'tv'
                                return (
                                    <Link 
                                        key={`${item.id}-${item.credit_id}`}
                                        to={`/${isTV ? 'tv' : 'movie'}/${item.id}`}
                                        className="known-for-item"
                                    >
                                        <img 
                                            src={item.poster_path 
                                                ? `https://image.tmdb.org/t/p/w300${item.poster_path}` 
                                                : 'https://via.placeholder.com/300x450?text=No+Image'
                                            }
                                            alt={item.title || item.name}
                                        />
                                        <p className="known-for-title">{item.title || item.name}</p>
                                        <p className="known-for-role">
                                            {item.character || item.job || ''}
                                        </p>
                                    </Link>
                                )
                            })}
                        </div>
                        {hasMore && (
                            <button 
                                className="see-more-btn"
                                onClick={() => setShowCount(prev => prev + 12)}
                            >
                                See More
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Person
