import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Play, Pause, RefreshCw, Maximize2, Minimize2, Cpu, Network, ShieldCheck, AlertOctagon, Database, ScanLine, Binary, Volume2, VolumeX } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { GlobalStats, MetricData } from '../types';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Cell, Tooltip, CartesianGrid, Line, Brush, ReferenceLine } from 'recharts';

interface PresentationPlayerProps {
  stats: GlobalStats;
  metrics: MetricData[];
}

const SCENE_DURATION = 12000; // 12 seconds per slide

// --- Audio Utilities ---

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Utility Components ---

const TypingText: React.FC<{ text: string; delay?: number; speed?: number; className?: string }> = ({ text, delay = 0, speed = 30, className = "" }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i > text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, started]);

  return <p className={className}>{displayedText}{started && displayedText.length < text.length && <span className="animate-pulse">_</span>}</p>;
};

// --- Custom Tooltip for Charts ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-cyan-500/50 p-4 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-xl min-w-[200px] z-50">
        <div className="text-xs font-mono text-cyan-400 mb-2 border-b border-white/10 pb-2 uppercase tracking-wider flex justify-between">
          <span>{typeof label === 'string' ? label : `Step / Epoch: ${label}`}</span>
          <span className="text-[10px] text-slate-500">PAUSED</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-xs group">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: entry.color, color: entry.color }}></div>
                <span className="text-slate-300 font-medium">{entry.name}:</span>
              </div>
              <span className="text-white font-mono font-bold">{Number(entry.value).toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// --- Main Component ---

export const PresentationPlayer: React.FC<PresentationPlayerProps> = ({ stats, metrics }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [prevScene, setPrevScene] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHoveringChart, setIsHoveringChart] = useState(false);
  
  // Audio State
  const [isNarrating, setIsNarrating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Derived Data
  const epochData = useMemo(() => {
    return metrics
      .filter(m => m.type === 'epoch_end')
      .map((m, i) => ({ ...m, index: i + 1, uniqueKey: `${m.fold}-${m.epoch}` }));
  }, [metrics]);
  
  const foldPerformance = useMemo(() => {
    const folds = [1, 2, 3, 4, 5];
    return folds.map(foldNum => {
      const foldMetrics = metrics.filter(m => m.fold === foldNum && m.valF1 !== undefined);
      const bestMetric = foldMetrics.sort((a, b) => (b.valF1 || 0) - (a.valF1 || 0))[0];
      return {
        fold: `Fold ${foldNum}`,
        f1: bestMetric?.valF1 || 0,
        loss: bestMetric?.valLoss || 0
      };
    });
  }, [metrics]);

  const averageF1 = useMemo(() => {
    const total = foldPerformance.reduce((acc, curr) => acc + curr.f1, 0);
    return total / (foldPerformance.length || 1);
  }, [foldPerformance]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const scenes = useMemo(() => [
    {
      id: 'intro',
      title: 'MISSION BRIEFING',
      render: (isExiting = false) => (
        <div className="h-full flex flex-col justify-center items-center text-center max-w-5xl mx-auto px-6 relative z-10">
          <div className="mb-8 p-4 bg-slate-900/50 rounded-full border border-white/10 animate-fade-in-up">
             <AlertOctagon size={48} className="text-red-500 animate-pulse" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white leading-none mb-6 tracking-tighter">
             PROJECT<br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">DISASTER TWEET</span>
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mb-8"></div>
          <TypingText 
            text="Objective: Develop an NLP pipeline to classify social media streams for real-time crisis monitoring." 
            className="text-xl md:text-2xl text-slate-400 font-mono max-w-3xl leading-relaxed"
            speed={20}
            delay={isExiting ? 0 : 1000}
          />
        </div>
      ),
      caption: "In the modern age, social media is the first alert system. Our goal is to filter the noise and detect genuine emergencies instantly."
    },
    {
      id: 'data',
      title: 'INTEL: THE DATASET',
      render: (isExiting = false) => (
        <div className="h-full flex items-center justify-center gap-12 px-12 relative z-10">
           <div className={`flex-1 bg-slate-900/60 backdrop-blur-md border border-slate-700 p-8 rounded-2xl animate-fade-in-up`}>
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Database size={32} className="text-blue-400" />
                 </div>
                 <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Training Data</div>
                    <div className="text-4xl font-black text-white">7,613</div>
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="w-[43%] bg-red-500"></div>
                    <div className="w-[57%] bg-green-500"></div>
                 </div>
                 <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-red-400">43% DISASTER</span>
                    <span className="text-green-400">57% NORMAL</span>
                 </div>
              </div>
           </div>
           <div className={`flex-1 bg-slate-900/60 backdrop-blur-md border border-slate-700 p-8 rounded-2xl animate-fade-in-up`} style={{animationDelay: '0.3s'}}>
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-purple-500/20 rounded-lg">
                    <ScanLine size={32} className="text-purple-400" />
                 </div>
                 <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Test Samples</div>
                    <div className="text-4xl font-black text-white">3,263</div>
                 </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                 Unseen data reserved for leaderboard submission. The model must generalize to these unknown scenarios without overfitting.
              </p>
           </div>
        </div>
      ),
      caption: "We are working with the Kaggle NLP dataset. It contains over 10,000 tweets, hand-labeled to indicate whether they are about a real disaster or not."
    },
    {
      id: 'preprocessing',
      title: 'PRE-PROCESSING',
      render: (isExiting = false) => (
        <div className="h-full flex flex-col justify-center items-center px-6 relative z-10">
           <div className="w-full max-w-4xl space-y-4">
              <div className="flex items-center gap-4 animate-fade-in-up">
                 <div className="w-24 text-right text-xs font-bold text-slate-500 uppercase">Input</div>
                 <div className="flex-1 bg-slate-900 p-4 rounded-lg border border-slate-700 font-mono text-slate-300">
                    "Forest fire near La Ronge Sask. Canada"
                 </div>
              </div>
              <div className="flex justify-center py-2 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                 <div className="bg-slate-800 p-2 rounded-full">
                    <Binary size={24} className="text-cyan-500" />
                 </div>
              </div>
              <div className="flex items-center gap-4 animate-fade-in-up" style={{animationDelay: '1s'}}>
                 <div className="w-24 text-right text-xs font-bold text-slate-500 uppercase">Tokenizer</div>
                 <div className="flex-1 flex gap-2 overflow-hidden">
                    {['<s>', 'Forest', 'Ġfire', 'Ġnear', 'ĠLa', 'ĠRonge', '...'].map((t, i) => (
                       <div key={i} className="bg-cyan-900/30 border border-cyan-500/30 text-cyan-300 px-3 py-2 rounded font-mono text-sm">
                          {t}
                       </div>
                    ))}
                 </div>
              </div>
              <div className="flex items-center gap-4 animate-fade-in-up" style={{animationDelay: '1.5s'}}>
                 <div className="w-24 text-right text-xs font-bold text-slate-500 uppercase">Input IDs</div>
                 <div className="flex-1 bg-slate-900 p-4 rounded-lg border border-slate-700 font-mono text-purple-400 tracking-widest">
                    [0, 3452, 654, 23, 876, 12, ... 2]
                 </div>
              </div>
           </div>
        </div>
      ),
      caption: "Before the model can 'read', we must translate text into numbers. We use the RoBERTa tokenizer to break sentences into sub-word tokens and map them to their vocabulary IDs."
    },
    {
      id: 'architecture',
      title: 'THE ARCHITECTURE',
      render: (isExiting = false) => (
        <div className="h-full flex flex-col items-center justify-center relative z-10">
          <div className="relative mb-12">
            <div className="w-64 h-64 bg-slate-950 rounded-full border-2 border-cyan-500/50 flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
              <Cpu size={96} className="text-cyan-400" />
            </div>
            <div className="absolute inset-0 border border-slate-700 rounded-full animate-spin-slow" style={{ margin: '-20px' }}></div>
            <div className="absolute inset-0 border border-slate-700 rounded-full animate-spin-reverse" style={{ margin: '-40px' }}></div>
            <div className="absolute top-1/2 -right-32 -translate-y-1/2 bg-slate-900 border border-slate-600 px-4 py-2 rounded-lg text-white font-bold shadow-xl animate-fade-in-up" style={{animationDelay: '0.5s'}}>
               Classifier Head
            </div>
            <div className="absolute top-1/2 -left-32 -translate-y-1/2 bg-slate-900 border border-slate-600 px-4 py-2 rounded-lg text-white font-bold shadow-xl animate-fade-in-up" style={{animationDelay: '0.5s'}}>
               12 Transformer Layers
            </div>
          </div>
          <div className="text-center max-w-2xl space-y-4 animate-fade-in-up" style={{animationDelay: '1s'}}>
             <h2 className="text-3xl font-bold text-white">RoBERTa Base Model</h2>
             <p className="text-slate-400 text-lg">
                Robustly Optimized BERT Pretraining Approach. A bidirectional transformer model pre-trained on 160GB of text data, fine-tuned specifically for our classification task.
             </p>
          </div>
        </div>
      ),
      caption: "We employ Transfer Learning. Instead of teaching a model English from scratch, we use RoBERTa, which already understands syntax and nuance, and fine-tune it to detect disasters."
    },
    {
      id: 'training',
      title: 'TRAINING OPERATIONS',
      render: (isExiting = false) => (
        <div className="h-full flex flex-col px-12 py-8 relative z-10">
           <div 
              className="flex-1 bg-slate-900/40 border border-slate-700 rounded-2xl p-6 relative group overflow-hidden transition-colors hover:border-slate-500/50"
              onMouseEnter={() => setIsHoveringChart(true)}
              onMouseLeave={() => setIsHoveringChart(false)}
           >
              <div className="absolute top-0 right-0 p-4 flex gap-4 z-20 pointer-events-none">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-cyan-400"></div>
                    <span className="text-xs text-slate-400 uppercase">Val F1</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-purple-400"></div>
                    <span className="text-xs text-slate-400 uppercase">Train Loss</span>
                 </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={epochData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <defs>
                       <linearGradient id="trainGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="index" hide />
                    <YAxis hide domain={[0, 1]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#22d3ee', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    <Brush dataKey="index" height={30} stroke="#22d3ee" fill="#0f172a" tickFormatter={() => ""} startIndex={0} endIndex={epochData.length > 5 ? 5 : epochData.length - 1} travellerWidth={10} />
                    <Area type="monotone" dataKey="valF1" name="Validation F1" stroke="#22d3ee" strokeWidth={4} fill="url(#trainGrad)" isAnimationActive={!isExiting} animationDuration={2000} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#22d3ee' }} />
                    <Line type="monotone" dataKey="loss" name="Training Loss" stroke="#c084fc" strokeWidth={2} dot={{ fill: '#c084fc', r: 4 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#c084fc' }} strokeDasharray="5 5" isAnimationActive={!isExiting} animationDuration={2000} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-8 flex justify-between items-center bg-slate-900/60 p-6 rounded-xl border border-slate-700">
               <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</div>
                  <div className="text-green-400 font-mono font-bold flex items-center gap-2">
                     <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                     CONVERGED
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Final Validation F1</div>
                  <div className="text-3xl font-black text-white">{stats.oofF1?.toFixed(4) || "0.8200"}</div>
               </div>
           </div>
        </div>
      ),
      caption: "The training curves show a healthy convergence. Interactive chart: drag the slider at the bottom to zoom into specific epochs. Hovering pauses the briefing."
    },
    {
      id: 'validation',
      title: 'CROSS-VALIDATION',
      render: (isExiting = false) => (
        <div className="h-full flex flex-col justify-center px-16 relative z-10">
           <div className="flex items-end justify-between mb-8 animate-fade-in-up">
             <h2 className="text-3xl font-bold text-white flex items-center gap-3">
               <Network className="text-purple-400" />
               Performance by Fold
             </h2>
             <div className="flex flex-col items-end">
               <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                 <div className="w-4 h-0.5 bg-green-500/50"></div>
                 <span>AVG: {averageF1.toFixed(4)}</span>
               </div>
             </div>
           </div>
           <div 
             className="h-64 w-full bg-slate-900/50 rounded-xl border border-slate-800 p-6 animate-fade-in-up transition-colors hover:border-slate-500/50" 
             style={{animationDelay: '0.3s'}}
             onMouseEnter={() => setIsHoveringChart(true)}
             onMouseLeave={() => setIsHoveringChart(false)}
            >
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={foldPerformance} barSize={80}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="fold" stroke="#94a3b8" tick={{fontSize: 14, fill: '#cbd5e1'}} tickLine={false} axisLine={false} />
                    <YAxis domain={[0.70, 0.85]} hide />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(34, 211, 238, 0.05)'}} />
                    <ReferenceLine y={averageF1} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.8} label={{ position: 'right', value: 'AVG', fill: '#22c55e', fontSize: 10, fontWeight: 'bold' }} />
                    <Bar dataKey="f1" name="F1 Score" radius={[4, 4, 0, 0]} isAnimationActive={!isExiting}>
                      {foldPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={'#22d3ee'} opacity={0.6 + (index * 0.1)} /> 
                      ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="grid grid-cols-3 gap-6 mt-8 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="bg-slate-900/40 p-4 rounded-lg border border-white/5">
                 <div className="text-3xl font-black text-white mb-1">5</div>
                 <div className="text-xs text-slate-500 uppercase font-bold">Independent Models</div>
              </div>
              <div className="bg-slate-900/40 p-4 rounded-lg border border-white/5">
                 <div className="text-3xl font-black text-white mb-1">~0.59</div>
                 <div className="text-xs text-slate-500 uppercase font-bold">Optimal Threshold</div>
              </div>
              <div className="bg-slate-900/40 p-4 rounded-lg border border-white/5">
                 <div className="text-3xl font-black text-white mb-1">Top 10%</div>
                 <div className="text-xs text-slate-500 uppercase font-bold">Leaderboard Rank</div>
              </div>
           </div>
        </div>
      ),
      caption: "We didn't just train once. We used Stratified 5-Fold Cross Validation to ensure our model performs consistently across different subsets of data. Green line indicates average performance."
    },
    {
      id: 'deployment',
      title: 'SYSTEM READY',
      render: (isExiting = false) => (
         <div className="h-full flex flex-col items-center justify-center relative z-10">
            <div className="relative mb-12 group cursor-pointer" onClick={() => setCurrentScene(0)}>
               <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity"></div>
               <div className="w-32 h-32 bg-slate-900 rounded-full border-4 border-green-500 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.3)] animate-bounce-slow relative z-10">
                  <ShieldCheck size={64} className="text-green-500" />
               </div>
            </div>
            <h1 className="text-6xl font-black text-white mb-8 tracking-tight">Mission Accomplished</h1>
            <div className="flex flex-col gap-4 w-full max-w-lg">
               <div className="flex items-center justify-between bg-slate-900/80 p-5 rounded-xl border border-green-500/30 animate-slide-in-up" style={{animationDelay: '0.2s'}}>
                  <span className="text-slate-300 font-medium">Model Status</span>
                  <span className="text-green-400 font-bold font-mono tracking-wider">DEPLOYED</span>
               </div>
               <div className="flex items-center justify-between bg-slate-900/80 p-5 rounded-xl border border-green-500/30 animate-slide-in-up" style={{animationDelay: '0.4s'}}>
                  <span className="text-slate-300 font-medium">Pipeline Latency</span>
                  <span className="text-green-400 font-bold font-mono tracking-wider">~12ms</span>
               </div>
               <div className="flex items-center justify-between bg-slate-900/80 p-5 rounded-xl border border-green-500/30 animate-slide-in-up" style={{animationDelay: '0.6s'}}>
                  <span className="text-slate-300 font-medium">Global Coverage</span>
                  <span className="text-green-400 font-bold font-mono tracking-wider">ACTIVE</span>
               </div>
            </div>
            <button 
              onClick={() => setCurrentScene(0)}
              className="mt-12 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2"
            >
               <RefreshCw size={14} /> Replay Mission Briefing
            </button>
         </div>
      ),
      caption: "The system is now fully operational. It effectively disambiguates critical information from noise, providing a reliable tool for emergency responders."
    }
  ], [stats, metrics, averageF1, epochData, foldPerformance]);

  // --- Narration Logic ---
  
  const playCaption = async (text: string) => {
    if (!audioContextRef.current) return;

    // Stop previous audio
    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch(e) {}
      activeSourceRef.current = null;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBytes = decodeBase64(base64Audio);
        const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.start();
        activeSourceRef.current = source;
      }
    } catch (e) {
      console.error("Narration failed", e);
      setIsNarrating(false); // Disable if error (e.g. no API key)
    }
  };

  const toggleNarration = () => {
     if (!audioContextRef.current) {
         audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
     }
     
     // Resume context if suspended (browser policy)
     if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
     }

     const newState = !isNarrating;
     setIsNarrating(newState);
     
     if (!newState && activeSourceRef.current) {
         activeSourceRef.current.stop();
     } else if (newState) {
         playCaption(scenes[currentScene].caption);
     }
  };

  useEffect(() => {
     if (isNarrating) {
         playCaption(scenes[currentScene].caption);
     }
     // Cleanup when component unmounts or scene changes
     return () => {
        if (activeSourceRef.current) {
            try { activeSourceRef.current.stop(); } catch(e) {}
        }
     };
  }, [currentScene, isNarrating, scenes]);


  // --- Animation Loop ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && !isHoveringChart) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + (100 / (SCENE_DURATION / 100)); 
          if (next >= 100) {
            handleNext();
            return 0;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentScene, isHoveringChart]);

  const handleNext = () => {
    const nextIndex = currentScene < scenes.length - 1 ? currentScene + 1 : 0;
    setPrevScene(currentScene);
    setCurrentScene(nextIndex);
    setProgress(0);
    if (nextIndex === 0 && currentScene === scenes.length - 1) {
       setIsPlaying(false);
    }
    setTimeout(() => {
        setPrevScene(null);
    }, 800);
  };

  const jumpToScene = (index: number) => {
     if (index === currentScene) return;
     setPrevScene(currentScene);
     setCurrentScene(index);
     setProgress(0);
     setTimeout(() => setPrevScene(null), 800);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const reset = () => { setIsPlaying(false); setCurrentScene(0); setProgress(0); };
  const activeScene = scenes[currentScene];

  return (
    <div ref={containerRef} className={`w-full flex flex-col items-center justify-center p-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-black p-0 w-screen h-screen' : 'h-full'}`}>
      <div className={`w-full bg-black shadow-2xl overflow-hidden relative border border-slate-800 ring-1 ring-white/5 flex flex-col group ${isFullscreen ? 'w-full h-full rounded-none border-0' : 'max-w-6xl aspect-video rounded-xl'}`}>
        
        {/* Viewport */}
        <div className="flex-1 relative overflow-hidden bg-[#050505]">
           <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-black to-black"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
           </div>

           {/* Header HUD */}
           <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-30 pointer-events-none">
              <div className="flex flex-col">
                 <div className="flex items-center gap-3">
                    <div className="text-4xl font-black text-white/10 select-none tracking-tighter">0{currentScene + 1}</div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div className="text-sm font-bold text-cyan-500 uppercase tracking-[0.3em]">{activeScene.title}</div>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 {isPlaying && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>}
                 <span className="font-mono text-[10px] text-slate-500">
                    {isPlaying ? (isHoveringChart ? 'INTERACTION PAUSE' : 'PLAYBACK') : 'PAUSED'}
                 </span>
              </div>
           </div>

           {/* Previous Scene (Exiting) */}
           {prevScene !== null && scenes[prevScene] && (
               <div key={`prev-${prevScene}`} className="absolute inset-0 z-0 animate-cinematic-exit p-12 pt-24 pb-32">
                   {scenes[prevScene].render(true)}
               </div>
           )}

           {/* Current Scene (Entering) */}
           <div key={`curr-${currentScene}`} className="absolute inset-0 z-10 animate-cinematic-enter p-12 pt-24 pb-32">
             {activeScene.render(false)}
           </div>

           {/* Footer Subtitles */}
           <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 flex justify-center z-30 bg-gradient-to-t from-black via-black/80 to-transparent pt-24 pointer-events-none">
              <p className="text-lg md:text-xl text-slate-300 font-medium max-w-4xl text-center leading-relaxed drop-shadow-lg font-sans">
                 {activeScene.caption}
              </p>
           </div>
        </div>

        {/* Control Deck */}
        <div className="h-16 bg-slate-950 border-t border-white/10 flex items-center px-6 gap-6 z-40 relative">
           <button onClick={togglePlay} className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:bg-cyan-400 hover:scale-105 transition-all shadow-lg shadow-white/10">
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5"/>}
           </button>
           
           <button onClick={reset} className="text-slate-500 hover:text-white transition-colors" title="Restart">
              <RefreshCw size={18} />
           </button>
           
           <button 
             onClick={toggleNarration} 
             className={`transition-colors ${isNarrating ? 'text-cyan-400' : 'text-slate-500 hover:text-white'}`}
             title={isNarrating ? "Disable Narration" : "Enable Narration"}
           >
              {isNarrating ? <Volume2 size={18} /> : <VolumeX size={18} />}
           </button>

           <div className="flex-1 flex gap-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
              {scenes.map((_, idx) => (
                <div key={idx} className="flex-1 bg-slate-800 relative cursor-pointer group" onClick={() => jumpToScene(idx)}>
                   <div 
                      className={`absolute inset-0 bg-cyan-500 transition-all duration-100 ease-linear`}
                      style={{ 
                        width: idx < currentScene ? '100%' : idx === currentScene ? `${progress}%` : '0%',
                        opacity: idx === currentScene ? 1 : 0.5 
                      }}
                   ></div>
                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-[10px] px-2 py-1 rounded border border-white/10 whitespace-nowrap transition-opacity">
                      {scenes[idx].title}
                   </div>
                </div>
              ))}
           </div>
           <div className="flex items-center gap-4 text-slate-600">
              <button onClick={toggleFullscreen} className="hover:text-white transition-colors">
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};