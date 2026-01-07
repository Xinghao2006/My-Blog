import React from 'react';
import { Sparkles, Mic, Pause, Headphones, Tv, Smartphone, Mail, Volume2, Camera, ArrowRight, ArrowUpRight, Gamepad2 } from 'lucide-react';

interface BlogProps {
  onOpenTool: (id: string) => void;
  isPlaying: boolean;
  togglePlay: () => void;
}

const TOOLS = [
    {
        id: 'receipt',
        title: "The Life Receipt",
        subtitle: "人生收据",
        desc: "如果人生是一张超市小票，上面会打印什么？生成你的专属人生账单。",
        icon: <Sparkles size={16} />,
        bgGradient: "from-stone-800 to-stone-900",
        accent: "text-indigo-400"
    },
    {
        id: 'polaroid',
        title: "Polaroid Lab",
        subtitle: "时光拍立得",
        desc: "定格瞬间。生成带有复古做旧效果、时间戳和拍立得边框的照片。",
        icon: <Camera size={16} />,
        bgGradient: "from-stone-900 to-neutral-900",
        accent: "text-red-400"
    },
    {
        id: 'mixer',
        title: "8-Bit Ambiance",
        subtitle: "白噪音混音台",
        desc: "定制你的专注背景音。倾盆大雨、壁炉篝火与复古键盘声。",
        icon: <Volume2 size={16} />,
        bgGradient: "from-slate-900 to-slate-800",
        accent: "text-emerald-400"
    }
];

