import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface RetroSnakeProps {
  onBack: () => void;
}

const GRID_SIZE = 20;
const SPEED = 120;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const RetroSnake: React.FC<RetroSnakeProps> = ({ onBack }) => {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const gameLoopRef = useRef<number | null>(null);
  const directionRef = useRef<Direction>('RIGHT');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('snake_highscore');
    if (saved) setHighScore(parseInt(saved));
    return () => stopBGM();
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake_highscore', score.toString());
    }
  }, [score, highScore]);

  // Audio Logic
  const initAudio = () => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (freq: number, type: OscillatorType, duration: number, vol: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const startBGM = () => {
    if (!audioCtxRef.current) return;
    stopBGM();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    bgmRef.current = { osc, gain };

    // Simple rhythmic modulation
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 2; 
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 10;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();
  };

  const stopBGM = () => {
    if (bgmRef.current) {
        bgmRef.current.osc.stop();
        bgmRef.current.osc.disconnect();
        bgmRef.current.gain.disconnect();
        bgmRef.current = null;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (directionRef.current !== 'DOWN') changeDir('UP'); break;
        case 'ArrowDown': if (directionRef.current !== 'UP') changeDir('DOWN'); break;
        case 'ArrowLeft': if (directionRef.current !== 'RIGHT') changeDir('LEFT'); break;
        case 'ArrowRight': if (directionRef.current !== 'LEFT') changeDir('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const changeDir = (newDir: Direction) => {
      setDirection(newDir);
      directionRef.current = newDir;
      playSound(150, 'square', 0.05, 0.02);
  };

  const spawnFood = () => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  };

  const resetGame = () => {
    initAudio();
    startBGM();
    setSnake([{ x: 10, y: 10 }]);
    setFood(spawnFood());
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    playSound(440, 'square', 0.2, 0.1);
  };

  const gameOverLogic = () => {
    setIsPlaying(false);
    setGameOver(true);
    stopBGM();
    playSound(100, 'sawtooth', 0.5, 0.2);
    if (navigator.vibrate) navigator.vibrate(200);
  };

  useEffect(() => {
    if (isPlaying) {
      gameLoopRef.current = window.setInterval(() => {
        setSnake((prevSnake) => {
          const head = prevSnake[0];
          const newHead = { ...head };

          switch (directionRef.current) {
            case 'UP': newHead.y -= 1; break;
            case 'DOWN': newHead.y += 1; break;
            case 'LEFT': newHead.x -= 1; break;
            case 'RIGHT': newHead.x += 1; break;
          }

          if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
            gameOverLogic();
            return prevSnake;
          }

          if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
             gameOverLogic();
             return prevSnake;
          }

          const newSnake = [newHead, ...prevSnake];

          if (newHead.x === food.x && newHead.y === food.y) {
            setScore(s => s + 10);
            setFood(spawnFood());
            playSound(880, 'square', 0.1, 0.1);
            if (navigator.vibrate) navigator.vibrate(50);
          } else {
            newSnake.pop();
          }

          return newSnake;
        });
      }, SPEED);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, food]);


  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center font-mono relative select-none bg-[#2d3748]">
       <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

       <button onClick={() => { stopBGM(); onBack(); }} className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">返回</span>
       </button>

       <div className="absolute top-6 right-6 z-50 flex items-center gap-2 text-yellow-400 font-bold bg-black/30 px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <Trophy size={16} /> 
            <span className="text-sm">HI: {highScore}</span>
       </div>

       <div className="bg-[#c0c0c0] p-4 sm:p-6 rounded-b-3xl rounded-t-lg shadow-2xl border-b-8 border-gray-400 relative z-10 w-full max-w-[340px] transform scale-90 sm:scale-100">
           <div className="bg-[#555] p-4 rounded-t-lg rounded-b-[30px] sm:rounded-b-[40px] relative shadow-inner">
               <div className="text-[8px] sm:text-[10px] text-gray-400 mb-1 flex justify-between uppercase tracking-widest font-bold">
                   <span>Snake 8-bit</span>
                   <span>Score: {score}</span>
               </div>
               
               <div className="w-full aspect-square bg-[#9bbc0f] relative shadow-inner overflow-hidden border-2 border-[#8b9c0f]">
                   <div className="grid w-full h-full" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` }}>
                       {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                           const x = i % GRID_SIZE;
                           const y = Math.floor(i / GRID_SIZE);
                           const isSnake = snake.some(s => s.x === x && s.y === y);
                           const isFood = food.x === x && food.y === y;
                           return <div key={i} className={`w-full h-full border-[0.5px] border-[#8b9c0f]/20 ${isSnake ? 'bg-[#0f380f]' : ''} ${isFood ? 'bg-[#306230] rounded-full scale-75' : ''}`} />;
                       })}
                   </div>

                   {(!isPlaying || gameOver) && (
                       <div className="absolute inset-0 bg-[#9bbc0f]/80 flex flex-col items-center justify-center p-4 text-[#0f380f] z-20">
                           <h2 className="text-xl sm:text-2xl font-black mb-2 tracking-widest">{gameOver ? 'GAME OVER' : 'SNAKE'}</h2>
                           {gameOver && <p className="mb-4 font-bold">SCORE: {score}</p>}
                           <button onClick={resetGame} className="animate-pulse font-bold text-xs sm:text-sm border-2 border-[#0f380f] px-4 py-2 hover:bg-[#0f380f] hover:text-[#9bbc0f] transition-colors">
                              {gameOver ? 'TRY AGAIN' : 'START GAME'}
                           </button>
                       </div>
                   )}
               </div>
           </div>

           <div className="mt-4 mb-6 pl-2 flex items-baseline gap-1">
               <span className="font-sans font-bold italic text-blue-800 text-base sm:text-lg tracking-wide">Retro</span>
               <span className="font-sans text-blue-800 text-xs sm:text-sm">SOUNDS</span>
           </div>

           <div className="flex justify-between items-center px-2 sm:px-4 pb-6 sm:pb-8">
               <div className="relative w-20 h-20 sm:w-28 sm:h-28">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-[#333] rounded-t shadow-md cursor-pointer" onClick={() => { if(direction !== 'DOWN') changeDir('UP') }}>
                        <ChevronUp className="w-full h-full p-1 text-[#555]" />
                   </div>
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-[#333] rounded-b shadow-md cursor-pointer" onClick={() => { if(direction !== 'UP') changeDir('DOWN') }}>
                        <ChevronDown className="w-full h-full p-1 text-[#555]" />
                   </div>
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-[#333] rounded-l shadow-md cursor-pointer" onClick={() => { if(direction !== 'RIGHT') changeDir('LEFT') }}>
                        <ChevronLeft className="w-full h-full p-1 text-[#555]" />
                   </div>
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-[#333] rounded-r shadow-md cursor-pointer" onClick={() => { if(direction !== 'LEFT') changeDir('RIGHT') }}>
                        <ChevronRight className="w-full h-full p-1 text-[#555]" />
                   </div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-[#333]"></div>
               </div>

               <div className="flex gap-4 rotate-[-15deg] translate-y-4">
                   <div className="flex flex-col items-center gap-1">
                       <button onClick={resetGame} className="w-8 h-8 sm:w-10 sm:h-10 bg-red-800 rounded-full shadow-lg active:shadow-none active:translate-y-[2px] transition-transform"></button>
                       <span className="font-bold text-gray-500 text-[10px]">B</span>
                   </div>
                   <div className="flex flex-col items-center gap-1 mt-[-10px]">
                       <button onClick={() => { if(!isPlaying) resetGame(); }} className="w-8 h-8 sm:w-10 sm:h-10 bg-red-800 rounded-full shadow-lg active:shadow-none active:translate-y-[2px] transition-transform"></button>
                       <span className="font-bold text-gray-500 text-[10px]">A</span>
                   </div>
               </div>
           </div>

           <div className="flex justify-center gap-6 sm:gap-8 px-10 sm:px-12 mb-2">
               <div className="flex flex-col items-center">
                   <div className="w-8 h-2 sm:w-12 sm:h-3 bg-gray-500 rounded-full transform rotate-[25deg]"></div>
                   <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-wider">Select</span>
               </div>
               <div className="flex flex-col items-center">
                   <button onClick={resetGame} className="w-8 h-2 sm:w-12 sm:h-3 bg-gray-500 rounded-full transform rotate-[25deg] shadow-sm"></button>
                   <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-wider">Start</span>
               </div>
           </div>
       </div>
    </div>
  );
};

export default RetroSnake;