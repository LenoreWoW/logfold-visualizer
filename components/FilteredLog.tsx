import React from 'react';
import { ParsedLine } from '../types';

interface FilteredLogProps {
  lines: ParsedLine[];
}

export const FilteredLog: React.FC<FilteredLogProps> = ({ lines }) => {
  const filteredLines = lines.filter(l => l.isRelevant);

  if (filteredLines.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 italic">
        No relevant fold data found.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-950 p-6 font-mono text-sm border border-slate-800 rounded-xl shadow-2xl">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
         <div className="w-3 h-3 rounded-full bg-red-500"></div>
         <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
         <div className="w-3 h-3 rounded-full bg-green-500"></div>
         <span className="ml-2 text-slate-500 text-xs">training_log.txt</span>
      </div>
      <table className="w-full text-left border-collapse">
        <tbody className="divide-y divide-slate-900/50">
          {filteredLines.map((line) => {
             // Heuristic highlighting
             const isFold = line.content.includes('Fold') && !line.content.includes('|');
             const isMetric = line.content.includes('Train loss') || line.content.includes('Best OOF');
             const isSuccess = line.content.includes('New best F1');
             
             return (
              <tr key={line.id} className="hover:bg-slate-900/50 transition-colors group">
                <td className="py-1 px-4 text-slate-600 text-xs align-top whitespace-nowrap w-24 select-none group-hover:text-slate-500">
                  {line.timestamp.toFixed(1)}s
                </td>
                <td className={`py-1 px-4 break-all ${
                    isFold ? 'text-cyan-400 font-bold' : 
                    isSuccess ? 'text-green-400' :
                    isMetric ? 'text-purple-300' : 
                    'text-slate-400'
                }`}>
                  {line.content}
                </td>
              </tr>
             );
          })}
        </tbody>
      </table>
    </div>
  );
};
