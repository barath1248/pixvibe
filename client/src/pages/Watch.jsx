import React, { useEffect, useState } from 'react';
import { FaSearch, FaPlay, FaEye, FaClock, FaYoutube, FaSpinner, FaFilter } from 'react-icons/fa';
import '../styles/watch.css';

const Watch = () => {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [nextPageToken, setNextPageToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchVideos = async (q = query, pageToken = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `http://localhost:5000/api/watch?q=${encodeURIComponent(q)}&pageToken=${pageToken}`
      );
      const data = await response.json();

      // Check if API quota is exceeded
      if (data.error && data.error.code === 403) {
        setError('YouTube API quota exceeded. Please try again after 24 hours.');
        setLoading(false);
        return;
      }

      if (!data.items || data.items.length === 0) {
        setError('No videos found for your search.');
        setLoading(false);
        return;
      }

      if (pageToken) {
        setVideos((prev) => [...prev, ...data.items]);
      } else {
        setVideos(data.items);
      }

      setNextPageToken(data.nextPageToken || '');
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Something went wrong while fetching videos. Please try again.');
    }
    setLoading(false);
  };

  // Track video view and update dashboard stats
  const trackVideoView = async (videoId, videoTitle) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/watch/track-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          videoId,
          videoTitle,
          watchedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('Video view tracked successfully');
        // Trigger a custom event to notify dashboard to refresh stats
        window.dispatchEvent(new CustomEvent('videoWatched', {
          detail: { videoId, videoTitle }
        }));
      }
    } catch (error) {
      console.error('Error tracking video view:', error);
    }
  };

  useEffect(() => {
    // If no query, show trending videos by default
    if (!query) {
      fetchVideos('trending');
    } else {
      fetchVideos();
    }
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setQuery(search);
      setSelectedVideo(null);
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    // Track the video view when user clicks to watch
    trackVideoView(video.id.videoId, video.snippet.title);
  };

  const formatDuration = (duration) => {
    // YouTube API doesn't provide duration in search results
    // This would need to be implemented with additional API calls
    return 'Unknown';
  };

  const formatViewCount = (viewCount) => {
    if (!viewCount) return 'Unknown views';
    if (viewCount >= 1000000) {
      return `${(viewCount / 1000000).toFixed(1)}M views`;
    } else if (viewCount >= 1000) {
      return `${(viewCount / 1000).toFixed(1)}K views`;
    }
    return `${viewCount} views`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="watch-container">
      {/* Header */}
      <div className="watch-header">
        <div className="watch-title">
          <FaYoutube className="youtube-icon" />
          <h1>Video Hub</h1>
        </div>
        <p className="watch-subtitle">Discover and watch amazing videos from YouTube</p>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for videos, channels, or topics..."
              className="search-input"
            />
          </div>
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : 'Search'}
          </button>
        </form>
        
        <button 
          className="filter-button"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter />
          Filters
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="watch-content">
        {/* Video Grid */}
        {videos.length > 0 && (
          <div className="video-grid">
            {videos.map((video) => (
              <div
                key={video.id.videoId}
                className="video-card"
                onClick={() => handleVideoClick(video)}
              >
                <div className="video-thumbnail">
                  <img
                    src={video.snippet.thumbnails.high.url}
                    alt={video.snippet.title}
                    className="thumbnail-image"
                  />
                  <div className="video-overlay">
                    <FaPlay className="play-icon" />
                  </div>
                  <div className="video-duration">
                    <FaClock />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                </div>
                
                <div className="video-info">
                  <h3 className="video-title">{video.snippet.title}</h3>
                  <p className="video-channel">{video.snippet.channelTitle}</p>
                  <div className="video-meta">
                    <span className="video-views">
                      <FaEye />
                      {formatViewCount(video.statistics?.viewCount)}
                    </span>
                    <span className="video-date">
                      {formatDate(video.snippet.publishedAt)}
                    </span>
                  </div>
                  <p className="video-description">
                    {video.snippet.description.substring(0, 100)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Video Modal */}
        {selectedVideo && (
          <div className="video-modal" onClick={() => setSelectedVideo(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedVideo.snippet.title}</h2>
                <button 
                  className="close-button"
                  onClick={() => setSelectedVideo(null)}
                >
                  ×
                </button>
              </div>
              <div className="modal-video">
                <iframe
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${selectedVideo.id.videoId}`}
                  title={selectedVideo.snippet.title}
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
              <div className="modal-info">
                <h3>{selectedVideo.snippet.channelTitle}</h3>
                <p>{selectedVideo.snippet.description}</p>
                <div className="modal-meta">
                  <span>Published: {formatDate(selectedVideo.snippet.publishedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {nextPageToken && !error && !loading && (
          <div className="load-more-section">
            <button
              onClick={() => fetchVideos(query, nextPageToken)}
              className="load-more-button"
            >
              Load More Videos
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-section">
            <FaSpinner className="loading-spinner" />
            <p>Searching for videos...</p>
          </div>
        )}

        {/* Empty State - Only show if a search was made */}
        {!loading && !error && videos.length === 0 && query && (
          <div className="empty-state">
            <FaYoutube className="empty-icon" />
            <h3>No videos found</h3>
            <p>Try adjusting your search terms or browse trending videos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watch;
