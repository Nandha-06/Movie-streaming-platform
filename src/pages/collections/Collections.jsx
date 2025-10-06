import React, { useEffect, useState, useCallback, useRef } from "react"
import "./Collections.css"
import { Link } from "react-router-dom"

const Collections = () => {
    const [collections, setCollections] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [currentBatch, setCurrentBatch] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const observer = useRef()

    // Extended list of popular movie collections IDs from TMDB
    const allCollectionIds = [
        { id: 10, name: "Star Wars Collection" },
        { id: 131295, name: "John Wick Collection" },
        { id: 131292, name: "The Conjuring Collection" },
        { id: 645, name: "James Bond Collection" },
        { id: 2344, name: "The Matrix Collection" },
        { id: 8945, name: "The Lord of the Rings Collection" },
        { id: 121938, name: "The Hobbit Collection" },
        { id: 1570, name: "Die Hard Collection" },
        { id: 9485, name: "The Fast and the Furious Collection" },
        { id: 86311, name: "The Avengers Collection" },
        { id: 131296, name: "X-Men Collection" },
        { id: 263, name: "The Dark Knight Collection" },
        { id: 556, name: "Spider-Man Collection" },
        { id: 87096, name: "Avatar Collection" },
        { id: 528, name: "Terminator Collection" },
        { id: 1241, name: "Harry Potter Collection" },
        { id: 295, name: "Pirates of the Caribbean Collection" },
        { id: 8091, name: "Alien Collection" },
        { id: 2980, name: "Ghostbusters Collection" },
        { id: 535313, name: "Godzilla Collection" },
        { id: 119050, name: "Middle-earth Collection" },
        { id: 230, name: "The Godfather Collection" },
        { id: 1582, name: "Transformers Collection" },
        { id: 87359, name: "Mission: Impossible Collection" },
        { id: 304, name: "Ocean's Collection" },
        { id: 125574, name: "The Expendables Collection" },
        { id: 448150, name: "Deadpool Collection" },
        { id: 131635, name: "Sherlock Holmes Collection" },
        { id: 623, name: "A Nightmare on Elm Street Collection" },
        { id: 1733, name: "The Mummy Collection" },
        { id: 91361, name: "Halloween Collection" },
        { id: 8581, name: "A Nightmare on Elm Street Collection" },
        { id: 91361, name: "Halloween Collection" },
        { id: 656, name: "Saw Collection" },
        { id: 2602, name: "American Pie Collection" },
        { id: 86027, name: "Shrek Collection" },
        { id: 137697, name: "Finding Nemo Collection" },
        { id: 544669, name: "Incredibles Collection" },
        { id: 87118, name: "Monsters, Inc. Collection" },
        { id: 137696, name: "Toy Story Collection" },
        { id: 87096, name: "Avatar Collection" },
        { id: 422834, name: "Jurassic Park Collection" },
        { id: 328, name: "Jurassic Park Collection" },
        { id: 1570, name: "Die Hard Collection" },
        { id: 87359, name: "Mission: Impossible Collection" },
        { id: 131292, name: "The Conjuring Collection" },
        { id: 313086, name: "Conjuring Universe" },
        { id: 87359, name: "Mission: Impossible Collection" }
    ]

    const BATCH_SIZE = 12

    const loadCollectionBatch = async (batchIndex) => {
        try {
            const startIndex = batchIndex * BATCH_SIZE
            const endIndex = startIndex + BATCH_SIZE
            const batchIds = allCollectionIds.slice(startIndex, endIndex)

            if (batchIds.length === 0) {
                setHasMore(false)
                return []
            }

            const API_KEY = '4e44d9029b1270a757cddc766a1bcb63'
            const BASE_URL = 'https://api.themoviedb.org/3'

            // Remove duplicates by id
            const uniqueBatchIds = batchIds.filter((item, index, self) => 
                index === self.findIndex(t => t.id === item.id)
            )

            // Fetch collections in parallel
            const collectionPromises = uniqueBatchIds.map(async ({ id }) => {
                try {
                    const response = await fetch(
                        `${BASE_URL}/collection/${id}?api_key=${API_KEY}&language=en-US`
                    )
                    if (!response.ok) return null
                    return await response.json()
                } catch (err) {
                    console.error(`Error fetching collection ${id}:`, err)
                    return null
                }
            })

            const collectionsData = await Promise.all(collectionPromises)
            const validCollections = collectionsData.filter(c => c !== null)
            
            if (validCollections.length < BATCH_SIZE) {
                setHasMore(false)
            }

            return validCollections
        } catch (err) {
            console.error("Error loading collection batch:", err)
            throw err
        }
    }

    const loadMoreCollections = useCallback(async () => {
        if (loadingMore || !hasMore) return

        try {
            setLoadingMore(true)
            const newCollections = await loadCollectionBatch(currentBatch + 1)
            
            setCollections(prev => {
                // Remove duplicates when adding new collections
                const existingIds = new Set(prev.map(c => c.id))
                const uniqueNewCollections = newCollections.filter(c => !existingIds.has(c.id))
                return [...prev, ...uniqueNewCollections]
            })
            setCurrentBatch(prev => prev + 1)
        } catch (err) {
            setError("Failed to load more collections")
            console.error("Error loading more collections:", err)
        } finally {
            setLoadingMore(false)
        }
    }, [currentBatch, loadingMore, hasMore])

    // Intersection Observer for infinite scroll
    const lastCollectionElementRef = useCallback(node => {
        if (loading) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loadingMore) {
                loadMoreCollections()
            }
        })
        if (node) observer.current.observe(node)
    }, [loading, hasMore, loadingMore, loadMoreCollections])

    useEffect(() => {
        const loadInitialCollections = async () => {
            try {
                setLoading(true)
                setError(null)
                const initialCollections = await loadCollectionBatch(0)
                setCollections(initialCollections)
                setCurrentBatch(0)
            } catch (err) {
                setError("Failed to load collections")
                console.error("Error loading initial collections:", err)
            } finally {
                setLoading(false)
            }
        }

        loadInitialCollections()
    }, [])

    if (error) {
        return (
            <div className="collections-error">
                <h2>{error}</h2>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="collections-loading">
                <div className="loading-spinner">Loading Collections...</div>
            </div>
        )
    }

    return (
        <div className="collections-page">
            <div className="collections-header">
                <h1>Movie Collections</h1>
                <p>Explore iconic movie franchises and series</p>
            </div>

            <div className="collections-grid">
                {collections.map((collection, index) => {
                    const isLast = collections.length === index + 1
                    return (
                        <Link 
                            key={collection.id}
                            to={`/collection/${collection.id}`}
                            className="collection-card"
                            ref={isLast ? lastCollectionElementRef : null}
                        >
                            <div className="collection-card-image">
                                <img 
                                    src={collection.poster_path 
                                        ? `https://image.tmdb.org/t/p/w500${collection.poster_path}` 
                                        : collection.backdrop_path
                                        ? `https://image.tmdb.org/t/p/w500${collection.backdrop_path}`
                                        : 'https://via.placeholder.com/500x750?text=No+Image'
                                    }
                                    alt={collection.name}
                                    loading="lazy"
                                />
                                <div className="collection-card-overlay">
                                    <div className="collection-info">
                                        <h3>{collection.name}</h3>
                                        <p className="collection-count">
                                            {collection.parts?.length || 0} Movies
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Loading more indicator */}
            {loadingMore && (
                <div className="loading-more">
                    <div className="loading-spinner">Loading more collections...</div>
                </div>
            )}

            {/* End of results indicator */}
            {!hasMore && collections.length > 0 && (
                <div className="end-of-results">
                    <p>You've reached the end of our collections!</p>
                </div>
            )}
        </div>
    )
}

export default Collections
