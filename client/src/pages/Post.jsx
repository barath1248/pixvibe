import React, { useState, useEffect, useRef } from 'react';
import '../styles/Post.css';

const Post = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);

  // Fetch all posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const BASE_URL = 'https://pixvibe.onrender.com';
      const res = await fetch(`${BASE_URL}/api/posts`);
      const data = await res.json();
      setPosts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle post submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    setPosting(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      const BASE_URL = 'https://pixvibe.onrender.com';
      const formData = new FormData();
      formData.append('content', content);
      if (image) formData.append('image', image);
      const res = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        setContent('');
        setImage(null);
        setImagePreview('');
        setSuccess('Post created successfully!');
        fetchPosts();
      } else {
        setError('Failed to post');
      }
    } catch (err) {
      setError('Failed to post');
    } finally {
      setPosting(false);
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImagePreview('');
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImage(e.dataTransfer.files[0]);
      setImagePreview(URL.createObjectURL(e.dataTransfer.files[0]));
    }
  };

  return (
    <div className="post-container">
      <div className="post-page-container">
        <div className="form-card" style={{marginBottom: 36, padding: 24, borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', background: '#f8fafc'}}>
          <h2 style={{marginBottom: 18, fontWeight: 700, fontSize: '1.4rem'}}>Create a Post</h2>
          {error && <div className="error-message" style={{marginBottom: 12}}>{error}</div>}
          {success && <div className="success-message" style={{marginBottom: 12}}>{success}</div>}
          <form onSubmit={handleSubmit} className="post-form" encType="multipart/form-data">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              style={{marginBottom: 0}}
            />
            <div
              className={`file-upload-area${dragActive ? ' drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{
                border: '2px dashed #a5b4fc',
                borderRadius: 12,
                padding: 18,
                background: dragActive ? '#e0e7ff' : '#f8fafc',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: 0,
                marginTop: 8
              }}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <span style={{fontWeight: 500, color: '#6366f1'}}>
                {imagePreview ? 'Change Photo' : 'Add Photo'}
              </span>
              <p style={{fontSize: 13, color: '#888', margin: 0}}>
                Drag & drop or click to select an image
              </p>
            </div>
            {imagePreview && (
              <div className="post-image-preview" style={{marginTop: 16, marginBottom: 0}}>
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
            <button type="submit" disabled={posting || (!content.trim() && !image)} style={{marginTop: 18}}>
              {posting ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
        <hr style={{margin: '32px 0 24px 0', border: 0, borderTop: '1.5px solid #e5e7eb'}} />
        <h3 style={{marginBottom: 18, fontWeight: 700, fontSize: '1.2rem'}}>All Posts</h3>
        {loading ? (
          <p>Loading posts...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
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

export default Post;
