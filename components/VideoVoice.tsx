'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Video as VideoIcon, 
  Mic, 
  Download,
  Loader2,
  RefreshCw,
  Volume2,
  Lock,
  Unlock,
  Image as ImageIcon
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type ToolType = 'video' | 'voice';

const VideoVoice: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('video');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoLanguage, setVideoLanguage] = useState<'Khmer' | 'English'>('Khmer');
  const [voiceLanguage, setVoiceLanguage] = useState<'Khmer' | 'English'>('Khmer');
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [ttsText, setTtsText] = useState('');
  const [targetDuration, setTargetDuration] = useState<number>(1);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [videoImage, setVideoImage] = useState<string | null>(null);
  const [videoImageMimeType, setVideoImageMimeType] = useState<string | null>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  const pcmToWav = (pcmBase64: string, sampleRate: number = 24000): string => {
    const binaryString = atob(pcmBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + len, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, len, true);
    const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };

  const checkApiKey = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setNeedsApiKey(true);
        return false;
      }
    }
    return true;
  };

  const handleOpenKeySelector = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setNeedsApiKey(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt && !videoImage) return;
    const hasKey = await checkApiKey();
    if (!hasKey) return;

    setLoading(true);
    setGeneratedVideo(null);
    try {
      const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY || '' });
      const videoConfig: any = {
        model: 'veo-3.1-lite-generate-preview',
        prompt: `${videoLanguage === 'Khmer' ? 'In Khmer context: ' : ''}${videoPrompt}`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      };
      if (videoImage && videoImageMimeType) {
        videoConfig.image = { imageBytes: videoImage, mimeType: videoImageMimeType };
      }
      let operation = await videoAi.models.generateVideos(videoConfig);
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await videoAi.operations.getVideosOperation({ operation: operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: { 'x-goog-api-key': process.env.API_KEY || process.env.GEMINI_API_KEY || '' },
        });
        const blob = await response.blob();
        setGeneratedVideo(URL.createObjectURL(blob));
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('permission denied')) setNeedsApiKey(true);
      alert('Error generating video. Video generation requires a paid Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!ttsText) return;
    const hasKey = await checkApiKey();
    if (!hasKey) return;

    setAudioLoading(true);
    setGeneratedAudio(null);
    try {
      const voiceAi = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY || '' });
      const timedPrompt = `Please read the following text in ${voiceLanguage}. 
      Target: Aim for a total duration of approximately ${targetDuration} minute(s). 
      Text to read: ${ttsText}`;

      const response = await voiceAi.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: timedPrompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        setGeneratedAudio(pcmToWav(base64Audio, 24000));
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('permission denied')) setNeedsApiKey(true);
      alert('Error generating audio. Please check your API key.');
    } finally {
      setAudioLoading(false);
    }
  };

  const handleDownload = () => {
    if (activeTool === 'video' && generatedVideo) {
      const link = document.createElement('a');
      link.href = generatedVideo;
      link.download = `marketing-engine-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeTool === 'voice' && generatedAudio) {
      const link = document.createElement('a');
      link.href = generatedAudio;
      link.download = `marketing-engine-audio-${Date.now()}.wav`;
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
            Video & AI Voice
            <VideoIcon className="text-brand-500" size={32} />
          </h2>
          <p className="text-slate-500 mt-1 text-lg">Create immersive video and audio content.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          {needsApiKey && (
            <button 
              onClick={handleOpenKeySelector}
              className="text-xs bg-crab-shell text-white px-6 py-3 rounded-full font-bold hover:bg-crab-shell/90 transition-all flex items-center gap-2 shadow-lg animate-bounce"
            >
              <Lock size={14} />
              Unlock Premium AI Features
            </button>
          )}
          <div className="flex bg-brand-100/50 p-1.5 rounded-2xl border border-brand-200 backdrop-blur-sm">
            {[
              { id: 'video', label: 'Video Creator', icon: VideoIcon },
              { id: 'voice', label: 'AI Voice', icon: Mic },
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
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-8">
          <div className="glass p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden">
            {activeTool === 'video' ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Starting Image (Optional)</label>
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-brand-200 rounded-2xl bg-brand-50 hover:bg-brand-100 transition-all cursor-pointer">
                    {videoImage ? (
                      <img src={`data:${videoImageMimeType};base64,${videoImage}`} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <ImageIcon className="text-brand-300" size={32} />
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setVideoImage((reader.result as string).split(',')[1]);
                          setVideoImageMimeType(file.type);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Scene Description</label>
                    <div className="flex bg-brand-50 p-1 rounded-xl border border-brand-100">
                      {['Khmer', 'English'].map(lang => (
                        <button key={lang} onClick={() => setVideoLanguage(lang as any)} className={cn("px-3 py-1 rounded-lg text-[10px] font-black", videoLanguage === lang ? "bg-white text-brand-700 shadow-sm" : "text-brand-400")}>{lang}</button>
                      ))}
                    </div>
                  </div>
                  <textarea value={videoPrompt} onChange={(e) => setVideoPrompt(e.target.value)} className="w-full h-32 p-5 rounded-2xl bg-brand-50 border border-brand-200 outline-none transition-all resize-none" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Script Text</label>
                  <div className="flex bg-brand-50 p-1 rounded-xl border border-brand-100">
                    {['Khmer', 'English'].map(lang => (
                      <button key={lang} onClick={() => setVoiceLanguage(lang as any)} className={cn("px-3 py-1 rounded-lg text-[10px] font-black", voiceLanguage === lang ? "bg-white text-brand-700 shadow-sm" : "text-brand-400")}>{lang}</button>
                    ))}
                  </div>
                </div>
                <textarea value={ttsText} onChange={(e) => setTtsText(e.target.value)} className="w-full h-48 p-4 rounded-2xl bg-brand-50 border border-brand-200 outline-none transition-all resize-none" />
              </div>
            )}
            <button onClick={activeTool === 'video' ? handleGenerateVideo : handleGenerateAudio} className="w-full bg-gradient-to-r from-brand-600 to-crab-shell text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl">
              {loading || audioLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={22} />}
              <span className="text-lg">{loading || audioLoading ? 'Generating...' : 'Generate with AI'}</span>
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
              {(generatedVideo || generatedAudio) && (
                <button onClick={handleDownload} className="p-3 bg-brand-50 text-brand-500 hover:bg-brand-100 rounded-xl transition-all border border-brand-200">
                  <Download size={20} />
                </button>
              )}
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              {loading || audioLoading ? (
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-brand-600 mx-auto" />
                  <p className="text-brand-700 font-bold">Crafting your content...</p>
                </div>
              ) : activeTool === 'video' && generatedVideo ? (
                <video src={generatedVideo} controls className="w-full rounded-3xl shadow-2xl" />
              ) : activeTool === 'voice' && generatedAudio ? (
                <div className="text-center space-y-6">
                  <Volume2 size={64} className="text-brand-600 mx-auto" />
                  <audio src={generatedAudio} controls className="w-full" />
                </div>
              ) : (
                <div className="text-center text-brand-300 space-y-4">
                  <Sparkles size={48} className="mx-auto" />
                  <p>Your AI content will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoVoice;
