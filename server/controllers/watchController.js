import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

export const getyoutubevideos = async (req, res) => {
  try {
    const query = req.query.q ;
    const pageToken = req.query.pageToken || '';
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${encodeURIComponent(query)}&pageToken=${pageToken}&key=${process.env.YOUTUBE_API_KEY}&type=video`;

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch the video!" });
  }
};
