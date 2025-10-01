import { Sun, Moon, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-slate-800 text-white p-4 flex justify-between items-center border-b border-slate-600">
      <div className="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-400"><path d="M10 4L12 6L14 4L16 6L18 4V12H6V4L8 6L10 4ZM6 18V14H18V18H6Z" fill="currentColor"></path></svg>
        <h1 className="text-xl font-bold">AI Video Gen</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-slate-700">
          <Sun size={20} /> {/* We'll add toggle functionality later */}
        </button>
        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
          <User size={20} />
        </div>
      </div>
    </header>
  );
}