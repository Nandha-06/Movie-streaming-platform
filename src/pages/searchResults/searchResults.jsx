import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import "./searchResults.css";
import Cards from "../../components/card/card";
import { searchMulti } from "../../utils/api";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const performSearch = async () => {
            if (!query.trim()) {
                setSearchResults([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const data = await searchMulti(query);
                setSearchResults(data.results || []);
            } catch (err) {
                setError("Failed to search movies");
                console.error("Error searching movies:", err);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [query]);

    // Memoize search result cards
    const searchResultCards = useMemo(() => {
        return searchResults.map(movie => (
            <Cards key={movie.id} movie={movie} />
        ));
    }, [searchResults]);

    if (loading) {
        return (
            <div className="search-results">
                <div className="search-header">
                    <h2>Searching for "{query}"...</h2>
                </div>
                <div className="search-loading">
                    <div className="loading-spinner">Searching movies...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="search-results">
                <div className="search-header">
                    <h2>Search Results for "{query}"</h2>
                </div>
                <div className="search-error">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="search-results">
            <div className="search-header">
                <h2>
                    {query ? `Search Results for "${query}"` : "Search Movies"}
                    {searchResults.length > 0 && (
                        <span className="result-count">({searchResults.length} results)</span>
                    )}
                </h2>
            </div>

            {query && searchResults.length === 0 ? (
                <div className="no-results">
                    <p>No movies found for "{query}"</p>
                    <p>Try searching with different keywords</p>
                </div>
            ) : (
                <div className="search-results-grid">
                    {searchResultCards}
                </div>
            )}
        </div>
    );
};

export default SearchResults;
