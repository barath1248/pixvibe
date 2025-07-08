// controllers/musicControllers.js
import fetch from 'node-fetch'; // Install node-fetch if you don't have it

// Audius API base URL
const AUDIUS_API_URL = 'https://api.audius.co/v1/';

// Get trending music tracks
export const getTrendingMusic = async (req, res) => {
  try {
    const response = await fetch(`${AUDIUS_API_URL}tracks/trending?limit=10`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error: ' + err.message });
  }
};

// Get a specific track by ID
export const getMusicById = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`${AUDIUS_API_URL}tracks/${id}`);
    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      return res.status(404).json({ error: 'Music track not found' });
    }
    res.status(200).json(data.data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error: ' + err.message });
  }
};

// Search music tracks
export const searchMusic = async (req, res) => {
  const { query } = req.query; // 'query' should be the search term (e.g., artist, track)
  try {
    const response = await fetch(`${AUDIUS_API_URL}tracks/search?query=${query}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error: ' + err.message });
  }
};
