import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy' });
});

// Video generation endpoint
app.post('/api/generate-video', (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // --- AI Workflow will go here ---
  console.log(`Received prompt: ${prompt}`);
  // ---

  // For now, return a mock response
  res.json({
    message: 'Video generation started successfully',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});