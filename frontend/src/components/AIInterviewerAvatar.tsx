import React from 'react';
import { Bot, Sparkles, Mic, Volume2 } from 'lucide-react';

interface AIInterviewerAvatarProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  speakerVolume?: number; // 0.0 to 1.0
}

export const AIInterviewerAvatar: React.FC<AIInterviewerAvatarProps> = ({ state, speakerVolume = 0.5 }) => {
  return (
    <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56">
      
      {/* Outer Pulse Rings */}
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-500 ${
          state === 'speaking' 
            ? 'bg-gradient-to-tr from-cyan-500/30 to-purple-600/30 blur-xl scale-125 animate-pulse'
            : state === 'listening'
            ? 'bg-cyan-500/20 blur-lg scale-110 animate-pulse'
            : state === 'thinking'
            ? 'bg-purple-600/30 blur-xl scale-115 animate-spin'
            : 'bg-purple-600/10 blur-md scale-100'
        }`}
      />

      {/* Orbiting Ring */}
      <div 
        className={`absolute w-full h-full rounded-full border border-dashed transition-all duration-700 ${
          state === 'speaking'
            ? 'border-cyan-400/80 animate-spin'
            : state === 'listening'
            ? 'border-purple-400/60 animate-pulse'
            : 'border-white/20'
        }`}
        style={{ animationDuration: state === 'speaking' ? '8s' : '15s' }}
      />

      {/* Core AI Orb Container */}
      <div className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-b from-[#1E1B4B] to-[#0F0E2A] border-2 border-purple-500/50 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
        
        {/* Internal Gradient Aurora */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(circle, #8B5CF6 10%, #22D3EE 60%, transparent 80%)',
          }}
        />

        {/* Central Icon / Face Element */}
        <div className="relative z-20 flex flex-col items-center">
          <div className="relative">
            <Bot 
              className={`w-14 h-14 sm:w-16 sm:h-16 transition-all duration-300 ${
                state === 'speaking'
                  ? 'text-cyan-300 scale-110 drop-shadow-[0_0_12px_#22D3EE]'
                  : state === 'listening'
                  ? 'text-purple-300 scale-105'
                  : 'text-slate-300'
              }`}
            />
            {state === 'speaking' && (
              <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-2 animate-bounce" />
            )}
          </div>

          {/* Dynamic Voice Waves indicator */}
          <div className="flex items-center gap-1 mt-3">
            {[4, 8, 14, 20, 14, 8, 4].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  state === 'speaking'
                    ? 'bg-gradient-to-t from-cyan-400 to-purple-400'
                    : state === 'listening'
                    ? 'bg-purple-500/60'
                    : 'bg-slate-700'
                }`}
                style={{
                  height: state === 'speaking' ? `${Math.max(6, h * (speakerVolume + 0.5))}px` : '4px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Status Badge inside Orb */}
        <div className="absolute bottom-2 z-20">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            state === 'speaking' 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : state === 'listening'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : state === 'thinking'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-slate-800 text-slate-400'
          }`}>
            {state === 'speaking' ? 'Speaking' : state === 'listening' ? 'Listening...' : state === 'thinking' ? 'Evaluating' : 'Vignan AI'}
          </span>
        </div>
      </div>
    </div>
  );
};
