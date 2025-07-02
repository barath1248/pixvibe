// src/components/Explore.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Styles/Explore.css"; // Optional: Create for styling

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUsername = localStorage.getItem("username"); // or from context

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/posts/explore");
        const otherUsersPosts = res.data.filter(post => post.username !== currentUsername);
        setPosts(otherUsersPosts);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch posts");
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentUsername]);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="explore-container">
      {posts.length === 0 ? (
        <p>No posts to explore.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="post-card">
            <h4>@{post.username}</h4>
            {post.imageUrl && <img src={post.imageUrl} alt="Post" className="post-image" />}
            <p>{post.caption}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Explore;
