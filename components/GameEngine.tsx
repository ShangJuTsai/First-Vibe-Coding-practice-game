
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  LevelConfig, CharacterType, Player, Enemy, Boss, Bubble, GameObject 
} from '../types';
import { 
  CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, JUMP_FORCE, MOVE_SPEED, 
  PLAYER_WIDTH, PLAYER_HEIGHT, CHARACTERS 
} from '../constants';
import { sounds } from './SoundManager';

interface GameEngineProps {
  level: LevelConfig;
  character: CharacterType;
  customAvatar: string | null;
  paused: boolean;
  onLevelComplete: () => void;
  onPlayerDeath: () => void;
}

const GameEngine: React.FC<GameEngineProps> = ({ 
  level, character, customAvatar, paused, onLevelComplete, onPlayerDeath 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const keys = useRef<{ [key: string]: boolean }>({});
  const animationFrame = useRef(0);
  
  const player = useRef<Player>({
    x: 100,
    y: CANVAS_HEIGHT - 100,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    lives: 5,
    score: 0,
    onGround: false,
    color: CHARACTERS.find(c => c.id === character)?.color || '#fff',
    type: character,
    invulnerableFrames: 0
  });

  const enemies = useRef<Enemy[]>([]);
  const boss = useRef<Boss | null>(null);
  const platforms = useRef<GameObject[]>([]);
  const scenery = useRef<{x: number, y: number, type: string, size: number, color: string, speed: number, depth: number}[]>([]);
  const cameraX = useRef(0);
  const levelEnded = useRef(false);

  useEffect(() => {
    levelEnded.current = false;
    cameraX.current = 0;
    
    player.current.x = 100;
    player.current.y = CANVAS_HEIGHT - 200;
    player.current.vx = 0;
    player.current.vy = 0;
    player.current.invulnerableFrames = 0;
    player.current.type = character;
    player.current.color = CHARACTERS.find(c => c.id === character)?.color || '#fff';

    const s: any[] = [];
    const sceneryCount = level.width / 120;
    for (let i = 0; i < sceneryCount; i++) {
      const x = i * 150 + Math.random() * 100;
      const depth = Math.random() * 0.5 + 0.2;
      if (level.theme === 'forest') {
        s.push({ x, y: CANVAS_HEIGHT - 40, type: 'tree', size: 150 + Math.random() * 100, color: '#2d5a27', speed: 0, depth });
        s.push({ x: x + 60, y: CANVAS_HEIGHT - 45, type: 'bush', size: 50 + Math.random() * 30, color: '#3e7d37', speed: 0, depth: 0.8 });
      } else if (level.theme === 'volcano') {
        s.push({ x, y: CANVAS_HEIGHT - 40, type: 'rock', size: 60 + Math.random() * 70, color: '#333', speed: 0, depth });
        s.push({ x, y: CANVAS_HEIGHT - 40, type: 'lava_glow', size: 120, color: 'rgba(255, 69, 0, 0.4)', speed: 0, depth: 1 });
      } else if (level.theme === 'underwater' || level.theme === 'seaside') {
        s.push({ x, y: CANVAS_HEIGHT - 40, type: 'coral', size: 50 + Math.random() * 40, color: i % 2 === 0 ? '#ff7f50' : '#ffb6c1', speed: 0, depth });
        s.push({ x: Math.random() * level.width, y: Math.random() * CANVAS_HEIGHT, type: 'bubble_bg', size: 5 + Math.random() * 15, color: 'rgba(255,255,255,0.4)', speed: 0.8 + Math.random(), depth: 1 });
      } else if (level.theme === 'dungeon') {
        if (i % 2 === 0) s.push({ x, y: 150, type: 'torch', size: 50, color: '#ffcc00', speed: 0, depth: 0.5 });
      }
      if (level.theme !== 'underwater' && level.theme !== 'dungeon') {
        s.push({ x: Math.random() * level.width, y: 40 + Math.random() * 180, type: 'cloud', size: 80 + Math.random() * 80, color: 'rgba(255,255,255,0.9)', speed: 0.2 + Math.random() * 0.3, depth: 0.3 });
      }
    }
    scenery.current = s;

    const p: GameObject[] = [];
    p.push({ x: 0, y: CANVAS_HEIGHT - 40, width: level.width, height: 40, color: level.groundColor });
    
    if (!level.isBossLevel) {
      for (let i = 0; i < level.width / 400; i++) {
        p.push({
          x: 400 + i * 400 + Math.random() * 180,
          y: CANVAS_HEIGHT - 200 - Math.random() * 220,
          width: 200 + Math.random() * 150,
          height: 40,
          color: level.groundColor
        });
      }
    } else {
      p.push({ x: 200, y: CANVAS_HEIGHT - 250, width: 300, height: 35, color: level.groundColor });
      p.push({ x: 700, y: CANVAS_HEIGHT - 250, width: 300, height: 35, color: level.groundColor });
    }
    platforms.current = p;

    const e: Enemy[] = [];
    if (!level.isBossLevel) {
      for (let i = 0; i < level.width / 450; i++) {
        const startX = 800 + i * 450;
        e.push({
          x: startX,
          y: CANVAS_HEIGHT - 90,
          width: 50,
          height: 50,
          color: '#FF0000',
          type: level.id === 10 ? 'bat' : 'slime',
          vx: 2.5 + (level.id * 0.2),
          patrolRange: 200 + Math.random() * 100,
          startX: startX
        });
      }
    }
    enemies.current = e;

    if (level.isBossLevel) {
      boss.current = {
        x: CANVAS_WIDTH + 300,
        y: CANVAS_HEIGHT - 420,
        width: 240,
        height: 240,
        color: '#8B0000',
        health: 8 + (level.id * 2),
        maxHealth: 8 + (level.id * 2),
        state: 'idle',
        attackCooldown: 130,
        bubbles: []
      };
    } else {
      boss.current = null;
    }
  }, [level, character]);

  const drawCharacter = (ctx: CanvasRenderingContext2D, p: Player) => {
    ctx.save();
    const { x, y, width, height, type, color } = p;
    const jumpState = p.vy < 0 ? -12 : (p.vy > 0 ? 12 : 0);
    const walkBob = Math.sin(animationFrame.current * 0.2) * 4;

    if (customAvatar) {
       const img = new Image();
       img.src = customAvatar;
       ctx.drawImage(img, x, y, width, height);
       ctx.restore();
       return;
    }

    // Shadow with depth
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height, width/2 + 8, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body with Gradient
    const bodyGrd = ctx.createLinearGradient(x, y, x + width, y + height);
    bodyGrd.addColorStop(0, color);
    bodyGrd.addColorStop(1, '#fff4');
    ctx.fillStyle = bodyGrd;
    ctx.beginPath();
    ctx.roundRect(x, y + jumpState/2 + (p.onGround ? walkBob : 0), width, height - jumpState, 20);
    ctx.fill();

    // Highlight for 3D effect
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(x + 5, y + 5 + jumpState/2, width - 10, (height - jumpState)/3, 10);
    ctx.stroke();

    const drawY = y + jumpState/2 + (p.onGround ? walkBob : 0);

    if (type === CharacterType.PRINCESS) {
      ctx.fillStyle = '#F4D03F';
      ctx.beginPath();
      ctx.arc(x + width/2, drawY + 10, width/2 + 10, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(x - 10, drawY + 10, 15, height - 10);
      ctx.fillRect(x + width - 5, drawY + 10, 15, height - 10);
      
      ctx.fillStyle = 'gold';
      ctx.beginPath();
      ctx.moveTo(x + 5, drawY - 10);
      ctx.lineTo(x + 15, drawY - 25);
      ctx.lineTo(x + 20, drawY - 10);
      ctx.lineTo(x + 25, drawY - 25);
      ctx.lineTo(x + 35, drawY - 10);
      ctx.fill();
    } else if (type === CharacterType.PET) {
      ctx.fillStyle = color;
      const earWag = Math.sin(animationFrame.current * 0.15) * 10;
      ctx.save();
      ctx.translate(x + 8, drawY + 10); ctx.rotate(-0.5 + earWag*0.01);
      ctx.roundRect(-10, -15, 15, 30, 10); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(x + width - 8, drawY + 10); ctx.rotate(0.5 - earWag*0.01);
      ctx.roundRect(-5, -15, 15, 30, 10); ctx.fill();
      ctx.restore();
    } else if (type === CharacterType.BOY) {
      ctx.fillStyle = '#E74C3C';
      ctx.roundRect(x - 5, drawY - 5, width + 10, 20, 5); ctx.fill();
      ctx.fillStyle = '#C0392B';
      ctx.fillRect(x + width/2, drawY - 10, width/2 + 10, 8);
    } else if (type === CharacterType.GOLDEN_SLIME) {
      ctx.shadowBlur = 20; ctx.shadowColor = 'gold';
      ctx.fillStyle = 'rgba(255,215,0,0.3)';
      ctx.roundRect(x - 5, drawY - 5, width + 10, height + 10, 25); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#C0392B';
      ctx.fillRect(x - 12, drawY + 20, width + 24, height - 20);
    }

    // Eyes - Expressive
    const blink = (animationFrame.current % 150) < 6;
    ctx.fillStyle = 'white';
    if (!blink) {
      ctx.beginPath();
      ctx.ellipse(x + 15, drawY + 30, 9, 11, 0, 0, Math.PI*2);
      ctx.ellipse(x + width - 15, drawY + 30, 9, 11, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = 'black';
      const lookX = p.vx * 0.5;
      ctx.beginPath();
      ctx.arc(x + 15 + lookX, drawY + 30, 5, 0, Math.PI*2);
      ctx.arc(x + width - 15 + lookX, drawY + 30, 5, 0, Math.PI*2);
      ctx.fill();
    } else {
      ctx.lineWidth = 3; ctx.strokeStyle = 'black';
      ctx.beginPath(); ctx.moveTo(x + 8, drawY + 30); ctx.lineTo(x + 22, drawY + 30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + width - 22, drawY + 30); ctx.lineTo(x + width - 8, drawY + 30); ctx.stroke();
    }

    ctx.restore();
  };

  const update = useCallback(() => {
    if (paused) {
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    animationFrame.current++;
    const p = player.current;

    if (keys.current['ArrowLeft']) p.vx = -MOVE_SPEED;
    else if (keys.current['ArrowRight']) p.vx = MOVE_SPEED;
    else p.vx *= 0.85;

    if (keys.current['ArrowUp'] && p.onGround) {
      p.vy = JUMP_FORCE;
      p.onGround = false;
      sounds.playJump();
    }

    p.vy += GRAVITY;
    p.x += p.vx;
    p.y += p.vy;

    const targetCam = Math.max(0, Math.min(level.width - CANVAS_WIDTH, p.x - CANVAS_WIDTH / 2));
    cameraX.current += (targetCam - cameraX.current) * 0.12;

    p.onGround = false;
    platforms.current.forEach(plat => {
      if (p.x < plat.x + plat.width && p.x + p.width > plat.x && p.y + p.height > plat.y && p.y + p.height < plat.y + plat.height + p.vy) {
        p.y = plat.y - p.height; p.vy = 0; p.onGround = true;
      }
    });

    if (p.invulnerableFrames > 0) p.invulnerableFrames--;

    enemies.current.forEach(enemy => {
      enemy.x += enemy.vx;
      if (enemy.x > enemy.startX + enemy.patrolRange || enemy.x < enemy.startX - enemy.patrolRange) enemy.vx *= -1;
      if (p.invulnerableFrames === 0 && p.x < enemy.x + enemy.width && p.x + p.width > enemy.x && p.y < enemy.y + enemy.height && p.y + p.height > enemy.y) {
        if (p.vy > 0 && p.y + p.height < enemy.y + 30) {
          enemy.y = -3000; p.vy = JUMP_FORCE / 1.5;
        } else {
          onPlayerDeath(); p.invulnerableFrames = 80; p.vx = (p.x < enemy.x) ? -15 : 15;
        }
      }
    });

    if (boss.current) {
      const b = boss.current;
      if (p.x > level.width - 900 && b.x > level.width - 480) b.x -= 5;
      b.attackCooldown--;
      if (b.attackCooldown <= 0) {
        b.state = Math.random() > 0.4 ? 'attacking' : 'charging';
        b.attackCooldown = 120 - (level.id * 2);
        if (b.state === 'attacking') {
          for(let i=0; i<6; i++) {
            b.bubbles.push({ x: b.x, y: b.y + 120, width: 45, height: 45, color: '#00FAFF', vx: -8 - Math.random() * 6, vy: -5 + Math.random() * 10 });
          }
        }
      }
      if (b.state === 'charging') {
        b.x -= 15;
        if (b.x < cameraX.current - 300) { b.x = level.width - 200; b.state = 'idle'; }
      }
      b.bubbles.forEach((bub, idx) => {
        bub.x += bub.vx; bub.y += bub.vy;
        if (p.invulnerableFrames === 0 && p.x < bub.x + bub.width && p.x + p.width > bub.x && p.y < bub.y + bub.height && p.y + p.height > bub.y) {
          onPlayerDeath(); p.invulnerableFrames = 80; b.bubbles.splice(idx, 1);
        }
      });
      if (p.x < b.x + b.width && p.x + p.width > b.x && p.y < b.y + b.height && p.y + p.height > b.y) {
        if (p.vy > 0 && p.y + p.height < b.y + 80 && p.invulnerableFrames === 0) {
          b.health--; p.vy = JUMP_FORCE; p.invulnerableFrames = 35;
          if (b.health <= 0) { b.y = -3000; setTimeout(onLevelComplete, 1500); }
        } else if (p.invulnerableFrames === 0) {
          onPlayerDeath(); p.invulnerableFrames = 80;
        }
      }
    }

    scenery.current.forEach(s => {
      if (s.speed > 0) {
        if (s.type === 'cloud') { s.x -= s.speed; if (s.x < -300) s.x = level.width + 300; }
        else if (s.type === 'bubble_bg') { s.y -= s.speed; if (s.y < -150) s.y = CANVAS_HEIGHT + 150; }
      }
    });

    if (!level.isBossLevel && p.x > level.width - 200 && !levelEnded.current) {
      levelEnded.current = true; onLevelComplete();
    }

    if (p.y > CANVAS_HEIGHT + 200) {
      p.x = Math.max(100, cameraX.current + 50); p.y = CANVAS_HEIGHT - 500; onPlayerDeath();
    }

    draw();
    requestRef.current = requestAnimationFrame(update);
  }, [level, paused, onLevelComplete, onPlayerDeath]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgGrd = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrd.addColorStop(0, level.bgColor);
    bgGrd.addColorStop(1, '#001a33');
    ctx.fillStyle = bgGrd;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.translate(-cameraX.current, 0);

    scenery.current.forEach(s => {
      ctx.save();
      // Simple parallax by applying camera offset multiplied by depth
      ctx.translate(cameraX.current * (1 - s.depth), 0);
      ctx.globalAlpha = s.depth;
      if (s.type === 'cloud') {
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.size/2, 0, Math.PI*2); ctx.arc(s.x+40, s.y-20, s.size/2.5, 0, Math.PI*2); ctx.arc(s.x+80, s.y, s.size/2, 0, Math.PI*2); ctx.fill();
      } else if (s.type === 'tree') {
        ctx.fillStyle = '#5D4037'; ctx.fillRect(s.x-15, s.y-s.size, 30, s.size);
        ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(s.x, s.y-s.size, 55, 0, Math.PI*2); ctx.arc(s.x-25, s.y-s.size+25, 45, 0, Math.PI*2); ctx.arc(s.x+25, s.y-s.size+25, 45, 0, Math.PI*2); ctx.fill();
      } else if (s.type === 'torch') {
        ctx.fillStyle = '#444'; ctx.fillRect(s.x-6, s.y, 12, 50);
        const glow = Math.sin(Date.now()*0.01)*5;
        ctx.fillStyle = '#FF9800'; ctx.beginPath(); ctx.arc(s.x, s.y, 12+glow, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();
    });

    platforms.current.forEach(plat => {
      const pGrd = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
      pGrd.addColorStop(0, plat.color); pGrd.addColorStop(1, '#0008');
      ctx.fillStyle = pGrd;
      ctx.beginPath(); ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 10); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(plat.x, plat.y, plat.width, 8);
    });

    if (boss.current && boss.current.health > 0) {
      const b = boss.current;
      ctx.save();
      ctx.translate(b.x + b.width/2, b.y + b.height/2);
      ctx.rotate(Math.sin(Date.now()*0.005)*0.15);
      ctx.fillStyle = b.state === 'charging' ? '#FF4136' : '#FF851B';
      ctx.beginPath(); ctx.arc(0, 0, b.width/2, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 12;
      for(let i=0; i<18; i++) {
        const ang = (i/18)*Math.PI*2 + (Date.now()/350);
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(ang)*(b.width/2+55), Math.sin(ang)*(b.width/2+55)); ctx.stroke();
      }
      ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(-50, -40, 40, 0, Math.PI*2); ctx.arc(50, -40, 40, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-55, -40, 18, 0, Math.PI*2); ctx.arc(45, -40, 18, 0, Math.PI*2); ctx.fill();
      ctx.lineWidth = 12; ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.arc(0, 60, 50, 0, Math.PI, true); ctx.stroke();
      ctx.restore();
      b.bubbles.forEach(bub => {
        ctx.fillStyle = bub.color; ctx.beginPath(); ctx.arc(bub.x, bub.y, bub.width/2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      });
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.roundRect(b.x, b.y-90, b.width, 30, 15); ctx.fill();
      ctx.fillStyle = '#FF4136'; ctx.roundRect(b.x+5, b.y-85, (b.health/b.maxHealth)*(b.width-10), 20, 10); ctx.fill();
    }

    if (!level.isBossLevel) {
      ctx.fillStyle = 'gold'; ctx.fillRect(level.width-120, CANVAS_HEIGHT-240, 15, 200);
      const wave = Math.sin(Date.now()*0.01)*12;
      ctx.fillStyle = '#E74C3C'; ctx.beginPath(); ctx.moveTo(level.width-105, CANVAS_HEIGHT-240); ctx.lineTo(level.width-20+wave, CANVAS_HEIGHT-210); ctx.lineTo(level.width-105, CANVAS_HEIGHT-180); ctx.fill();
    }

    enemies.current.forEach(e => {
      const wobble = Math.sin(Date.now()*0.02)*6;
      ctx.fillStyle = e.type === 'slime' ? '#9B59B6' : '#2C3E50';
      ctx.beginPath(); ctx.ellipse(e.x+25, e.y+28-wobble, 25, 22+wobble, 0, 0, Math.PI*2); ctx.fill();
    });

    drawCharacter(ctx, player.current);
    ctx.restore();
  }, [level, customAvatar, drawCharacter]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { keys.current[e.key] = e.type === 'keydown'; };
    window.addEventListener('keydown', handleKey); window.addEventListener('keyup', handleKey);
    requestRef.current = requestAnimationFrame(update);
    return () => { window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKey); cancelAnimationFrame(requestRef.current); };
  }, [update]);

  return (
    <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} 
      className="border-[16px] border-white/80 rounded-[50px] shadow-[0_30px_60px_rgba(0,0,0,0.6)] ring-8 ring-black/20" />
  );
};

export default GameEngine;
