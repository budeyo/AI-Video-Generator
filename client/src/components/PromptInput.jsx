import { Sparkles } from 'lucide-react';

export default function PromptInput({ prompt, setPrompt, handleGenerate, isLoading }) {
  return (
    <div className="p-4">
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A cinematic video of a majestic lion in the Serengeti, golden hour lighting..."
          className="w-full p-4 pr-32 rounded-lg bg-slate-800 text-white border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none disabled:opacity-50"
          rows={3}
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={18} />
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </div>
  );
}