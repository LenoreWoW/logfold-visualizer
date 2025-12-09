import React from 'react';

interface LogInputProps {
  value: string;
  onChange: (val: string) => void;
}

export const LogInput: React.FC<LogInputProps> = ({ value, onChange }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-slate-800 text-slate-300 px-4 py-2 text-sm font-semibold border-b border-slate-700 flex justify-between items-center">
        <span>Input Raw Logs</span>
        <button 
          onClick={() => onChange('')}
          className="text-xs hover:text-white transition-colors"
        >
          Clear
        </button>
      </div>
      <textarea
        className="flex-1 bg-slate-900 text-slate-400 p-4 font-mono text-xs focus:outline-none resize-none"
        placeholder="Paste your logs here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    </div>
  );
};
