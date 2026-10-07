import React from 'react';
import { AIStatus } from '../types';

interface AudioWaveformProps {
  status: AIStatus;
  confidence?: number;
  noiseLevel?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ status, confidence = 0.95, noiseLevel = 'Normal OR' }) => {
  // Height arrays for realistic multi-bar acoustic visualizer
  const bars = [14, 28, 42, 65, 88, 52, 95, 74, 38, 82, 58, 30, 16];

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
      {/* Status indicator dot */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          {status === 'LISTENING' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          )}
          {status === 'SPEAKING' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          {status === 'UNCERTAIN' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              status === 'LISTENING'
                ? 'bg-blue-600'
                : status === 'SPEAKING'
                ? 'bg-emerald-600'
                : status === 'UNCERTAIN'
                ? 'bg-amber-500'
                : status === 'PROCESSING'
                ? 'bg-indigo-600 animate-pulse'
                : status === 'INTERRUPTED'
                ? 'bg-amber-600'
                : 'bg-slate-400'
            }`}
          />
        </span>
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-700">
          {status}
        </span>
      </div>

      {/* Waveform bars */}
      <div className="flex items-center gap-1 h-6 px-1">
        {bars.map((heightPercent, idx) => {
          let dynamicHeight = 4;
          let barColor = 'bg-slate-300';

          if (status === 'LISTENING') {
            dynamicHeight = Math.max(6, (heightPercent / 100) * 22);
            barColor = 'bg-blue-500';
          } else if (status === 'SPEAKING') {
            dynamicHeight = Math.max(8, (heightPercent / 100) * 24);
            barColor = 'bg-emerald-500';
          } else if (status === 'PROCESSING') {
            dynamicHeight = 10 + (idx % 3) * 6;
            barColor = 'bg-indigo-400';
          } else if (status === 'UNCERTAIN') {
            dynamicHeight = (heightPercent / 100) * 14;
            barColor = 'bg-amber-400';
          } else if (status === 'INTERRUPTED') {
            dynamicHeight = 8;
            barColor = 'bg-amber-500';
          }

          return (
            <span
              key={idx}
              className={`w-0.5 rounded-full transition-all duration-150 ${barColor} ${
                status === 'LISTENING' || status === 'SPEAKING' ? 'wave-bar' : ''
              }`}
              style={{
                height: `${dynamicHeight}px`,
                animationDelay: `${idx * 0.08}s`
              }}
            />
          );
        })}
      </div>

      {/* Confidence badge */}
      {status !== 'IDLE' && status !== 'MUTED' && (
        <div className="flex items-center gap-1 pl-2 border-l border-slate-200 text-xs">
          <span className="text-slate-500">Conf:</span>
          <span className={`font-mono font-medium ${
            confidence >= 0.85 ? 'text-emerald-700' : confidence >= 0.7 ? 'text-amber-700' : 'text-rose-700'
          }`}>
            {Math.round(confidence * 100)}%
          </span>
        </div>
      )}

      {/* Ambient noise badge */}
      <div className="text-[11px] text-slate-400 hidden sm:block">
        [{noiseLevel}]
      </div>
    </div>
  );
};
