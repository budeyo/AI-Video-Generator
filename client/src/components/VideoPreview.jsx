import { AlertTriangle } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center gap-4">
    <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-slate-400">Generating your masterpiece... this may take a moment.</p>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="flex flex-col items-center justify-center gap-4 text-red-400">
    <AlertTriangle size={48} />
    <p className="font-semibold">An Error Occurred</p>
    <p className="text-sm text-slate-400">{message}</p>
  </div>
);

export default function VideoPreview({ videoUrl, isLoading, error }) {
  const renderContent = () => {
    if (error) {
      return <ErrorDisplay message={error} />;
    }
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (videoUrl) {
      return <video src={videoUrl} controls className="w-full h-full rounded-lg" />;
    }
    return <p className="text-slate-400">Your generated video will appear here.</p>;
  };

  return (
    <div className="flex-grow p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl aspect-video bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}