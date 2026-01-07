import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Trophy, RotateCw, ChevronDown, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface TetrisBlockProps { onBack: () => void; }

const ROWS = 20;
const COLS = 10;
const INITIAL_SPEED = 800;
const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: 'bg-cyan-500' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-blue-500' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-500' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-500' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-500' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-500' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500' },
};
type TetrominoType = keyof typeof TETROMINOS;
const createBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const TetrisBlock: React.FC<TetrisBlockProps> = ({ onBack }) => {
  const [board, setBoard] = useState<(string | 0)[][]>(createBoard());
  const [currentPiece, setCurrentPiece] = useState<{ type: TetrominoType; shape: number[][]; x: number; y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const speedRef = useRef(INITIAL_SPEED);
  const gameLoopRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tetris_highscore');
    if (saved) setHighScore(parseInt(saved));
    return () => { stopBGM(); if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('tetris_highscore', score.toString());
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
    if (bgmIntervalRef.current) clearInterval(bgmIntervalRef.current);
    let step = 0;
    const melody = [330, 247, 262, 294, 262, 247, 220, 220, 262, 330, 294, 262, 247, 262, 294, 330, 262, 220, 220];
    bgmIntervalRef.current = window.setInterval(() => {
        playSound(melody[step % melody.length], 'square', 0.2, 0.03);
        step++;
    }, 400);
  };

  const stopBGM = () => { if (bgmIntervalRef.current) clearInterval(bgmIntervalRef.current); };

  const getRandomPiece = () => {
    const types = Object.keys(TETROMINOS) as TetrominoType[];
    const type = types[Math.floor(Math.random() * types.length)];
    const shape = TETROMINOS[type].shape;
    return { type, shape, x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 };
  };

  const checkCollision = (piece: typeof currentPiece, moveX: number, moveY: number, newShape?: number[][]) => {
    if (!piece) return true;
    const shape = newShape || piece.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = piece.x + x + moveX;
          const newY = piece.y + y + moveY;
          if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX] !== 0)) return true;
        }
      }
    }
    return false;
  };

  const initGame = () => {
    initAudio();
    startBGM();
    setBoard(createBoard());
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    speedRef.current = INITIAL_SPEED;
    setCurrentPiece(getRandomPiece());
    playSound(523, 'square', 0.2, 0.1);
  };

  const mergeBoard = () => {
    if (!currentPiece) return;
    const newBoard = [...board.map(row => [...row])];
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value && currentPiece.y + y >= 0 && currentPiece.y + y < ROWS) {
            newBoard[currentPiece.y + y][currentPiece.x + x] = currentPiece.type;
        }
      });
    });
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(COLS).fill(0));
        linesCleared++;
        y++;
      }
    }
    if (linesCleared > 0) {
      const points = [0, 100, 300, 500, 800][linesCleared];
      setScore(prev => prev + points);
      speedRef.current = Math.max(100, speedRef.current - (linesCleared * 20));
      playSound(1000, 'square', 0.3, 0.1);
      if (navigator.vibrate) navigator.vibrate(50);
    } else {
      playSound(100, 'square', 0.05, 0.05);
    }
    setBoard(newBoard);
    const next = getRandomPiece();
    if (checkCollision(next, 0, 0)) {
        setGameOver(true);
        setIsPlaying(false);
        stopBGM();
        playSound(100, 'sawtooth', 0.5, 0.2);
        if (navigator.vibrate) navigator.vibrate(200);
    } else {
        setCurrentPiece(next);
    }
  };

  const move = (dirX: number, dirY: number) => {
    if (!isPlaying || gameOver || !currentPiece) return;
    if (!checkCollision(currentPiece, dirX, dirY)) {
      setCurrentPiece({ ...currentPiece, x: currentPiece.x + dirX, y: currentPiece.y + dirY });
      if (dirX !== 0) playSound(150, 'square', 0.05, 0.02);
    } else if (dirY > 0) {
      mergeBoard();
    }
  };

  const rotate = () => {
    if (!isPlaying || gameOver || !currentPiece) return;
    const rotatedShape = currentPiece.shape[0].map((_, index) => currentPiece.shape.map(row => row[index]).reverse());
    if (!checkCollision(currentPiece, 0, 0, rotatedShape)) {
        setCurrentPiece({ ...currentPiece, shape: rotatedShape });
        playSound(300, 'square', 0.05, 0.05);
    }
  };

  useEffect(() => {
      if (isPlaying && !gameOver) {
          gameLoopRef.current = window.setInterval(() => move(0, 1), speedRef.current);
      }
      return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [isPlaying, gameOver, currentPiece, board]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isPlaying || gameOver) return;
        if (e.key === 'ArrowLeft') move(-1, 0);
        if (e.key === 'ArrowRight') move(1, 0);
        if (e.key === 'ArrowDown') move(0, 1);
        if (e.key === 'ArrowUp') rotate();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver, currentPiece, board]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center font-mono relative select-none bg-[#2d3748]">
       <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
       <button onClick={() => { stopBGM(); onBack(); }} className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">返回</span>
       </button>
       <div className="absolute top-6 right-6 z-50 flex items-center gap-2 text-orange-400 font-bold bg-black/30 px-4 py-2 rounded-full border border-white/10">
            <Trophy size={16} /> 
            <span className="text-sm">HI: {highScore}</span>
       </div>
       <div className="bg-[#c0c0c0] p-4 sm:p-6 rounded-b-3xl rounded-t-lg shadow-2xl border-b-8 border-gray-400 relative z-10 w-full max-w-[340px] transform scale-90 sm:scale-100">
           <div className="bg-[#555] p-4 rounded-t-lg rounded-b-[30px] sm:rounded-b-[40px] relative shadow-inner">
               <div className="text-[8px] sm:text-[10px] text-gray-400 mb-1 flex justify-between uppercase tracking-widest font-bold">
                   <span>Tetris Chiptune</span>
                   <span>Score: {score}</span>
               </div>
               <div className="w-full aspect-[10/20] bg-[#9bbc0f] relative shadow-inner overflow-hidden border-2 border-[#8b9c0f]">
                   <div className="grid w-full h-full" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
                       {board.map((row, y) => row.map((cell, x) => {
                           let isActive = false;
                           if (currentPiece) {
                               const pY = y - currentPiece.y, pX = x - currentPiece.x;
                               if (pY >= 0 && pY < currentPiece.shape.length && pX >= 0 && pX < currentPiece.shape[0].length && currentPiece.shape[pY][pX]) isActive = true;
                           }
                           return <div key={`${y}-${x}`} className={`w-full h-full border-[0.5px] border-[#8b9c0f]/30 ${cell !== 0 || isActive ? 'bg-[#0f380f] shadow-inner' : ''}`} />;
                       }))}
                   </div>
                   {(!isPlaying || gameOver) && (
                       <div className="absolute inset-0 bg-[#9bbc0f]/80 flex flex-col items-center justify-center p-4 text-[#0f380f] z-20">
                           <h2 className="text-xl sm:text-2xl font-black mb-2 tracking-widest">TETRIS</h2>
                           {gameOver && <p className="mb-4 font-bold">GAME OVER</p>}
                           <button onClick={initGame} className="animate-pulse font-bold text-xs sm:text-sm border-2 border-[#0f380f] px-4 py-2 hover:bg-[#0f380f] hover:text-[#9bbc0f] transition-colors uppercase">
                              {gameOver ? 'RETRY' : 'START GAME'}
                           </button>
                       </div>
                   )}
               </div>
           </div>
           <div className="mt-4 mb-6 pl-2 flex items-baseline gap-1">
               <span className="font-sans font-bold italic text-blue-800 text-base sm:text-lg tracking-wide">Retro</span>
               <span className="font-sans text-blue-800 text-xs sm:text-sm">BLOCKS</span>
           </div>
           <div className="flex justify-between items-center px-2 sm:px-4 pb-8">
               <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-[#333] rounded-t shadow-md cursor-pointer" onPointerDown={() => rotate()}><RotateCw className="w-full h-full p-1.5 text-[#555]" /></div>
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-[#333] rounded-b shadow-md cursor-pointer" onPointerDown={() => move(0, 1)}><ChevronDown className="w-full h-full p-1 text-[#555]" /></div>
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-[#333] rounded-l shadow-md cursor-pointer" onPointerDown={() => move(-1, 0)}><ChevronLeft className="w-full h-full p-1 text-[#555]" /></div>
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-[#333] rounded-r shadow-md cursor-pointer" onPointerDown={() => move(1, 0)}><ChevronRight className="w-full h-full p-1 text-[#555]" /></div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-[#333]"></div>
               </div>
               <div className="flex gap-4 rotate-[-15deg] translate-y-4">
                   <div className="flex flex-col items-center gap-1">
                       <button onClick={rotate} className="w-10 h-10 sm:w-12 sm:h-12 bg-red-800 rounded-full shadow-lg active:shadow-none active:translate-y-[2px] transition-transform flex items-center justify-center"><RotateCw size={18} className="text-red-900/50" /></button>
                       <span className="font-bold text-gray-500 text-[10px]">ROTATE</span>
                   </div>
               </div>
           </div>
           <div className="flex justify-center gap-8 px-10 sm:px-12 mb-2">
               <div className="flex flex-col items-center">
                   <button onClick={() => { if(isPlaying) { setIsPlaying(false); stopBGM(); } else { setIsPlaying(true); startBGM(); } }} className="w-10 h-2 sm:w-12 sm:h-3 bg-gray-500 rounded-full transform rotate-[25deg] shadow-sm"></button>
                   <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-wider">Pause</span>
               </div>
               <div className="flex flex-col items-center">
                   <button onClick={initGame} className="w-10 h-2 sm:w-12 sm:h-3 bg-gray-500 rounded-full transform rotate-[25deg] shadow-sm"></button>
                   <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-wider">Start</span>
               </div>
           </div>
       </div>
    </div>
  );
};

export default TetrisBlock;