const Blog: React.FC<BlogProps> = ({ onOpenTool, isPlaying, togglePlay }) => {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-800 font-sans selection:bg-stone-200 flex flex-col">
      <style>{`
        .custom-scrollbar {
            scrollbar-width: auto;
            scrollbar-color: #d6d3d1 #f5f5f4;
        }
        .custom-scrollbar::-webkit-scrollbar {
            height: 14px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background-color: #f5f5f4;
            border-radius: 6px;
            border: 1px solid #e7e5e4;
            margin: 0 24px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #a8a29e;
            border-radius: 6px;
            border: 3px solid #f5f5f4;
            transition: background-color 0.3s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #78716c;
        }
      `}</style>

      {/* Navigation - Responsive Fix */}
      <nav className="fixed top-0 w-full bg-[#fafaf9]/70 backdrop-blur-md z-40 border-b border-stone-100/50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          <div className="font-serif-title font-bold text-lg sm:text-xl tracking-tight flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center text-white shadow-sm">
                 <Mic size={14} />
            </div>
            <span className="hidden xs:block">My Blog.</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-6 text-[10px] sm:text-sm font-medium text-stone-500 overflow-x-auto no-scrollbar py-2">
            <button 
                onClick={() => onOpenTool('gamemenu')} 
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-stone-900 text-white font-bold uppercase tracking-wider hover:bg-stone-800 transition-all shrink-0"
            >
                <Gamepad2 size={12} className="sm:w-[14px] sm:h-[14px]" />
                <span>Old Game</span>
            </button>
            <div className="w-px h-4 bg-stone-200 shrink-0"></div>
            <button onClick={() => onOpenTool('about')} className="hover:text-stone-900 transition-colors shrink-0 px-1">About</button>
            <a href="#connect" className="hover:text-stone-900 transition-colors shrink-0 px-1">Connect</a>
          </div>
        </div>
      </nav>

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 pt-24 sm:pt-32 pb-20">
        <header className="mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6">
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 ${isPlaying ? 'animate-ping' : ''}`}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                {isPlaying ? 'Now Playing' : 'On Air'}
            </div>
            <h1 className="font-serif-title text-3xl sm:text-5xl md:text-6xl font-medium leading-tight mb-4 sm:mb-6 text-stone-900">
              记录生活，<br/>
              以及那些<span className="italic font-serif text-stone-400">编译通过</span>的瞬间。
            </h1>
            <p className="text-stone-500 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-md">
              这里是我的数字花园与播客空间。没有复杂的算法，只有关于技术、生活与极简主义的音频笔记。
            </p>
            <div className="flex gap-4">
                <button 
                    onClick={togglePlay}
                    className="flex items-center gap-2 bg-stone-900 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full hover:bg-stone-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-stone-900/20 text-sm"
                >
                    {isPlaying ? <Pause size={18} /> : <Headphones size={18} />}
                    <span>{isPlaying ? 'Pause Music' : 'Start Listening'}</span>
                </button>
            </div>
        </header>

        <div className="mb-24">
            <div className="flex justify-between items-end mb-6 px-1">
                <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-stone-900">Interactive Tools</h3>
                <span className="text-[10px] text-stone-400 uppercase tracking-widest hidden sm:block">Scroll to explore →</span>
            </div>

            <div className="w-full overflow-x-auto pb-8 custom-scrollbar snap-x snap-mandatory">
                <div className="flex gap-4 sm:gap-6 w-max px-1">
                    {TOOLS.map((tool) => (
                        <div 
                            key={tool.id}
                            onClick={() => onOpenTool(tool.id)}
                            className={`
                                relative w-[280px] sm:w-[340px] h-[360px] sm:h-[420px] rounded-3xl cursor-pointer snap-center
                                transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl shadow-xl
                                bg-gradient-to-br ${tool.bgGradient} text-white p-6 sm:p-8 flex flex-col justify-between group
                                border border-white/5 overflow-hidden shrink-0
                            `}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-white/10 transition-colors"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <div className={`p-2 sm:p-3 rounded-xl bg-white/10 backdrop-blur-md ${tool.accent} border border-white/10`}>
                                    {tool.icon}
                                </div>
                                <ArrowUpRight className="text-white/30 group-hover:text-white transition-colors" size={24} />
                            </div>

                            <div className="relative z-10">
                                <h2 className="font-serif-title text-2xl sm:text-3xl font-bold mb-2 tracking-tight">{tool.title}</h2>
                                <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-widest mb-3 sm:mb-4 opacity-90 ${tool.accent}`}>{tool.subtitle}</h3>
                                <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 line-clamp-3">
                                    {tool.desc}
                                </p>
                                
                                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                                    <span>Launch App</span>
                                    <ArrowRight size={12} />
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="w-[80px] h-[360px] sm:h-[420px] flex items-center justify-center shrink-0 opacity-20">
                         <span className="vertical-text text-stone-900 font-bold tracking-widest uppercase rotate-180 text-[10px] sm:text-xs" style={{ writingMode: 'vertical-rl' }}>More coming soon</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="border-t border-stone-200 mb-16"></div>

        <section id="connect" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#f5f5f4] rounded-2xl p-6 sm:p-8 flex flex-col group hover:shadow-lg transition-shadow border border-transparent hover:border-stone-200">
                <h4 className="font-serif-title text-lg font-bold mb-6">关于主播</h4>
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-stone-300 overflow-hidden border-2 border-white shadow-sm shrink-0">
                        <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="Avatar" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    </div>
                    <div>
                         <p className="text-stone-600 text-sm leading-relaxed">
                            构建数字工具，探讨代码、设计与生活的交汇点。<br/>
                            喜欢在深夜写代码，在清晨喝咖啡。
                        </p>
                    </div>
                </div>
               
                <div className="mt-auto pt-4">
                    <button 
                        onClick={() => onOpenTool('about')}
                        className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-stone-900 border-b border-stone-900 pb-0.5 hover:opacity-70"
                    >
                        更多关于我
                    </button>
                </div>
            </div>

            <div className="border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col hover:shadow-lg transition-shadow bg-white">
                <h4 className="font-serif-title text-lg font-bold mb-6">找到我 (Connect)</h4>
                <div className="space-y-3 flex-grow">
                    <a 
                        href="https://space.bilibili.com/271852283?spm_id_from=333.788.0.0" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-3 rounded-xl bg-stone-50 border border-stone-100 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-white text-stone-400 group-hover:bg-[#00AEEC] group-hover:text-white flex items-center justify-center transition-colors duration-300 shadow-sm">
                            <Tv size={18} />
                        </div>
                        <div>
                            <h5 className="font-bold text-stone-800 text-sm group-hover:text-[#00AEEC] transition-colors">Bilibili</h5>
                            <p className="text-xs text-stone-400">观看视频</p>
                        </div>
                    </a>

                     <a 
                        href="https://www.douyin.com/user/MS4wLjABAAAAGnSEWak2bYGKQaRoiT1fQj5a0BrBD3XT_oMQFrkD9Rs?from_tab_name=main" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-3 rounded-xl bg-stone-50 border border-stone-100 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-white text-stone-400 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors duration-300 shadow-sm">
                            <Smartphone size={18} />
                        </div>
                        <div>
                            <h5 className="font-bold text-stone-800 text-sm group-hover:text-black transition-colors">抖音</h5>
                            <p className="text-xs text-stone-400">关注日常</p>
                        </div>
                    </a>

                    <a 
                        href="mailto:X18143003659@163.com"
                        className="flex items-center gap-4 p-3 rounded-xl bg-stone-50 border border-stone-100 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-white text-stone-400 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center transition-colors duration-300 shadow-sm">
                            <Mail size={18} />
                        </div>
                        <div>
                            <h5 className="font-bold text-stone-800 text-sm group-hover:text-orange-500 transition-colors">邮箱</h5>
                            <p className="text-xs text-stone-400">合作联系</p>
                        </div>
                    </a>
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-stone-100 py-12 border-t border-stone-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-4">
            <div className="text-center">
                <div className="font-serif-title font-bold text-lg text-stone-900 mb-2">My Blog.</div>
                <p className="text-stone-500 text-sm">© 2026 Built by xinghao.</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Blog;