import React, { useState, memo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchMulti, formatRating } from "../../utils/api";
import "./searchBar.css";

const SearchBar = memo(({ forceExpanded = false, transparent = false, hideToggle = false, onClose }) => {
    const [query, setQuery] = useState("");
    const [isExpanded, setIsExpanded] = useState(forceExpanded);
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();
    const autoCloseTimerRef = useRef(null);
    const inputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setQuery("");
            setSuggestions([]);
            setIsExpanded(false);
        }
    };

    const handleSuggestionClick = (item) => {
        const isTV = item.media_type === 'tv';
        navigate(`${isTV ? '/tv' : '/movie'}/${item.id}`);
        setQuery('');
        setSuggestions([]);
        setIsExpanded(false);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        // Clear auto-close timer when user types
        if (autoCloseTimerRef.current) {
            clearTimeout(autoCloseTimerRef.current);
        }

        // Set auto-close timer if input is empty
        if (!value.trim() && isExpanded) {
            autoCloseTimerRef.current = setTimeout(() => {
                setIsExpanded(false);
            }, 3000); // Close after 3 seconds of no input
        }
    };

    const toggleSearch = () => {
        if (onClose) {
            onClose();
        } else {
            setIsExpanded(!isExpanded);
            if (isExpanded) {
                setQuery("");
                setSuggestions([]);
                if (autoCloseTimerRef.current) {
                    clearTimeout(autoCloseTimerRef.current);
                }
            }
        }
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (autoCloseTimerRef.current) {
                clearTimeout(autoCloseTimerRef.current);
            }
        };
    }, []);

    // Fetch suggestions when query changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.trim().length > 2) {
                try {
                    const data = await searchMulti(query, 1);
                    setSuggestions(data.results.slice(0, 5));
                } catch (error) {
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
            }
        };

        fetchSuggestions();
    }, [query]);

    // Focus input when expanded
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    return (
        <div className="search-container">
            <form onSubmit={handleSubmit} className={`search-form ${isExpanded ? 'expanded' : ''}`}>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search movies and TV shows..."
                    className={`search-input ${isExpanded ? 'expanded' : ''} ${transparent ? 'transparent' : ''}`}
                    aria-label="Search movies and TV shows"
                />
                {!hideToggle && (
                    <button
                        type="button"
                        className="search-toggle"
                        onClick={toggleSearch}
                        aria-label="Toggle search"
                    >
                        <i className={`fas ${isExpanded ? 'fa-times' : 'fa-search'}`} />
                    </button>
                )}
            </form>
            {suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                    {suggestions.map(item => {
                        const isTV = item.media_type === 'tv';
                        const title = item.title || item.name || '';
                        return (
                            <div
                                key={item.id}
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(item)}
                            >
                                {item.poster_path && (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                        alt={title}
                                        className="suggestion-poster"
                                    />
                                )}
                                <div className="suggestion-info">
                                    <div className="suggestion-title">{title}</div>
                                    <div className="suggestion-details">
                                        {isTV ? 'TV Series' : 'Movie'} • {(item.release_date || item.first_air_date || '').slice(0, 4)} • ★ {formatRating(item.vote_average) || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
});

export default SearchBar;
