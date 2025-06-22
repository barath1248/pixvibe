import React, { useEffect, useState } from 'react';
import '../styles/Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState('');
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        
        if (!storedUsername) {
          throw new Error('Username not found in storage');
        }

        const response = await fetch(`http://localhost:5000/api/profile/${storedUsername}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 404) {
          // Initialize empty profile for new users
          setProfile({ username: storedUsername, bio: '', profile_picture: null });
          setUsername(storedUsername);
          setBio('');
          setPreviewImage('');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
        setUsername(data.username || storedUsername);
        setBio(data.bio || '');
        setPreviewImage(data.profile_picture 
          ? `http://localhost:5000/uploads/${data.profile_picture}?t=${new Date().getTime()}`
          : '');

      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only JPEG, PNG, or GIF images are allowed');
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      setError('File size should be less than 2MB');
      return;
    }

    setError('');
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('bio', bio);
    if (file) formData.append('profile_picture', file);

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Profile update failed');
      }

      const result = await response.json();
      
      // Update all state and localStorage
      setProfile(result.profile || result);
      const updatedUsername = result.profile?.username || result.username || username;
      setUsername(updatedUsername);
      localStorage.setItem('username', updatedUsername);
      
      setBio(result.profile?.bio || result.bio || '');
      
      if (result.profile?.profile_picture || result.profile_picture) {
        const imageName = result.profile?.profile_picture || result.profile_picture;
        setPreviewImage(`http://localhost:5000/uploads/${imageName}?t=${new Date().getTime()}`);
      }
      
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Profile</h2>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        ) : (
          <button onClick={() => {
            setIsEditing(false);
            if (profile) {
              setUsername(profile.username || '');
              setBio(profile.bio || '');
              setPreviewImage(profile.profile_picture 
                ? `http://localhost:5000/uploads/${profile.profile_picture}`
                : '');
            }
          }}>Cancel</button>
        )}
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="profile-content">
        <div className="profile-picture">
          {previewImage ? (
            <img 
              src={previewImage} 
              alt="Profile" 
              onError={(e) => e.target.src = '/default-profile.png'}
            />
          ) : (
            <div className="placeholder">No Image</div>
          )}
        </div>

        <div className="profile-info">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div>
                <label>Username:</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Bio:</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell about yourself..."
                  maxLength="150"
                />
                <small>{bio.length}/150</small>
              </div>

              <div>
                <label>Profile Picture:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <small>Max 2MB (JPEG, PNG, GIF)</small>
              </div>

              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="profile-view">
              <h3>{username || 'No username'}</h3>
              <p>{bio || 'No bio yet'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;