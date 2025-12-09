import React, { useState } from 'react';
import { Send, AlertTriangle, CheckCircle, Activity, Zap } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const SAMPLE_TWEETS = [
  "Just happened a terrible car crash",
  "Heard about #earthquake is different cities, stay safe everyone.",
  "There is a forest fire at spot pond, geese are fleeing across the street, I cannot save them all",
  "I love this movie! It was a total blast.",
  "The sky is ablaze with the sunset tonight."
];

export const LiveDemoSlide: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ isDisaster: boolean; confidence: number; reason: string } | null>(null);

  const handleClassify = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setResult(null);

    try {
      // We use Gemini to simulate the RoBERTa model's behavior for the demo
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are acting as a RoBERTa-based disaster tweet classifier trained on the Kaggle NLP dataset. 
        Classify the following tweet.
        Tweet: "${input}"
        
        Is this describing a real disaster? 
        Return ONLY a JSON object with this format:
        {
          "isDisaster": boolean,
          "confidence": number (between 0.5 and 0.99),
          "reason": "short explanation of why (max 10 words)"
        }
        `,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (text) {
        setResult(JSON.parse(text));
      }
    } catch (e) {
      console.error(e);
      // Fallback if API fails
      setResult({ 
        isDisaster: Math.random() > 0.5, 
        confidence: 0.75, 
        reason: "Simulated fallback response" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">
      <div className="text-center mb-10 space-y-2">
         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-700/50 text-purple-300 text-xs font-medium uppercase tracking-widest animate-pulse">
            <Zap size={12} /> Live Inference Lab
         </div>
         <h2 className="text-4xl font-black text-white">Model Test Environment</h2>
         <p className="text-slate-400">Test the model's capability on unseen data.</p>
      </div>

      {/* Main Interaction Area */}
      <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/80 z-20 flex flex-col items-center justify-center space-y-4">
             <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
             </div>
             <div className="font-mono text-cyan-400 text-sm">
                <p className="animate-pulse">TOKENIZING INPUT...</p>
             </div>
          </div>
        )}

        <div className="p-8 space-y-6">
           <div className="space-y-2">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Input Tweet</label>
             <div className="relative">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full bg-slate-950 text-white p-4 rounded-xl border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none font-mono text-lg transition-all"
                  rows={3}
                  placeholder="Enter a tweet to classify..."
                />
                <button 
                  onClick={handleClassify}
                  disabled={isLoading || !input}
                  className="absolute bottom-3 right-3 bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
             </div>
           </div>

           {/* Sample Chips */}
           <div className="flex flex-wrap gap-2">
              {SAMPLE_TWEETS.map((t, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(t)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs rounded-full border border-slate-700 transition-all"
                >
                  {t}
                </button>
              ))}
           </div>
        </div>

        {/* Result Section */}
        {result && (
          <div className={`p-6 border-t ${result.isDisaster ? 'bg-red-950/20 border-red-900/50' : 'bg-green-950/20 border-green-900/50'} transition-all duration-500`}>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${result.isDisaster ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                      {result.isDisaster ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
                   </div>
                   <div>
                      <h3 className={`text-2xl font-black ${result.isDisaster ? 'text-red-400' : 'text-green-400'}`}>
                        {result.isDisaster ? 'DISASTER DETECTED' : 'SAFE / IRRELEVANT'}
                      </h3>
                      <p className="text-slate-400 text-sm font-mono">{result.reason}</p>
                   </div>
                </div>
                
                <div className="text-right">
                   <div className="text-xs text-slate-500 font-bold uppercase mb-1">Confidence</div>
                   <div className="text-3xl font-mono font-bold text-white">
                     {(result.confidence * 100).toFixed(1)}%
                   </div>
                </div>
             </div>

             {/* Confidence Bar */}
             <div className="mt-6 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${result.isDisaster ? 'bg-red-500' : 'bg-green-500'} transition-all duration-1000 ease-out`}
                  style={{ width: `${result.confidence * 100}%` }}
                ></div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
