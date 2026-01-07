import React, { useState } from 'react';
import { PolaroidData } from '../types';

interface PolaroidProps {
  data: PolaroidData | null;
  onClose: () => void;
}

const Polaroid: React.FC<PolaroidProps> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#fdfdfd] shadow-2xl max-w-[340px] w-full max-h-[85vh] overflow-y-auto flex flex-col relative rounded-sm"
        style={{ 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-50 z-20 mix-blend-multiply" 
             style={{ 
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")` 
             }}>
        </div>

        {/* Date Stamp Header */}
        <div className="sticky top-0 bg-[#fdfdfd]/95 backdrop-blur z-10 p-4 border-b border-gray-100 flex justify-between items-center">
            <span className="font-mono text-xs text-gray-400 tracking-widest uppercase">{data.date}</span>
            <button 
                onClick={onClose}
                className="text-gray-400 hover:text-black transition-colors"
            >
                ✕
            </button>
        </div>

        {/* Content Stream */}
        <div className="p-4 space-y-6 pb-12">
            {data.items.map((item) => (
                <div key={item.id} className="animate-fade-in">
                    {item.type === 'image' ? (
                         <div className="p-2 bg-white border border-gray-100 shadow-sm transform rotate-[0.5deg]">
                            <div className="aspect-square bg-gray-100 overflow-hidden relative">
                                <img 
                                    src={item.content} 
                                    alt="Memory" 
                                    className="w-full h-full object-cover filter sepia-[0.2] contrast-105"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
                                    }}
                                />
                                <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="px-2">
                             <p className="font-handwriting text-xl leading-relaxed text-gray-800 whitespace-pre-wrap">
                                {item.content}
                             </p>
                        </div>
                    )}
                </div>
            ))}
            
            {/* End Mark */}
            <div className="flex justify-center pt-4 opacity-50">
                <div className="w-2 h-2 rounded-full bg-gray-300 mx-1"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 mx-1"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 mx-1"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Polaroid;