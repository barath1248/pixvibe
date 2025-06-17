import React, { useEffect, useState } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState('');
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState('');

  // Get username from localStorage (you must store it there after login)
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      alert('No username found. Please log in again.');
      return;
    }
    setUsername(storedUsername);
  }, []);

  // Fetch profile data from backend
  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/profile/${username}`);
        if (!res.ok) throw new Error('Profile fetch failed');
        const data = await res.json();
        setProfile(data);
        setBio(data.bio || '');
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchProfile();
  }, [username]);

  // Submit updated bio/photo
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username) {
      alert('Username not found. Cannot upload profile.');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('bio', bio);
    if (file) {
      formData.append('profile_picture', file);
    }

    try {
      const res = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setProfile(data);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <h2>Profile</h2>

      {profile?.profile_picture && (
        <img
          src={`http://localhost:5000/uploads/${profile.profile_picture}`}
          alt="Profile"
          width="150"
        />
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Bio:</label>
          <input
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div>
          <label>Profile Picture:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;
