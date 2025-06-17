import React, { useEffect, useState } from 'react';

const Watch = () => {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [nextPageToken, setNextPageToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        setError('No videos found.');
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
      setError('Something went wrong while fetching videos.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search); // triggers useEffect
  };

  return (
    <div style={{ padding: '20px' }}>
      <form onSubmit={handleSearch} style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search videos..."
          style={{ padding: '10px', width: '300px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{
            marginLeft: '10px',
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
          }}
        >
          Search
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>{error}</div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          justifyItems: 'center',
        }}
      >
        {videos.map((video) => (
          <div
            key={video.id.videoId}
            style={{
              width: '100%',
              maxWidth: '480px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <iframe
              width="100%"
              height="250"
              src={`https://www.youtube.com/embed/${video.id.videoId}`}
              title={video.snippet.title}
              frameBorder="0"
              allowFullScreen
              style={{ borderRadius: '8px 8px 0 0' }}
            ></iframe>
            <div style={{ padding: '10px' }}>
              <p style={{ fontSize: '14px', color: '#333' }}>{video.snippet.title}</p>
            </div>
          </div>
        ))}
      </div>

      {nextPageToken && !error && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => fetchVideos(query, nextPageToken)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28A745',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
            }}
          >
            Load More
          </button>
        </div>
      )}

      {loading && <p style={{ textAlign: 'center', marginTop: '10px' }}>Loading...</p>}
    </div>
  );
};

export default Watch;
