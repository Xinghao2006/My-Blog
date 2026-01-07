import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Disc3, Volume2, BarChart2, Activity, Zap } from 'lucide-react';

interface MoodMixtapeProps {
  onBack: () => void;
}

const MOODS = [
    { id: 'emo', label: '网抑云', emoji: '🌧️', tapeColor: '#1e293b', desc: '432Hz 治愈频率 + 雨声' },
    { id: 'coding', label: '深夜编译', emoji: '☕', tapeColor: '#064e3b', desc: '40Hz Gamma波 + 棕色噪音' },
    { id: 'happy', label: '多巴胺', emoji: '✨', tapeColor: '#f97316', desc: '528Hz 奇迹频率 + 活力律动' },
    { id: 'chill', label: '放空发呆', emoji: '🍃', tapeColor: '#78716c', desc: 'Theta波 + 粉红噪音' },
    { id: 'retro', label: '千禧年', emoji: '📼', tapeColor: '#92400e', desc: '8-Bit 方波 + Lo-Fi 杂音' }
];

// Replaced Song List with Frequency Concepts
interface FrequencyTrack {
    title: string;
    type: 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise';
    freq: number;
    mod?: number; // Modulation frequency
}

const GENERATIVE_TRACKS: Record<string, FrequencyTrack[]> = {
    'emo': [
        { title: "Minor Drone (A)", type: 'sine', freq: 220 }, // A3
        { title: "Rain Texture", type: 'noise', freq: 0 },
        { title: "Sub Bass", type: 'sine', freq: 55 }, 
    ],
    'coding': [
        { title: "Focus Flow (Brown)", type: 'noise', freq: 0 },
        { title: "Binaural (Left)", type: 'sine', freq: 200 },
        { title: "Binaural (Right)", type: 'sine', freq: 240 }, // 40Hz beat
    ],
    'happy': [
        { title: "Major Arp (C)", type: 'triangle', freq: 523.25 }, // C5
        { title: "Sparkle", type: 'square', freq: 880 },
        { title: "Warm Pad", type: 'sine', freq: 261.63 },
    ],
    'chill': [
        { title: "Pink Haze", type: 'noise', freq: 0 },
        { title: "Theta Pulse", type: 'sine', freq: 110, mod: 6 },
        { title: "Deep Breathing", type: 'triangle', freq: 55 },
    ],
    'retro': [
        { title: "8-Bit Lead", type: 'square', freq: 440 },
        { title: "Glitch Noise", type: 'sawtooth', freq: 110 },
        { title: "Cartridge Dust", type: 'noise', freq: 0 },
    ]
};

