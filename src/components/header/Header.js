import React, { memo } from "react"
import "./Header.css"
import { Link } from "react-router-dom"
import SearchBar from "../searchBar/searchBar"

const Header = memo(() => {
    return (
        <div className="header">
            <div className="headerLeft">
                <Link to="/" aria-label="Home" className="logo-link">
                    <div className="logo">
                        <span className="logo-screen">Screeni</span>
                        <span className="logo-fy">Fy</span>
                    </div>
                </Link>
                <nav className="nav-links">
                    <Link to="/movies" className="nav-link" aria-label="Movies">
                        Movies
                    </Link>
                    <Link to="/tv-shows" className="nav-link" aria-label="TV Shows">
                        TV Shows
                    </Link>
                </nav>
            </div>
            <div className="headerRight">
                <SearchBar />
                <div className="header-icons">
                    <button className="notification-btn" aria-label="Notifications">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                    </button>
                    <Link to="/signup" className="signup-btn" aria-label="Sign Up">
                        Sign up →
                    </Link>
                </div>
            </div>
        </div>
    )
})

export default Header
