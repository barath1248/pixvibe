import React, { useState, useEffect } from 'react';
import '../styles/Music.css'; // Importing external CSS file for styling

const Music = () => {
  const [tracks, setTracks] = useState([]); // Ensure tracks is initialized as an array
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch trending music tracks when the component mounts
  useEffect(() => {
    const fetchTrendingMusic = async () => {
      try {
        const res = await fetch('/api/music/trending');
        const data = await res.json();
        // Now access the 'data' field properly
        if (Array.isArray(data.data)) {
          setTracks(data.data); // Access the array of tracks within 'data'
        } else {
          console.error("Received data.data is not an array:", data.data);
        }
      } catch (err) {
        console.error('Error fetching music:', err);
      }
    };

    fetchTrendingMusic();
  }, []);

  // Handle playing a track
  const handlePlay = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  // Handle pausing the track
  const handlePause = () => {
    setIsPlaying(false);
  };

  return (
    <div className="music-container">
      <h1 className="heading">Trending Music</h1>

      <div className="tracks-list">
        {tracks && tracks.length > 0 ? (
          tracks.map((track) => (
            <div key={track.id} className="track-item">
              <img
                src={track.artwork_url || 'https://via.placeholder.com/200'}
                alt={track.title}
                className="track-image"
              />
              <div className="track-info">
                <h3>{track.title}</h3>
                <p>{track.artist}</p>
                <button onClick={() => handlePlay(track)} className="play-button">
                  Play
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No trending tracks available.</p>
        )}
      </div>

      {currentTrack && (
        <div className="music-player">
          <h2>Now Playing: {currentTrack.title} by {currentTrack.artist}</h2>

          {/* Ensure stream_url is full */}
          <audio controls autoPlay={isPlaying}>
            <source
              src={`https://stream.audius.co${currentTrack.stream_url}`} // Full stream URL
              type="audio/mpeg"
            />
            Your browser does not support the audio element.
          </audio>

          <button onClick={handlePause} className="pause-button">
            Pause
          </button>
        </div>
      )}
    </div>
  );
};

export default Music;
