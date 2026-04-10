'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Users, 
  Heart, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Play, 
  MoreHorizontal,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { tiktokService, TikTokUser, TikTokAnalyticsData } from '@/services/tiktokService';

const tiktokData = {
  overview: [
    { label: 'Total Views', value: '2,199', change: '+5.2%', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50', trend: 'up' },
    { label: 'Estimated Earnings', value: '$0.00', change: '0%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: 'up' },
    { label: 'Engagement Rate', value: '58', change: '+12.4%', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', trend: 'up' },
    { label: 'Net Followers', value: '3', change: '+100%', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50', trend: 'up' },
  ],
  weeklyProgress: [
    { day: 'Mon', views: 12000, engagement: 800 },
    { day: 'Tue', views: 15000, engagement: 1200 },
    { day: 'Wed', views: 18000, engagement: 1500 },
    { day: 'Thu', views: 14000, engagement: 900 },
    { day: 'Fri', views: 22000, engagement: 1800 },
    { day: 'Sat', views: 25000, engagement: 2200 },
    { day: 'Sun', views: 18500, engagement: 1400 },
  ],
  contentPerformance: [
    { id: '1', title: 'AI Cafe Introduction', views: '450K', watchThrough: '68%', likes: '12K', thumbnail: 'https://picsum.photos/seed/tiktok1/400/600' },
    { id: '2', title: 'How AI Changes the World', views: '320K', watchThrough: '54%', likes: '28K', thumbnail: 'https://picsum.photos/seed/tiktok2/400/600' },
    { id: '3', title: 'Welcome to AI Cafe', views: '280K', watchThrough: '42%', likes: '18K', thumbnail: 'https://picsum.photos/seed/tiktok3/400/600' },
  ],
  audienceInsights: {
    gender: [
      { name: 'Female', value: 65, color: '#f43f5e' },
      { name: 'Male', value: 30, color: '#3b82f6' },
      { name: 'Other', value: 5, color: '#94a3b8' },
    ],
    age: [
      { range: '18-24', value: 45 },
      { range: '25-34', value: 35 },
      { range: '35-44', value: 15 },
      { range: '45+', value: 5 },
    ],
    location: [
      { city: 'Phnom Penh', value: '75%' },
      { city: 'Siem Reap', value: '15%' },
      { city: 'Battambang', value: '10%' },
    ]
  },
  trafficSources: [
    { source: 'For You Page', value: 82 },
    { source: 'Search', value: 12 },
    { source: 'Link in Bio', value: 6 },
  ],
  adTracking: {
    spend: '$1,240',
    revenue: '$3,850',
    roi: '310%',
    conversions: 145
  }
};

const TikTokAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '28d' | 'custom'>('7d');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
  const [userData, setUserData] = useState<TikTokUser | null>(null);
  const [analyticsData, setAnalyticsData] = useState<TikTokAnalyticsData | null>(null);
  const [hasNewUpdate, setHasNewUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("You have 1 update");

  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState(24); // Hours
  const [nextSyncTime, setNextSyncTime] = useState("23:59:59");
  const [uploadStatus, setUploadStatus] = useState<string | null>(localStorage.getItem('tiktok_upload_status'));
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), event: 'System Initialized', status: 'Success' },
    { time: new Date().toLocaleTimeString(), event: 'Connecting to TikTok API', status: 'Success' },
  ]);

  useEffect(() => {
    fetchData();
    
    // Simulate real-time monitoring
    const interval = setInterval(() => {
      if (isAutoSyncEnabled) {
        simulateLiveUpdate();
      }
    }, 15000); // Check every 15 seconds

    // Countdown for Sync
    const timer = setInterval(() => {
      if (!isAutoSyncEnabled) {
        setNextSyncTime("PAUSED");
        return;
      }

      const now = new Date();
      // For "Daily Sync" (24h), we target midnight
      // If syncInterval is different, we could calculate from lastSync, 
      // but for this UI "Daily Sync" usually implies a fixed time.
      // Let's make it dynamic based on syncInterval if it's not 24.
      
      let targetDate = new Date();
      if (syncInterval === 24) {
        targetDate.setHours(23, 59, 59, 999);
      } else {
        // Simple logic: next interval from now (this is a simulation)
        // In a real app, this would be stored in a DB
        const lastSyncDate = new Date(); // Mocking last sync as 'now' for the start
        targetDate = new Date(lastSyncDate.getTime() + syncInterval * 60 * 60 * 1000);
      }

      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        if (isAutoSyncEnabled) {
          addLog(`Automatic ${syncInterval}h Sync Triggered`);
          fetchData();
        }
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      setNextSyncTime(timeStr);
    }, 1000);

    const checkPublishStatus = async () => {
      const publishId = localStorage.getItem('tiktok_last_publish_id');
      if (!publishId) return;

      try {
        const res = await fetch('/api/tiktok/publish-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publishId })
        });
        const data = await res.json();
        if (res.ok) {
          const status = data.data?.status;
          setPublishStatus(status);
          if (status === 'PUBLISH_COMPLETE') {
            addLog('TikTok Publish Confirmed', 'Success');
            localStorage.removeItem('tiktok_last_publish_id');
          } else if (status === 'FAILED') {
            addLog('TikTok Publish Failed', 'Error');
            localStorage.removeItem('tiktok_last_publish_id');
          }
        }
      } catch (error) {
        console.error("Status check failed", error);
      }
    };

    const statusInterval = setInterval(() => {
      if (localStorage.getItem('tiktok_last_publish_id')) {
        checkPublishStatus();
      }
    }, 10000); // Check every 10 seconds

    const handleUploadChange = () => {
      setUploadStatus(localStorage.getItem('tiktok_upload_status'));
    };

    window.addEventListener('tiktok_upload_change', handleUploadChange);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
      clearInterval(statusInterval);
      window.removeEventListener('tiktok_upload_change', handleUploadChange);
    };
  }, [isAutoSyncEnabled, syncInterval]);

  const addLog = (event: string, status: string = 'Success') => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), event, status }, ...prev].slice(0, 5));
  };

  const simulateLiveUpdate = () => {
    setAnalyticsData(prev => {
      if (!prev) return prev;
      
      // 30% chance of a small update
      if (Math.random() > 0.7) {
        const viewIncrease = Math.floor(Math.random() * 5) + 1;
        setHasNewUpdate(true);
        setUpdateMessage(`New increase: +${viewIncrease} Views!`);
        
        return {
          ...prev,
          views: prev.views + viewIncrease
        };
      }
      return prev;
    });
  };

  const fetchData = async () => {
    setIsSyncing(true);
    try {
      // For demo purposes, we'll use mock data if API keys are missing
      const user = await tiktokService.getUserInfo();
      const analytics = await tiktokService.getAnalytics();
      setUserData(user);
      setAnalyticsData(analytics);
      const time = new Date().toLocaleTimeString();
      setLastSync(time);
      addLog('Data Sync Successful');
    } catch (error) {
      console.error('Error fetching TikTok data:', error);
      addLog('Data Sync Failed', 'Error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSync = () => {
    fetchData();
  };

  const formatValue = (val: number, type: 'views' | 'likes' | 'followers') => {
    if (type === 'views') {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
      return val.toLocaleString();
    }
    if (type === 'likes' || type === 'followers') {
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
      return val.toLocaleString();
    }
    return val.toLocaleString();
  };

  const displayData = analyticsData ? {
    overview: [
      { label: 'Total Views', value: formatValue(analyticsData.views, 'views'), change: '+5.2%', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50', trend: 'up' },
      { label: 'Estimated Earnings', value: '$0.00', change: '0%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: 'up' },
      { label: 'Engagement Rate', value: formatValue(analyticsData.likes, 'likes'), change: '+12.4%', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', trend: 'up' },
      { label: 'Net Followers', value: formatValue(analyticsData.followers_count, 'followers'), change: '+100%', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50', trend: 'up' },
    ],
    weeklyProgress: tiktokData.weeklyProgress,
    contentPerformance: analyticsData.videos.map(v => ({
      id: v.id,
      title: v.title,
      views: formatValue(v.view_count, 'views'),
      watchThrough: '68%',
      likes: formatValue(v.like_count, 'likes'),
      thumbnail: v.cover_image_url
    })),
    audienceInsights: tiktokData.audienceInsights,
    trafficSources: tiktokData.trafficSources,
    adTracking: tiktokData.adTracking
  } : tiktokData;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Notification Banner */}
      <AnimatePresence>
        {hasNewUpdate && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="bg-crab-shell/10 border border-crab-shell/30 px-6 py-4 rounded-2xl flex items-center justify-between shadow-lg shadow-crab-shell/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-crab-shell rounded-full animate-ping" />
              <p className="text-sm font-bold text-brand-700">{updateMessage}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setHasNewUpdate(false)}
                className="text-xs font-black text-brand-400 uppercase tracking-widest hover:text-brand-600 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setHasNewUpdate(false);
                  handleSync();
                }}
                className="px-4 py-1.5 bg-crab-shell text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-sm"
              >
                View Live
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasNewUpdate && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Upload Progress Indicator */}
          <AnimatePresence>
            {uploadStatus && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "px-6 py-4 rounded-2xl border flex flex-col gap-3 shadow-sm",
                  uploadStatus === 'uploading' ? "bg-brand-700 border-brand-600 text-white" : 
                  uploadStatus === 'success' ? "bg-emerald-500 border-emerald-400 text-white" :
                  "bg-rose-500 border-rose-400 text-white"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {uploadStatus === 'uploading' ? (
                      <RefreshCw size={18} className="animate-spin text-brand-300" />
                    ) : uploadStatus === 'success' ? (
                      <div className="w-5 h-5 bg-white text-emerald-500 rounded-full flex items-center justify-center">
                        <ChevronRight size={14} className="rotate-90" />
                      </div>
                    ) : (
                      <Lock size={18} />
                    )}
                    <p className="text-sm font-bold">
                      {uploadStatus === 'uploading' ? 'Video Uploading to TikTok...' : 
                       uploadStatus === 'success' ? (publishStatus === 'PUBLISH_COMPLETE' ? 'Video Live on TikTok!' : 'Video Received by TikTok') : 
                       'Upload Failed'}
                    </p>
                  </div>
                  {uploadStatus === 'uploading' && (
                    <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-lg">Processing</span>
                  )}
                  {uploadStatus === 'success' && publishStatus && (
                    <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                      {publishStatus.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                
                {uploadStatus === 'uploading' && (
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 15, ease: "linear" }}
                      className="h-full bg-white"
                    />
                  </div>
                )}

                {uploadStatus === 'success' && (
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    {publishStatus === 'PUBLISH_COMPLETE' 
                      ? "Your video is now live! Check your TikTok profile." 
                      : "TikTok is processing your video. If you have a Personal account, check your 'Inbox' or 'Drafts' in the TikTok app to finalize the post."}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-brand-50 border border-brand-100 px-6 py-3 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              <p className="text-sm font-bold text-brand-700">System Monitoring Live...</p>
            </div>
            <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest">Last updated: {lastSync}</p>
          </div>
          
          <div className="bg-brand-700 border border-brand-600 px-6 py-3 rounded-2xl flex items-center justify-between shadow-sm text-white">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <RefreshCw size={16} className={cn("text-brand-300", isSyncing && "animate-spin")} />
                <p className="text-sm font-bold">
                  {isAutoSyncEnabled ? `Next Sync in:` : `Auto-Sync:`} 
                  <span className={cn(
                    "ml-2 font-mono",
                    isAutoSyncEnabled ? "text-brand-300" : "text-rose-400"
                  )}>
                    {nextSyncTime}
                  </span>
                </p>
              </div>
              
              {isAutoSyncEnabled && (
                <select 
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(Number(e.target.value))}
                  className="bg-brand-800 border border-brand-600 text-[10px] font-bold rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-brand-400"
                >
                  <option value={1}>1h</option>
                  <option value={6}>6h</option>
                  <option value={12}>12h</option>
                  <option value={24}>24h</option>
                </select>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-300">
                {isAutoSyncEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <button 
                onClick={() => setIsAutoSyncEnabled(!isAutoSyncEnabled)}
                className={cn(
                  "w-10 h-5 rounded-full relative transition-all duration-300",
                  isAutoSyncEnabled ? "bg-emerald-500" : "bg-brand-900"
                )}
              >
                <motion.div 
                  animate={{ x: isAutoSyncEnabled ? 22 : 2 }}
                  className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )}

      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-[2rem] border-4 border-white shadow-2xl overflow-hidden bg-brand-100">
              <img 
                src={userData?.avatar_url || "https://picsum.photos/seed/malis/200/200"} 
                alt={userData?.display_name || "AI Cafe"} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-black rounded-xl flex items-center justify-center border-2 border-white shadow-lg">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.06 3.42-.01 6.83-.02 10.25-.17 4.14-4.23 7.25-8.26 6.5-3.94-.73-6.47-5.11-4.67-8.73 1.14-2.2 3.86-3.54 6.32-3.14.05 1.58 0 3.16 0 4.74-1.57-.14-3.29.35-4.23 1.71-.96 1.39-.64 3.55.75 4.53 1.38.97 3.56.64 4.53-.75.28-.38.39-.84.41-1.3.02-3.58 0-7.17.01-10.75 0-2.87 0-5.74 0-8.61z"/>
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <h2 className="text-3xl font-display font-bold text-brand-700 tracking-tight">{userData?.display_name || "AI Cafe"}</h2>
              <p className="text-slate-500 font-medium text-sm">@{userData?.display_name?.toLowerCase().replace(/\s+/g, '') || "ai.cafe4"} • Marketing Data Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '29%' }}
                  className="h-full bg-brand-500"
                />
              </div>
              <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Progress 29%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-brand-200/50">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '28d', label: '28 Days' },
              { id: 'custom', label: 'Custom' }
            ].map((range) => (
              <button 
                key={range.id}
                onClick={() => setTimeRange(range.id as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider",
                  timeRange === range.id ? "bg-white text-brand-700 shadow-sm border border-brand-100" : "text-slate-500 hover:text-brand-700"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={cn(
              "p-3 bg-white border border-brand-200 rounded-2xl text-brand-600 hover:text-brand-700 transition-all shadow-sm",
              isSyncing && "animate-spin"
            )}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {/* Main Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayData.overview.map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className="glass p-8 rounded-[2.5rem] border border-white/50 shadow-sm group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                stat.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">{stat.label}</h3>
            <div className="flex items-baseline gap-2">
              <motion.p 
                key={stat.value}
                initial={{ scale: 1.2, color: '#f59e0b' }}
                animate={{ scale: 1, color: '#4338ca' }}
                className="text-3xl font-display font-bold text-brand-700"
              >
                {stat.value}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly Growth Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 glass p-8 rounded-[2.5rem] border border-white/50 shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-brand-700 flex items-center gap-2">
              <TrendingUp className="text-brand-500" size={24} />
              Weekly Growth Performance
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Engagement Rate</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData.weeklyProgress}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }} />
                <Area type="monotone" dataKey="views" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="engagement" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorEngage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Content Performance */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 glass p-8 rounded-[2.5rem] border border-white/50 shadow-sm flex flex-col"
        >
          <h3 className="text-xl font-bold text-brand-700 mb-6 flex items-center gap-2">
            <Sparkles className="text-crab-fat" size={24} />
            Top Performing Videos
          </h3>
          <div className="space-y-6 flex-1">
            {displayData.contentPerformance.map((video, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer">
                <div className="relative w-20 h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={20} className="text-white fill-current" />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg py-1 px-2">
                    <p className="text-[8px] font-black text-white text-center uppercase tracking-tighter">{video.watchThrough} Watch Through</p>
                  </div>
                </div>
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-bold text-brand-700 text-sm line-clamp-2 leading-tight mb-1">{video.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest">Success</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <Eye size={12} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-brand-600">{video.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart size={12} className="text-rose-400" />
                      <span className="text-[10px] font-bold text-brand-600">{video.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 bg-brand-50 text-brand-700 rounded-2xl font-bold text-sm hover:bg-brand-100 transition-all flex items-center justify-center gap-2">
            View All Videos
            <ChevronRight size={18} />
          </button>
        </motion.div>
      </div>
      {/* System Status & Logs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-[2.5rem] border border-white/50 shadow-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-brand-700 flex items-center gap-2">
            <RefreshCw className="text-brand-500" size={24} />
            System Status & Logs
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Active</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {logs.map((log, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-slate-400">{log.time}</span>
                <p className="text-sm font-medium text-brand-600">{log.event}</p>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                log.status === 'Success' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-brand-50 rounded-2xl border border-brand-100">
          <p className="text-xs text-brand-500 leading-relaxed">
            <span className="font-bold">Note:</span> The system automatically fetches new data from TikTok every 24 hours. You can also perform a manual sync at any time by clicking the Refresh button above.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TikTokAnalytics;
