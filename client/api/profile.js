// Vercel serverless function for profile routes
// NOTE: You must use a cloud database connection here
// import db from '../../server/config/db.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // File upload is not supported in Vercel serverless functions (use S3/Cloudinary)
    // TODO: Accept username, bio, and image_url, save to cloud DB
    return res.status(200).json({
      success: true,
      profile: {
        username: req.body.username,
        bio: req.body.bio || null,
        profile_picture: 'Stub: Use cloud storage for profile picture',
      },
      message: 'Stub: Profile uploaded/updated (implement DB and file upload logic)'
    });
  }
  if (req.method === 'GET') {
    const { username } = req.query;
    // TODO: Connect to your cloud DB and fetch profile by username
    return res.status(200).json({
      username,
      bio: null,
      profile_picture: null,
      message: 'Stub: Profile fetched (implement DB logic)'
    });
  }
  res.status(404).json({ error: 'Not found' });
} 