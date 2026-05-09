'use client';
import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Music, Mic, Settings, Type as TypeIcon, Copy, Check, Sparkles, SlidersHorizontal } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

const GENRES = [
  'Pop', 'Hip-Hop', 'R&B', 'Rock', 'EDM', 'Acoustic', 
  'Luk Thung', 'Indie', 'Morlam', 'Thai Traditional',
  'Cyberpunk / Synthwave', 'Cinematic / Epic', 'Lo-Fi', 'Metal'
];
const MOODS = [
  'สนุกสนาน', 'เศร้า', 'โรแมนติก', 'ฮึกเหิม', 'ชิลๆ', 'ลึกลับ', 'คิดถึง',
  'ดุดัน (Aggressive)', 'อลังการ (Epic)', 'ล้ำยุค (Sci-Fi)', 'เซ็กซี่ (Sexy)'
];
const VOCAL_STYLES = ['หญิงเดี่ยว', 'ชายเดี่ยว', 'ดูเอ็ต', 'คอรัส', 'ไม่ระบุ'];
const LANGUAGES = ['ไทย', 'อังกฤษ', 'ผสม'];
const INSTRUMENTS = ['Acoustic Guitar', 'Electric Guitar', 'Piano', 'Synthesizer', 'Drum Kit', 'Bass', 'Strings', 'แคน', 'พิณ', 'ซอ'];

const RHYME_RULES = [
  { id: 'outer_rhyme', label: 'สัมผัสนอก (มาตรฐาน)' },
  { id: 'inner_rhyme', label: 'เพิ่มสัมผัสใน (สละสลวย)' },
  { id: 'near_rhyme_allowed', label: 'อนุโลมสัมผัสเลือน (ร้องง่าย)' }
];

const LYRIC_PROFILES = [
  { id: 'T-Pop', label: 'T-Pop (วัยรุ่น/สแลง/ทับศัพท์)' },
  { id: 'Luk Thung', label: 'ลูกทุ่ง (จริงใจ/คำคม/ภาษาถิ่น)' },
  { id: 'Thai Classical', label: 'ไทยเดิม (ภาษากวี/สละสลวย)' }
];

const VOCAL_CHARS = ['ลูกคอ (Vibrato)', 'เอื้อน (Melisma)', 'เสียงหลบ (Falsetto)', 'ร้องเต็มเสียง (Belt)'];

