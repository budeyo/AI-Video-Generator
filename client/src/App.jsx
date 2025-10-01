import { useState } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import VideoPreview from './components/VideoPreview';

// Define the backend URL. Make sure your server is running.
const API_URL = 'http://localhost:5001';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null); // State for handling errors

  const handleGenerateVideo = async () => {
    if (!prompt) {
      alert('Please enter a prompt.');
      return;
    }

    console.log('Calling backend to generate video for:', prompt);
    setIsLoading(true);
    setVideoUrl(null);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate video. Please try again.');
      }

      const data = await response.json();
      setVideoUrl(data.videoUrl);

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
        {/* Pass error to VideoPreview to display it */}
        <VideoPreview videoUrl={videoUrl} isLoading={isLoading} error={error} />
      </main>
    </div>
  );
}