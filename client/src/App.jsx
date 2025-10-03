import { useState } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import VideoPreview from './components/VideoPreview';
import AssetUploader from './components/AssetUploader';
import ControlsPanel from './components/ControlsPanel'; 

// Define the backend URL. Make sure your server is running.
const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [userAssets, setUserAssets] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  

  const handleGenerateVideo = async () => {
    // Basic validation
    if (!prompt && userAssets.length === 0) {
      alert('Please enter a prompt or upload some assets.');
      return;
    }

    setIsLoading(true);
    setVideoUrl(null);
    setError(null);

    try {
      let assetUrls = [];

      // Step 1: Upload assets if they exist
      if (userAssets.length > 0) {
        const formData = new FormData();
        userAssets.forEach(file => {
          formData.append('assets', file);
        });

        const uploadResponse = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error('File upload failed.');
        const uploadData = await uploadResponse.json();
        assetUrls = uploadData.assetUrls;
      }
      
      // Step 2: Call generate-video with either a prompt or the new asset URLs
      const generationResponse = await fetch(`${API_URL}/api/generate-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userAssetUrls: assetUrls }),
      });

      if (!generationResponse.ok) throw new Error('Video generation failed.');
      const generationData = await generationResponse.json();
      setVideoUrl(generationData.videoUrl);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col">
        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          handleGenerate={handleGenerateVideo}
          isLoading={isLoading}
        />
        <AssetUploader assets={userAssets} setAssets={setUserAssets} />
        <VideoPreview videoUrl={videoUrl} isLoading={isLoading} error={error} />
        <ControlsPanel videoUrl={videoUrl} isLoading={isLoading} />

      </main>
    </div>
  );
}
