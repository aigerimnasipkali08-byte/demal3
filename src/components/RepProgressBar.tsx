import React from 'react';
import { Trophy, CheckCircle } from 'lucide-react';

interface RepProgressBarProps {
  currentReps: number;
  targetReps: number;
  holdProgress: number;
}

export const RepProgressBar: React.FC<RepProgressBarProps> = ({
  currentReps,
  targetReps,
  holdProgress,
}) => {
  const percentage = Math.min(100, Math.round((currentReps / targetReps) * 100));

  return (
    <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="font-semibold text-slate-200">Required Micro-Exercise</span>
        </div>
        <div className="text-xl font-black text-emerald-400 font-mono">
          {currentReps} <span className="text-slate-500 text-sm font-normal">/ {targetReps} reps</span>
        </div>
      </div>

      {/* Main Rep Progress Bar */}
      <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(34,197,94,0.6)]"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Hold timer indicator if hold exercise */}
      {holdProgress > 0 && holdProgress < 1 && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>Current Hold Progress</span>
          <span className="font-mono font-bold text-emerald-400">{Math.round(holdProgress * 100)}%</span>
        </div>
      )}

      {currentReps >= targetReps && (
        <div className="mt-3 flex items-center gap-2 text-emerald-400 font-semibold text-sm animate-bounce">
          <CheckCircle className="w-4 h-4" />
          Goal Achieved! Unlocking screen...
        </div>
      )}
    </div>
  );
};
