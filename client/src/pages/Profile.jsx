import React, { useEffect, useState } from 'react';
import '../styles/profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState('');

  // Fetch profile on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (!token || !storedUsername) {
      setError('You must be logged in.');
      setLoading(false);
      return;
    }

    setUsername(storedUsername);
    fetchProfile(storedUsername);
  }, []);

  // Fetch user posts after profile is loaded
  useEffect(() => {
    if (profile && profile.username) {
      fetchUserPosts();
    }
    // eslint-disable-next-line
  }, [profile]);

  const fetchProfile = async (uname) => {
    try {
      const BASE_URL = 'https://pixvibe.onrender.com';
      const response = await fetch(`${BASE_URL}/api/profile/${uname}`);
      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      if (response.status === 404 || !data.bio) {
        setProfile({ username: uname, bio: '', profile_picture: null });
        setBio('');
        setPreviewImage('');
      } else {
        setProfile(data);
        setBio(data.bio || '');
        setPreviewImage(
          data.profile_picture
            ? `http://localhost:5000/uploads/${data.profile_picture}?t=${Date.now()}`
            : ''
        );
      }
    } catch (err) {
      console.error(err);
      setError('Could not load profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    setPostsLoading(true);
    setPostsError('');
    try {
      const token = localStorage.getItem('token');
      // Get user id from token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      const BASE_URL = 'https://pixvibe.onrender.com';
      const res = await fetch(`${BASE_URL}/api/posts/user/${userId}`);
      const data = await res.json();
      setUserPosts(data);
    } catch (err) {
      setPostsError('Failed to load your posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewImage(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const BASE_URL = 'https://pixvibe.onrender.com';
      const formData = new FormData();
      formData.append('username', username);
      formData.append('bio', bio);
      if (file) formData.append('profile_picture', file);

      const response = await fetch(`${BASE_URL}/api/profile`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save profile');
      }

      const updated = result.profile;
      setProfile(updated);
      setBio(updated.bio || '');
      setPreviewImage(
        updated.profile_picture
          ? `http://localhost:5000/uploads/${updated.profile_picture}?t=${Date.now()}`
          : ''
      );
      setFile(null);
      setIsEditing(false);
      setSuccess('Profile saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      {/* Profile card always at the top */}
      <div className="profile-card">
        <div className="profile-header">
          <h2>My Profile</h2>
          {!isEditing ? (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              <i className="fas fa-edit"></i> Edit
            </button>
          ) : (
            <button
              className="cancel-btn"
              onClick={() => {
                setIsEditing(false);
                setBio(profile?.bio || '');
                setFile(null);
                setPreviewImage(
                  profile?.profile_picture
                    ? `http://localhost:5000/uploads/${profile.profile_picture}?t=${Date.now()}`
                    : ''
                );
              }}
            >
              <i className="fas fa-times"></i> Cancel
            </button>
          )}
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="profile-content">
            <div className="profile-picture-container">
              <div className="profile-picture-wrapper">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="profile-picture"
                    onError={(e) => (e.target.src = '/default-profile.png')}
                  />
                ) : (
                  <div className="profile-picture-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
                {isEditing && (
                  <label className="upload-label">
                    <i className="fas fa-camera"></i>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="profile-info">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      value={username}
                      className="form-input"
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      maxLength="150"
                      className="form-textarea"
                    />
                    <div className="char-count">{bio.length}/150</div>
                  </div>

                  <button type="submit" className="save-btn" disabled={loading}>
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i> Save Changes
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="profile-view">
                  <h3 className="username">{username}</h3>
                  <p className="bio">{bio || 'No bio yet'}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Spacer for clarity */}
      <div style={{ height: 32 }} />

      {/* Posts section always at the bottom, full width */}
      <div className="profile-posts-section">
        <h3 style={{marginBottom: 18, fontWeight: 700, fontSize: '1.2rem'}}>My Posts</h3>
        {postsLoading ? (
          <p>Loading your posts...</p>
        ) : postsError ? (
          <p style={{ color: 'red' }}>{postsError}</p>
        ) : userPosts.length === 0 ? (
          <p>You haven't posted anything yet.</p>
        ) : (
          <div className="posts-list">
            {userPosts.map(post => (
              <div key={post.id} className="post-item">
                <div className="post-header">
                  <img
                    src={post.profile_picture || '/default-avatar.png'}
                    alt={post.username}
                    className="post-avatar"
                    width={32}
                    height={32}
                    style={{ borderRadius: '50%', marginRight: 8 }}
                  />
                  <strong>{post.username}</strong>
                  <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>
                    {new Date(post.created_at).toLocaleString()}
                  </span>
                </div>
                {post.content && <div className="post-content">{post.content}</div>}
                {post.image_url && (
                  <div className="post-image">
                    <img src={post.image_url.startsWith('http') ? post.image_url : `http://localhost:5000/uploads/${post.image_url}`} alt="Post" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
