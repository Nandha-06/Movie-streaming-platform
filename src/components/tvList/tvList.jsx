import React, {useEffect, useState, useMemo, useCallback} from "react"
import "./tvList.css"
import { useParams, Link } from "react-router-dom"
import Cards from "../card/card"
import { fetchMultipleTVPages } from "../../utils/api"

const TVList = () => {

    const [tvList, setTVList] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const {type} = useParams()

    const currentType = useMemo(() => type || "popular", [type])

    const loadTVShows = useCallback(async (pageCount = 3, reset = true) => {
        try {
            console.log(`Loading ${pageCount} pages for ${currentType}, reset: ${reset}`)
            if (reset) {
                setLoading(true)
            } else {
                setLoadingMore(true)
            }
            setError(null)

            const data = await fetchMultipleTVPages(currentType, pageCount)
            console.log(`Received ${data.results.length} TV shows from ${pageCount} pages`)

            if (reset) {
                setTVList(data.results)
            } else {
                setTVList(prevList => [...prevList, ...data.results])
            }

            console.log(`Has more pages: ${data.results.length === pageCount * 20}`)
        } catch (err) {
            setError(`Failed to load ${currentType} TV shows`)
            console.error(`Error loading ${currentType} TV shows:`, err)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [currentType])


    useEffect(() => {
        loadTVShows()
    }, [loadTVShows])

    // Memoize TV cards to prevent unnecessary re-renders
    const tvCards = useMemo(() => {
        return tvList.map(tv => (
            <Cards key={tv.id} movie={tv} />
        ))
    }, [tvList])

    if (error) {
    return (
        <div className="movie__list">
                <h2 className="list__title">{currentType.toUpperCase()}</h2>
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={loadTVShows}>Retry</button>
                </div>
            </div>
        )
    }

    return (
        <div className="movie__list">
            <Link to={`/tv-shows/${currentType}`} style={{textDecoration: "none", color: "inherit"}}>
                <h2 className="list__title" style={{textTransform: "capitalize"}}>{currentType.replace('_', ' ')} TV Shows</h2>
            </Link>
            <div className="list__cards">
                {loading ? (
                    // Show loading skeletons
                    Array.from({ length: 20 }).map((_, index) => (
                        <Cards key={`skeleton-${index}`} movie={null} />
                    ))
                ) : (
                    <>
                        {tvCards}
                        {loadingMore && (
                            // Show loading skeletons for additional TV shows
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

export default TVList
