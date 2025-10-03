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

const downloadFile = async (url, outputPath) => {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({ url, method: 'GET', responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

const getLocalPathFromUrl = (url) => {
    const urlObj = new URL(url);
    return path.join(__dirname, '../../', urlObj.pathname.replace('/static/', 'public/'));
}

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads/';
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

const openai = new OpenAI();

// --- Controllers ---
export const uploadAssets = [
  upload.array('assets', 5),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }
    const assetUrls = req.files.map(file =>
      `${req.protocol}://${req.get('host')}/static/uploads/${file.filename}`
    );
    res.json({ assetUrls });
  }
];

export const generateVideo = async (req, res) => {
  const { prompt, userAssetUrls } = req.body;
  if (!prompt && (!userAssetUrls || userAssetUrls.length === 0)) {
    return res.status(400).json({ error: 'A prompt or uploaded assets are required' });
  }

  try {
    // --- 1. Asset Gathering ---
    let sourceImageUrls = [];
    if (userAssetUrls && userAssetUrls.length > 0) {
      sourceImageUrls = userAssetUrls;
    } else {
      const imagePromises = Array.from({ length: 3 }).map(() =>
        openai.images.generate({
          model: "dall-e-3",
          prompt: `Cinematic shot for a video about: "${prompt}"`,
          n: 1,
          size: "1792x1024",
        })
      );
      const imageResults = await Promise.all(imagePromises);
      sourceImageUrls = imageResults.map(res => res.data[0].url);
    }
    console.log('✅ Visual assets ready:', sourceImageUrls);

    // --- 2. Audio Generation ---
    // ***FIX***: Handle the no-prompt scenario for script generation
    const scriptPrompt = prompt || "A short, inspiring slideshow of images.";
    const scriptResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "system", content: "You are a concise scriptwriter. Create a short, engaging voiceover script (max 50 words) for the following topic." }, { role: "user", content: scriptPrompt }],
    });
    const script = scriptResponse.choices[0].message.content;
    const speechFile = path.resolve(`./public/uploads/speech-${Date.now()}.mp3`);
    const mp3 = await openai.audio.speech.create({ model: "tts-1", voice: "alloy", input: script });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    const audioUrl = `${req.protocol}://${req.get('host')}/static/uploads/${path.basename(speechFile)}`;
    console.log('✅ Audio asset ready:', audioUrl);
    
    // --- 3. Localize Assets for FFmpeg ---
    console.log('⬇️ Localizing assets for processing...');
    const localImagePaths = await Promise.all(
        sourceImageUrls.map(async (url) => {
            if (url.startsWith('http://localhost') || url.startsWith('https://' + req.get('host'))) {
                return getLocalPathFromUrl(url);
            } else {
                const localPath = path.resolve(`./public/uploads/image-${Date.now()}-${Math.random()}.jpg`);
                await downloadFile(url, localPath);
                return localPath;
            }
        })
    );
    const localAudioPath = getLocalPathFromUrl(audioUrl);

    // ***FIX***: Re-integrated the FFmpeg video processing logic
    // --- 4. FFmpeg Video Processing ---
    console.log('🎬 Starting video creation with FFmpeg...');
    const outputFileName = `video-${Date.now()}.mp4`;
    const outputPath = path.resolve(`./public/outputs/${outputFileName}`);

    await new Promise((resolve, reject) => {
        const command = ffmpeg();
        // Create a text file with image durations for a robust slideshow
        const fileListPath = path.resolve(`./public/uploads/filelist-${Date.now()}.txt`);
        const fileContent = localImagePaths.map(p => `file '${p}'\nduration 5`).join('\n');
        fs.writeFileSync(fileListPath, fileContent);

        command
            .input(fileListPath)
            .inputOptions(['-f concat', '-safe 0'])
            .input(localAudioPath)
            .outputOptions(['-c:v libx264', '-c:a aac', '-pix_fmt yuv420p', '-shortest'])
            .on('end', () => { console.log('✅ FFmpeg processing finished.'); resolve(); })
            .on('error', (err) => { console.error('❌ FFmpeg error:', err); reject(err); })
            .save(outputPath);
    });

    // Cleanup temporary files
    localImagePaths.forEach(p => fs.unlinkSync(p));
    fs.unlinkSync(localAudioPath);
    // You could also delete the file list here if you created one

    const finalVideoUrl = `${req.protocol}://${req.get('host')}/static/outputs/${outputFileName}`;
    res.json({ message: 'Video created successfully!', videoUrl: finalVideoUrl });

  } catch (error) {
    console.error('Error in generateVideo:', error);
    res.status(500).json({ error: 'Failed to generate video.' });
  }
};