export default function ComposePhase({ initialTrend, onBack }: { initialTrend: any, onBack: () => void }) {
  const [genre, setGenre] = useState(initialTrend?.genre || 'Pop');
  const [moods, setMoods] = useState<string[]>(initialTrend?.moodTags?.slice(0, 2) || ['สนุกสนาน']);
  const [tempo, setTempo] = useState(120);
  const [vocalStyle, setVocalStyle] = useState('หญิงเดี่ยว');
  const [language, setLanguage] = useState('ไทย');
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [topic, setTopic] = useState('');
  
  // Advanced Settings
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [rhymeRule, setRhymeRule] = useState('outer_rhyme');
  const [lyricProfile, setLyricProfile] = useState('T-Pop');
  const [vocalChar, setVocalChar] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  
  const [copiedSuno, setCopiedSuno] = useState(false);
  const [copiedReview, setCopiedReview] = useState(false);

  const toggleMood = (m: string) => {
    if (moods.includes(m)) {
      setMoods(moods.filter(x => x !== m));
    } else if (moods.length < 3) {
      setMoods([...moods, m]);
    }
  };

  const toggleInstrument = (inst: string) => {
    if (selectedInstruments.includes(inst)) {
      setSelectedInstruments(selectedInstruments.filter(x => x !== inst));
    } else {
      setSelectedInstruments([...selectedInstruments, inst]);
    }
  };

  const handleCompose = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const prompt = `
ข้อมูลเพลงที่ต้องการ:
- แนวเพลง (Genre): ${genre}
- อารมณ์ (Mood): ${moods.join(', ')}
- ความเร็ว (Tempo): ${tempo} BPM
- สไตล์เสียงร้อง (Vocal Style): ${vocalStyle} ${vocalChar ? `+ เทคนิค: ${vocalChar}` : ''}
- ภาษา (Language): ${language}
- เครื่องดนตรี (Instruments): ${selectedInstruments.join(', ') || 'ตามความเหมาะสม'}
- หัวข้อ/เนื้อหา (Topic): ${topic || 'อิสระ ตามความเหมาะสมของแนวเพลงและอารมณ์'}

กฎการแต่งเพลง (Thai Music Prompt Matrix):
- กฎสัมผัส (Rhyme Rule): ${RHYME_RULES.find(r => r.id === rhymeRule)?.label}
- สไตล์ภาษา (Lyric Profile): ${LYRIC_PROFILES.find(l => l.id === lyricProfile)?.label}

${initialTrend ? `อ้างอิงจากเทรนด์: ${initialTrend.description} (Keywords: ${initialTrend.keywords.join(', ')})` : ''}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: `คุณคือ "ยอดนักแต่งเพลงและโปรดิวเซอร์มือโปร" ที่เชี่ยวชาญภาษาไทยอย่างลึกซึ้ง มีหน้าที่รับผิดชอบงานเขียนเนื้อร้องและออกแบบทำนองให้ร้าน MIX-IMAGE Art & Audio งานของคุณต้อง "สร้างความรู้สึก" และมี "Flow ที่ลื่นไหล" เหมือนมนุษย์แต่ง ไม่ใช่ AI ที่สะกดคำตามตำรา

Execution Strategy:
Analytic Phase (Thinking): ก่อนเขียนเนื้อเพลง ให้วิเคราะห์ "อารมณ์ (Vibe)" และ "กลุ่มคนฟัง" เสมอ โดยอิงจาก Lyric Profile ที่กำหนด
Natural Flow Rule: ห้ามใช้คำที่ดูเป็นทางการเกินไปหรือคำที่ AI ชอบใช้ (เช่น "มุ่งมั่น", "นิรันดร์", "พลังอันยิ่งใหญ่", "ก้าวเดิน", "ฟันฝ่า", "แสงสว่าง", "ดั่งฝัน", "ตราบนานเท่านาน") เด็ดขาด
ให้ใช้ภาษาพูด ภาษาใจ หรือสแลงที่ทันสมัยแต่ดูแพง (Modern & Expensive Slang) ตัวอย่างเช่น:
- แทนที่จะใช้ "ฉันจะรักเธอตลอดไป" ให้ใช้ "อยู่ตรงนี้ดิ ไม่ไปไหนหรอก" หรือ "ให้เป็นเธอไปเรื่อย เรื่อย"
- แทนที่จะใช้ "ความเจ็บปวด" ให้ใช้ "อาการนอยด์", "ฟีลมันดาวน์", "จม", "พัง"
- แทนที่จะใช้ "งดงาม" ให้ใช้ "จึ้ง", "เทสต์ดี", "ดาเมจแรง", "เกินต้าน"
- แทนที่จะใช้ "โชคชะตา" ให้ใช้ "จังหวะตกหลุมรัก", "ไทม์มิ่ง", "Vibe มันได้"
- คำสร้อย/คำเชื่อมสไตล์คนรุ่นใหม่: "เอาดี ดี", "แบบว่า", "ก็แค่", "ดิ", "ปะ", "เถอะ", "ฟีลแบบ"
(เว้นแต่ Lyric Profile จะระบุเป็นอย่างอื่น เช่น ลูกทุ่ง หรือ ไทยเดิม)
Musical Phrasing & Rhyme Scheme: ออกแบบการเว้นวรรคและสัมผัสสระให้ลงล็อกกับจังหวะ (Rhythm) ปฏิบัติตามกฎสัมผัส (Rhyme Rule) ที่กำหนดอย่างเคร่งครัด
Tone-Melody Guideline: คำนึงถึงวรรณยุกต์ไทยกับทิศทางของเมโลดี้ (เช่น คำเสียงจัตวา มักใช้กับเมโลดี้ขาขึ้น, คำเสียงเอก มักใช้กับเมโลดี้ขาลง)
Formatting & Breathing: จัดเรียงบรรทัดให้ชัดเจน ขึ้นบรรทัดใหม่เมื่อจบประโยคเพลง แยกท่อนเพลง (เช่น [Verse], [Chorus]) ด้วยการเว้นบรรทัดว่าง 1 บรรทัดเสมอ
Word Spacing (ห้ามเว้นวรรคทุกคำเด็ดขาด): เขียนคำในประโยคเดียวกันให้ติดกันตามหลักภาษาไทยปกติ ห้ามเว้นวรรคแยกทีละคำหรือทีละพยางค์เด็ดขาด (เช่น ห้ามเขียน "ซี โร เดย์" ให้เขียน "ซีโร่เดย์" หรือ "Zero-Day", ห้ามเขียน "เปิด วอ จัด พายุ" ให้เขียน "เปิดวอจัดพายุ") ให้เว้นวรรค (Spacebar) เฉพาะเมื่อต้องการแบ่งท่อนหายใจกลางประโยคเท่านั้น

Suno Format Rules (ข้อควรระวังสำหรับ Suno AI):
1. ห้ามใช้ตัวการันต์ (์) เด็ดขาดใน sunoLyrics เพราะ Suno จะร้องผิด ให้เขียนคำอ่านแทนโดยต้องเขียนติดกันเป็นคำเดียวห้ามแยกพยางค์ เช่น "แมตช์" ให้เขียนเป็น "แมต", "สัตว์" ให้เขียนเป็น "สัด", "กีตาร์" ให้เขียนเป็น "กีตา"
2. ห้ามใช้ไม้ยมก (ๆ) เด็ดขาดใน sunoLyrics ให้เขียนคำซ้ำสองครั้งแทน เช่น "อื่นๆ" เป็น "อื่น อื่น", "ต่างๆ" เป็น "ต่าง ต่าง", "เล่นๆ" เป็น "เล่น เล่น"
3. การเว้นบรรทัดสำหรับเสียงร้องใน sunoLyrics ให้เว้นบรรทัดว่าง 1 บรรทัดคั่นระหว่างแต่ละประโยคเสมอ (โดยเฉพาะเมื่อมีการสลับคนร้อง)
4. การระบุตัวละคร/ผู้ร้อง: ให้ใส่ชื่อผู้ร้องไว้ในวงเล็บหน้าประโยคเสมอ เพื่อให้ AI ร้องคำนั้นออกมาด้วย เช่น "(Male) เปิดบีตมาแบบงง งง" หรือ "(Female) แต่ฟังไปมา เอ้า ฟีลมันลง" โดยต้องเว้นวรรคหลังวงเล็บหนึ่งครั้งก่อนเริ่มเนื้อร้องเสมอ

Instructions for Lyrics:
Verse: เล่าเรื่องแบบภาพยนตร์ (Show, Don't Tell) ให้เห็นภาพเหตุการณ์
Hook: ต้องติดหู (Earworm) ใช้คำง่ายแต่กระแทกใจคนฟังชาวไทย
Bridge: สร้างจุดเปลี่ยนอารมณ์ (Twist) ให้เพลงมีความลึก`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              songName: { type: Type.STRING },
              themeAndMood: { type: Type.STRING },
              sunoStylePrompt: { type: Type.STRING, description: "Comma-separated style tags for Suno (e.g., thai pop, 120 bpm, female vocal, acoustic guitar, vibrato)" },
              sunoNegativePrompt: { type: Type.STRING },
              sunoLyrics: { type: Type.STRING, description: "Lyrics formatted for Suno with metatags like [Intro], [Verse 1], [Chorus], [Bridge], [Outro]" },
              reviewLyrics: { type: Type.STRING, description: "Human-readable lyrics with clear sections" },
              voiceGeneratorTips: { type: Type.STRING },
              songInfo: {
                type: Type.OBJECT,
                properties: {
                  genre: { type: Type.STRING },
                  tempo: { type: Type.STRING },
                  mood: { type: Type.STRING },
                  vocalStyle: { type: Type.STRING },
                  instruments: { type: Type.STRING },
                  lyricProfile: { type: Type.STRING }
                }
              }
            },
            required: ["songName", "themeAndMood", "sunoStylePrompt", "sunoNegativePrompt", "sunoLyrics", "reviewLyrics", "songInfo"]
          }
        }
      });

      if (response.text) {
        setResult(JSON.parse(response.text));
      }
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการแต่งเพลง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'suno' | 'review') => {
    navigator.clipboard.writeText(text);
    if (type === 'suno') {
      setCopiedSuno(true);
      setTimeout(() => setCopiedSuno(false), 2000);
    } else {
      setCopiedReview(true);
      setTimeout(() => setCopiedReview(false), 2000);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        กลับไปหน้าเทรนด์
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              ปรับแต่งสไตล์เพลง
            </h2>

            <div className="space-y-5">
              {/* Genre */}
              <div>
                <label className="block text-sm text-neutral-400 mb-2">แนวเพลง (Genre)</label>
                <select 
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-neutral-200 focus:outline-none focus:border-purple-500 transition-colors"
                >
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-sm text-neutral-400 mb-2">อารมณ์ (Mood) - เลือกได้สูงสุด 3</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(m => (
                    <button
                      key={m}
                      onClick={() => toggleMood(m)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${moods.includes(m) ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-500'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tempo */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="text-neutral-400">ความเร็ว (Tempo)</label>
                  <span className="text-purple-400 font-mono">{tempo} BPM</span>
                </div>
                <input 
                  type="range" 
                  min="60" max="180" step="5"
                  value={tempo}
                  onChange={(e) => setTempo(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>ช้า</span>
                  <span>ปานกลาง</span>
                  <span>เร็ว</span>
                </div>
              </div>

              {/* Vocal Style & Language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">เสียงร้อง</label>
                  <select 
                    value={vocalStyle}
                    onChange={(e) => setVocalStyle(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-purple-500"
                  >
                    {VOCAL_STYLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">ภาษา</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-purple-500"
                  >
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Instruments */}
              <div>
                <label className="block text-sm text-neutral-400 mb-2">เครื่องดนตรีเด่น</label>
                <div className="flex flex-wrap gap-2">
                  {INSTRUMENTS.map(inst => (
                    <button
                      key={inst}
                      onClick={() => toggleInstrument(inst)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${selectedInstruments.includes(inst) ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50' : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-500'}`}
                    >
                      {inst}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm text-neutral-400 mb-2">ไอเดีย / เรื่องราว (Topic)</label>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="เช่น อยากได้เพลงแอบชอบเพื่อนสนิท แต่ไม่กล้าบอก..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-200 focus:outline-none focus:border-purple-500 h-24 resize-none"
                />
              </div>

              {/* Advanced Settings Toggle */}
              <div>
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors w-full py-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {showAdvanced ? 'ซ่อนการตั้งค่าขั้นสูง' : 'การตั้งค่าขั้นสูง (Thai Music Matrix)'}
                </button>
                
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-4 border-t border-neutral-800 mt-2">
                        <div>
                          <label className="block text-xs text-neutral-500 mb-2">สไตล์ภาษา (Lyric Profile)</label>
                          <select 
                            value={lyricProfile}
                            onChange={(e) => setLyricProfile(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-purple-500"
                          >
                            {LYRIC_PROFILES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-neutral-500 mb-2">กฎสัมผัส (Rhyme Scheme)</label>
                          <select 
                            value={rhymeRule}
                            onChange={(e) => setRhymeRule(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-purple-500"
                          >
                            {RHYME_RULES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-neutral-500 mb-2">เทคนิคการร้อง (Vocal Characteristics)</label>
                          <select 
                            value={vocalChar}
                            onChange={(e) => setVocalChar(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-purple-500"
                          >
                            <option value="">ไม่ระบุ (ให้ AI เลือก)</option>
                            {VOCAL_CHARS.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleCompose}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    กำลังสร้างเพลง...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    เขียนเพลง!
                  </>
                )}
              </button>
              
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-neutral-900/30 border border-neutral-800/50 rounded-2xl backdrop-blur-sm">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-r-2 border-blue-500 animate-spin" style={{ animationDelay: '150ms' }} />
                <div className="absolute inset-4 rounded-full border-b-2 border-purple-400 animate-spin" style={{ animationDelay: '300ms' }} />
                <Music className="absolute inset-0 m-auto w-8 h-8 text-neutral-400 animate-pulse" />
              </div>
              <p className="text-neutral-400 animate-pulse">AI กำลังร้อยเรียงทำนองและเนื้อร้อง...</p>
            </div>
          ) : result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full"
            >
              {/* Suno Format Panel */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-800">
                  <h3 className="font-semibold text-purple-400 flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Suno Format
                  </h3>
                  <button 
                    onClick={() => copyToClipboard(`Style Prompt: ${result.sunoStylePrompt}\n\nLyrics:\n${result.sunoLyrics}`, 'suno')}
                    className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
                    title="คัดลอกสำหรับ Suno"
                  >
                    {copiedSuno ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Style Prompt</div>
                    <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-purple-300 font-mono">
                      {result.sunoStylePrompt}
                    </div>
                  </div>
                  
                  {result.sunoNegativePrompt && (
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">Negative Prompt</div>
                      <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-red-300/70 font-mono">
                        {result.sunoNegativePrompt}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Lyrics</div>
                    <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {result.sunoLyrics.split(/(\[.*?\])/g).map((part: string, i: number) => {
                        if (part.startsWith('[') && part.endsWith(']')) {
                          return <span key={i} className="text-blue-400 font-bold">{part}</span>;
                        }
                        return part;
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Format Panel */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-800">
                  <h3 className="font-semibold text-blue-400 flex items-center gap-2">
                    <TypeIcon className="w-4 h-4" />
                    Review Format
                  </h3>
                  <button 
                    onClick={() => copyToClipboard(result.reviewLyrics, 'review')}
                    className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    {copiedReview ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                  <div>
                    <h4 className="text-2xl font-bold text-neutral-100 mb-2">🎵 {result.songName}</h4>
                    <ul className="text-sm text-neutral-400 space-y-1 list-disc list-inside">
                      <li>แนวเพลง: {result.songInfo.genre} ({result.songInfo.tempo} BPM)</li>
                      <li>อารมณ์: {result.songInfo.mood}</li>
                      <li>เสียงร้อง: {result.songInfo.vocalStyle}</li>
                      <li>เครื่องดนตรี: {result.songInfo.instruments}</li>
                      {result.songInfo.lyricProfile && <li>สไตล์ภาษา: {result.songInfo.lyricProfile}</li>}
                    </ul>
                  </div>
                  
                  <div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Theme & Mood</div>
                    <p className="text-sm text-neutral-300 italic border-l-2 border-purple-500 pl-3 py-1">
                      {result.themeAndMood}
                    </p>
                  </div>
                  
                  <div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">เนื้อเพลง</div>
                    <div className="text-sm text-neutral-200 whitespace-pre-wrap leading-loose font-serif">
                      {result.reviewLyrics}
                    </div>
                  </div>
                  
                  {result.voiceGeneratorTips && (
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="text-xs text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Mic className="w-3 h-3" />
                        คำแนะนำสำหรับ AI Voice
                      </div>
                      <p className="text-sm text-blue-200/80">
                        {result.voiceGeneratorTips}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-neutral-900/20 border border-neutral-800/30 rounded-2xl border-dashed">
              <Music className="w-12 h-12 text-neutral-700 mb-4" />
              <p className="text-neutral-500 text-center max-w-sm">
                ปรับแต่งสไตล์เพลงที่คุณต้องการทางด้านซ้าย<br/>แล้วกด &quot;เขียนเพลง!&quot; เพื่อดูผลลัพธ์
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
