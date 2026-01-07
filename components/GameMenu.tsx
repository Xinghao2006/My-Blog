import React from 'react';
import { ArrowLeft, Ghost, Rocket, Boxes, Gamepad2, Play } from 'lucide-react';

interface GameMenuProps {
  onBack: () => void;
  onSelectGame: (gameId: string) => void;
}

const GameMenu: React.FC<GameMenuProps> = ({ onBack, onSelectGame }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fafaf9] text-stone-900 font-sans animate-fade-in overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-40 pointer-events-none" 
            style={{ 
                backgroundImage: `radial-gradient(#a8a29e 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
            }}>
        </div>

       <div className="max-w-6xl w-full p-8 relative z-10 flex flex-col h-full">
         
         <div className="flex justify-between items-end mb-12 border-b border-stone-200 pb-6">
            <div>
                <button 
                    onClick={onBack} 
                    className="flex items-center gap-2 text-stone-500 hover:text-black transition-colors bg-white border border-stone-200 rounded-full px-4 py-2 hover:bg-stone-50 mb-6 shadow-sm"
                >
                    <ArrowLeft size={16} /> <span className="text-sm font-medium">返回博客</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-stone-900 text-white rounded-lg">
                        <Gamepad2 size={24} />
                    </div>
                    <div>
                        <h2 className="font-serif-title text-3xl md:text-4xl font-bold text-stone-900">Arcade Gallery</h2>
                        <p className="text-stone-500 text-sm">经典像素游戏的复刻与重制</p>
                    </div>
                </div>
            </div>
            
            <div className="hidden md:block text-stone-400 font-mono text-xs uppercase tracking-widest">
                Insert Coin to Play
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 flex-1 overflow-y-auto pb-8">
            {/* Snake - Playable */}
            <div 
                onClick={() => onSelectGame('snake')} 
                className="group relative bg-white p-8 rounded-2xl border border-stone-200 shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center overflow-hidden"
            >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>

                <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-stone-900 group-hover:text-white transition-all duration-300">
                    <Ghost size={40} className="text-stone-600 group-hover:text-white transition-colors" />
                </div>
                
                <h3 className="font-serif-title text-2xl font-bold mb-2 text-stone-900">Retro Snake</h3>
                <div className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded mb-4">
                    Playable
                </div>
                
                <p className="text-sm text-stone-500 mb-8 leading-relaxed max-w-xs">
                    经典的诺基亚风格贪吃蛇。<br/>吞噬像素，变长，不要撞墙。
                </p>
                
                <button className="mt-auto flex items-center gap-2 px-6 py-2 bg-stone-900 text-white font-bold text-xs rounded-full uppercase tracking-wider group-hover:bg-black transition-colors shadow-lg">
                    <Play size={12} fill="currentColor" />
                    Start Game
                </button>
            </div>

             {/* Space Invaders - Unlocked */}
            <div 
                onClick={() => onSelectGame('space-invaders')} 
                className="group relative bg-white p-8 rounded-2xl border border-stone-200 shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                
                <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-stone-900 group-hover:text-white transition-all duration-300">
                    <Rocket size={40} className="text-stone-600 group-hover:text-white transition-colors" />
                </div>
                
                <h3 className="font-serif-title text-2xl font-bold mb-2 text-stone-900">Space Invaders</h3>
                 <div className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-widest rounded mb-4">
                    Playable
                </div>
                
                <p className="text-sm text-stone-500 mb-8 leading-relaxed max-w-xs">
                    像素化的太空防御战。<br/>左右移动，抵御外星入侵。
                </p>
                
                <button className="mt-auto flex items-center gap-2 px-6 py-2 bg-stone-900 text-white font-bold text-xs rounded-full uppercase tracking-wider group-hover:bg-black transition-colors shadow-lg">
                    <Play size={12} fill="currentColor" />
                    Start Game
                </button>
            </div>

            {/* Tetris - Unlocked */}
            <div 
                onClick={() => onSelectGame('tetris')} 
                className="group relative bg-white p-8 rounded-2xl border border-stone-200 shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                
                <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-stone-900 group-hover:text-white transition-all duration-300">
                    <Boxes size={40} className="text-stone-600 group-hover:text-white transition-colors" />
                </div>
                
                <h3 className="font-serif-title text-2xl font-bold mb-2 text-stone-900">Tetris Block</h3>
                 <div className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-widest rounded mb-4">
                    Playable
                </div>
                
                <p className="text-sm text-stone-500 mb-8 leading-relaxed max-w-xs">
                    堆叠方块，消除行。<br/>致敬最经典的消除游戏。
                </p>
                
                <button className="mt-auto flex items-center gap-2 px-6 py-2 bg-stone-900 text-white font-bold text-xs rounded-full uppercase tracking-wider group-hover:bg-black transition-colors shadow-lg">
                    <Play size={12} fill="currentColor" />
                    Start Game
                </button>
            </div>
         </div>
       </div>
    </div>
  );
};

export default GameMenu;