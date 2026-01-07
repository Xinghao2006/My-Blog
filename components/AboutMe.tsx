import React from 'react';
import { ArrowLeft, MapPin, Coffee, Code2, Terminal, Cpu, Heart, Globe, Github, Zap, Mail, ChevronDown } from 'lucide-react';

interface AboutMeProps {
  onBack: () => void;
}

const AboutMe: React.FC<AboutMeProps> = ({ onBack }) => {
  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#e5e5e5]"
        style={{
            backgroundImage: `radial-gradient(#a3a3a3 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
        }}
    >
        {/* Back Button */}
        <button 
            onClick={onBack}
            className="absolute top-6 left-6 z-[60] flex items-center gap-2 text-stone-600 hover:text-black transition-colors bg-white/70 px-4 py-2 rounded-full backdrop-blur-md border border-stone-200 shadow-sm"
        >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">返回博客</span>
        </button>

        {/* Profile Card Container */}
        <div className="relative w-full max-w-4xl h-full md:h-auto md:max-h-[85vh] flex flex-col md:flex-row bg-[#f5f5f4] rounded-none md:rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
            
            {/* Left Column: ID Card Style */}
            <div className="w-full md:w-1/3 bg-[#1c1917] text-stone-200 p-8 flex flex-col items-center text-center relative shrink-0">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-red-500 to-purple-500"></div>
                
                <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
                    <Cpu size={120} />
                </div>

                {/* Avatar */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-stone-800 shadow-xl overflow-hidden mb-6 relative group shrink-0">
                    <img 
                        src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" 
                        alt="Avatar" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>

                {/* Name & Title */}
                <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-white mb-2 shrink-0">Xinghao</h2>
                <div className="inline-block px-3 py-1 bg-stone-800 rounded-full text-[10px] sm:text-xs font-mono text-stone-400 mb-6 border border-stone-700 shrink-0">
                    FULL STACK DEV
                </div>

                {/* Meta Info */}
                <div className="w-full space-y-3 sm:space-y-4 text-xs sm:text-sm text-stone-400 border-t border-stone-800 pt-6">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><MapPin size={14}/> Location</span>
                        <span className="text-stone-200">Earth, CN</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><Coffee size={14}/> Fuel</span>
                        <span className="text-stone-200">Iced Americano</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><Code2 size={14}/> Level</span>
                        <span className="text-stone-200">Lv. 20</span>
                    </div>
                </div>

                {/* Socials - Fixed visibility on mobile */}
                <div className="mt-6 md:mt-auto pt-6 flex gap-4">
                    <a 
                        href="https://github.com/Xinghao2006" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2.5 bg-stone-800 rounded-full hover:bg-white hover:text-black transition-all shadow-lg"
                    >
                        <Github size={18} />
                    </a>
                    <a href="#" className="p-2.5 bg-stone-800 rounded-full hover:bg-white hover:text-black transition-all shadow-lg">
                        <Globe size={18} />
                    </a>
                    <a href="mailto:X18143003659@163.com" className="p-2.5 bg-stone-800 rounded-full hover:bg-white hover:text-black transition-all shadow-lg">
                        <Mail size={18} />
                    </a>
                </div>

                {/* Mobile Scroll Indicator */}
                <div className="mt-4 flex md:hidden items-center gap-1 text-[10px] text-stone-500 animate-bounce">
                    <ChevronDown size={12} />
                    Scroll Down
                </div>
            </div>

            {/* Right Column: Content Dossier - Scrollable */}
            <div className="w-full md:w-2/3 p-8 md:p-12 bg-[#fafaf9] flex flex-col overflow-y-auto custom-scrollbar">
                
                {/* Section: Bio */}
                <div className="mb-10">
                    <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">
                        <Terminal size={14} />
                        ./README.md
                    </h3>
                    <p className="font-serif text-lg sm:text-xl leading-relaxed text-stone-800 mb-4">
                        你好，我是 Xinghao。一名热衷于构建<span className="bg-orange-100 text-orange-800 px-1 rounded mx-0.5 sm:mx-1">数字工具</span>的开发者。
                    </p>
                    <p className="text-stone-600 leading-relaxed text-xs sm:text-sm">
                        我相信代码不仅是逻辑的堆砌，更是表达创意的媒介。在这个博客里，我试图探索一种“反算法”的数字生活方式——用收据记录记忆，用卡带储存情绪，用极简主义对抗信息过载。
                    </p>
                </div>

                {/* Section: Tech Stack */}
                <div className="mb-10">
                    <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">
                        <Cpu size={14} />
                        Tech Stack
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {['React / Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Figma', 'Vite'].map((tech) => (
                            <div key={tech} className="bg-white border border-stone-200 px-3 py-2 rounded text-xs text-stone-700 font-medium flex items-center gap-2 shadow-sm">
                                <Zap size={10} className="text-orange-400 fill-current" />
                                {tech}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Philosophy / Interests */}
                <div>
                    <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">
                        <Heart size={14} />
                        Philosophy
                    </h3>
                    <div className="space-y-4">
                         <div className="flex items-start gap-3">
                             <div className="mt-1 w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0"></div>
                             <p className="text-xs sm:text-sm text-stone-600">
                                <strong className="text-stone-900 block mb-1">数字极简主义</strong>
                                减少噪音，关注信号。在信息洪流中构建自己的精神庇护所。
                             </p>
                         </div>
                         <div className="flex items-start gap-3">
                             <div className="mt-1 w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0"></div>
                             <p className="text-xs sm:text-sm text-stone-600">
                                <strong className="text-stone-900 block mb-1">复古未来主义</strong>
                                喜欢 8-bit 音乐、像素艺术和旧时代的物理交互质感（咔哒声、阻尼感）。
                             </p>
                         </div>
                    </div>
                </div>

                {/* Footer Stamp */}
                <div className="mt-12 pt-6 border-t border-dashed border-stone-300 flex justify-between items-center opacity-50 pb-8 md:pb-0">
                    <div className="font-mono text-[10px] text-stone-400">
                        ID: XH-2026-DEV
                    </div>
                    <div className="border-2 border-stone-300 text-stone-400 px-2 py-1 rounded text-[8px] sm:text-[10px] font-bold uppercase -rotate-12">
                        APPROVED
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default AboutMe;