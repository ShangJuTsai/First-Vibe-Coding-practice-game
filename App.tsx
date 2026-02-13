
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, CharacterType, Player } from './types';
import { LEVELS, INITIAL_LIVES, CHARACTERS } from './constants';
import GameEngine from './components/GameEngine';
import MainMenu from './components/MainMenu';
import CharacterSelect from './components/CharacterSelect';
import HUD from './components/HUD';
import GeminiCustomizer from './components/GeminiCustomizer';
import PauseMenu from './components/PauseMenu';
import { sounds } from './components/SoundManager';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START_MENU);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>(CharacterType.BOY);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [hasBeatenGame, setHasBeatenGame] = useState(false);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      sounds.startMusic();
    } else if (gameState !== GameState.PAUSED) {
      sounds.stopMusic();
    }
  }, [gameState]);

  const handleStart = () => {
    setGameState(GameState.CHARACTER_SELECT);
  };
  
  const handleSelectCharacter = (type: CharacterType) => {
    setSelectedCharacter(type);
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = () => {
    setLives(INITIAL_LIVES);
    setGameState(GameState.PLAYING);
  };

  const handleLevelComplete = () => {
    sounds.playLevelUp();
    if (currentLevelIdx < LEVELS.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
      setGameState(GameState.LEVEL_COMPLETE);
      setTimeout(() => setGameState(GameState.PLAYING), 2000);
    } else {
      setHasBeatenGame(true);
      setGameState(GameState.VICTORY);
    }
  };

  const handlePlayerDeath = () => {
    sounds.playDeath();
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameState(GameState.GAME_OVER);
        return 0;
      }
      return newLives;
    });
  };

  const resetToMainMenu = () => {
    setGameState(GameState.START_MENU);
    setCurrentLevelIdx(0);
    setLives(INITIAL_LIVES);
    sounds.stopMusic();
  };

  const togglePause = useCallback(() => {
    setGameState(prev => {
      if (prev === GameState.PLAYING) return GameState.PAUSED;
      if (prev === GameState.PAUSED) return GameState.PLAYING;
      return prev;
    });
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        togglePause();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [togglePause]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-slate-950 font-sans">
      {gameState === GameState.START_MENU && (
        <MainMenu onStart={handleStart} onEnterWorkshop={() => setGameState(GameState.AI_WORKSHOP)} />
      )}

      {gameState === GameState.CHARACTER_SELECT && (
        <CharacterSelect 
          onSelect={handleSelectCharacter} 
          unlockedSecret={hasBeatenGame} 
          onBack={resetToMainMenu}
        />
      )}

      {gameState === GameState.AI_WORKSHOP && (
        <GeminiCustomizer 
          onBack={() => setGameState(GameState.START_MENU)} 
          onSave={(img) => { setCustomAvatar(img); setGameState(GameState.START_MENU); }} 
        />
      )}

      {(gameState === GameState.PLAYING || gameState === GameState.PAUSED) && (
        <>
          <HUD lives={lives} level={LEVELS[currentLevelIdx].name} score={0} />
          <GameEngine 
            level={LEVELS[currentLevelIdx]} 
            character={selectedCharacter} 
            customAvatar={customAvatar}
            paused={gameState === GameState.PAUSED}
            onLevelComplete={handleLevelComplete}
            onPlayerDeath={handlePlayerDeath}
          />
        </>
      )}

      {gameState === GameState.PAUSED && (
        <PauseMenu 
          onResume={() => setGameState(GameState.PLAYING)}
          onExit={resetToMainMenu}
          onChangeCharacter={() => setGameState(GameState.CHARACTER_SELECT)}
        />
      )}

      {gameState === GameState.LEVEL_COMPLETE && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="text-center animate-bounce">
            <h1 className="text-6xl text-yellow-400 font-black drop-shadow-2xl">LEVEL CLEAR!</h1>
            <p className="text-white text-xl mt-4 font-bold uppercase tracking-widest">Entering {LEVELS[currentLevelIdx].name}</p>
          </div>
        </div>
      )}

      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950/90 text-white p-10 text-center backdrop-blur-xl">
          <h1 className="text-8xl font-black mb-8 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">GAME OVER</h1>
          <p className="text-2xl mb-12 font-medium opacity-80 italic">The quest ends here... or does it?</p>
          <button 
            onClick={handleGameOver}
            className="px-12 py-6 bg-gradient-to-r from-white to-gray-200 text-red-900 rounded-[30px] text-3xl font-black shadow-2xl hover:scale-105 transition-transform active:scale-95"
          >
            TRY AGAIN
          </button>
          <button 
            onClick={resetToMainMenu}
            className="mt-8 text-lg underline opacity-50 hover:opacity-100 transition-opacity"
          >
            Back to Title
          </button>
        </div>
      )}

      {gameState === GameState.VICTORY && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 text-white p-10 text-center overflow-y-auto">
          <div className="animate-pulse mb-8">
            <h1 className="text-9xl font-black drop-shadow-[0_15px_15px_rgba(0,0,0,0.4)]">VICTORY</h1>
          </div>
          <p className="text-3xl mb-8 font-black uppercase tracking-tighter bg-black/20 py-4 px-8 rounded-full backdrop-blur-md">
            The Kingdom is Safe!
          </p>
          <div className="text-[120px] mb-12 animate-bounce">👑🏆👑</div>
          <div className="max-w-md bg-white/20 p-8 rounded-[40px] backdrop-blur-xl border-4 border-white/30 mb-12 shadow-2xl">
            <p className="text-xl italic font-bold">New Secret Unlocked:</p>
            <p className="text-4xl font-black text-yellow-200 mt-2 tracking-widest">GOLDEN SLIME</p>
          </div>
          <button 
            onClick={resetToMainMenu}
            className="px-16 py-8 bg-white text-orange-600 rounded-[40px] text-4xl font-black hover:scale-110 transition-transform shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
          >
            HOME SCREEN
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
