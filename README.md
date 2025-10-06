# Movie Streaming Platform

A modern React-based movie and TV show streaming platform that provides comprehensive entertainment information using The Movie Database (TMDB) API.

## 🚀 Features

- 🎬 Browse movies and TV shows by categories (popular, trending, etc.)
- 📱 Responsive design optimized for all devices
- 🔍 Advanced search functionality for movies and TV shows
- 🎭 Detailed information pages for movies, TV shows, and people
- 🎨 Movie collections and series information
- ⚡ Fast loading with lazy component loading
- 🖼️ High-quality images and posters from TMDB
- ⭐ User ratings and reviews
- 🎥 Trailer playback integration

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **Routing**: React Router v6
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **API Integration**: TMDB (The Movie Database) API
- **Build Tool**: Vite
- **Icons**: Custom SVG and Font Awesome
- **Deployment**: Ready for GitHub Pages or modern hosting platforms

## 📁 Project Structure

```
src/
├── components/
│   ├── ErrorBoundary.jsx          # Error boundary component
│   ├── Logo.jsx                   # App logo component
│   ├── card/                      # Movie/TV card components
│   ├── header/                    # Navigation header
│   ├── movieList/                 # Movie listing component
│   ├── searchBar/                 # Search functionality
│   └── tvList/                    # TV show listing component
├── pages/
│   ├── browse/                    # Browse page (movies savu, TV, trending)
│   ├── collectionDetail/          # Individual collection details
│   ├── collections/              # Collections listing page
│   ├── home/                      # Homepage
│   ├── movieDetail/               # Movie/TV detail page
│   ├── personDetail/              # Actor/Person details
│   └── searchResults/             # Search results page
└── utils/
    └── api.jsx                    # TMDB API integration
```

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js (v14 or更高)
- npm or yarn
- TMDB API Key (get one at [TMDB](https://www.themoviedb.org/settings/api))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/movie-streaming-platform.git
cd movie-streaming-platform
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) to view the app.

### Build for Production

```bash
npm run build
```

## 📱 Available Scripts

### `npm run dev`
Starts the development server with hot reloading.

### `npm run build`
Builds the app for production to the `dist` folder. The build is minified and optimized for best performance.

### `npm run preview`
Previews the production build locally before deployment.

## 🌐 Pages and Routes

- `/` - Homepage with featured content
- `/movies` - Browse movies by categories
- `/tv-shows` - Browse TV shows
- `/trending` - Trending movies and shows
- `/movie/:id` - Individual movie details
- `/tv/:id` - Individual TV show details
- `/person/:id` - Person/actor details
- `/collections` - Browse movie collections
- `/collection/:id` - Collection details
- `/search` - Search results page

## 🎨 Customization

### TMDB API Configuration
Update your TMDB API key in `src/utils/api.jsx`:

```javascript
const API_KEY = 'your-tmdb-api-key-here';
```

### Styling
Modify styles in component-specific CSS files. The app uses:
- CSS Grid for layouts
- Flexbox for component alignment
- CSS Variables for consistent theming
- Media queries for responsiveness

## 🚀 Deployment

### GitHub Pages
The project is configured for GitHub Pages deployment:

1. Update the `base` path in `vite.config.js` if deploying to a repository subdirectory
2. Run the build command
3. Deploy the `dist` folder contents

### Other Hosting Platforms
Upload the contents of the `dist` folder to any static hosting service like Vercel, Netlify, or traditional web hosting.

## 📝 API Usage

This app uses The Movie Database (TMDB) API. Make sure to:
- Register for a free account at TMDB
- Get your API key from the settings page
- Respect TMDB's API usage policies
- Attribute TMDB appropriately in your app

Built with ❤️ using React, Vite, and TMDB API
