import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserData, removeFromLiked, removeFromWatchLater } from '../../utils/userActions';
import MovieCard from '../../components/MovieCard/MovieCard';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('likes');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const fetchUserData = async () => {
      try {
        const data = await getUserData(user.uid);
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleRemoveLiked = async (movieId) => {
    try {
      await removeFromLiked(user.uid, movieId);
      setUserData(prev => ({
        ...prev,
        likedMovies: prev.likedMovies.filter(id => id !== movieId)
      }));
    } catch (error) {
      console.error('Error removing liked movie:', error);
    }
  };

  const handleRemoveWatchLater = async (movieId) => {
    try {
      await removeFromWatchLater(user.uid, movieId);
      setUserData(prev => ({
        ...prev,
        watchLater: prev.watchLater.filter(id => id !== movieId)
      }));
    } catch (error) {
      console.error('Error removing from watch later:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} />
            ) : (
              <div className="avatar-placeholder">
                {(userData?.displayName || user?.email)?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-details">
            <h1>{userData?.displayName || user?.displayName || 'User'}</h1>
            <p>{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Sign Out
        </button>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === 'likes' ? 'active' : ''}`}
          onClick={() => setActiveTab('likes')}
        >
          Liked Movies ({userData?.likedMovies?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'watchlater' ? 'active' : ''}`}
          onClick={() => setActiveTab('watchlater')}
        >
          Watch Later ({userData?.watchLater?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'likes' && (
          <div className="content-section">
            <h2>Liked Movies</h2>
            {userData?.likedMovies?.length > 0 ? (
              <div className="movies-grid">
                {userData.likedMovies.map(movieId => (
                  <MovieCard 
                    key={movieId} 
                    movieId={movieId}
                    onRemove={handleRemoveLiked}
                  />
                ))}
              </div>
            ) : (
              <p className="empty-state">No liked movies yet. Start exploring!</p>
            )}
          </div>
        )}

        {activeTab === 'watchlater' && (
          <div className="content-section">
            <h2>Watch Later</h2>
            {userData?.watchLater?.length > 0 ? (
              <div className="movies-grid">
                {userData.watchLater.map(movieId => (
                  <MovieCard 
                    key={movieId} 
                    movieId={movieId}
                    onRemove={handleRemoveWatchLater}
                  />
                ))}
              </div>
            ) : (
              <p className="empty-state">No movies in watch later. Add some!</p>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="content-section">
            <h2>Account Settings</h2>
            <div className="settings-group">
              <div className="setting-item">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              <div className="setting-item">
                <label>Display Name</label>
                <p>{userData?.displayName || 'Not set'}</p>
              </div>
              <div className="setting-item">
                <label>Member Since</label>
                <p>{new Date(userData?.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
