import React, { useState } from "react"
import "../../pages/browse/Browse.css"

const years = ["All", "2025", "2024", "2023", "2022", "2021", "2020", "Older"]
const types = ["All", "Movies", "TV shows"]

export function FiltersBar({ onFilterChange, onClearFilters, activeFilters = {} }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeFilter, setActiveFilter] = useState('')
  const [tempFilterValue, setTempFilterValue] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

   const handleFilterClick = (filterType, event) => {
     const rect = event.target.getBoundingClientRect()
     const windowWidth = window.innerWidth
     const dropdownWidth = 320 // maxWidth from CSS
     let left = rect.left + window.scrollX

     // Adjust left position if dropdown would go off-screen
     if (left + dropdownWidth > windowWidth) {
       left = windowWidth - dropdownWidth - 20 // 20px margin from right edge
     }
     if (left < 10) {
       left = 10 // 10px margin from left edge
     }

     setActiveFilter(filterType)
     setTempFilterValue('')
     setDropdownPosition({
       top: rect.bottom + window.scrollY + 5,
       left: left,
       width: rect.width
     })
     setShowDropdown(true)
   }

  const handleCloseDropdown = () => {
    setShowDropdown(false)
  }

  const handleOptionClick = (value) => {
    setTempFilterValue(value)
  }

  const handleApplyFilter = () => {
    if (tempFilterValue && onFilterChange) {
      onFilterChange({ [activeFilter]: tempFilterValue });
    }
    setShowDropdown(false);
  }

  const getFilterOptions = (filterType) => {
    switch(filterType) {
      case 'type':
        return types
      case 'genre':
        return [
          'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi'
        ]
      case 'country':
        return [
          'United States', 'United Kingdom', 'France', 'India', 'Germany', 'Italy',
          'Spain', 'Canada', 'Australia', 'Japan', 'South Korea', 'China', 'Brazil',
          'Mexico', 'Argentina', 'Russia', 'Thailand', 'Turkey', 'Poland', 'Romania',
          'Netherlands', 'Belgium', 'Austria', 'Denmark', 'Norway', 'Sweden', 'South Africa'
        ]
      case 'released':
        return years
      case 'imdb':
        return ['9+ Stars', '8+ Stars', '7+ Stars', '6+ Stars', '5+ Stars']
      case 'quality':
        return ['All', 'HD', '4K', 'SD']
      case 'newest':
        return ['Newest First', 'Oldest First', 'Highest Rated', 'Most Popular', 'Alphabetical']
      default:
        return []
    }
  }

  const FilterDropdown = () => (
    showDropdown && (
      <div
        className="filter-dropdown-overlay"
        onClick={handleCloseDropdown}
      >
        <div
          className="filter-dropdown"
          style={{
            position: 'absolute',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            minWidth: '300px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="filter-dropdown-options">
            {getFilterOptions(activeFilter).map((option) => (
              <button
                key={option}
                className={`filter-option ${tempFilterValue === option ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="filter-dropdown-actions">
            <button
              className="apply-btn"
              onClick={handleApplyFilter}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    )
  )

  return (
    <>
      <div className="filters-bar">
        <div className="filters-horizontal">
          <button
            className="filter-button"
            onClick={(e) => handleFilterClick('type', e)}
            type="button"
          >
            <span className="filter-text">Type</span>
            {activeFilters.type && activeFilters.type !== 'All' && (
              <span className="filter-badge">{activeFilters.type}</span>
            )}
            <span className="hamburger-icon">
              <span className="hamburger-line line-1"></span>
              <span className="hamburger-line line-2"></span>
              <span className="hamburger-line line-3"></span>
            </span>
          </button>

          <button
            className="filter-button"
            onClick={(e) => handleFilterClick('genre', e)}
            type="button"
          >
            <span className="filter-text">Genre</span>
            {activeFilters.genre && activeFilters.genre !== 'All' && (
              <span className="filter-badge">{activeFilters.genre}</span>
            )}
            <span className="hamburger-icon">
              <span className="hamburger-line line-1"></span>
              <span className="hamburger-line line-2"></span>
              <span className="hamburger-line line-3"></span>
            </span>
          </button>

          <button
            className="filter-button"
            onClick={(e) => handleFilterClick('country', e)}
            type="button"
          >
            <span className="filter-text">Country</span>
            {activeFilters.country && activeFilters.country !== 'All' && (
              <span className="filter-badge">{activeFilters.country}</span>
            )}
            <span className="hamburger-icon">
              <span className="hamburger-line line-1"></span>
              <span className="hamburger-line line-2"></span>
              <span className="hamburger-line line-3"></span>
            </span>
          </button>

           <button
             className="filter-button"
             onClick={(e) => handleFilterClick('released', e)}
             type="button"
           >
             <span className="filter-text">Released</span>
             {activeFilters.released && activeFilters.released !== 'All' && (
               <span className="filter-badge">{activeFilters.released}</span>
             )}
             <span className="hamburger-icon">
               <span className="hamburger-line line-1"></span>
               <span className="hamburger-line line-2"></span>
               <span className="hamburger-line line-3"></span>
             </span>
           </button>

            <button
              className="filter-button"
              onClick={(e) => handleFilterClick('imdb', e)}
              type="button"
            >
              <span className="filter-text">IMDb</span>
              {activeFilters.imdb && activeFilters.imdb !== 'All' && (
                <span className="filter-badge">{activeFilters.imdb}</span>
              )}
              <span className="hamburger-icon">
                <span className="hamburger-line line-1"></span>
                <span className="hamburger-line line-2"></span>
                <span className="hamburger-line line-3"></span>
              </span>
            </button>

            <div className="filter-separator">|</div>

            <button
              className="filter-button"
              onClick={(e) => handleFilterClick('newest', e)}
              type="button"
            >
              <span className="filter-text">Newest</span>
              {activeFilters.newest && activeFilters.newest !== 'Newest First' && (
                <span className="filter-badge">{activeFilters.newest}</span>
              )}
              <span className="hamburger-icon">
                <span className="hamburger-line line-1"></span>
                <span className="hamburger-line line-2"></span>
                <span className="hamburger-line line-3"></span>
              </span>
            </button>

            {Object.keys(activeFilters).length > 0 && (
              <button
                className="clear-all-btn"
                onClick={() => onClearFilters && onClearFilters()}
                type="button"
              >
                × Clear All
              </button>
            )}
        </div>
      </div>
      <FilterDropdown />
    </>
  )
}
