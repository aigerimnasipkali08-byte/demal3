import React, { useState } from 'react';
import { CameraFeed } from './CameraFeed';
import { ExerciseInstructions } from './ExerciseInstructions';
import { RepProgressBar } from './RepProgressBar';
import { FeedbackBadge } from './FeedbackBadge';
import { EmergencyBypassModal } from './EmergencyBypassModal';
import { ExerciseType, PoseAnalysisResult } from '../types/pose';
import { Lock, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

interface BlockerOverlayProps {
  exerciseId: ExerciseType;
  targetReps: number;
  onUnlock: () => void;
  onSnooze: (minutes: number) => void;
  onSelectExercise: (exercise: ExerciseType) => void;
}

export const BlockerOverlay: React.FC<BlockerOverlayProps> = ({
  exerciseId,
  targetReps,
  onUnlock,
  onSnooze,
  onSelectExercise,
}) => {
  const [currentReps, setCurrentReps] = useState(0);
  const [analysis, setAnalysis] = useState<PoseAnalysisResult | null>(null);
  const [isBypassOpen, setIsBypassOpen] = useState(false);

  const handleRepCompleted = () => {
    setCurrentReps((prev) => prev + 1);
  };

  const handleAnalysisUpdate = (res: PoseAnalysisResult) => {
    setAnalysis(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl text-slate-100 flex flex-col p-6 select-none overflow-y-auto">
      {/* Top Header Warning Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl animate-pulse">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">PostureLock Restricted Mode</h1>
              <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Screen Locked
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Screen-time limit reached! Perform {targetReps} reps in front of webcam to earn +20 minutes.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsBypassOpen(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl transition shadow-lg"
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Emergency Bypass
        </button>
      </div>

      {/* Main Grid: Left side Camera & Skeletal Overlay; Right side Guidance & Counter */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
        {/* Left Column: Live Camera Feed + Skeletal Landmark Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <CameraFeed
            exerciseId={exerciseId}
            targetReps={targetReps}
            onRepCompleted={handleRepCompleted}
            onAllRepsFinished={onUnlock}
            onAnalysisUpdate={handleAnalysisUpdate}
          />

          {/* Real-time Posture Feedback Pill */}
          <FeedbackBadge analysis={analysis} />
        </div>

        {/* Right Column: Rep Progress + Exercise Cards + Instructions */}
        <div className="lg:col-span-5 space-y-5">
          {/* Progress Tracker Card */}
          <RepProgressBar
            currentReps={currentReps}
            targetReps={targetReps}
            holdProgress={analysis?.holdProgress ?? 0}
          />

          {/* Exercise Instructions & Selector Card */}
          <ExerciseInstructions
            exerciseId={exerciseId}
            onSelectExercise={onSelectExercise}
          />

          {/* Privacy Guarantee Note */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200 block mb-0.5">100% On-Device Privacy</span>
              MediaPipe vision inference runs locally on your WebGL/Wasm engine. No webcam video or images leave your machine.
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Passcode Bypass Modal */}
      <EmergencyBypassModal
        isOpen={isBypassOpen}
        onClose={() => setIsBypassOpen(false)}
        onBypass={(snoozeMins) => {
          onSnooze(snoozeMins);
        }}
      />
    </div>
  );
};
