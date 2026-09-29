import React from 'react';
import { PoseAnalysisResult } from '../types/pose';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface FeedbackBadgeProps {
  analysis: PoseAnalysisResult | null;
}

export const FeedbackBadge: React.FC<FeedbackBadgeProps> = ({ analysis }) => {
  if (!analysis) return null;

  const { isFormValid, feedbackMessage, errorMessage } = analysis;

  if (errorMessage) {
    return (
      <div className="flex items-center gap-3 bg-red-950/80 border border-red-500/50 text-red-200 px-5 py-3 rounded-2xl shadow-lg shadow-red-950/40 backdrop-blur-md animate-pulse">
        <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
        <div className="text-sm font-medium">
          <span className="font-bold block text-red-100">Posture Fix Needed:</span>
          {errorMessage}
        </div>
      </div>
    );
  }

  if (isFormValid) {
    return (
      <div className="flex items-center gap-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-5 py-3 rounded-2xl shadow-lg shadow-emerald-950/40 backdrop-blur-md">
        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
        <div className="text-sm font-medium">
          <span className="font-bold block text-emerald-100">Correct Form!</span>
          {feedbackMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/60 text-slate-300 px-5 py-3 rounded-2xl shadow-lg backdrop-blur-md">
      <Info className="w-6 h-6 text-cyan-400 shrink-0" />
      <div className="text-sm font-medium">
        <span className="font-bold block text-cyan-200">Guidance:</span>
        {feedbackMessage}
      </div>
    </div>
  );
};
