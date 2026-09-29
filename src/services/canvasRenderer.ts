import { NormalizedLandmark, PoseAnalysisResult } from '../types/pose';

/**
 * Skeletal Connection pairs for MediaPipe Pose (Upper Body focus)
 */
const UPPER_BODY_CONNECTIONS: [number, number][] = [
  // Face & Neck
  [0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6], [0, 7], [0, 8],
  [7, 8], // Ear to Ear
  // Shoulders & Arms
  [11, 12], // Left Shoulder to Right Shoulder
  [11, 13], // Left Shoulder to Left Elbow
  [13, 15], // Left Elbow to Left Wrist
  [12, 14], // Right Shoulder to Right Elbow
  [14, 16], // Right Elbow to Right Wrist
  // Torso frame
  [11, 23], [12, 24], [23, 24],
];

export class CanvasRenderer {
  /**
   * Draws the skeletal pose overlay, joint points, angle lines, and active feedback indicators.
   */
  public static drawPose(
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    analysis: PoseAnalysisResult,
    width: number,
    height: number
  ) {
    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    // Determine color theme based on form validity
    let strokeColor = '#22c55e'; // Emerald green (correct form)
    let nodeColor = '#00f2fe';   // Cyan highlight
    let shadowColor = 'rgba(34, 197, 94, 0.6)';

    if (!analysis.isFormValid) {
      if (analysis.errorMessage) {
        strokeColor = '#ef4444'; // Red error
        nodeColor = '#f87171';
        shadowColor = 'rgba(239, 68, 68, 0.6)';
      } else {
        strokeColor = '#f59e0b'; // Amber warning
        nodeColor = '#fbbf24';
        shadowColor = 'rgba(245, 158, 11, 0.6)';
      }
    }

    ctx.save();

    // Set line styles
    ctx.lineWidth = 4;
    ctx.strokeStyle = strokeColor;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 12;

    // 1. Draw Skeleton Bone Connections
    UPPER_BODY_CONNECTIONS.forEach(([startIndex, endIndex]) => {
      const p1 = landmarks[startIndex];
      const p2 = landmarks[endIndex];

      if (p1 && p2 && (p1.visibility ?? 1) > 0.5 && (p2.visibility ?? 1) > 0.5) {
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }
    });

    // 2. Draw Joint Keypoints
    const KEY_JOINTS = [0, 7, 8, 11, 12, 13, 14, 15, 16];
    KEY_JOINTS.forEach((index) => {
      const lm = landmarks[index];
      if (lm && (lm.visibility ?? 1) > 0.5) {
        const x = lm.x * width;
        const y = lm.y * height;

        ctx.beginPath();
        ctx.arc(x, y, index === 0 ? 8 : 6, 0, 2 * Math.PI);
        ctx.fillStyle = nodeColor;
        ctx.shadowBlur = 16;
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
    });

    // 3. Draw Hold Timer / Gauge Overlay near head if active hold
    if (analysis.holdProgress > 0) {
      const head = landmarks[0];
      if (head) {
        const hx = head.x * width;
        const hy = (head.y * height) - 60;
        const radius = 24;

        // Background circle
        ctx.beginPath();
        ctx.arc(hx, hy, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Progress arc
        ctx.beginPath();
        ctx.arc(
          hx,
          hy,
          radius,
          -Math.PI / 2,
          -Math.PI / 2 + (2 * Math.PI * analysis.holdProgress)
        );
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Progress text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round(analysis.holdProgress * 100)}%`, hx, hy);
      }
    }

    // 4. Draw Neck Tilt Angle Indicator if exercise is neck_tilt
    if (analysis.exercise === 'neck_tilt' && analysis.metrics.neckRollAngleDeg !== undefined) {
      const leftEar = landmarks[7];
      const rightEar = landmarks[8];
      if (leftEar && rightEar) {
        const midX = ((leftEar.x + rightEar.x) / 2) * width;
        const midY = ((leftEar.y + rightEar.y) / 2) * height - 30;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(midX - 45, midY - 15, 90, 26);

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1;
        ctx.strokeRect(midX - 45, midY - 15, 90, 26);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 13px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${analysis.metrics.neckRollAngleDeg}°`, midX, midY);
      }
    }

    ctx.restore();
  }
}
