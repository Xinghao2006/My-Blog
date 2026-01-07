import React, { useState } from 'react';
import { ReceiptData, ReceiptItem, HiddenContentItem } from '../types';
import { Plus, Trash2, X, Save, Image as ImageIcon, Type as TypeIcon, Upload, Loader2, AlertCircle } from 'lucide-react';

interface EditorProps {
  data: ReceiptData;
  onChange: (data: ReceiptData) => void;
  onClose: () => void;
  onSave: () => void;
}

const Editor: React.FC<EditorProps> = ({ data, onChange, onClose, onSave }) => {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  
  const updateField = (field: keyof ReceiptData, value: string) => {
    onChange({ ...data, [field]: value } as any);
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: string | number) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    onChange({
      ...data,
      items: [...data.items, { name: "新项目", qty: 1, price: "无价" }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);
    onChange({ ...data, items: newItems });
  };

  // --- Hidden Content Logic ---

  const addHiddenContent = (type: 'text' | 'image') => {
    const newContent: HiddenContentItem = {
      id: Date.now().toString(),
      type,
      content: type === 'image' ? '' : ''
    };
    const currentContent = data.hiddenContent || [];
    onChange({ ...data, hiddenContent: [...currentContent, newContent] });
  };

  const updateHiddenContent = (id: string, value: string) => {
    const currentContent = data.hiddenContent || [];
    const newContent = currentContent.map(item => 
      item.id === id ? { ...item, content: value } : item
    );
    onChange({ ...data, hiddenContent: newContent });
  };

  const removeHiddenContent = (id: string) => {
    const currentContent = data.hiddenContent || [];
    onChange({ ...data, hiddenContent: currentContent.filter(item => item.id !== id) });
  };

  // --- Image Upload Logic ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingId(id);

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Try a different ImgBB Key, but keep logic robust
      // Note: Ideally users should supply their own key in a real production app
      const API_KEY = 'e7a9359d949437140733159275034633'; 
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        updateHiddenContent(id, result.data.url);
      } else {
        console.warn('ImgBB Upload Failed:', result);
        throw new Error(result.error?.message || 'API Error');
      }
    } catch (error) {
      console.error('Upload failed, falling back to Base64:', error);
      
      // Fallback: Use Base64 if API fails (Works for small images < 100KB usually)
      if (file.size < 150 * 1024) { // Limit fallback to 150KB to prevent URL crashes
          const reader = new FileReader();
          reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                  updateHiddenContent(id, reader.result);
                  alert(`图床上传失败 (${(error as Error).message})，已自动切换为本地存储模式。\n注意：生成的分享链接可能会变得很长。`);
              }
          };
          reader.readAsDataURL(file);
      } else {
          alert(`上传失败: ${(error as Error).message}\n且图片过大 (${(file.size/1024).toFixed(0)}KB) 无法使用本地存储。建议使用小于100KB的图片。`);
      }
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex flex-col animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 shrink-0">
        <h2 className="text-white font-bold text-lg">定制您的收据</h2>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        
        {/* Basic Info Section */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">基础信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">店铺/收银员</label>
              <input 
                type="text" 
                value={data.cashier || ''} 
                onChange={(e) => updateField('cashier', e.target.value)}
                className="w-full bg-gray-800 text-white rounded p-2 text-sm border border-gray-700 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">日期范围</label>
              <input 
                type="text" 
                value={data.dateRange || ''} 
                onChange={(e) => updateField('dateRange', e.target.value)}
                className="w-full bg-gray-800 text-white rounded p-2 text-sm border border-gray-700 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Items Section */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">清单项目 ({data.items ? data.items.length : 0})</h3>
            <button onClick={addItem} className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded">
              <Plus size={14} /> 添加
            </button>
          </div>
          
          <div className="space-y-2">
            {(data.items || []).map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start bg-gray-800 p-2 rounded border border-gray-700">
                <input 
                  type="number" 
                  value={item.qty} 
                  onChange={(e) => updateItem(idx, 'qty', parseInt(e.target.value) || 0)}
                  className="w-10 bg-gray-900 text-center text-white rounded p-1 text-sm border border-gray-600"
                />
                <div className="flex-1 space-y-1">
                  <input 
                    type="text" 
                    value={item.name || ''} 
                    onChange={(e) => updateItem(idx, 'name', e.target.value)}
                    className="w-full bg-transparent text-white border-b border-gray-600 focus:border-blue-500 outline-none text-sm pb-1"
                    placeholder="项目名称"
                  />
                  <input 
                    type="text" 
                    value={item.price || ''} 
                    onChange={(e) => updateItem(idx, 'price', e.target.value)}
                    className="w-full bg-transparent text-gray-400 text-xs outline-none"
                    placeholder="价格/代价"
                  />
                </div>
                <button onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:text-red-300">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Hidden Content Section (New) */}
        <section className="space-y-4 pt-4 border-t border-gray-700">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon size={16} /> 彩蛋配置池 (盲盒模式)
            </h3>
            <p className="text-[10px] text-gray-400">
                添加多个图片和文字作为<b>“盲盒”池</b>。<br/>
                每次扫描条形码，系统会从中<b>随机抽取</b>一张图片和一段文字组合展示。
            </p>
          </div>
          
          <div className="space-y-3">
             {(data.hiddenContent || []).map((item, idx) => (
               <div key={item.id} className="bg-gray-800 p-3 rounded border border-gray-700 relative group transition-all">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                          {item.type === 'image' ? <ImageIcon size={10} /> : <TypeIcon size={10} />}
                          {item.type === 'image' ? '图片素材' : '文字素材'}
                      </span>
                      <button onClick={() => removeHiddenContent(item.id)} className="p-1 hover:bg-red-900/50 text-red-400 rounded"><Trash2 size={12}/></button>
                  </div>

                  {item.type === 'image' ? (
                      <div className="flex items-center gap-4">
                          {/* Hidden Input */}
                          <input 
                            type="file" 
                            id={`file-${item.id}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, item.id)}
                            disabled={uploadingId === item.id}
                          />

                          {/* Preview or Placeholder */}
                          {item.content ? (
                              <div className="relative w-20 h-20 bg-black rounded overflow-hidden border border-gray-600 shrink-0">
                                  <img src={item.content} alt="Preview" className="w-full h-full object-cover" />
                              </div>
                          ) : (
                              <div className="w-20 h-20 bg-gray-900 rounded border border-dashed border-gray-600 flex items-center justify-center text-gray-600 shrink-0">
                                  <ImageIcon size={20} />
                              </div>
                          )}

                          {/* Action Button */}
                          <div className="flex-1">
                              {uploadingId === item.id ? (
                                  <div className="flex items-center gap-2 text-purple-400 text-sm">
                                      <Loader2 size={16} className="animate-spin" />
                                      上传中...
                                  </div>
                              ) : (
                                  <label 
                                    htmlFor={`file-${item.id}`}
                                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white transition-colors border border-gray-600"
                                  >
                                      <Upload size={14} />
                                      {item.content ? "更换图片" : "上传图片"}
                                  </label>
                              )}
                              <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                                  {item.content ? (
                                    item.content.startsWith('data:') ? 
                                    <span className="text-yellow-500 flex items-center gap-1"><AlertCircle size={10}/> 已使用本地存储模式</span> : 
                                    "图片链接已生成 (隐藏)"
                                  ) : "点击按钮从设备选择"}
                              </p>
                          </div>
                      </div>
                  ) : (
                      <textarea 
                        value={item.content}
                        onChange={(e) => updateHiddenContent(item.id, e.target.value)}
                        rows={2}
                        placeholder="输入一段可选的文案..."
                        className="w-full bg-gray-900 text-white rounded p-2 text-sm border border-gray-600 focus:border-purple-500 outline-none font-handwriting"
                      />
                  )}
               </div>
             ))}
          </div>

          <div className="flex gap-2">
             <button onClick={() => addHiddenContent('text')} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-xs flex items-center justify-center gap-2 transition-colors">
                <TypeIcon size={14} /> 添加文字素材
             </button>
             <button onClick={() => addHiddenContent('image')} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-xs flex items-center justify-center gap-2 transition-colors">
                <ImageIcon size={14} /> 添加图片素材
             </button>
          </div>
        </section>
        
        {/* Footer Totals */}
        <section className="space-y-4 pt-4 border-t border-gray-700">
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">底部总结</h3>
           <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">总计标签</label>
              <input type="text" value={data.totalLabel || ''} onChange={(e) => updateField('totalLabel', e.target.value)} className="w-full bg-gray-800 text-white rounded p-2 text-sm border border-gray-700" />
            </div>
             <div>
              <label className="block text-xs text-gray-500 mb-1">总计值</label>
              <input type="text" value={data.totalValue || ''} onChange={(e) => updateField('totalValue', e.target.value)} className="w-full bg-gray-800 text-white rounded p-2 text-sm border border-gray-700" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">税费标签</label>
              <input type="text" value={data.taxLabel || ''} onChange={(e) => updateField('taxLabel', e.target.value)} className="w-full bg-gray-800 text-white rounded p-2 text-sm border border-gray-700" />
            </div>
             <div>
              <label className="block text-xs text-gray-500 mb-1">税费值</label>
              <input type="text" value={data.taxValue || ''} onChange={(e) => updateField('taxValue', e.target.value)} className="w-full bg-gray-800 text-white rounded p-2 text-sm border border-gray-700" />
            </div>
           </div>
        </section>

      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 shrink-0 safe-area-bottom">
        <button 
          onClick={onSave}
          className="w-full bg-white text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
        >
          <Save size={20} />
          生成并分享网页
        </button>
      </div>
    </div>
  );
};

export default Editor;