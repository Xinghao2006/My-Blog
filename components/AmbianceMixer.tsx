import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CloudRain, Flame, Wind, Sun, Volume1, CloudLightning } from 'lucide-react';

interface AmbianceMixerProps {
  onBack: () => void;
}

// Sound configuration types
type SoundId = 'focus' | 'rain' | 'fire' | 'wind' | 'thunder';

interface SoundTrack {
  id: SoundId;
  icon: React.ReactNode;
  label: string;
  desc: string;
}

const SOUNDS: SoundTrack[] = [
    { id: 'focus', label: '深度专注', desc: '平滑的粉红噪音', icon: <Sun size={24} /> },
    { id: 'rain', label: '倾盆大雨', desc: '持续的白噪音雨声', icon: <CloudRain size={24} /> },
    { id: 'fire', label: '篝火晚会', desc: '温暖的低频燃烧声', icon: <Flame size={24} /> },
    { id: 'wind', label: '山谷微风', desc: '动态呼啸的风声', icon: <Wind size={24} /> },
    { id: 'thunder', label: '远方雷雨', desc: '低沉的滚雷声', icon: <CloudLightning size={24} /> },
];

const AmbianceMixer: React.FC<AmbianceMixerProps> = ({ onBack }) => {
  const [activeVolumes, setActiveVolumes] = useState<Record<string, number>>({});
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Store references to audio nodes so we can stop/disconnect them individually
  // Structure: { [id]: { gainNode: GainNode, nodes: AudioNode[], interval?: number } }
  const activeSoundsRef = useRef<Record<string, { gain: GainNode; nodes: AudioNode[]; timer?: number }>>({});

  useEffect(() => {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();

      return () => {
          stopAllSounds();
          if (audioCtxRef.current) {
              audioCtxRef.current.close();
          }
      };
  }, []);

  const stopAllSounds = () => {
      Object.keys(activeSoundsRef.current).forEach(id => stopSound(id));
  };

  const stopSound = (id: string) => {
      const soundData = activeSoundsRef.current[id];
      if (soundData) {
          // Ramp down volume before stopping to avoid clicks
          const ctx = audioCtxRef.current;
          if (ctx) {
             soundData.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
          }
          
          setTimeout(() => {
              soundData.nodes.forEach(node => {
                  try {
                      if (node instanceof AudioScheduledSourceNode) node.stop();
                      node.disconnect();
                  } catch (e) { /* Ignore errors on already stopped nodes */ }
              });
              if (soundData.timer) clearInterval(soundData.timer);
              soundData.gain.disconnect();
          }, 200);

          delete activeSoundsRef.current[id];
      }
  };

  // --- Noise Buffer Generators ---

  const createWhiteNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
      const bufferSize = ctx.sampleRate * 2; // 2 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }
      return buffer;
  };

  const createPinkNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
      for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          data[i] *= 0.11; 
          b6 = white * 0.115926;
      }
      return buffer;
  };

  const createBrownNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; 
      }
      return buffer;
  };

  // --- Synthesis Logic per Sound Type ---

  const startSound = (id: string) => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      // Master gain for this track
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0; // Start silent, fade in
      masterGain.connect(ctx.destination);
      
      const nodes: AudioNode[] = [];
      let timer: number | undefined;

      // 1. FOCUS: Pure Pink Noise (Standard broad spectrum)
      if (id === 'focus') {
          const src = ctx.createBufferSource();
          src.buffer = createPinkNoiseBuffer(ctx);
          src.loop = true;
          
          // Slight lowpass to make it less harsh than raw pink noise
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 4000;

          src.connect(filter);
          filter.connect(masterGain);
          src.start();
          nodes.push(src, filter);
      }

      // 2. RAIN: White Noise + LowPass (Simulate rain hitting ground)
      else if (id === 'rain') {
          const src = ctx.createBufferSource();
          src.buffer = createWhiteNoiseBuffer(ctx);
          src.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 800; // Muffles the sharp hiss

          src.connect(filter);
          filter.connect(masterGain);
          src.start();
          nodes.push(src, filter);
      }

      // 3. FIRE: Brown Noise + Gain Jitter (Flickering effect)
      else if (id === 'fire') {
          const src = ctx.createBufferSource();
          src.buffer = createBrownNoiseBuffer(ctx);
          src.loop = true;

          // Make the volume wobble slightly to simulate flames flicking
          const flickerGain = ctx.createGain();
          flickerGain.gain.value = 1.0;
          
          // Using a ScriptProcessor or interval for random flicker is expensive/complex in React
          // Simplified: Use two LFOs to modulate gain chaotically
          const lfo1 = ctx.createOscillator();
          lfo1.frequency.value = 8; // Fast flicker
          const lfo1Gain = ctx.createGain();
          lfo1Gain.gain.value = 0.1; // Small depth

          const lfo2 = ctx.createOscillator();
          lfo2.frequency.value = 0.5; // Slow swell
          const lfo2Gain = ctx.createGain();
          lfo2Gain.gain.value = 0.2;

          lfo1.connect(lfo1Gain);
          lfo1Gain.connect(flickerGain.gain);
          
          lfo2.connect(lfo2Gain);
          lfo2Gain.connect(flickerGain.gain);

          src.connect(flickerGain);
          flickerGain.connect(masterGain);
          
          src.start();
          lfo1.start();
          lfo2.start();
          
          nodes.push(src, flickerGain, lfo1, lfo1Gain, lfo2, lfo2Gain);
      }

      // 4. WIND: Pink Noise + BandPass Sweep (Whooshing effect)
      else if (id === 'wind') {
          const src = ctx.createBufferSource();
          src.buffer = createPinkNoiseBuffer(ctx);
          src.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.Q.value = 1; // Width of the wind sound

          // LFO to sweep the filter frequency up and down
          const lfo = ctx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.value = 0.15; // Speed of wind gusts

          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 300; // How much the pitch changes

          // Base frequency around 400Hz, moving +/- 300Hz
          filter.frequency.value = 400; 

          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);

          src.connect(filter);
          filter.connect(masterGain);
          
          src.start();
          lfo.start();
          
          nodes.push(src, filter, lfo, lfoGain);
      }

      // 5. THUNDER: Deep Brown Noise + Rolling Amplitude (Storm rumble)
      else if (id === 'thunder') {
          const src = ctx.createBufferSource();
          src.buffer = createBrownNoiseBuffer(ctx);
          src.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 180; // Very low rumble

          // Slow rolling effect
          const rollLfo = ctx.createOscillator();
          rollLfo.frequency.value = 0.1; // Very slow roll
          const rollGain = ctx.createGain();
          rollGain.gain.value = 0.4; // Modulation depth

          const baseGain = ctx.createGain();
          baseGain.gain.value = 0.6; 

          rollLfo.connect(rollGain);
          rollGain.connect(baseGain.gain);

          src.connect(filter);
          filter.connect(baseGain);
          baseGain.connect(masterGain);

          src.start();
          rollLfo.start();

          nodes.push(src, filter, baseGain, rollLfo, rollGain);
      }

      activeSoundsRef.current[id] = { gain: masterGain, nodes, timer };
  };

  const toggleSound = (id: string) => {
      setActiveVolumes(prev => {
          const isActive = !!prev[id];
          if (isActive) {
              const next = { ...prev };
              delete next[id];
              stopSound(id);
              return next;
          } else {
              startSound(id);
              // Set initial volume slightly delayed to allow node setup
              setTimeout(() => {
                  const sound = activeSoundsRef.current[id];
                  if (sound && audioCtxRef.current) {
                      sound.gain.gain.setTargetAtTime(0.5, audioCtxRef.current.currentTime, 0.5);
                  }
              }, 50);
              return { ...prev, [id]: 0.5 };
          }
      });
  };

  const updateVolume = (id: string, vol: number) => {
      setActiveVolumes(prev => ({ ...prev, [id]: vol }));
      const sound = activeSoundsRef.current[id];
      const ctx = audioCtxRef.current;
      if (sound && ctx) {
          sound.gain.gain.setTargetAtTime(vol, ctx.currentTime, 0.1);
      }
  };

  return (
    <div 
        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
        style={{
            background: "linear-gradient(to top, #0f172a, #334155)",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}
    >
        
        {/* Back Button */}
        <button 
            onClick={onBack}
            className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
        >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">返回博客</span>
        </button>

        {/* Mixer Board */}
        <div className="flex-1 w-full overflow-y-auto p-8 flex items-center justify-center pt-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl w-full">
                
                {SOUNDS.map((sound) => {
                    const isActive = activeVolumes[sound.id] !== undefined;
                    const volume = activeVolumes[sound.id] || 0.5;

                    return (
                        <div 
                            key={sound.id}
                            className={`
                                relative p-4 rounded-xl border transition-all duration-300 group
                                ${isActive 
                                    ? 'bg-emerald-900/40 backdrop-blur-md border-emerald-500/50 shadow-lg' 
                                    : 'bg-slate-800/40 backdrop-blur-sm border-white/5 hover:bg-slate-700/40'}
                            `}
                        >
                            {/* Header / Toggle */}
                            <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => toggleSound(sound.id)}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg transition-all duration-500 ${isActive ? 'bg-emerald-400 text-emerald-900' : 'bg-slate-700 text-slate-400'}`}>
                                        {sound.icon}
                                    </div>
                                    <div>
                                        <h3 className={`font-serif-title font-bold text-lg ${isActive ? 'text-emerald-100' : 'text-slate-300'}`}>{sound.label}</h3>
                                        <p className="text-[10px] text-slate-400">{sound.desc}</p>
                                    </div>
                                </div>
                                
                                <div className={`
                                    w-3 h-3 rounded-full border-2 transition-all duration-300
                                    ${isActive ? 'bg-emerald-400 border-emerald-400' : 'bg-transparent border-slate-500'}
                                `}></div>
                            </div>

                            {/* Volume Slider */}
                            <div className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-2 pointer-events-none grayscale'}`}>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider">
                                    <Volume1 size={12} />
                                    <span>音量 {Math.round(volume * 100)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.01" 
                                    value={volume}
                                    onChange={(e) => updateVolume(sound.id, parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400 hover:accent-emerald-300"
                                />
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    </div>
  );
};

export default AmbianceMixer;