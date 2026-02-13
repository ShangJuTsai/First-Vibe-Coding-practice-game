
import { LevelConfig, CharacterType } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const GRAVITY = 0.8;
export const JUMP_FORCE = -16;
export const MOVE_SPEED = 5;
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 60;
export const INITIAL_LIVES = 5;

export const CHARACTERS = [
  { id: CharacterType.PRINCESS, name: '可愛公主', color: '#FF69B4', icon: '👸' },
  { id: CharacterType.PET, name: '可愛小寵物', color: '#90EE90', icon: '🐶' },
  { id: CharacterType.BOY, name: '帥氣小男生', color: '#1E90FF', icon: '👦' },
  { id: CharacterType.GOLDEN_SLIME, name: '萌萌金史萊姆', color: '#FFD700', icon: '👑', secret: true },
];

export const LEVELS: LevelConfig[] = [
  { id: 1, name: "陽光森林", theme: "forest", bgColor: "#87CEEB", groundColor: "#228B22", isBossLevel: false, width: 3000 },
  { id: 2, name: "幽靜竹林", theme: "forest", bgColor: "#B0E0E6", groundColor: "#32CD32", isBossLevel: false, width: 3500 },
  { id: 3, name: "森林巨怪", theme: "forest", bgColor: "#556B2F", groundColor: "#1E2F23", isBossLevel: true, width: 1200 },
  { id: 4, name: "炎熱火山", theme: "volcano", bgColor: "#FF4500", groundColor: "#8B4513", isBossLevel: false, width: 4000 },
  { id: 5, name: "岩漿之地", theme: "volcano", bgColor: "#B22222", groundColor: "#3D2B1F", isBossLevel: false, width: 4500 },
  { id: 6, name: "火焰領主", theme: "volcano", bgColor: "#4B0000", groundColor: "#1A0000", isBossLevel: true, width: 1200 },
  { id: 7, name: "蔚藍海邊", theme: "seaside", bgColor: "#00BFFF", groundColor: "#F4A460", isBossLevel: false, width: 5000 },
  { id: 8, name: "深海奇緣", theme: "underwater", bgColor: "#000080", groundColor: "#2F4F4F", isBossLevel: false, width: 5500 },
  { id: 9, name: "珊瑚迷宮", theme: "underwater", bgColor: "#483D8B", groundColor: "#4682B4", isBossLevel: false, width: 6000 },
  { id: 10, name: "陰森地下城", theme: "dungeon", bgColor: "#2F4F4F", groundColor: "#000000", isBossLevel: true, width: 1500 },
];
