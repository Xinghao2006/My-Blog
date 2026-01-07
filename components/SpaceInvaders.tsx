import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Trophy, ChevronLeft, ChevronRight, Target } from 'lucide-react';

interface SpaceInvadersProps {
  onBack: () => void;
}

const BOARD_WIDTH = 40;
const BOARD_HEIGHT = 40;
const PLAYER_Y = 36;
const ENEMY_ROWS = 4;
const ENEMY_COLS = 8;
const ENEMY_SPEED_START = 500;

interface Entity { id: number; x: number; y: number; }

const SpaceInvaders: React.FC<SpaceInvadersProps> = ({ onBack }) => {
  const [playerX, setPlayerX] = useState(BOARD_WIDTH / 2);
  const [bullets, setBullets] = useState<Entity[]>([]);
  const [enemies, setEnemies] = useState<Entity[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const bulletsRef = useRef<Entity[]>([]);
  const enemiesRef = useRef<Entity[]>([]);
  const directionRef = useRef(1);
  const gameLoopRef = useRef<number | null>(null);
  const enemyMoveTimerRef = useRef<number>(0);
  const currentEnemySpeedRef = useRef(ENEMY_SPEED_START);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('invaders_highscore');
    if (saved) setHighScore(parseInt(saved));
    return () => { stopBGM(); if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('invaders_highscore', score.toString());
    }
  }, [score, highScore]);

  // Audio Logic
  const initAudio = () => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (freq: number, type: OscillatorType, duration: number, vol: number, sweep?: boolean) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (sweep) {
        osc.frequency.exponentialRampToValueAtTime(1, ctx.currentTime + duration);
    }
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const startBGM = () => {
    if (bgmIntervalRef.current) clearInterval(bgmIntervalRef.current);
    let step = 0;
    const notes = [60, 58, 55, 53];
    bgmIntervalRef.current = window.setInterval(() => {
        playSound(notes[step % notes.length], 'triangle', 0.1, 0.05);
        step++;
    }, 600);
  };

  const stopBGM = () => {
    if (bgmIntervalRef.current) clearInterval(bgmIntervalRef.current);
  };

  const initGame = () => {
    initAudio();
    startBGM();
    const newEnemies: Entity[] = [];
    for (let r = 0; r < ENEMY_ROWS; r++) {
      for (let c = 0; c < ENEMY_COLS; c++) {
        newEnemies.push({ id: Math.random(), x: c * 4 + 2, y: r * 3 + 2 });
      }
    }
    setEnemies(newEnemies);
    enemiesRef.current = newEnemies;
    setBullets([]);
    bulletsRef.current = [];
    setPlayerX(BOARD_WIDTH / 2);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    directionRef.current = 1;
    currentEnemySpeedRef.current = ENEMY_SPEED_START;
    playSound(200, 'square', 0.3, 0.1, true);
  };

  const fireBullet = () => {
    if (!isPlaying) return;
    const newBullet = { id: Math.random(), x: playerX, y: PLAYER_Y - 1 };
    setBullets(prev => [...prev, newBullet]);
    bulletsRef.current.push(newBullet);
    playSound(1000, 'square', 0.1, 0.05, true);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const movePlayer = (dir: -1 | 1) => {
    setPlayerX(prev => Math.max(1, Math.min(BOARD_WIDTH - 2, prev + dir)));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft') movePlayer(-1);
      if (e.key === 'ArrowRight') movePlayer(1);
      if (e.key === ' ' || e.key === 'ArrowUp') fireBullet();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, playerX]);

  useEffect(() => {
    if (isPlaying) {
      let lastTime = performance.now();
      const loop = (time: number) => {
        const delta = time - lastTime;
        lastTime = time;
        bulletsRef.current = bulletsRef.current.map(b => ({ ...b, y: b.y - 0.5 })).filter(b => b.y > 0);
        enemyMoveTimerRef.current += delta;
        if (enemyMoveTimerRef.current > currentEnemySpeedRef.current) {
           enemyMoveTimerRef.current = 0;
           let moveDown = false;
           const leftEdge = Math.min(...enemiesRef.current.map(e => e.x));
           const rightEdge = Math.max(...enemiesRef.current.map(e => e.x));
           if ((rightEdge >= BOARD_WIDTH - 2 && directionRef.current === 1) || (leftEdge <= 1 && directionRef.current === -1)) {
              directionRef.current *= -1;
              moveDown = true;
           }
           enemiesRef.current = enemiesRef.current.map(e => ({ ...e, x: moveDown ? e.x : e.x + directionRef.current, y: moveDown ? e.y + 1 : e.y }));
           if (enemiesRef.current.some(e => e.y >= PLAYER_Y - 1)) {
             setGameOver(true);
             setIsPlaying(false);
             stopBGM();
             playSound(100, 'sawtooth', 0.5, 0.2);
             if (navigator.vibrate) navigator.vibrate(400);
             return; 
           }
        }
        const nextBullets: Entity[] = [];
        const hitEnemyIds = new Set<number>();
        bulletsRef.current.forEach(b => {
           let hit = false;
           enemiesRef.current.forEach(e => {
              if (!hit && Math.abs(b.x - e.x) < 2 && Math.abs(b.y - e.y) < 1.5) {
                 hit = true;
                 hitEnemyIds.add(e.id);
                 setScore(s => s + 10);
                 playSound(50, 'sawtooth', 0.1, 0.1);
              }
           });
           if (!hit) nextBullets.push(b);
        });
        bulletsRef.current = nextBullets;
        enemiesRef.current = enemiesRef.current.filter(e => !hitEnemyIds.has(e.id));
        const count = enemiesRef.current.length;
        if (count === 0 && isPlaying) {
             initGame(); 
             setScore(s => s + 100);
             currentEnemySpeedRef.current = Math.max(100, currentEnemySpeedRef.current - 50);
        } else {
             currentEnemySpeedRef.current = Math.max(50, ENEMY_SPEED_START - ((ENEMY_ROWS * ENEMY_COLS) - count) * 10);
        }
        setBullets([...bulletsRef.current]);
        setEnemies([...enemiesRef.current]);
        if (isPlaying && !gameOver) {
            gameLoopRef.current = requestAnimationFrame(loop);
        }
      };
      gameLoopRef.current = requestAnimationFrame(loop);
    } else {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [isPlaying, gameOver]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center font-mono relative select-none bg-[#0f0f1a]">
       <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
       <button onClick={() => { stopBGM(); onBack(); }} className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">返回</span>
       </button>
       <div className="absolute top-6 right-6 z-50 flex items-center gap-2 text-purple-400 font-bold bg-black/30 px-4 py-2 rounded-full border border-white/10">
            <Trophy size={16} /> 
            <span className="text-sm">HI: {highScore}</span>
       </div>
       <div className="bg-[#2a2a35] p-2 sm:p-4 rounded-xl shadow-2xl border-4 border-[#3a3a45] relative z-10 w-full max-w-[340px] transform scale-95 sm:scale-100">
           <div className="w-full aspect-[3/4] bg-[#000] relative overflow-hidden border-2 border-[#111]">
                <div className="absolute top-2 left-2 text-white font-mono text-[10px] z-20">SCORE: {score}</div>
                <div className="w-full h-full relative">
                    <div className="absolute bottom-4 w-6 h-4 bg-green-400" style={{ left: `${(playerX / BOARD_WIDTH) * 100}%`, transform: 'translateX(-50%)', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                    {enemies.map(e => (
                        <div key={e.id} className="absolute w-4 h-3 bg-purple-500 animate-pulse" style={{ left: `${(e.x / BOARD_WIDTH) * 100}%`, top: `${(e.y / BOARD_HEIGHT) * 100}%`, transform: 'translateX(-50%)', clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' }}></div>
                    ))}
                    {bullets.map(b => (
                        <div key={b.id} className="absolute w-1 h-2 bg-yellow-400" style={{ left: `${(b.x / BOARD_WIDTH) * 100}%`, top: `${(b.y / BOARD_HEIGHT) * 100}%`, transform: 'translateX(-50%)' }}></div>
                    ))}
                </div>
                {(!isPlaying || gameOver) && (
                   <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-green-400 z-30">
                       <h2 className="text-xl sm:text-2xl font-black mb-2 tracking-widest text-purple-400 text-center uppercase">Space<br/>Sounds</h2>
                       {gameOver && <p className="mb-4 font-bold text-red-500">GAME OVER</p>}
                       <button onClick={initGame} className="animate-pulse font-bold text-xs sm:text-sm border-2 border-green-500 px-6 py-2 hover:bg-green-500 hover:text-black transition-colors uppercase">
                          {gameOver ? 'Retry' : 'Insert Coin'}
                       </button>
                   </div>
               )}
           </div>
           <div className="mt-4 mb-4 text-center">
               <span className="font-sans font-bold italic text-purple-500 text-base sm:text-lg tracking-[0.5em] opacity-50">DEFENDER</span>
           </div>
           <div className="flex justify-between items-center px-2 sm:px-4 pb-4 gap-4">
               <div className="flex gap-2 sm:gap-4">
                   <button className="w-12 h-12 bg-[#444] rounded-full shadow-lg active:bg-[#222] flex items-center justify-center" onPointerDown={() => movePlayer(-1)}><ChevronLeft className="text-gray-200" /></button>
                   <button className="w-12 h-12 bg-[#444] rounded-full shadow-lg active:bg-[#222] flex items-center justify-center" onPointerDown={() => movePlayer(1)}><ChevronRight className="text-gray-200" /></button>
               </div>
               <button className="w-14 h-14 sm:w-16 sm:h-16 bg-red-600 rounded-full shadow-lg active:bg-red-800 flex items-center justify-center border-4 border-[#3a3a45]" onPointerDown={fireBullet} onClick={fireBullet}><Target className="text-white w-6 h-6 sm:w-8 sm:h-8" /></button>
           </div>
       </div>
    </div>
  );
};

export default SpaceInvaders;