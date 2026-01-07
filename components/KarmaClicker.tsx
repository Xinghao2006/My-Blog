import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Zap, Volume2, VolumeX } from 'lucide-react';

interface KarmaClickerProps {
  onBack: () => void;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
}

const KarmaClicker: React.FC<KarmaClickerProps> = ({ onBack }) => {
  const [count, setCount] = useState(0);
  const [clicks, setClicks] = useState<FloatingText[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  
  // Audio Context for low latency sound synthesis (No external assets needed)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const autoClickerRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('karma_count');
    if (saved) setCount(parseInt(saved));
    
    // Init Audio Context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtxRef.current = new AudioContextClass();
    
    return () => {
       if (autoClickerRef.current) clearInterval(autoClickerRef.current);
       if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('karma_count', count.toString());
  }, [count]);

  useEffect(() => {
    if (autoPlay) {
        autoClickerRef.current = window.setInterval(() => {
            // Randomize position slightly for auto clicks
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            triggerHit(cx, cy, true);
        }, 800); // 800ms interval for auto mode
    } else {
        if (autoClickerRef.current) clearInterval(autoClickerRef.current);
    }
  }, [autoPlay]);

  const playWoodSound = () => {
      if (isMuted || !audioCtxRef.current) return;
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const t = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Synthesize a wood block sound
      // Sine wave with rapid frequency drop and short decay
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
      
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.15);
  };

  const triggerHit = (x: number, y: number, isAuto: boolean = false) => {
      setCount(prev => prev + 1);
      playWoodSound();
      
      // Add floating text
      const id = Date.now() + Math.random();
      const text = isAuto ? "自动积德 +1" : "功德 +1";
      // Randomize position slightly around center if auto
      const finalX = isAuto ? x + (Math.random() - 0.5) * 100 : x;
      const finalY = isAuto ? y + (Math.random() - 0.5) * 100 : y;

      setClicks(prev => [...prev, { id, x: finalX, y: finalY, text }]);
      
      // Cleanup text
      setTimeout(() => {
          setClicks(prev => prev.filter(c => c.id !== id));
      }, 1000);

      // Vibration (Haptic Feedback)
      if (navigator.vibrate && !isAuto) navigator.vibrate(15);
  };

  const handleClick = (e: React.MouseEvent) => {
      // Prevent double trigger on buttons
      if ((e.target as HTMLElement).closest('button')) return;
      triggerHit(e.clientX, e.clientY);
  };

  return (
    <div className="min-h-screen w-full bg-[#1c1917] text-stone-200 flex flex-col font-sans relative overflow-hidden select-none touch-manipulation">
        
        {/* Background Zen Circles */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-stone-800/50 rounded-full opacity-50 pointer-events-none animate-[spin_60s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-stone-800 rounded-full opacity-50 pointer-events-none"></div>

        {/* Header */}
        <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-stone-500 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm"
            >
                <ArrowLeft size={16} /> 返回
            </button>
            <div className="flex gap-4">
                 <button 
                    onClick={() => setAutoPlay(!autoPlay)} 
                    className={`p-3 rounded-full transition-all flex items-center gap-2 ${autoPlay ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-stone-800 text-stone-500'}`}
                    title="自动积德"
                 >
                    <Zap size={20} className={autoPlay ? 'fill-current' : ''} />
                    {autoPlay && <span className="text-xs font-bold">AUTO</span>}
                </button>
                <button 
                    onClick={() => setIsMuted(!isMuted)} 
                    className="p-3 bg-stone-800 rounded-full text-stone-500 hover:text-white transition-colors"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full cursor-pointer" onClick={handleClick}>
            
            {/* Counter */}
            <div className="mb-16 text-center select-none pointer-events-none">
                <div className="text-xs font-bold tracking-[0.5em] text-stone-600 uppercase mb-4">Current Merit</div>
                <div className="text-6xl md:text-8xl font-serif-title font-bold text-white tabular-nums tracking-tighter drop-shadow-2xl">
                    {count}
                </div>
            </div>

            {/* Wooden Fish Visual (CSS Shapes) */}
            <div className="relative group active:scale-95 transition-transform duration-75">
                 {/* Stick - Animated */}
                 <div className="absolute -right-12 -top-12 w-32 h-6 bg-stone-700 rounded-full transform rotate-45 origin-bottom-left transition-all duration-75 group-active:rotate-[25deg] group-active:translate-y-4 z-10 shadow-xl"></div>
                 <div className="absolute -right-16 -top-16 w-12 h-12 bg-stone-600 rounded-full transform z-20 shadow-lg"></div>

                 {/* Fish Body */}
                 <div className="w-48 h-40 md:w-64 md:h-52 bg-gradient-to-br from-stone-800 to-stone-900 rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] relative border-b-8 border-black flex items-center justify-center overflow-hidden">
                    {/* Texture */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
                    
                    {/* Eye/Opening */}
                    <div className="w-24 h-4 bg-black/60 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"></div>
                 </div>
                 
                 {/* Ripple Effect Container */}
                 <div className="absolute inset-0 rounded-[3rem] animate-ping opacity-0 group-active:opacity-30 bg-amber-500/20 pointer-events-none duration-300"></div>
            </div>

            <p className="mt-20 text-stone-600 text-xs tracking-widest uppercase animate-pulse pointer-events-none">
                Tap anywhere to accumulate merit
            </p>

        </div>

        {/* Floating Text Overlay */}
        {clicks.map(c => (
            <div 
                key={c.id}
                className="fixed pointer-events-none text-amber-400 font-bold text-xl animate-float-up z-50 shadow-black drop-shadow-md"
                style={{ left: c.x, top: c.y }}
            >
                {c.text}
            </div>
        ))}
        
        <style>{`
            @keyframes float-up {
                0% { opacity: 1; transform: translate(-50%, -50%) scale(0.8); }
                100% { opacity: 0; transform: translate(-50%, -200%) scale(1.2); }
            }
            .animate-float-up {
                animation: float-up 0.8s cubic-bezier(0, 0, 0.2, 1) forwards;
            }
        `}</style>
    </div>
  );
};

export default KarmaClicker;