import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Upload, Image as ImageIcon, RotateCcw, Download, Printer, Zap } from 'lucide-react';

interface PolaroidGeneratorProps {
  onBack: () => void;
}

const PolaroidGenerator: React.FC<PolaroidGeneratorProps> = ({ onBack }) => {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPolaroid, setShowPolaroid] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isDeveloping, setIsDeveloping] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Advanced Synthesized Sound
  const playPrintSound = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const t = ctx.currentTime;
    // Shutter
    const shutterOsc = ctx.createOscillator();
    const shutterGain = ctx.createGain();
    shutterOsc.connect(shutterGain);
    shutterGain.connect(ctx.destination);
    shutterOsc.type = 'square';
    shutterOsc.frequency.setValueAtTime(800, t);
    shutterOsc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
    shutterGain.gain.setValueAtTime(0.3, t);
    shutterGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    shutterOsc.start(t);
    shutterOsc.stop(t + 0.05);
    // Motor
    const motorOsc = ctx.createOscillator();
    const motorGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    motorOsc.connect(filter);
    filter.connect(motorGain);
    motorGain.connect(ctx.destination);
    motorOsc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    motorOsc.frequency.setValueAtTime(50, t + 0.1);
    motorOsc.frequency.linearRampToValueAtTime(120, t + 0.3);
    motorOsc.frequency.setValueAtTime(120, t + 1.8);
    motorOsc.frequency.linearRampToValueAtTime(40, t + 2.0);
    motorGain.gain.setValueAtTime(0, t);
    motorGain.gain.linearRampToValueAtTime(0.2, t + 0.2);
    motorGain.gain.setValueAtTime(0.2, t + 1.8);
    motorGain.gain.linearRampToValueAtTime(0, t + 2.0);
    motorOsc.start(t + 0.1);
    motorOsc.stop(t + 2.0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setImage(ev.target?.result as string);
              setShowPolaroid(false);
              setGeneratedUrl(null);
              setIsDeveloping(false);
          };
          reader.readAsDataURL(file);
      }
  };

  const handlePrint = () => {
      if (!image) return;
      setIsProcessing(true);
      playPrintSound();
      
      setTimeout(() => {
          setShowPolaroid(true);
          generateCanvasImage();
          setIsDeveloping(true);
          setIsProcessing(false);
          setTimeout(() => {
              setIsDeveloping(false);
          }, 4500); 
      }, 1000);
  };

  const generateCanvasImage = () => {
      const canvas = canvasRef.current;
      if (!canvas || !image) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image;
      
      img.onload = () => {
          const width = 800;
          const height = 960;
          const padding = 50;
          const bottomPadding = 200;
          const imageSize = width - (padding * 2);

          canvas.width = width;
          canvas.height = height;

          // Paper Frame
          ctx.fillStyle = "#fafaf9"; 
          ctx.fillRect(0, 0, width, height);
          // Dark Inner Frame
          ctx.fillStyle = "#1c1917";
          ctx.fillRect(padding, padding, imageSize, imageSize);

          // Image Draw (Center Crop)
          const aspect = img.width / img.height;
          let drawW, drawH, sx, sy;
          if (aspect > 1) { 
              drawH = img.height; drawW = img.height; sx = (img.width - img.height) / 2; sy = 0;
          } else { 
              drawW = img.width; drawH = img.width; sx = 0; sy = (img.height - img.width) / 2;
          }

          ctx.filter = 'sepia(0.3) contrast(1.1) brightness(1.1) saturate(0.85)';
          ctx.drawImage(img, sx, sy, drawW, drawH, padding, padding, imageSize, imageSize);
          ctx.filter = 'none';

          // Noise
          const imageData = ctx.getImageData(padding, padding, imageSize, imageSize);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
              const noise = (Math.random() - 0.5) * 25;
              data[i] = Math.min(255, Math.max(0, data[i] + noise));
              data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
              data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
          }
          ctx.putImageData(imageData, padding, padding);

          // Date Stamp
          const now = new Date();
          const year = now.getFullYear().toString().slice(2);
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          const day = now.getDate().toString().padStart(2, '0');
          const dateStr = `'${year} ${month} ${day}`;
          
          ctx.font = 'bold 24px "Courier New", monospace';
          ctx.fillStyle = 'rgba(255, 140, 0, 0.85)';
          ctx.textAlign = 'right';
          ctx.fillText(dateStr, width - padding - 20, height - bottomPadding - 30);

          // Caption
          if (caption) {
              ctx.fillStyle = "#292524";
              ctx.font = 'normal 50px "Caveat", "Ma Shan Zheng", cursive';
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              const textY = height - (bottomPadding / 2) + 10;
              ctx.fillText(caption, width / 2, textY);
          }

          setGeneratedUrl(canvas.toDataURL('image/jpeg', 0.9));
      };
  };

  const handleDownload = () => {
      if (generatedUrl) {
          const link = document.createElement('a');
          link.download = `polaroid-${Date.now()}.jpg`;
          link.href = generatedUrl;
          link.click();
      }
  };

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        style={{
            background: "#1c1917", // Charcoal
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}
    >
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(#57534e 1px, transparent 1px)`, backgroundSize: '24px 24px' }}></div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Back Button */}
        <button 
            onClick={onBack}
            className="absolute top-6 left-6 z-50 flex items-center gap-2 text-stone-400 hover:text-white transition-colors bg-stone-800/50 px-4 py-2 rounded-full backdrop-blur-md border border-stone-700"
        >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">返回博客</span>
        </button>

        {/* Main Workspace */}
        <div className="relative w-full max-w-md px-4 flex flex-col items-center">
            
            {/* The "Camera" Body */}
            <div className="w-full max-w-[320px] bg-[#292524]/90 backdrop-blur-md rounded-t-2xl p-6 border border-stone-700/50 relative z-30 shadow-2xl">
                 {/* Lens / Viewfinder Area */}
                 <div className="w-full aspect-square bg-[#0c0a09] rounded-lg border-2 border-stone-800 mb-6 relative overflow-hidden flex items-center justify-center group shadow-inner">
                      {image ? (
                          <img src={image} alt="Preview" className="w-full h-full object-cover opacity-80" />
                      ) : (
                          <div className="text-stone-700 flex flex-col items-center gap-2">
                              <ImageIcon size={48} />
                              <span className="text-xs uppercase tracking-widest">未放入底片</span>
                          </div>
                      )}
                      
                      {/* Upload Overlay */}
                      <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                          <Upload size={32} className="mb-2" />
                          <span className="text-xs font-bold uppercase">插入照片</span>
                          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                 </div>

                 {/* Controls */}
                 <div className="space-y-4">
                     <input 
                        type="text" 
                        placeholder="写下这一刻的心情..." 
                        maxLength={25}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full bg-[#1c1917] text-center text-stone-300 placeholder:text-stone-600 border border-stone-700 rounded p-2 text-sm font-handwriting outline-none focus:border-stone-500 transition-colors"
                     />
                     
                     <button 
                        onClick={handlePrint}
                        disabled={!image || isProcessing || showPolaroid}
                        className={`
                            w-full py-3 rounded-lg font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                            ${!image || isProcessing || showPolaroid 
                                ? 'bg-stone-800 text-stone-600 cursor-not-allowed' 
                                : 'bg-red-800 hover:bg-red-700 text-white shadow-lg active:scale-95 border border-red-900'}
                        `}
                     >
                        {isProcessing ? '冲洗中...' : (
                            <>
                                <Printer size={18} />
                                打印照片
                            </>
                        )}
                     </button>
                 </div>
            </div>

            {/* The Ejection Slot / Result Area */}
            <div className="relative w-full max-w-[320px] z-20">
                 <div className="absolute top-0 left-2 right-2 h-2 bg-black/50 rounded-full blur-sm z-30"></div>
                 
                 <div className={`
                    relative w-full flex justify-center origin-top transition-all duration-[2000ms] ease-out
                    ${showPolaroid ? 'translate-y-0 opacity-100' : '-translate-y-[90%] opacity-0 pointer-events-none'}
                 `}>
                      {/* Result Card */}
                      <div className="bg-[#fafaf9] p-4 pb-12 shadow-2xl w-[280px] transform rotate-1 mt-[-10px] relative group border border-stone-200">
                          <div className="aspect-square bg-[#1c1917] mb-4 overflow-hidden relative">
                              {generatedUrl ? (
                                  <>
                                    <img 
                                        src={generatedUrl} 
                                        className={`w-full h-full object-cover transition-all duration-[5000ms] ease-in-out ${isDeveloping ? 'brightness-[0.1] grayscale blur-[1px]' : 'brightness-100 grayscale-0 blur-0'}`}
                                        alt="Generated" 
                                    />
                                    {isDeveloping && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="text-white/20 text-xs font-bold uppercase tracking-widest animate-pulse">处理中...</div>
                                        </div>
                                    )}
                                  </>
                              ) : (
                                  <div className="w-full h-full bg-black"></div>
                              )}
                          </div>
                          
                          {/* Reset / Download Buttons (Only visible when done) */}
                          {generatedUrl && !isDeveloping && (
                              <div className="absolute -bottom-14 left-0 w-full flex justify-center gap-4 animate-fade-in">
                                  <button onClick={() => { setShowPolaroid(false); setImage(null); setCaption(''); }} className="p-3 bg-stone-700 text-white rounded-full hover:bg-stone-600 shadow-lg transition-transform hover:scale-110" title="新照片">
                                      <RotateCcw size={20} />
                                  </button>
                                  <button onClick={handleDownload} className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest rounded-full hover:bg-stone-200 shadow-lg transition-transform hover:scale-105 flex items-center gap-2" title="保存图片">
                                      <Download size={18} />
                                      <span>导出照片</span>
                                  </button>
                              </div>
                          )}
                      </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default PolaroidGenerator;