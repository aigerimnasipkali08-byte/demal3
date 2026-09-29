import React, { useState } from 'react';
import { PostureTimerState, ExerciseType } from '../types/pose';
import { EXERCISE_DEFINITIONS } from './ExerciseInstructions';
import { Clock, Play, Pause, Lock, ShieldCheck, Flame, Activity, RefreshCw, MoveHorizontal, Camera } from 'lucide-react';
import { CameraFeed } from './CameraFeed';

interface DashboardProps {
  timerState: PostureTimerState;
  onSetWorkDuration: (minutes: number) => void;
  onSelectExercise: (exercise: ExerciseType) => void;
  onSetTargetReps: (reps: number) => void;
  onTogglePause: () => void;
  onSimulateLock: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  timerState,
  onSetWorkDuration,
  onSelectExercise,
  onSetTargetReps,
  onTogglePause,
  onSimulateLock,
}) => {
  const [showCameraPreview, setShowCameraPreview] = useState(false);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-6 font-sans">
      {/* Top Navbar */}
      <header className="max-w-6xl mx-auto flex items-center justify-between border-b border-slate-800 pb-5 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            PL
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              PostureLock
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                MVP v1.0
              </span>
            </h1>
            <p className="text-xs text-slate-400">Desktop Screen Time Restriction & Posture Verification</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCameraPreview(!showCameraPreview)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            {showCameraPreview ? 'Hide Camera Test' : 'Test Camera & Skeleton'}
          </button>

          <button
            onClick={onSimulateLock}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-red-600/20 transition"
          >
            <Lock className="w-4 h-4" />
            Lock Screen Now (Test)
          </button>
        </div>
      </header>

      {/* Camera Test Preview Drawer if toggled */}
      {showCameraPreview && (
        <div className="max-w-6xl mx-auto mb-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              Webcam Pose Landmark Verification Preview
            </h3>
            <button
              onClick={() => setShowCameraPreview(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Close Test
            </button>
          </div>
          <div className="max-w-xl mx-auto">
            <CameraFeed
              exerciseId={timerState.selectedExercise}
              targetReps={timerState.targetReps}
              onRepCompleted={() => {}}
              onAllRepsFinished={() => {}}
              onAnalysisUpdate={() => {}}
            />
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Big Timer Display & Work Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Countdown Timer Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-6">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" /> ACTIVE WORK SESSION
              </span>
              <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-mono">
                {timerState.isPaused ? 'PAUSED' : 'COUNTING DOWN'}
              </span>
            </div>

            {/* Giant Timer Display */}
            <div className="text-center my-6">
              <div className="text-7xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-[0_0_25px_rgba(34,197,94,0.3)]">
                {formatTime(timerState.timeRemainingSeconds)}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Screen will automatically lock when timer reaches 00:00.
              </p>
            </div>

            {/* Play/Pause Control Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={onTogglePause}
                className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold px-8 py-3.5 rounded-2xl shadow-xl transition"
              >
                {timerState.isPaused ? (
                  <>
                    <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" /> Resume Work Timer
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5 text-amber-400 fill-amber-400" /> Pause Timer
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Work Duration Presets */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Configurable Work Session Interval
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[20, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => onSetWorkDuration(mins)}
                  className={`py-3 rounded-2xl font-bold text-sm transition ${
                    timerState.workDurationMinutes === mins
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Exercise Selection & Stats */}
        <div className="lg:col-span-5 space-y-6">
          {/* Exercise Selection Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Required Micro-Exercise on Lock
            </h3>

            <div className="space-y-3">
              {Object.values(EXERCISE_DEFINITIONS).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectExercise(item.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    timerState.selectedExercise === item.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-slate-100 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="p-2.5 bg-slate-900 border border-slate-800 text-emerald-400 rounded-xl mt-0.5">
                    {item.id === 'scapular_squeeze' && <Activity className="w-5 h-5" />}
                    {item.id === 'neck_tilt' && <RefreshCw className="w-5 h-5" />}
                    {item.id === 'chin_tuck' && <MoveHorizontal className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-200">{item.name}</h4>
                      {timerState.selectedExercise === item.id && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Target Rep Count Configurator */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Target Repetitions:</span>
              <div className="flex items-center gap-2">
                {[3, 5, 8].map((reps) => (
                  <button
                    key={reps}
                    onClick={() => onSetTargetReps(reps)}
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-bold ${
                      timerState.targetReps === reps
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {reps}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Posture & Wellness Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-2">
                <Flame className="w-4 h-4" /> Daily Streak
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {timerState.completedSessions} <span className="text-xs font-normal text-slate-400">sessions</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Exercises completed today</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-2">
                <ShieldCheck className="w-4 h-4" /> Privacy Mode
              </div>
              <div className="text-sm font-bold text-slate-200 mt-1">100% On-Device</div>
              <p className="text-[11px] text-slate-500 mt-1">MediaPipe WebGL Engine</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
