
export enum GameState {
  START_MENU = 'START_MENU',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  BOSS_INTRO = 'BOSS_INTRO',
  GAME_OVER = 'GAME_OVER',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  VICTORY = 'VICTORY',
  AI_WORKSHOP = 'AI_WORKSHOP'
}

export enum CharacterType {
  PRINCESS = 'PRINCESS',
  PET = 'PET',
  BOY = 'BOY',
  GOLDEN_SLIME = 'GOLDEN_SLIME'
}

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface Player extends GameObject {
  vx: number;
  vy: number;
  lives: number;
  score: number;
  onGround: boolean;
  type: CharacterType;
  invulnerableFrames: number;
}

export interface Enemy extends GameObject {
  type: 'slime' | 'bat' | 'spiky';
  vx: number;
  patrolRange: number;
  startX: number;
}

export interface Boss extends GameObject {
  health: number;
  maxHealth: number;
  state: 'idle' | 'attacking' | 'charging';
  attackCooldown: number;
  bubbles: Bubble[];
}

export interface Bubble extends GameObject {
  vx: number;
  vy: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  theme: string;
  bgColor: string;
  groundColor: string;
  isBossLevel: boolean;
  width: number;
}
