import React, { useMemo } from 'react';
import { MetricData, GlobalStats } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';

interface MetricsDashboardProps {
  metrics: MetricData[];
  stats: GlobalStats;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics, stats }) => {
  const stepData = useMemo(() => metrics.filter(m => m.type === 'step'), [metrics]);
  const epochData = useMemo(() => metrics.filter(m => m.type === 'epoch_end'), [metrics]);

  const foldSummary = useMemo(() => {
    const folds: Record<number, { fold: number; maxF1: number; minLoss: number; epochs: number }> = {};
    epochData.forEach(m => {
      if (!folds[m.fold]) {
        folds[m.fold] = { fold: m.fold, maxF1: 0, minLoss: 100, epochs: 0 };
      }
      folds[m.fold].epochs = Math.max(folds[m.fold].epochs, m.epoch);
      if (m.valF1 && m.valF1 > folds[m.fold].maxF1) folds[m.fold].maxF1 = m.valF1;
      if (m.valLoss && m.valLoss < folds[m.fold].minLoss) folds[m.fold].minLoss = m.valLoss;
    });
    return Object.values(folds).sort((a, b) => a.fold - b.fold);
  }, [epochData]);

  const avgF1 = foldSummary.reduce((acc, curr) => acc + curr.maxF1, 0) / (foldSummary.length || 1);

  if (metrics.length === 0) return null;

  return (
    <div className="h-full overflow-y-auto p-2 space-y-6">
      
      {/* Global Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-xl">
            <p className="text-slate-500 text-xs font-bold uppercase">Best OOF F1</p>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
               {stats.oofF1?.toFixed(4) || "N/A"}
            </p>
         </div>
         <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-xl">
            <p className="text-slate-500 text-xs font-bold uppercase">Average F1</p>
            <p className="text-3xl font-bold text-cyan-400">{avgF1.toFixed(4)}</p>
         </div>
         <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-xl">
            <p className="text-slate-500 text-xs font-bold uppercase">Total Duration</p>
            <p className="text-3xl font-bold text-slate-200">{stats.duration ? `${(stats.duration / 60).toFixed(0)}m` : "N/A"}</p>
         </div>
         <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-xl">
            <p className="text-slate-500 text-xs font-bold uppercase">Total Folds</p>
            <p className="text-3xl font-bold text-slate-200">{foldSummary.length}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-xl min-h-[400px]">
           <h3 className="text-slate-200 font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Learning Curves (Val F1 vs Loss)
           </h3>
           <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={epochData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorF1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="timestamp" tickFormatter={(v) => `${Math.round(v)}s`} stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis yAxisId="left" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} domain={[0, 1]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                      itemStyle={{ fontSize: 12 }}
                  />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="valF1" name="Validation F1" stroke="#22d3ee" fillOpacity={1} fill="url(#colorF1)" strokeWidth={3} />
                  <Line yAxisId="right" type="monotone" dataKey="loss" name="Train Loss" stroke="#f472b6" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                  <Line yAxisId="right" type="monotone" dataKey="valLoss" name="Val Loss" stroke="#facc15" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Fold Comparison */}
        <div className="space-y-4">
           {foldSummary.map((f) => (
              <div key={f.fold} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-cyan-500/50 transition-colors">
                 <div>
                    <h4 className="text-cyan-400 text-sm font-bold">FOLD {f.fold}</h4>
                    <span className="text-slate-500 text-xs">{f.epochs} Epochs</span>
                 </div>
                 <div className="text-right">
                    <div className="text-xl font-bold text-white">{f.maxF1.toFixed(4)}</div>
                    <div className="text-slate-500 text-xs">Best F1</div>
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* Granular Step Chart */}
      {stepData.length > 0 && (
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-xl">
         <h3 className="text-slate-200 font-semibold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Step-by-Step Training Loss
         </h3>
         <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stepData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="timestamp" tickFormatter={(v) => `${Math.round(v)}s`} stroke="#475569" tick={{fontSize: 10}} />
                <YAxis stroke="#475569" tick={{fontSize: 10}} />
                <Tooltip 
                     contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                     labelFormatter={(v) => `${v}s`}
                />
                <Line type="monotone" dataKey="loss" stroke="#a855f7" strokeWidth={1} dot={false} />
                {foldSummary.map(f => {
                   const startPoint = stepData.find(d => d.fold === f.fold);
                   return startPoint ? (
                       <ReferenceLine key={f.fold} x={startPoint.timestamp} stroke="#334155" strokeDasharray="3 3" />
                   ) : null;
                })}
              </LineChart>
            </ResponsiveContainer>
         </div>
      </div>
      )}
    </div>
  );
};
