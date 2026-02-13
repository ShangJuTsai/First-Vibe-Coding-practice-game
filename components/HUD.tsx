
import React from 'react';

interface HUDProps {
  lives: number;
  level: string;
  score: number;
}

const HUD: React.FC<HUDProps> = ({ lives, level, score }) => {
  return (
    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-40 pointer-events-none">
      <div className="bg-black/50 p-4 rounded-xl backdrop-blur-sm border-2 border-white/20">
        <div className="text-yellow-400 text-xs mb-1 uppercase tracking-wider">Lives</div>
        <div className="text-white text-2xl flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < lives ? 'text-red-500' : 'opacity-20'}>❤️</span>
          ))}
        </div>
      </div>

      <div className="bg-black/50 p-4 rounded-xl backdrop-blur-sm border-2 border-white/20 text-center">
        <div className="text-blue-300 text-xs mb-1 uppercase tracking-wider">Level</div>
        <div className="text-white text-lg font-bold">{level}</div>
      </div>

      <div className="bg-black/50 p-4 rounded-xl backdrop-blur-sm border-2 border-white/20 text-right min-w-[120px]">
        <div className="text-green-400 text-xs mb-1 uppercase tracking-wider">Score</div>
        <div className="text-white text-2xl font-mono">{score.toString().padStart(5, '0')}</div>
      </div>
    </div>
  );
};

export default HUD;
