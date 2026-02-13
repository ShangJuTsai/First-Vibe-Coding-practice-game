
import React from 'react';

interface MainMenuProps {
  onStart: () => void;
  onEnterWorkshop: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onEnterWorkshop }) => {
  return (
    <div className="flex flex-col items-center justify-center text-white text-center p-8 bg-gradient-to-tr from-blue-400 via-indigo-500 to-purple-600 w-full h-full relative overflow-hidden">
      {/* Decorative Floating Blobs */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-60 h-60 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative z-10">
        <div className="bg-white/10 p-12 rounded-[60px] backdrop-blur-xl border-4 border-white/20 shadow-2xl mb-12 transform hover:scale-105 transition-transform duration-500">
          <h1 className="text-7xl md:text-9xl font-black mb-2 drop-shadow-[0_15px_0_rgba(0,0,0,0.2)] tracking-tightest">
            SUPER <span className="text-yellow-400">QUEST</span>
          </h1>
          <p className="text-3xl font-black uppercase tracking-[0.5em] text-white/80 drop-shadow-md">
            橫向卷軸大冒險
          </p>
        </div>
        
        <div className="flex flex-col gap-10 w-full max-w-lg mx-auto">
          <button 
            onClick={onStart}
            className="group relative w-full bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 text-blue-950 font-black py-10 px-16 rounded-[40px] text-5xl transition-all border-b-[16px] border-yellow-800 active:translate-y-4 active:border-b-0 shadow-[0_30px_50px_rgba(0,0,0,0.3)] hover:brightness-110"
          >
            PLAY
            <span className="ml-6 group-hover:rotate-12 inline-block transition-transform">⭐</span>
          </button>

          <button 
            onClick={onEnterWorkshop}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-black py-6 px-10 rounded-[30px] text-2xl transition-all border-b-[8px] border-white/10 active:translate-y-2 active:border-b-0 backdrop-blur-md shadow-xl uppercase tracking-widest"
          >
            AI Magic Workshop
          </button>
        </div>

        <div className="mt-20 flex justify-center gap-12 text-lg font-black tracking-widest bg-black/30 p-8 rounded-[40px] backdrop-blur-lg border-2 border-white/10 shadow-inner">
          <div className="flex flex-col items-center group">
            <span className="text-yellow-400 text-3xl mb-2 group-hover:scale-125 transition-transform">⬆️</span> 
            <span>JUMP</span>
          </div>
          <div className="flex flex-col items-center group">
            <span className="text-yellow-400 text-3xl mb-2 group-hover:scale-125 transition-transform">⬅️➡️</span> 
            <span>MOVE</span>
          </div>
          <div className="flex flex-col items-center group">
            <span className="text-yellow-400 text-3xl mb-2 group-hover:scale-125 transition-transform">ESC</span> 
            <span>PAUSE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
