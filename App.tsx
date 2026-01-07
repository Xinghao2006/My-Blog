import React, { useState, useEffect, useRef } from 'react';
import Blog from './components/Blog';
import ReceiptGenerator from './components/ReceiptGenerator';
import PolaroidGenerator from './components/PolaroidGenerator';
import AmbianceMixer from './components/AmbianceMixer';
import AboutMe from './components/AboutMe';
import RetroSnake from './components/RetroSnake';
import SpaceInvaders from './components/SpaceInvaders';
import TetrisBlock from './components/TetrisBlock';
import GameMenu from './components/GameMenu';

type ActiveTool = 'receipt' | 'polaroid' | 'mixer' | 'about' | 'gamemenu' | 'snake' | 'space-invaders' | 'tetris' | null;

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  
  // Audio State lifted to App level to persist playback across views
  // Initialized to true for auto-play attempt
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Basic routing based on Hash
    const checkHash = () => {
        const hash = window.location.hash;
        if (hash.includes('config=')) {
            setActiveTool('receipt');
        } else if (hash.includes('tool=polaroid')) {
            setActiveTool('polaroid');
        } else if (hash.includes('tool=mixer')) {
            setActiveTool('mixer');
        } else if (hash.includes('tool=about')) {
            setActiveTool('about');
        } else if (hash.includes('tool=gamemenu')) {
            setActiveTool('gamemenu');
        } else if (hash.includes('tool=snake')) {
            setActiveTool('snake');
        } else if (hash.includes('tool=space-invaders')) {
            setActiveTool('space-invaders');
        } else if (hash.includes('tool=tetris')) {
            setActiveTool('tetris');
        }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Audio Fade In/Out Logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
    }

    if (isPlaying) {
        // Fade In
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.warn("Background audio auto-play blocked", e);
                setIsPlaying(false);
            });
        }
        
        let volume = audio.volume; // Start from current volume
        if (audio.paused) audio.volume = 0; 
        
        const targetVolume = 0.5; 
        const step = 0.05;

        fadeIntervalRef.current = window.setInterval(() => {
            if (audio.volume < targetVolume) {
                audio.volume = Math.min(audio.volume + step, targetVolume);
            } else {
                if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            }
        }, 100);
    } else {
        // Fade Out
        const step = 0.05;
        fadeIntervalRef.current = window.setInterval(() => {
            if (audio.volume > 0) {
                audio.volume = Math.max(audio.volume - step, 0);
            } else {
                audio.pause();
                if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            }
        }, 100);
    }

    return () => {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleOpenTool = (toolId: string) => {
      // Clear hash if moving to a fresh tool to avoid state conflicts
      if (!window.location.hash.includes('config=')) {
          try {
            window.history.replaceState(null, '', window.location.pathname);
          } catch (e) {
            console.warn('Navigation history update failed:', e);
          }
      }
      
      // Auto-pause background music when entering an immersive tool
      // Except for Game Menu where we might want music, but let's pause for consistency
      if (isPlaying) {
          setIsPlaying(false);
      }
      
      if (toolId === 'receipt') setActiveTool('receipt');
      if (toolId === 'polaroid') setActiveTool('polaroid');
      if (toolId === 'mixer') setActiveTool('mixer');
      if (toolId === 'about') setActiveTool('about');
      if (toolId === 'gamemenu') setActiveTool('gamemenu');
      if (toolId === 'snake') setActiveTool('snake');
      if (toolId === 'space-invaders') setActiveTool('space-invaders');
      if (toolId === 'tetris') setActiveTool('tetris');
  };

  const handleBackToBlog = () => {
      try {
          window.history.pushState(null, '', window.location.pathname);
      } catch (e) {
          console.warn('Navigation history update failed:', e);
          try {
            window.location.hash = '';
          } catch(e2) {
             console.warn('Hash update failed:', e2);
          }
      }
      setActiveTool(null);
  };

  const handleBackToGameMenu = () => {
      setActiveTool('gamemenu');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafaf9]">
      {/* Persistent Audio Element */}
      <audio ref={audioRef} loop crossOrigin="anonymous">
          <source src="https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" type="audio/mpeg" />
      </audio>

      {/* Blog View (Base Layer) */}
      <div 
        className={`transition-all duration-700 ease-in-out transform ${
            activeTool ? 'scale-95 opacity-50 blur-[2px] pointer-events-none' : 'scale-100 opacity-100'
        }`}
      >
        <Blog 
            onOpenTool={handleOpenTool} 
            isPlaying={isPlaying} 
            togglePlay={togglePlay} 
        />
      </div>

      {/* Tool Layers */}

      {/* 1. Life Receipt */}
      <div 
        className={`fixed inset-0 z-50 transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
            activeTool === 'receipt' ? 'translate-y-0' : 'translate-y-[110%]'
        }`}
      >
        <div 
            className="h-full w-full overflow-y-auto"
            style={{ background: 'linear-gradient(to bottom, #bfdbfe, #ffffff)' }}
        >
            <ReceiptGenerator onBack={handleBackToBlog} />
        </div>
      </div>

      {/* 2. Polaroid Generator */}
      <div 
        className={`fixed inset-0 z-50 transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
            activeTool === 'polaroid' ? 'translate-y-0' : 'translate-y-[110%]'
        }`}
      >
        <div 
            className="h-full w-full overflow-y-auto bg-[#1c1917]"
            style={{
                 backgroundImage: 'radial-gradient(#57534e 1px, #1c1917 1px)',
                 backgroundSize: '24px 24px'
            }}
        >
            <PolaroidGenerator onBack={handleBackToBlog} />
        </div>
      </div>

      {/* 3. Ambiance Mixer */}
      <div 
        className={`fixed inset-0 z-50 transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
            activeTool === 'mixer' ? 'translate-y-0' : 'translate-y-[110%]'
        }`}
      >
        <div 
            className="h-full w-full overflow-y-auto"
            style={{ background: 'linear-gradient(to top, #0f172a, #334155)' }}
        >
            <AmbianceMixer onBack={handleBackToBlog} />
        </div>
      </div>

      {/* 4. About Me */}
      <div 
        className={`fixed inset-0 z-50 transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
            activeTool === 'about' ? 'translate-y-0' : 'translate-y-[110%]'
        }`}
      >
        <AboutMe onBack={handleBackToBlog} />
      </div>

      {/* 5. Game Menu */}
      <div 
        className={`fixed inset-0 z-50 transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
            activeTool === 'gamemenu' ? 'translate-y-0' : 'translate-y-[110%]'
        }`}
      >
        <GameMenu onBack={handleBackToBlog} onSelectGame={(gameId) => handleOpenTool(gameId)} />
      </div>

      {/* 6. Retro Snake */}
       <div 
        className={`fixed inset-0 z-50 transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
            activeTool === 'snake' ? 'translate-y-0' : 'translate-y-[110%]'
        }`}
      >
        <div className="h-full w-full overflow-y-auto bg-[#2d3748]">
            <RetroSnake onBack={handleBackToGameMenu} />
        </div>
      </div>

      {/* 7. Space Invaders */}
       <div 
        className={`fixed inset-0 z-50 transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
            activeTool === 'space-invaders' ? 'translate-y-0' : 'translate-y-[110%]'
        }`}
      >
        <div className="h-full w-full overflow-y-auto bg-[#0f0f1a]">
            <SpaceInvaders onBack={handleBackToGameMenu} />
        </div>
      </div>

      {/* 8. Tetris */}
       <div 
        className={`fixed inset-0 z-50 transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
            activeTool === 'tetris' ? 'translate-y-0' : 'translate-y-[110%]'
        }`}
      >
        <div className="h-full w-full overflow-y-auto bg-[#2d3748]">
            <TetrisBlock onBack={handleBackToGameMenu} />
        </div>
      </div>

    </div>
  );
};

export default App;