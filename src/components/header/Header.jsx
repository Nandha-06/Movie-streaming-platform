import { memo, useState, useEffect } from "react"
import "./Header.css"
import { Link } from "react-router-dom"
import SearchBar from "../searchBar/searchBar"
import Logo from "../Logo"
import { useAuth } from "../../context/AuthContext"

const Header = memo(() => {
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 900);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <>
        <div className="header">
            <div className="headerLeft">
                <Link to="/" aria-label="Home" className="logo-link">
                    <div className="logo">
                        <Logo width={140} height={50} />
                    </div>
                </Link>
                <nav className="nav-links">
                    <Link to="/" className="nav-link" aria-label="Home">
                        Home
                    </Link>
                    <Link to="/movies" className="nav-link" aria-label="Movies">
                        Movies
                    </Link>
                    <Link to="/tv-shows" className="nav-link" aria-label="TV Shows">
                        TV Shows
                    </Link>
                    <Link to="/collections" className="nav-link" aria-label="Collections">
                        Collections
                    </Link>
                </nav>
            </div>
            <div className="headerRight">
                {!isMobile && <SearchBar />}
                <div className="header-icons">
                    <button className="notification-btn" aria-label="Notifications">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                    </button>
                    {user ? (
                        <Link to="/profile" className="profile-btn" aria-label="Profile">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="profile-avatar-small" />
                            ) : (
                                <div className="profile-avatar-small">
                                    {user.email?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </Link>
                    ) : (
                        <Link to="/signin" className="signup-btn" aria-label="Sign In">
                            Sign in →
                        </Link>
                    )}
                </div>
            </div>
        </div>
        {/* Mobile Bottom Navigation */}
        {isMobile && (
            <>
                <div className="mobile-bottom-nav">
                    <Link to="/" className="mobile-nav-btn" aria-label="Home">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9,22 9,12 15,12 15,22"/>
                        </svg>
                        <span>Home</span>
                    </Link>
                    <button className="mobile-nav-btn" onClick={() => setShowSearchModal(true)} aria-label="Search">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                        <span>Search</span>
                    </button>
                    <button className="mobile-nav-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <line x1="3" y1="18" x2="21" y2="18"/>
                        </svg>
                        <span>Menu</span>
                    </button>
                </div>
                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="mobile-menu">
                        <Link to="/movies" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
                            Movies
                        </Link>
                        <Link to="/tv-shows" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
                            TV Shows
                        </Link>
                        <Link to="/collections" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>
                            Collections
                        </Link>
                    </div>
                )}
                {/* Mobile Search Modal */}
                {showSearchModal && (
                    <div className="mobile-search-modal" onClick={() => setShowSearchModal(false)}>
                        <div className="mobile-search-content" onClick={(e) => e.stopPropagation()}>
                            <SearchBar forceExpanded={true} transparent={true} onClose={() => setShowSearchModal(false)} />
                        </div>
                    </div>
                )}
            </>
        )}
        </>
    )
})

export default Header

