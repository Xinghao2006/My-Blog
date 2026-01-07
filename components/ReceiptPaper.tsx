import React, { useEffect, useRef } from 'react';
import { ReceiptData } from '../types';
import JsBarcode from 'jsbarcode';

interface ReceiptPaperProps {
  data: ReceiptData;
  onBarcodeClick: () => void;
  isPrinting?: boolean;
}

const ReceiptPaper: React.FC<ReceiptPaperProps> = ({ data, onBarcodeClick, isPrinting }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, "LIFE-2006-2026", {
          format: "CODE128",
          lineColor: "#000000", // Darker barcode
          width: 1.5,
          height: 35, // Slightly shorter barcode
          displayValue: true,
          fontSize: 12,
          fontOptions: "bold",
          font: "Courier Prime",
          background: "transparent",
          margin: 0
        });
      } catch (e) {
        console.error("Barcode generation failed", e);
      }
    }
  }, [data]);

  return (
    <div className={`relative w-full max-w-[340px] mx-auto filter drop-shadow-2xl ${isPrinting ? 'animate-print origin-top' : ''}`}>
      {/* Top jagged edge */}
      <div 
        className="w-full h-4 bg-paper relative z-10"
        style={{
          background: 'linear-gradient(135deg, transparent 5px, #fcfcfc 0) top left, linear-gradient(225deg, transparent 5px, #fcfcfc 0) top right',
          backgroundSize: '10px 10px',
          backgroundRepeat: 'repeat-x'
        }}
      />

      {/* Main Body - Removed min-h to allow compact fit */}
      <div className="bg-paper text-ink font-receipt px-6 py-4 flex flex-col items-stretch">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-black tracking-widest mb-1 text-black">人生有限公司</h1>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">官方凭证</p>
          <p className="text-xs font-bold mt-1 text-gray-800">{data.dateRange}</p>
        </div>

        {/* Meta */}
        <div className="text-xs mb-3 flex justify-between uppercase text-gray-700 font-bold border-b-2 border-dashed border-gray-400 pb-2">
          <span>收银员:</span>
          <span className="text-black">{data.cashier}</span>
        </div>

        {/* Items */}
        <div className="space-y-3 mb-4">
          {data.items.map((item, index) => (
            <div key={index} className="flex flex-col text-sm group cursor-default">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold text-black text-[14px]">
                  {item.qty}x {item.name}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-[12px] text-gray-600 pl-4 relative">
                 {/* Dotted leader */}
                 <span className="absolute left-2 right-0 bottom-1 border-b-2 border-dotted border-gray-300 -z-10"></span>
                 <span className="bg-paper pr-2 z-0 relative font-medium">...</span>
                 <span className="bg-paper pl-2 z-0 relative font-bold text-gray-800">{item.price}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-b-2 border-dashed border-gray-400 mb-4"></div>

        {/* Totals */}
        <div className="space-y-2 text-sm uppercase font-bold mb-6">
          <div className="flex justify-between text-lg text-black items-end">
            <span>{data.totalLabel}</span>
            <span className="text-xl">{data.totalValue}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-[12px]">
            <span>{data.taxLabel}</span>
            <span>{data.taxValue}</span>
          </div>
        </div>

        {/* Footer / Interactive Area */}
        <div className="mt-auto flex flex-col items-center space-y-4">
          <p className="text-[10px] font-bold text-center uppercase text-gray-500 leading-relaxed">
            感谢您光临人生。<br/>
            凭此票据可兑换回忆一份。<br/>
            恕不退换。
          </p>
          
          <button 
            onClick={onBarcodeClick}
            className="w-full group hover:opacity-80 transition-opacity active:scale-95 duration-200 flex justify-center p-1 bg-white rounded border border-transparent hover:border-gray-200"
            aria-label="扫描条形码查看记忆"
          >
            {/* Real Barcode Visual */}
            <svg ref={barcodeRef} className="w-full max-w-full"></svg>
          </button>
        </div>
      </div>

      {/* Bottom jagged edge */}
      <div 
        className="w-full h-4 bg-paper relative z-10 transform rotate-180"
        style={{
          background: 'linear-gradient(135deg, transparent 5px, #fcfcfc 0) top left, linear-gradient(225deg, transparent 5px, #fcfcfc 0) top right',
          backgroundSize: '10px 10px',
          backgroundRepeat: 'repeat-x'
        }}
      />
    </div>
  );
};

export default ReceiptPaper;