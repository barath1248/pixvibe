import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import watchRoutes from './routes/watchRoutes.js';
import musicRoutes from './routes/musicRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));
app.use(cors({
  origin: '*',
  credentials: true
}));



// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get("/", (req, res) => { 
  res.render("home");
});

app.use("/api", authRoutes);
app.use("/api/watch",watchRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/music', musicRoutes);
//app.use('/api/music', musicRoutes);

// 404 Handler
app.use((req, res) => { 
  res.status(404).send("404. Page not found.");
});




// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
