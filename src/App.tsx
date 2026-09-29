import React from 'react';
import { usePostureTimer } from './hooks/usePostureTimer';
import { Dashboard } from './components/Dashboard';
import { BlockerOverlay } from './components/BlockerOverlay';

export const App: React.FC = () => {
  const {
    timerState,
    setWorkDuration,
    setSelectedExercise,
    setTargetReps,
    togglePause,
    snooze,
    triggerUnlock,
    simulateLockNow,
  } = usePostureTimer(20);

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      {/* Main Active Desktop Dashboard */}
      <Dashboard
        timerState={timerState}
        onSetWorkDuration={setWorkDuration}
        onSelectExercise={setSelectedExercise}
        onSetTargetReps={setTargetReps}
        onTogglePause={togglePause}
        onSimulateLock={simulateLockNow}
      />

      {/* Fullscreen Blocker Overlay when time expires or simulated lock */}
      {timerState.isLocked && (
        <BlockerOverlay
          exerciseId={timerState.selectedExercise}
          targetReps={timerState.targetReps}
          onUnlock={triggerUnlock}
          onSnooze={snooze}
          onSelectExercise={setSelectedExercise}
        />
      )}
    </div>
  );
};

export default App;
