import { UploadCloud, Image, X } from 'lucide-react';

export default function AssetUploader({ assets, setAssets }) {
  const handleFileChange = (e) => {
    if (e.target.files) {
      // Limit to 5 assets for now
      const filesArray = Array.from(e.target.files).slice(0, 5);
      setAssets(filesArray);
    }
  };

  const removeAsset = (index) => {
    setAssets(assets.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4">
      <div className="mb-2 text-center text-sm text-slate-400">
        <p>Use AI-generated images OR upload your own (up to 5)</p>
      </div>
      <div className="w-full p-6 border-2 border-dashed border-slate-600 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-slate-800/50 transition-colors">
        <label htmlFor="asset-upload" className="cursor-pointer">
          <div className="flex flex-col items-center">
            <UploadCloud size={48} className="text-slate-500 mb-2" />
            <span className="font-semibold text-blue-400">Click to upload</span>
            <span className="text-xs text-slate-500">PNG, JPG, or MP4</span>
          </div>
          <input id="asset-upload" type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>
      {assets.length > 0 && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {assets.map((file, index) => (
            <div key={index} className="relative aspect-video">
              <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover rounded-md" />
              <button onClick={() => removeAsset(index)} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}