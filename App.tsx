import React, { useState, useMemo } from 'react';
import { SlideType } from './types';
import { LogInput } from './components/LogInput';
import { FilteredLog } from './components/FilteredLog';
import { MetricsDashboard } from './components/MetricsDashboard';
import { IntroSlide } from './components/IntroSlide';
import { CodeSlide } from './components/CodeSlide';
import { LiveDemoSlide } from './components/LiveDemoSlide';
import { PresentationPlayer } from './components/PresentationPlayer';
import { parseLogs, DEFAULT_LOGS } from './utils/parser';
import { BarChart2, Terminal, Home, ChevronRight, Edit2, Code, Zap, PlayCircle, Layers } from 'lucide-react';

export default function App() {
  const [rawLogs, setRawLogs] = useState(DEFAULT_LOGS);
  const [activeSlide, setActiveSlide] = useState<SlideType>(SlideType.Story);
  const [showInput, setShowInput] = useState(false);

  const { parsedLines, metrics, stats } = useMemo(() => parseLogs(rawLogs), [rawLogs]);

  const slides = [
    { id: SlideType.Story, label: 'Presentation', icon: PlayCircle, desc: 'Project Summary' },
    { id: SlideType.Intro, label: 'Overview', icon: Home, desc: 'Goals & Scope' },
    { id: SlideType.Code, label: 'Implementation', icon: Code, desc: 'Source Code' },
    { id: SlideType.Metrics, label: 'Performance', icon: BarChart2, desc: 'Training Metrics' },
    { id: SlideType.Demo, label: 'Live Inference', icon: Zap, desc: 'Test Model' },
    { id: SlideType.Terminal, label: 'System Logs', icon: Terminal, desc: 'Raw Output' },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30 relative">
      
      {/* Background - Deep Space Tech Theme */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/20 via-[#050505] to-[#050505]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20"></div>
      </div>

      {/* Side Navigation */}
      <nav className="w-16 md:w-64 border-r border-white/5 flex flex-col bg-[#050505]/80 backdrop-blur-xl z-20 relative shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-center md:justify-start">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]">
               <Layers size={18} />
             </div>
             <div className="hidden md:block">
               <h1 className="font-bold text-white tracking-tight leading-tight">Neuro<span className="text-cyan-500">Fold</span></h1>
             </div>
           </div>
        </div>
        
        <div className="flex-1 py-6 px-3 space-y-1">
          {slides.map((slide) => {
            const Icon = slide.icon;
            const isActive = activeSlide === slide.id;
            return (
              <button
                key={slide.id}
                onClick={() => setActiveSlide(slide.id)}
                className={`group w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-inner border border-white/5' 
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={20} className={`transition-colors ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                
                <div className="hidden md:block text-left">
                  <span className={`block font-medium text-sm ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                    {slide.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5">
           <button 
             onClick={() => setShowInput(!showInput)}
             className="flex items-center justify-center md:justify-start gap-3 text-xs text-slate-500 hover:text-white px-3 py-2 w-full rounded-lg hover:bg-white/5 transition-colors"
           >
             <Edit2 size={14} />
             <span className="hidden md:block">Edit Data Source</span>
           </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden z-10">
        
        {/* Input Overlay */}
        {showInput && (
           <div className="absolute inset-y-0 left-0 w-96 bg-[#0a0a0a]/95 backdrop-blur-2xl z-50 border-r border-white/10 shadow-2xl animate-slide-in-left">
              <LogInput value={rawLogs} onChange={setRawLogs} />
           </div>
        )}

        {/* Minimal Header */}
        <header className="h-14 px-6 flex items-center justify-between border-b border-white/5 bg-[#050505]/50 backdrop-blur-sm">
           <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span>root</span>
              <span className="text-slate-700">/</span>
              <span>projects</span>
              <span className="text-slate-700">/</span>
              <span className="text-cyan-500 font-bold uppercase">{activeSlide}</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Connected</span>
              </div>
           </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 w-full h-full relative">
          {activeSlide === SlideType.Story ? (
             <div className="absolute inset-0 bg-black">
                <PresentationPlayer stats={stats} metrics={metrics} />
             </div>
          ) : (
            <div className="h-full w-full max-w-7xl mx-auto p-4 md:p-8 overflow-auto custom-scrollbar animate-fade-in-up">
               {activeSlide === SlideType.Intro && <IntroSlide onNavigate={setActiveSlide} />}
               {activeSlide === SlideType.Code && <CodeSlide />}
               {activeSlide === SlideType.Metrics && <MetricsDashboard metrics={metrics} stats={stats} />}
               {activeSlide === SlideType.Demo && <LiveDemoSlide />}
               {activeSlide === SlideType.Terminal && <FilteredLog lines={parsedLines} />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}