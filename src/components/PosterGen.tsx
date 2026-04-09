import React, { useState } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Download,
  Loader2,
  RefreshCw,
  Share2,
  Copy
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type ToolType = 'poster' | 'visual';

const PosterGen: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('poster');
  const [posterPrompt, setPosterPrompt] = useState('');
  const [visualPrompt, setVisualPrompt] = useState('');
  const [posterDetails, setPosterDetails] = useState({
    brand: '',
    headline: '',
    cta: '',
    style: 'Modern'
  });
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  const handleGeneratePoster = async () => {
    setLoading(true);
    setGeneratedImage(null);
    try {
      const fullPrompt = `Create a professional marketing poster for a brand named "${posterDetails.brand}". 
      The main headline is "${posterDetails.headline}". 
      The call to action is "${posterDetails.cta}". 
      Style: ${posterDetails.style}. 
      Visual description: ${posterPrompt}. 
      The poster should have clear, readable text for the brand and headline.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "3:4"
          }
        }
      });
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('permission denied')) {
        setNeedsApiKey(true);
      }
      alert('Error generating poster. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!visualPrompt) return;
    setLoading(true);
    setGeneratedImage(null);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: visualPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('permission denied')) {
        setNeedsApiKey(true);
      }
      alert('Error generating image. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `idea2sale-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-display font-bold text-brand-700 tracking-tight flex items-center gap-3">
            Poster & Image Gen
            <ImageIcon className="text-brand-500" size={32} />
          </h2>
          <p className="text-slate-500 mt-1 text-lg">Create stunning visuals for your brand.</p>
        </div>
        <div className="flex bg-brand-100/50 p-1.5 rounded-2xl border border-brand-200 backdrop-blur-sm">
          {[
            { id: 'poster', label: 'Poster Maker', icon: ImageIcon },
            { id: 'visual', label: 'Image Gen', icon: Sparkles },
          ].map((tool) => (
            <button 
              key={tool.id}
              onClick={() => setActiveTool(tool.id as ToolType)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap",
                activeTool === tool.id 
                  ? "bg-white text-brand-700 shadow-md scale-105" 
                  : "text-brand-500 hover:text-brand-800"
              )}
            >
              <tool.icon size={18} />
              {tool.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-8">
          <div className="glass p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden">
            {activeTool === 'poster' ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Brand Name</label>
                    <input 
                      type="text" 
                      value={posterDetails.brand}
                      onChange={(e) => setPosterDetails({...posterDetails, brand: e.target.value})}
                      placeholder="e.g., Brown Coffee"
                      className="w-full p-4 rounded-2xl bg-brand-50 border border-brand-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Style</label>
                    <select 
                      value={posterDetails.style}
                      onChange={(e) => setPosterDetails({...posterDetails, style: e.target.value})}
                      className="w-full p-4 rounded-2xl bg-brand-50 border border-brand-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    >
                      <option>Modern</option>
                      <option>Vintage</option>
                      <option>Minimalist</option>
                      <option>Luxury</option>
                      <option>Cyberpunk</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Main Headline</label>
                  <input 
                    type="text" 
                    value={posterDetails.headline}
                    onChange={(e) => setPosterDetails({...posterDetails, headline: e.target.value})}
                    placeholder="e.g., Best Coffee in Town"
                    className="w-full p-4 rounded-2xl bg-brand-50 border border-brand-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Call to Action</label>
                  <input 
                    type="text" 
                    value={posterDetails.cta}
                    onChange={(e) => setPosterDetails({...posterDetails, cta: e.target.value})}
                    placeholder="e.g., Order Now"
                    className="w-full p-4 rounded-2xl bg-brand-50 border border-brand-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Visual Theme</label>
                  <textarea
                    value={posterPrompt}
                    onChange={(e) => setPosterPrompt(e.target.value)}
                    placeholder="Describe the background and atmosphere..."
                    className="w-full h-28 p-4 rounded-2xl bg-brand-50 border border-brand-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Visual Concept</label>
                <textarea
                  value={visualPrompt}
                  onChange={(e) => setVisualPrompt(e.target.value)}
                  placeholder="e.g., A modern minimalist poster for a skincare brand with natural ingredients..."
                  className="w-full h-56 p-5 rounded-2xl bg-brand-50 border border-brand-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                />
              </div>
            )}
            
            <button
              onClick={activeTool === 'poster' ? handleGeneratePoster : handleGenerateImage}
              disabled={loading || (activeTool === 'visual' && !visualPrompt)}
              className="w-full bg-gradient-to-r from-brand-600 to-crab-shell hover:from-brand-700 hover:to-crab-shell/90 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-500/20"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={22} />}
              <span className="text-lg">{loading ? 'Generating Magic...' : 'Generate with AI'}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="glass p-8 rounded-[2.5rem] min-h-[600px] flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-brand-700 flex items-center gap-2">
                <div className="w-2 h-6 bg-brand-500 rounded-full" />
                AI Generation Result
              </h3>
              {generatedImage && (
                <button 
                  onClick={handleDownload}
                  className="p-3 bg-brand-50 text-brand-500 hover:bg-brand-100 rounded-xl transition-all border border-brand-200"
                >
                  <Download size={20} />
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              {!generatedImage && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-brand-300 space-y-6">
                  <div className="w-24 h-24 bg-brand-50 rounded-[2rem] flex items-center justify-center border border-brand-100 shadow-inner">
                    <ImageIcon size={40} className="text-brand-200" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-brand-500">Ready to create?</p>
                    <p className="text-sm">Your AI-generated image will appear here.</p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-600 animate-pulse" size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-brand-700 animate-pulse">Crafting your masterpiece...</p>
                    <p className="text-brand-500">This usually takes a few seconds.</p>
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {generatedImage && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white group relative"
                  >
                    <img 
                      src={generatedImage} 
                      alt="AI Generated" 
                      className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosterGen;
