
import React, { useEffect, useState } from 'react';
import { CharacterType } from '../types';
import { CHARACTERS } from '../constants';

interface CharacterSelectProps {
  onSelect: (type: CharacterType) => void;
  unlockedSecret: boolean;
  onBack: () => void;
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect, unlockedSecret, onBack }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectable = CHARACTERS.filter(c => !c.secret || (c.secret && unlockedSecret));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : selectable.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex(prev => (prev < selectable.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter') {
        onSelect(selectable[selectedIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, selectable, onSelect]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-blue-900 to-indigo-950 text-white p-8">
      <h2 className="text-5xl font-black mb-16 drop-shadow-lg tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
        CHOOSE YOUR HERO
      </h2>
      
      <div className="flex gap-12 flex-wrap justify-center items-end h-96">
        {selectable.map((char, index) => (
          <div 
            key={char.id}
            onClick={() => onSelect(char.id)}
            className={`
              relative flex flex-col items-center p-10 rounded-[40px] transition-all duration-300 cursor-pointer transform
              ${index === selectedIndex 
                ? 'scale-125 bg-white text-blue-950 ring-[12px] ring-yellow-400 shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-10' 
                : 'bg-white/10 scale-90 opacity-40 hover:opacity-60'}
            `}
          >
            <div className={`text-9xl mb-6 transition-transform duration-500 ${index === selectedIndex ? 'animate-bounce' : ''}`}>
              {char.icon}
            </div>
            <div className="text-2xl font-black uppercase tracking-tight">{char.name}</div>
            
            {char.secret && (
              <div className="absolute -top-6 -right-6 bg-yellow-400 text-blue-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-pulse border-2 border-white">
                LEGENDARY
              </div>
            )}
            
            {index === selectedIndex && (
              <div className="mt-4 flex gap-1">
                <span className="w-3 h-3 bg-blue-600 rounded-full animate-ping"></span>
                <span className="w-3 h-3 bg-blue-600 rounded-full animate-ping delay-75"></span>
                <span className="w-3 h-3 bg-blue-600 rounded-full animate-ping delay-150"></span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-24 flex flex-col items-center gap-6">
        <p className="text-lg opacity-60 font-medium">Use ← → to explore, Enter to Select</p>
        <button 
          onClick={onBack} 
          className="px-8 py-3 bg-black/30 hover:bg-black/50 rounded-full text-sm font-bold border border-white/10 transition-all active:scale-95"
        >
          ← GO BACK
        </button>
      </div>
    </div>
  );
};

export default CharacterSelect;
