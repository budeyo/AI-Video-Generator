import OpenAI from 'openai';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';

// --- Helper Functions ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to download a file from a URL
const downloadFile = async (url, outputPath) => {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });
  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

// Helper to get a local file path from a server URL
const getLocalPathFromUrl = (url) => {
    try {
        const urlObj = new URL(url);
        // e.g., '/static/uploads/...' -> 'public/uploads/...'
        const localPath = path.join(__dirname, '../../', urlObj.pathname.replace('/static/', 'public/'));
        return localPath;
    } catch (error) {
        console.error("Invalid URL for local path conversion:", url, error);
        return null;
    }
}

// --- Multer Configuration ---
// This sets up where to store uploaded files and how to name them.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = 'public/uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// --- Controller for handling asset uploads ---
export const uploadAssets = [
  upload.array('assets', 5), // 'assets' is the field name, 5 is the max file count
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files were uploaded.' });
      }
      // Construct the URLs for the uploaded files
      const assetUrls = req.files.map(file => 
        `${req.protocol}://${req.get('host')}/static/uploads/${file.filename}`
      );
      res.json({ 
        success: true,
        message: 'Files uploaded successfully',
        assetUrls 
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to upload files' 
      });
    }
  }
];

// --- Updated generateVideo Controller ---
export const generateVideo = async (req, res) => {
  const { prompt, userAssetUrls } = req.body;
  
  if (!prompt && (!userAssetUrls || userAssetUrls.length === 0)) {
    return res.status(400).json({ 
      success: false,
      error: 'A prompt or uploaded assets are required' 
    });
  }

  try {
    let imageUrls = []; // Fixed: Declare imageUrls variable

    // --- 1. Asset Gathering ---
    if (userAssetUrls && userAssetUrls.length > 0) {
      console.log('✅ Using user-provided assets:', userAssetUrls);
      imageUrls = userAssetUrls;
    } else {
      console.log('🎨 Generating images with DALL-E...');
      
      // Generate multiple images for the video
      const imageGenerationPromises = Array.from({ length: 3 }).map((_, i) =>
        openai.images.generate({
          model: "dall-e-3",
          prompt: `Scene ${i+1}/3 for a video. A cinematic shot for: "${prompt}"`,
          n: 1,
          size: "1792x1024",
        })
      );
      
      const imageResults = await Promise.all(imageGenerationPromises);
      imageUrls = imageResults.map(result => result.data[0].url);
      console.log('✅ Images generated successfully:', imageUrls);
    }

    // --- 2. Audio Generation ---
    console.log('🎙️ Generating voiceover script with GPT-4...');
    
    // Generate a script
    const scriptResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a concise scriptwriter for short social media videos. Based on the user's prompt, create a short, engaging voiceover script that is no more than 50 words."
        },
        {
          role: "user",
          content: `The video is about: "${prompt}"`
        }
      ],
    });
    
    const script = scriptResponse.choices[0].message.content;
    console.log('📜 Script:', script);

    // Generate audio from the script
    console.log('🔊 Generating audio with TTS...');
    
    // Ensure uploads directory exists
    const uploadsDir = path.resolve('./public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const speechFile = path.join(uploadsDir, `speech-${Date.now()}.mp3`);
    
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: script,
    });
    
    // Save the audio to a file
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    
    const audioFilename = path.basename(speechFile);
    const audioUrl = `${req.protocol}://${req.get('host')}/static/uploads/${audioFilename}`;
    
    console.log('✅ Audio generated successfully:', audioUrl);

    // --- 3. Video Generation (Placeholder - you'll need to implement this) ---
    console.log('🎬 Starting video generation process...');
    
    // TODO: Implement actual video generation with ffmpeg
    // This would involve:
    // - Downloading the generated images
    // - Creating a video slideshow with the images and audio
    // - Using ffmpeg to combine everything
    
    // For now, return the assets with a placeholder video
    res.json({
      success: true,
      message: 'Video assets generated successfully!',
      imageUrls: imageUrls,
      audioUrl: audioUrl,
      script: script,
      videoUrl: null, // You'll update this when video generation is implemented
      status: 'assets_ready'
    });

  } catch (error) {
    console.error('Error during AI video generation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate video assets.',
      details: error.message 
    });
  }
};