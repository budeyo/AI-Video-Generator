import React from 'react';
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Tailwind CSS v4 is working! 🎉
        </h1>
        <p className="text-gray-600 mb-6">
          This is the new v4 setup - much simpler!
        </p>
        <button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">
          Get Started
        </button>
      </div>
    </div>
  );
}

export default App;