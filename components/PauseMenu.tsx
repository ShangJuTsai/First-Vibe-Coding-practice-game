
import React from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onExit: () => void;
  onChangeCharacter: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onExit, onChangeCharacter }) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white p-8">
      <div className="bg-white/10 p-12 rounded-3xl border-4 border-white/30 shadow-2xl text-center space-y-6 max-w-sm w-full">
        <h2 className="text-4xl font-bold mb-8 text-yellow-400">GAME PAUSED</h2>
        
        <button 
          onClick={onResume}
          className="w-full py-4 bg-green-500 hover:bg-green-400 rounded-2xl font-bold text-xl transition-all border-b-4 border-green-700 active:translate-y-1 active:border-b-0"
        >
          CONTINUE
        </button>

        <button 
          onClick={onChangeCharacter}
          className="w-full py-4 bg-blue-500 hover:bg-blue-400 rounded-2xl font-bold text-lg transition-all border-b-4 border-blue-700 active:translate-y-1 active:border-b-0"
        >
          CHANGE CHARACTER
        </button>

        <button 
          onClick={onExit}
          className="w-full py-4 bg-red-500 hover:bg-red-400 rounded-2xl font-bold text-lg transition-all border-b-4 border-red-700 active:translate-y-1 active:border-b-0"
        >
          QUIT TO MENU
        </button>
        
        <p className="text-xs opacity-50 pt-4">Press ESC to Resume</p>
      </div>
    </div>
  );
};

export default PauseMenu;
