import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Copywriter from './components/Copywriter';
import PosterGen from './components/PosterGen';
import VideoVoice from './components/VideoVoice';
import Planner from './components/Planner';
import TikTokAnalytics from './components/TikTokAnalytics';
import Auth from './components/Auth';
import { TabType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('copywriter');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'copywriter': return <Copywriter />;
      case 'poster-gen': return <PosterGen />;
      case 'video-voice': return <VideoVoice />;
      case 'planner': return <Planner />;
      case 'tiktok': return <TikTokAnalytics />;
      default: return <Copywriter />;
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-mesh">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setIsAuthenticated(false)} />
      
      <main className="flex-1 ml-72 p-10">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
