'use client';
import { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion } from 'motion/react';
import { RefreshCw, ArrowRight, Flame, TrendingUp, Minus } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export default function ResearchPhase({ onProceed }: { onProceed: (trend: any) => void }) {
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTrends = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'วิเคราะห์ข้อมูลเทรนด์เพลง TikTok ปัจจุบัน และสรุป 3 เทรนด์เพลงหลักที่กำลังมาแรง',
        config: {
          systemInstruction: 'คุณคือผู้เชี่ยวชาญด้านดนตรีและเทรนด์เพลงในโซเชียลมีเดีย โดยเฉพาะ TikTok ให้ข้อมูลที่สมจริงและอัปเดตที่สุด',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                genre: { type: Type.STRING },
                description: { type: Type.STRING },
                popularity: { type: Type.STRING, description: 'hot, rising, or stable' },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                exampleArtists: { type: Type.ARRAY, items: { type: Type.STRING } },
                moodTags: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["genre", "description", "popularity", "keywords", "exampleArtists", "moodTags"]
            }
          }
        }
      });
      
      if (response.text) {
        setTrends(JSON.parse(response.text));
      }
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถดึงข้อมูลเทรนด์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-100 flex items-center gap-2">
            <TrendingUp className="text-purple-400" />
            ดูเทรนด์เพลง (Research)
          </h2>
          <p className="text-neutral-400 text-sm mt-1">สำรวจเทรนด์เพลงที่กำลังมาแรงใน TikTok เพื่อเป็นไอเดีย</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchTrends}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            วิเคราะห์เทรนด์ใหม่
          </button>
          <button 
            onClick={() => onProceed(null)}
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
          >
            ไปแต่งเพลงกันเลย
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center">
          {error}
        </div>
      )}

      {loading && trends.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-neutral-900/50 border border-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trends.map((trend, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:border-purple-500/50 backdrop-blur-sm transition-all hover:shadow-[0_8px_30px_rgba(168,85,247,0.1)] cursor-pointer"
              onClick={() => onProceed(trend)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-neutral-100">{trend.genre}</h3>
                  <div className="p-2 rounded-full bg-neutral-800/80 text-neutral-300">
                    {trend.popularity === 'hot' && <Flame className="w-5 h-5 text-orange-500" />}
                    {trend.popularity === 'rising' && <TrendingUp className="w-5 h-5 text-blue-400" />}
                    {trend.popularity === 'stable' && <Minus className="w-5 h-5 text-neutral-400" />}
                  </div>
                </div>
                
                <p className="text-neutral-400 text-sm mb-6 line-clamp-3">
                  {trend.description}
                </p>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {trend.keywords.slice(0, 3).map((kw: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-md bg-neutral-800 text-xs text-neutral-300">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Mood</div>
                    <div className="flex flex-wrap gap-2">
                      {trend.moodTags.slice(0, 3).map((mood: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-300 text-xs border border-purple-500/20">
                          {mood}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-sm text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>ใช้เทรนด์นี้แต่งเพลง</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
