
import React, { useState } from 'react';
import { editCharacterImage } from '../geminiService';

interface GeminiCustomizerProps {
  onBack: () => void;
  onSave: (img: string) => void;
}

const GeminiCustomizer: React.FC<GeminiCustomizerProps> = ({ onBack, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMagicEdit = async () => {
    if (!currentImage || !prompt) return;
    setIsEditing(true);
    const result = await editCharacterImage(currentImage, prompt);
    if (result) {
      setCurrentImage(result);
    } else {
      alert("Magic failed! Check your API key or try a simpler prompt.");
    }
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-indigo-900 text-white p-8 w-full h-full overflow-y-auto">
      <h2 className="text-4xl mb-6">AI MAGIC WORKSHOP 🪄</h2>
      <p className="mb-8 opacity-70">Use AI to create your custom hero!</p>

      <div className="flex flex-col md:flex-row gap-10 items-center max-w-4xl w-full">
        <div className="flex-1 flex flex-col items-center bg-white/10 p-10 rounded-3xl border-2 border-dashed border-white/30">
          {currentImage ? (
            <img src={currentImage} alt="Preview" className="w-64 h-64 object-contain mb-4 rounded-xl" />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center text-6xl">❓</div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload}
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-col">
            <label className="text-sm mb-2">Magic Command:</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Make my pet look like a golden dragon with a crown..."
              className="p-4 rounded-xl bg-black/50 text-white border border-white/20 h-32 focus:ring-2 ring-purple-400 outline-none"
            />
          </div>
          
          <button 
            onClick={handleMagicEdit}
            disabled={isEditing || !currentImage}
            className={`w-full py-4 rounded-xl font-bold transition-all ${isEditing ? 'bg-gray-500' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105'}`}
          >
            {isEditing ? 'CASTING MAGIC...' : 'CAST AI MAGIC ⚡'}
          </button>

          {currentImage && (
            <button 
              onClick={() => onSave(currentImage)}
              className="w-full py-4 bg-green-500 rounded-xl font-bold hover:bg-green-400"
            >
              SAVE AS MY HERO ✅
            </button>
          )}
        </div>
      </div>

      <button onClick={onBack} className="mt-12 opacity-50 underline">Back to Main Menu</button>
    </div>
  );
};

export default GeminiCustomizer;
