import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import videoRoutes from './routes/videoRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from the 'public' directory
app.use('/static', express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', videoRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});