import React, { useState, useEffect } from 'react';
import ReceiptPaper from './ReceiptPaper';
import Polaroid from './Polaroid';
import Editor from './Editor';
import { generatePolaroidStory } from '../services/geminiService';
import { ReceiptData, PolaroidData, HiddenContentItem } from '../types';
import { Edit2, Share2, ArrowLeft } from 'lucide-react';

// Default data constant
const DEFAULT_RECEIPT: ReceiptData = {
  dateRange: "2006.02.09 - 2026.02.09",
  cashier: "教务系统",
  items: [
    { qty: 1, name: "Hello World", price: "梦开始的地方" },
    { qty: 1024, name: "写代码", price: "发际线后移" },
    { qty: 1, name: "高等数学", price: "低空飘过" },
    { qty: 404, name: "找对象", price: "Not Found" },
    { qty: 365, name: "早八", price: "困意" },
    { qty: 100, name: "冰美式", price: "续命水" }
  ],
  totalLabel: "当前状态",
  totalValue: "正在编译...",
  taxLabel: "额外支出",
  taxValue: "颈椎康复费",
  hiddenContent: [
    { id: 'img1', type: 'image', content: "https://images.pexels.com/photos/57980/pexels-photo-57980.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: 'txt1', type: 'text', content: "只有在编译通过的那一刻，世界才是美好的。" },
    // ... Keeping logic concise, assuming service has randomizers
    { id: 'txt2', type: 'text', content: "凌晨四点的城市，和未闭合的标签页。" }
  ]
};

// Helpers for Base64
const toBase64 = (str: string) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    (match, p1) => String.fromCharCode(parseInt(p1, 16)))
  );
};

const fromBase64 = (str: string) => {
  try {
    let safeStr = str.replace(/ /g, '+');
    while (safeStr.length % 4) safeStr += '=';
    return decodeURIComponent(atob(safeStr).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    console.error("Base64 decoding failed:", e);
    throw new Error("Invalid config string");
  }
};

interface ReceiptGeneratorProps {
  onBack: () => void;
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ onBack }) => {
  const [receiptData, setReceiptData] = useState<ReceiptData>(DEFAULT_RECEIPT);
  const [polaroidData, setPolaroidData] = useState<PolaroidData | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    const handleStateLoad = () => {
      try {
        let configStr = "";
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        
        if (hashParams.has('config')) {
            configStr = hashParams.get('config') || "";
        } 
        
        if (configStr) {
            const decoded: ReceiptData = JSON.parse(fromBase64(configStr));
            setReceiptData(decoded);
            setIsPrinting(true);
            setTimeout(() => setIsPrinting(false), 1600);
        }
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    };

    handleStateLoad();
  }, []);

  const handleBarcodeClick = async () => {
    if (receiptData.hiddenContent && receiptData.hiddenContent.length > 0) {
        const images = receiptData.hiddenContent.filter(i => i.type === 'image');
        const texts = receiptData.hiddenContent.filter(i => i.type === 'text');
        const selectedItems: HiddenContentItem[] = [];

        if (images.length > 0) selectedItems.push(images[Math.floor(Math.random() * images.length)]);
        if (texts.length > 0) selectedItems.push(texts[Math.floor(Math.random() * texts.length)]);

        if (selectedItems.length > 0) {
            setPolaroidData({
                items: selectedItems,
                date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')
            });
            return;
        }
    }

    const randomItem = receiptData.items[Math.floor(Math.random() * receiptData.items.length)];
    const generatedItems = await generatePolaroidStory(randomItem.name);
    
    setPolaroidData({
      items: generatedItems,
      date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')
    });
  };

  const handleSave = async () => {
      try {
        const jsonString = JSON.stringify(receiptData);
        const encoded = toBase64(jsonString);
        const urlSafeEncoded = encodeURIComponent(encoded);
        const hashString = `config=${urlSafeEncoded}`;
        
        // Update URL safely without reloading
        window.location.hash = hashString;
        
        // Robust copy
        const targetUrl = window.location.href;
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(targetUrl);
        } else {
             const textArea = document.createElement("textarea");
             textArea.value = targetUrl;
             document.body.appendChild(textArea);
             textArea.select();
             document.execCommand('copy');
             document.body.removeChild(textArea);
        }
        
        setShowShareToast(true);
      } catch (err) {
        console.error("Share failed", err);
      }

      setTimeout(() => setShowShareToast(false), 3000);
      setIsEditorOpen(false);
      setIsPrinting(true);
      setTimeout(() => setIsPrinting(false), 1600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #bfdbfe, #ffffff)", // blue-200 to white
      }}
    >
      {/* Texture Overlay - Subtle clouds/noise */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-blue-800 hover:text-blue-900 transition-colors bg-white/60 px-4 py-2 rounded-full backdrop-blur-md shadow-sm border border-blue-100"
      >
        <ArrowLeft size={16} />
        <span className="text-sm font-medium">返回博客</span>
      </button>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-4 flex flex-col items-center transform scale-[0.85] sm:scale-100 origin-center transition-transform duration-300">
        <div className="w-[340px] h-2 bg-blue-900/10 rounded-full mb-[-2px] blur-[2px] relative z-20"></div>
        <div className="relative w-full perspective-1000">
             <ReceiptPaper 
                data={receiptData} 
                onBarcodeClick={handleBarcodeClick} 
                isPrinting={isPrinting}
             />
        </div>
      </div>

      {/* Controls UI */}
      <div className="absolute bottom-8 right-6 flex flex-col gap-4 z-40">
        <button 
          onClick={() => setIsEditorOpen(true)}
          className="w-12 h-12 bg-white text-blue-900 border border-blue-100 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 hover:bg-blue-50"
          title="定制内容"
        >
          <Edit2 size={20} />
        </button>
        <button 
            onClick={handleSave}
            className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 hover:bg-blue-700"
            title="复制分享链接"
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* Toast */}
      <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 bg-slate-800/90 text-white px-6 py-2 rounded-full backdrop-blur transition-all duration-300 z-50 shadow-lg ${showShareToast ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <p className="text-sm font-medium">链接已复制！快去分享吧。</p>
      </div>

      {/* Modals */}
      {isEditorOpen && (
        <Editor 
            data={receiptData} 
            onChange={setReceiptData} 
            onClose={() => setIsEditorOpen(false)} 
            onSave={handleSave}
        />
      )}

      {polaroidData && (
        <Polaroid 
            data={polaroidData} 
            onClose={() => setPolaroidData(null)} 
        />
      )}
    </div>
  );
};

export default ReceiptGenerator;