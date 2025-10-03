import { Download } from 'lucide-react';

export default function ControlsPanel({ videoUrl, isLoading }) {
  const canDownload = !isLoading && videoUrl;

  return (
    <div className="p-4 flex justify-center items-center">
      <a
        href={canDownload ? videoUrl : '#'}
        download="ai-generated-video.mp4"
        // The 'aria-disabled' and 'pointer-events-none' are for styling disabled links
        aria-disabled={!canDownload}
        // This makes the link unclickable when disabled
        onClick={(e) => !canDownload && e.preventDefault()}
        className={`inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md transition-colors
          ${canDownload
            ? 'hover:bg-green-700 cursor-pointer'
            : 'bg-slate-500 cursor-not-allowed opacity-50'
          }`}
      >
        <Download size={20} />
        Download Video
      </a>
    </div>
  );
}