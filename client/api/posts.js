// Vercel serverless function for posts routes
// NOTE: You must use a cloud database connection here
// import db from '../../server/config/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (req.url.match(/^\/api\/posts\/user\//)) {
      // Get posts by user
      const userId = req.query.userId;
      // TODO: Connect to your cloud DB and fetch posts by user
      return res.status(200).json([{ id: 1, content: 'Stub: User post', userId }]);
    }
    // Get all posts
    // TODO: Connect to your cloud DB and fetch all posts
    return res.status(200).json([{ id: 1, content: 'Stub: All posts' }]);
  }
  if (req.method === 'POST') {
    // File upload is not supported in Vercel serverless functions (use S3/Cloudinary)
    // TODO: Accept content and image_url, save to cloud DB
    return res.status(201).json({ id: 1, content: 'Stub: Created post (implement DB logic)' });
  }
  res.status(404).json({ error: 'Not found' });
} 