import React from 'react';
import { Target, Cpu, GitBranch, Trophy, ChevronRight, PlayCircle, Zap, Code, BarChart2 } from 'lucide-react';
import { SlideType } from '../types';

interface IntroSlideProps {
  onNavigate: (slide: SlideType) => void;
}

export const IntroSlide: React.FC<IntroSlideProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8 relative overflow-y-auto">
      
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 text-center space-y-12 max-w-6xl w-full animate-fade-in-up">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 backdrop-blur-md shadow-xl text-slate-300 text-xs font-bold uppercase tracking-[0.2em] mb-4">
             <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
             Deep Learning Pipeline
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">
            Disaster<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Response AI
            </span>
          </h1>
          
          <p className="text-slate-400 max-w-2xl mx-auto text-xl font-light leading-relaxed">
            A specialized RoBERTa model engineered to disambiguate <span className="text-white font-medium">real-time emergencies</span> from noise in social media streams.
          </p>

          {/* Primary CTA */}
          <div className="flex justify-center pt-4">
             <button 
               onClick={() => onNavigate(SlideType.Story)}
               className="group relative inline-flex items-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_40px_rgba(8,145,178,0.6)] hover:-translate-y-1"
             >
               <PlayCircle size={24} className="fill-current" />
               <span className="font-bold tracking-widest uppercase text-sm">Initialize System</span>
               <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all animate-pulse-glow"></div>
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Card 1 */}
          <button 
            onClick={() => onNavigate(SlideType.Code)}
            className="group bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-3xl hover:bg-slate-900/60 hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex flex-col h-full items-start">
              <div className="p-3 bg-slate-800/50 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/5">
                <Code className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Architecture</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">Inspect the source code, RoBERTa tokenizer config, and training loop implementation.</p>
              <div className="mt-auto flex items-center text-cyan-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                 View Source <ChevronRight size={14} className="ml-1" />
              </div>
            </div>
          </button>

          {/* Card 2 */}
          <button 
            onClick={() => onNavigate(SlideType.Metrics)}
            className="group bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-3xl hover:bg-slate-900/60 hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex flex-col h-full items-start">
              <div className="p-3 bg-slate-800/50 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/5">
                <BarChart2 className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Performance</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">Analyze Stratified 5-Fold Cross-Validation metrics and learning curves.</p>
              <div className="mt-auto flex items-center text-purple-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                 View Metrics <ChevronRight size={14} className="ml-1" />
              </div>
            </div>
          </button>

          {/* Card 3 */}
          <button 
            onClick={() => onNavigate(SlideType.Demo)}
            className="group bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-3xl hover:bg-slate-900/60 hover:border-yellow-500/30 transition-all duration-300 relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex flex-col h-full items-start">
              <div className="p-3 bg-slate-800/50 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/5">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Inference Lab</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">Test the model with live inputs and seeing confidence scores in real-time.</p>
              <div className="mt-auto flex items-center text-yellow-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                 Launch Demo <ChevronRight size={14} className="ml-1" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};