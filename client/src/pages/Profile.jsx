import React, { useEffect, useState } from 'react';
import '../styles/Profile.css';

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

  const fetchProfile = async (uname) => {
    try {
      const response = await fetch(`http://localhost:5000/api/profile/${uname}`);
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
      const formData = new FormData();
      formData.append('username', username);
      formData.append('bio', bio);
      if (file) formData.append('profile_picture', file);

      const response = await fetch('http://localhost:5000/api/profile', {
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
    </div>
  );
};

export default Profile;
