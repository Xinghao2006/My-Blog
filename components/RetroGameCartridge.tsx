import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Coffee, Sword, Brain, Zap, History, Trophy } from 'lucide-react';

interface RetroGameCartridgeProps {
  onBack: () => void;
}

type TimerMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

const MODES = {
    FOCUS: { label: 'BOSS FIGHT', minutes: 25, color: 'text-red-500', barColor: 'bg-red-500', icon: <Sword size={18} /> },
    SHORT_BREAK: { label: 'BONFIRE REST', minutes: 5, color: 'text-emerald-400', barColor: 'bg-emerald-500', icon: <Coffee size={18} /> },
    LONG_BREAK: { label: 'TOWN VISIT', minutes: 15, color: 'text-blue-400', barColor: 'bg-blue-500', icon: <Brain size={18} /> }
};

const RetroGameCartridge: React.FC<RetroGameCartridgeProps> = ({ onBack }) => {
  // Timer State
  const [mode, setMode] = useState<TimerMode>('FOCUS');
  const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [taskName, setTaskName] = useState('UNNAMED BOSS');
  
  // Stats State (Session persistence)
  const [stats, setStats] = useState({ battlesWon: 0, totalFocusMinutes: 0 });

  const timerRef = useRef<number | null>(null);

  // Load Stats
  useEffect(() => {
      const saved = localStorage.getItem('focus_stats');
      if (saved) setStats(JSON.parse(saved));
  }, []);

  // Save Stats
  useEffect(() => {
      localStorage.setItem('focus_stats', JSON.stringify(stats));
  }, [stats]);

  // Timer Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
        timerRef.current = window.setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
    } else if (timeLeft === 0) {
        // Timer Finished
        handleTimerComplete();
    }

    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Play Sound (Simple Beep via AudioContext usually better, but keeping simple here)
      // const audio = new Audio('...'); audio.play();

      if (mode === 'FOCUS') {
          setStats(prev => ({
              battlesWon: prev.battlesWon + 1,
              totalFocusMinutes: prev.totalFocusMinutes + MODES.FOCUS.minutes
          }));
          // Auto switch to break? Or let user choose. Let's notify.
          if (Notification.permission === 'granted') {
            new Notification("Victory!", { body: "Boss Defeated. Take a rest at the bonfire." });
          }
          alert("VICTORY! Boss defeated.\nXP Gained.\nTime to rest.");
          switchMode('SHORT_BREAK');
      } else {
          alert("Rest complete. Prepared for the next battle?");
          switchMode('FOCUS');
      }
  };

  const switchMode = (newMode: TimerMode) => {
      setIsActive(false);
      setMode(newMode);
      setTimeLeft(MODES[newMode].minutes * 60);
  };

  const toggleTimer = () => {
      if (!isActive && Notification.permission !== 'granted') {
          Notification.requestPermission();
      }
      setIsActive(!isActive);
  };

  const resetTimer = () => {
      setIsActive(false);
      setTimeLeft(MODES[mode].minutes * 60);
  };

  // Helper for formatting mm:ss
  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate HP Bar Percentage
  const maxTime = MODES[mode].minutes * 60;
  const hpPercent = (timeLeft / maxTime) * 100;

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center font-mono relative overflow-hidden select-none">
        
        {/* CRT Scanline Effect */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] opacity-20"></div>
        <div className="absolute inset-0 z-0 bg-[#0a0a0a]"></div>

        {/* --- Top Bar: Stats --- */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20">
             <button 
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-bold bg-white/5 px-3 py-1.5 rounded-sm border border-white/10"
            >
                <ArrowLeft size={14} /> ESCAPE
            </button>

            <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold tracking-widest">
                    <Trophy size={14} />
                    <span>SCORE: {stats.battlesWon * 1000}</span>
                </div>
                <div className="text-[10px] text-gray-600">
                    PLAY TIME: {Math.floor(stats.totalFocusMinutes / 60)}H {stats.totalFocusMinutes % 60}M
                </div>
            </div>
        </div>

        {/* --- Main Game HUD --- */}
        <div className="relative z-20 w-full max-w-2xl px-6 flex flex-col gap-8">
            
            {/* 1. Boss Name (Task Input) */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-red-900/30 border border-red-500/30 rounded text-[10px] text-red-400 font-bold tracking-[0.2em] animate-pulse">
                    ⚠️ WARNING: BOSS APPROACHING
                </div>
                <input 
                    type="text" 
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="w-full bg-transparent text-center text-2xl md:text-4xl font-black text-white outline-none placeholder:text-gray-800 uppercase tracking-tight caret-red-500"
                    placeholder="ENTER MISSION NAME"
                />
            </div>

            {/* 2. HP Bar (Timer Visual) */}
            <div className="w-full space-y-2">
                <div className="flex justify-between items-end px-1">
                    <span className={`text-sm font-bold flex items-center gap-2 ${MODES[mode].color}`}>
                        {MODES[mode].icon} {MODES[mode].label}
                    </span>
                    <span className="text-sm font-bold text-gray-500">HP {Math.ceil(hpPercent)}%</span>
                </div>
                
                {/* Bar Container */}
                <div className="h-8 w-full bg-[#1a1a1a] border-2 border-gray-700 p-1 relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    {/* The Bar */}
                    <div 
                        className={`h-full transition-all duration-1000 ease-linear ${MODES[mode].barColor} relative overflow-hidden`}
                        style={{ width: `${hpPercent}%` }}
                    >
                        {/* Shine effect */}
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20"></div>
                    </div>
                    
                    {/* Grid lines overlay */}
                    <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhZWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-30 pointer-events-none"></div>
                </div>
            </div>

            {/* 3. Timer Digits (Big) */}
            <div className="text-center my-4">
                <div className={`text-[6rem] md:text-[8rem] leading-none font-black tracking-tighter tabular-nums transition-colors ${
                    isActive ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-gray-700'
                }`}>
                    {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-gray-500 font-bold tracking-[0.5em] mt-2">
                    {isActive ? '>>> BATTLE IN PROGRESS <<<' : 'PAUSED'}
                </div>
            </div>

            {/* 4. Controls */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto w-full">
                <button 
                    onClick={toggleTimer}
                    className={`
                        col-span-2 group relative py-4 px-6 border-b-4 active:border-b-0 active:translate-y-1 transition-all
                        flex items-center justify-center gap-3 font-bold text-lg tracking-wider
                        ${isActive 
                            ? 'bg-yellow-600 border-yellow-800 hover:bg-yellow-500 text-white' 
                            : 'bg-emerald-600 border-emerald-800 hover:bg-emerald-500 text-white'}
                    `}
                >
                    {isActive ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                    <span>{isActive ? 'PAUSE' : 'FIGHT'}</span>
                </button>

                <button 
                    onClick={resetTimer}
                    className="bg-gray-700 border-b-4 border-gray-900 hover:bg-gray-600 text-white active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center"
                    title="Restart Level"
                >
                    <RotateCcw size={20} />
                </button>
            </div>

            {/* 5. Mode Switcher */}
            <div className="flex justify-center gap-4 mt-8 opacity-50 hover:opacity-100 transition-opacity">
                <button onClick={() => switchMode('FOCUS')} className={`p-2 rounded hover:bg-white/10 ${mode === 'FOCUS' ? 'text-red-500 ring-1 ring-red-500' : 'text-gray-500'}`} title="Focus Mode">
                    <Sword size={20} />
                </button>
                <button onClick={() => switchMode('SHORT_BREAK')} className={`p-2 rounded hover:bg-white/10 ${mode === 'SHORT_BREAK' ? 'text-emerald-500 ring-1 ring-emerald-500' : 'text-gray-500'}`} title="Short Break">
                    <Coffee size={20} />
                </button>
                <button onClick={() => switchMode('LONG_BREAK')} className={`p-2 rounded hover:bg-white/10 ${mode === 'LONG_BREAK' ? 'text-blue-500 ring-1 ring-blue-500' : 'text-gray-500'}`} title="Long Break">
                    <Brain size={20} />
                </button>
            </div>
            
            <p className="text-center text-[10px] text-gray-600 mt-4">
                TIP: DEFEAT THE BOSS BEFORE TIME RUNS OUT.
            </p>

        </div>

    </div>
  );
};

export default RetroGameCartridge;