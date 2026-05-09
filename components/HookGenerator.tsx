'use client';
import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion } from 'motion/react';
import { Sparkles, Music, Copy, Check, ArrowLeft, Send } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

const GENRES = [
  'Pop', 'Hip-Hop', 'R&B', 'Rock', 'EDM', 'Acoustic', 
  'Luk Thung', 'Indie', 'Morlam', 'Thai Traditional',
  'Cyberpunk / Synthwave', 'Cinematic / Epic', 'Lo-Fi'
];

const MOODS = [
  'สนุกสนาน', 'เศร้า', 'โรแมนติก', 'ฮึกเหิม', 'ชิลๆ', 'ลึกลับ', 'คิดถึง',
  'ดุดัน (Aggressive)', 'อลังการ (Epic)', 'ล้ำยุค (Sci-Fi)', 'เซ็กซี่ (Sexy)'
];

export default function HookGenerator({ onBack }: { onBack: () => void }) {
  const [theme, setTheme] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [mood, setMood] = useState('สนุกสนาน');
  const [loading, setLoading] = useState(false);
  const [hooks, setHooks] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generateHooks = async () => {
    if (!theme) {
      setError('กรุณาระบุ Theme ของเพลง');
      return;
    }

    setLoading(true);
    setError('');
    setHooks([]);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Theme: ${theme}\nGenre: ${genre}\nMood: ${mood}`,
        config: {
          systemInstruction: `คุณคือ "ยอดนักแต่งเพลงและโปรดิวเซอร์มือโปร" ที่เชี่ยวชาญภาษาไทยอย่างลึกซึ้ง มีหน้าที่ช่วยคิด Hook เพลงที่ติดหู (Earworm) 
เน้นใช้คำง่ายๆ แต่กระแทกใจคนฟังชาวไทย และให้มี Flow ที่ลื่นไหลเหมือนมนุษย์แต่ง ไม่ใช่ AI.

หลักการแต่ง Hook ของคุณ:
1. Earworm: ต้องติดหู ใช้คำที่คนจำได้ทันที
2. Natural Flow: ห้ามใช้คำที่เป็นทางการเกินไปหรือคำที่ AI ชอบใช้ (เช่น "มุ่งมั่น", "นิรันดร์", "พลังอันยิ่งใหญ่", "ก้าวเดิน", "ฟันฝ่า", "แสงสว่าง", "ดั่งฝัน", "ตราบนานเท่านาน") เด็ดขาด
ให้ใช้ภาษาพูด ภาษาใจ หรือสแลงที่ทันสมัยแต่ดูแพง (Modern & Expensive Slang) ตัวอย่างเช่น:
- แทนที่จะใช้ "ฉันจะรักเธอตลอดไป" ให้ใช้ "อยู่ตรงนี้ดิ ไม่ไปไหนหรอก" หรือ "ให้เป็นเธอไปเรื่อย เรื่อย"
- แทนที่จะใช้ "ความเจ็บปวด" ให้ใช้ "อาการนอยด์", "ฟีลมันดาวน์", "จม", "พัง"
- แทนที่จะใช้ "งดงาม" ให้ใช้ "จึ้ง", "เทสต์ดี", "ดาเมจแรง", "เกินต้าน"
- แทนที่จะใช้ "โชคชะตา" ให้ใช้ "จังหวะตกหลุมรัก", "ไทม์มิ่ง", "Vibe มันได้"
- คำสร้อย/คำเชื่อมสไตล์คนรุ่นใหม่: "เอาดี ดี", "แบบว่า", "ก็แค่", "ดิ", "ปะ", "เถอะ", "ฟีลแบบ"
3. Musical Phrasing: ออกแบบการเว้นวรรคและสัมผัสสระให้ลงล็อกกับจังหวะ
4. Emotional Impact: ต้องกระแทกใจคนฟังชาวไทย

ให้เสนอ Hook มา 3-5 แบบที่แตกต่างกันในเชิงอารมณ์หรือมุมมอง`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                hookText: { type: Type.STRING, description: "เนื้อเพลงท่อน Hook" },
                explanation: { type: Type.STRING, description: "เหตุผลที่ Hook นี้ทำงานได้ดี หรืออารมณ์ที่ต้องการสื่อ" },
                styleTag: { type: Type.STRING, description: "แนวเพลงที่แนะนำสำหรับ Hook นี้" }
              },
              required: ["hookText", "explanation", "styleTag"]
            }
          }
        }
      });

      if (response.text) {
        setHooks(JSON.parse(response.text));
      }
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการคิด Hook กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        กลับไปหน้าหลัก
      </button>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-100">Hook Brainstormer</h2>
            <p className="text-neutral-400 text-sm">คิดท่อนฮุคให้ติดหู กระแทกใจคนฟัง</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-3">
            <label className="block text-sm text-neutral-400 mb-2">Theme ของเพลง</label>
            <input 
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="เช่น แอบรักเพื่อน, อกหักซ้ำๆ, เริ่มต้นใหม่..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-neutral-200 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">แนวเพลง (Genre)</label>
            <select 
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-neutral-200 focus:outline-none focus:border-purple-500 transition-colors"
            >
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-neutral-400 mb-2">อารมณ์ (Mood)</label>
            <select 
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-neutral-200 focus:outline-none focus:border-purple-500 transition-colors"
            >
              {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={generateHooks}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              กำลังคิด Hook...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              คิด Hook ให้หน่อย!
            </>
          )}
        </button>

        {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
      </div>

      <div className="space-y-6">
        {hooks.map((hook, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-4">
                <div className="text-xs text-purple-400 font-mono uppercase tracking-widest">
                  Option {idx + 1} • {hook.styleTag}
                </div>
                <p className="text-xl md:text-2xl font-bold text-neutral-100 leading-relaxed font-serif">
                  &quot;{hook.hookText}&quot;
                </p>
                <p className="text-sm text-neutral-400 italic border-l-2 border-neutral-700 pl-4 py-1">
                  {hook.explanation}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(hook.hookText, idx)}
                className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                {copiedIdx === idx ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