const MoodMixtape: React.FC<MoodMixtapeProps> = ({ onBack }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        stopAudio();
    };
  }, []);

  const initAudio = () => {
      if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current?.state === 'suspended') {
          audioCtxRef.current.resume();
      }
  };

  const stopAudio = () => {
      nodesRef.current.forEach(node => {
          try {
             if (node instanceof AudioScheduledSourceNode) node.stop();
             node.disconnect(); 
          } catch (e) { /* ignore */ }
      });
      nodesRef.current = [];
      if (gainNodeRef.current) {
          gainNodeRef.current.disconnect();
          gainNodeRef.current = null;
      }
      setIsPlaying(false);
  };

  const createNoise = (ctx: AudioContext) => {
      const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      return noise;
  };

  const playGenerativeAudio = (moodId: string) => {
      initAudio();
      stopAudio(); // Stop any existing sounds

      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.4; // Master volume
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      const tracks = GENERATIVE_TRACKS[moodId] || GENERATIVE_TRACKS['chill'];

      tracks.forEach(track => {
          const trackGain = ctx.createGain();
          trackGain.gain.value = 0.15;
          trackGain.connect(masterGain);

          let source: AudioScheduledSourceNode;

          if (track.type === 'noise') {
              source = createNoise(ctx);
              // Add a filter to make noise less harsh
              const filter = ctx.createBiquadFilter();
              if (moodId === 'coding') {
                  filter.type = 'lowpass'; // Brownish
                  filter.frequency.value = 400;
              } else {
                  filter.type = 'lowpass'; // Pinkish
                  filter.frequency.value = 1000;
              }
              source.connect(filter);
              filter.connect(trackGain);
              nodesRef.current.push(filter);
          } else {
              const osc = ctx.createOscillator();
              osc.type = track.type;
              osc.frequency.value = track.freq;
              
              // Apply modulation (Pulse)
              if (track.mod) {
                  const lfo = ctx.createOscillator();
                  lfo.frequency.value = track.mod;
                  const lfoGain = ctx.createGain();
                  lfoGain.gain.value = 20; // Depth
                  lfo.connect(lfoGain);
                  lfoGain.connect(osc.frequency);
                  lfo.start();
                  nodesRef.current.push(lfo, lfoGain);
              }
              
              osc.connect(trackGain);
              source = osc;
          }

          source.start();
          nodesRef.current.push(source, trackGain);
      });

      setIsPlaying(true);
  };

  const handleGenerate = (moodId: string) => {
      setSelectedMood(moodId);
      setIsGenerating(true);
      
      // Simulate "Loading" tape
      stopAudio();
      
      setTimeout(() => {
          setIsGenerating(false);
          // Auto play after generating? No, let user press play to be safe.
      }, 800);
  };

  const handleTogglePlay = () => {
      if (isPlaying) {
          stopAudio();
      } else if (selectedMood) {
          playGenerativeAudio(selectedMood);
      }
  };

  const handleReset = () => {
      stopAudio();
      setSelectedMood(null);
  };

  const getMoodConfig = () => MOODS.find(m => m.id === selectedMood) || MOODS[0];

  return (
    <div 
        className="w-full flex flex-col items-center py-10"
    >
        {/* Grain overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")` }}></div>

        {/* Back Button (Top Left) */}
        <button 
            onClick={() => {
                stopAudio();
                onBack();
            }}
            className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/60 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/5"
        >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">返回博客</span>
        </button>

        {/* Main Content Container - Centered */}
        <div className="relative w-full max-w-md px-4 flex flex-col items-center z-10">
            
            {/* Cassette Visual */}
            <div className="relative group perspective-1000 w-full mb-8">
                <div 
                    className={`
                        w-full aspect-[1.6] rounded-xl shadow-2xl relative overflow-hidden border border-white/10 transition-all duration-700
                        ${isGenerating ? 'animate-pulse' : ''}
                    `}
                    style={{ 
                        backgroundColor: selectedMood ? getMoodConfig().tapeColor : '#333',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
                    }}
                >
                    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
                    
                    {/* Cassette UI */}
                    <div className="absolute top-[10%] left-[5%] right-[5%] height-[60%] bg-stone-100/90 rounded-sm transform -rotate-0.5 p-4 shadow-sm flex flex-col justify-between">
                         <div className="w-full h-8 border-b-2 border-red-500/50 font-handwriting text-2xl text-black flex items-center justify-between">
                             <span>{selectedMood ? `${getMoodConfig().label} Mix` : 'MOOD MIXTAPE'}</span>
                             {isPlaying && <BarChart2 className="text-red-500 animate-pulse" size={20} />}
                         </div>
                         
                         {selectedMood && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-black/60 text-[10px] font-mono border border-black/20 px-1 rounded">TYPE II</span>
                                <span className="text-black/60 text-[10px] font-mono border border-black/20 px-1 rounded">HIGH BIAS</span>
                            </div>
                         )}

                         <div className="text-black/50 text-xs font-mono mt-1 flex justify-between items-end">
                             <div className="flex flex-col">
                                <span>{isPlaying ? `GENERATING: ${getMoodConfig().desc}` : 'READY TO PLAY'}</span>
                             </div>
                             <span className="font-bold text-lg">A</span>
                         </div>
                    </div>

                    <div className="absolute top-[45%] left-[15%] right-[15%] h-[35%] bg-black/80 rounded-full flex justify-between items-center px-4 border border-stone-600/50 backdrop-blur-sm">
                         <div className={`w-12 h-12 rounded-full border-4 border-white/20 bg-transparent flex items-center justify-center ${isPlaying || isGenerating ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
                             <div className="w-full h-full border-t-2 border-white/50 rounded-full"></div>
                         </div>
                         <div className={`w-12 h-12 rounded-full border-4 border-white/20 bg-transparent flex items-center justify-center ${isPlaying || isGenerating ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
                             <div className="w-full h-full border-t-2 border-white/50 rounded-full"></div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Selection Grid (Only if no mood selected) */}
            {!selectedMood && !isGenerating && (
                <div className="grid grid-cols-3 gap-3 animate-fade-in w-full">
                    {MOODS.map(mood => (
                        <button
                            key={mood.id}
                            onClick={() => handleGenerate(mood.id)}
                            className={`
                                py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all
                                flex flex-col items-center gap-2 hover:scale-105 active:scale-95
                            `}
                        >
                            <span className="text-2xl">{mood.emoji}</span>
                            <span className="text-xs font-bold text-white/80">{mood.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Player Controls (If mood selected) */}
            {selectedMood && !isGenerating && (
                <div className="flex flex-col items-center gap-6 animate-fade-in w-full">
                    
                    {/* Big Play Button */}
                    <button 
                        onClick={handleTogglePlay}
                        className={`
                            w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95
                            ${isPlaying ? 'bg-red-500 text-white shadow-red-500/50' : 'bg-white text-black shadow-white/20'}
                        `}
                    >
                        {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>

                    <div className="bg-black/40 rounded-xl p-4 backdrop-blur-xl border border-white/5 w-full">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-white/40 tracking-wider">实时合成参数 (Generative Params)</span>
                            <Activity size={14} className={`text-white/40 ${isPlaying ? 'animate-pulse' : ''}`} />
                        </div>
                        
                        <div className="space-y-3">
                            {GENERATIVE_TRACKS[selectedMood].map((track, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                        <Zap size={12} className={isPlaying ? 'text-amber-400' : 'text-white/20'} />
                                        <span className="text-white/80">{track.title}</span>
                                    </div>
                                    <span className="font-mono text-xs text-white/40">
                                        {track.freq > 0 ? `${track.freq}Hz` : 'NOISE'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs transition-colors text-white/60 hover:text-white"
                    >
                        <Disc3 size={14} />
                        <span>更换磁带 (Eject)</span>
                    </button>
                </div>
            )}

        </div>
    </div>
  );
};

export default MoodMixtape;