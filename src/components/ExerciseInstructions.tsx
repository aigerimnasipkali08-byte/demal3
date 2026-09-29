import React from 'react';
import { ExerciseType, ExerciseDefinition } from '../types/pose';
import { Activity, RefreshCw, MoveHorizontal } from 'lucide-react';

export const EXERCISE_DEFINITIONS: Record<ExerciseType, ExerciseDefinition> = {
  scapular_squeeze: {
    id: 'scapular_squeeze',
    name: 'Scapular Squeeze & Chest Opener',
    description: 'Relieves upper back tension caused by forward desk slouching.',
    targetReps: 5,
    holdDurationSeconds: 1.5,
    iconName: 'Activity',
    instructions: [
      'Sit up tall with shoulders dropped away from ears.',
      'Pull elbows wide and draw shoulder blades back toward spine.',
      'Hold the contraction for 1.5 seconds until rep counts.',
      'Release and repeat 5 times.',
    ],
  },
  neck_tilt: {
    id: 'neck_tilt',
    name: 'Neck Side Rotations & Tilts',
    description: 'Stretches tight lateral neck muscles and relieves cervical pressure.',
    targetReps: 5,
    iconName: 'RefreshCw',
    instructions: [
      'Look straight into camera with chin parallel to floor.',
      'Slowly tilt left ear down toward left shoulder (18°+ angle).',
      'Return head to center, then tilt right ear toward right shoulder.',
      'One complete left + right cycle equals 1 rep.',
    ],
  },
  chin_tuck: {
    id: 'chin_tuck',
    name: 'Chin Tuck & Neck Retraction',
    description: 'Corrects forward head posture ("tech neck") by rebuilding deep cervical flexors.',
    targetReps: 5,
    holdDurationSeconds: 1.5,
    iconName: 'MoveHorizontal',
    instructions: [
      'Look straight ahead without tilting head up or down.',
      'Glide head straight backward as if making a double chin.',
      'Hold position for 1.5 seconds.',
      'Relax back to neutral.',
    ],
  },
};

interface ExerciseInstructionsProps {
  exerciseId: ExerciseType;
  onSelectExercise?: (exerciseId: ExerciseType) => void;
  isCompact?: boolean;
}

export const ExerciseInstructions: React.FC<ExerciseInstructionsProps> = ({
  exerciseId,
  onSelectExercise,
  isCompact = false,
}) => {
  const def = EXERCISE_DEFINITIONS[exerciseId];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Exercise selector buttons if handler provided */}
      {onSelectExercise && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {Object.values(EXERCISE_DEFINITIONS).map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectExercise(item.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                item.id === exerciseId
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl shrink-0">
          {exerciseId === 'scapular_squeeze' && <Activity className="w-6 h-6" />}
          {exerciseId === 'neck_tilt' && <RefreshCw className="w-6 h-6" />}
          {exerciseId === 'chin_tuck' && <MoveHorizontal className="w-6 h-6" />}
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-100">{def.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{def.description}</p>
        </div>
      </div>

      {!isCompact && (
        <ul className="mt-4 space-y-2 text-xs text-slate-300">
          {def.instructions.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="flex items-center justify-center w-5 h-5 bg-slate-800 text-emerald-400 rounded-full font-mono font-bold text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
