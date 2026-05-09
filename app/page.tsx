'use client';
import { useState } from 'react';
import ResearchPhase from '@/components/ResearchPhase';
import ComposePhase from '@/components/ComposePhase';
import HookGenerator from '@/components/HookGenerator';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [phase, setPhase] = useState<'research' | 'compose' | 'hook'>('research');
  const [selectedTrend, setSelectedTrend] = useState<any>(null);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 font-sans selection:bg-purple-500/30">
      {/* Background effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 inline-block mb-4">
            MIX Image Art & Audio
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto mb-6">
            AI Music Generator based on TikTok Trends & Suno Pro
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm mb-8">
            <a href="https://facebook.com/MixNattanon" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              Facebook
            </a>
            <span className="text-neutral-600">•</span>
            <a href="https://www.youtube.com/@MIXNATTANON" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
              YouTube
            </a>
            <span className="text-neutral-600">•</span>
            <a href="http://piscopy.shop" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
              Website
            </a>
            <span className="text-neutral-600">•</span>
            <a href="https://suno.com/" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors font-medium flex items-center gap-1">
              ไปสร้างเพลงที่ Suno 🎵
            </a>
          </div>
          
          <div className="flex justify-center gap-4 mt-8">
            <button 
              onClick={() => setPhase('research')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${phase === 'research' || phase === 'compose' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              Full Composer
            </button>
            <button 
              onClick={() => setPhase('hook')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${phase === 'hook' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              Hook Brainstormer
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {phase === 'research' ? (
            <motion.div
              key="research"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ResearchPhase 
                onProceed={(trend) => {
                  setSelectedTrend(trend);
                  setPhase('compose');
                }} 
              />
            </motion.div>
          ) : phase === 'compose' ? (
            <motion.div
              key="compose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ComposePhase 
                initialTrend={selectedTrend} 
                onBack={() => setPhase('research')} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="hook"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HookGenerator onBack={() => setPhase('research')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
