# 🧘 PostureLock MVP — Screen-Time Restriction & Posture Verification App

**PostureLock** is a cross-platform desktop wellness application built with **Electron**, **React**, **TypeScript**, **Tailwind CSS**, and **MediaPipe Tasks-Vision (Pose Detection)**.

When a user's configured screen-time limit expires, PostureLock triggers a full-screen, non-closable blocker overlay. To dismiss the overlay and earn additional screen time (+15 to +30 minutes), the user must complete real-time physical micro-exercises (e.g. Scapular Squeezes, Neck Rotations/Tilts, Chin Tucks) in front of their webcam.

---

## 🌟 Key Features

1. **100% Privacy-Preserving On-Device CV**: Uses MediaPipe Pose JS SDK via WebGL/Wasm. Zero video data or frames are uploaded to any cloud server.
2. **Real-Time Exercise Detection & Repetition Counting**:
   - **Scapular Squeeze / Chest Opener**: Tracks shoulder blade retraction and elbow pull-back with a 1.5-second continuous hold timer.
   - **Neck Rotations / Head Tilts**: Tracks head roll angle ($\theta_{roll} = \theta_{ears} - \theta_{shoulders}$) with a left-center-right state machine.
   - **Chin Tuck & Retraction**: Evaluates cervical spine pitch and head retraction.
3. **Smart "Error Mode" Real-Time Feedback**:
   - Detects improper posture, asymmetry, excessive tilt, or incomplete movement range.
   - Displays real-time corrective instructions (e.g., *"Move back from camera"*, *"Hold continuous squeeze for 1.5s (held 0.8s)"*, *"Tilt head further left"*).
4. **Desktop Overlay Interception**: Integrated Electron window management (`setAlwaysOnTop`, `setKiosk`, `setFullScreen`) to prevent trivial bypassing when screen time expires.
5. **Zero-Dependency Web Audio API**: Synthesizes pleasant chime sounds for rep completion, hold ticks, and unlock fanfare.
6. **Emergency Bypass System**: Passcode protection (`1234`) or temporary penalty snooze.

---

## 📁 Architecture & Project Structure

```
posture-lock/
├── package.json               # Dependencies & build scripts
├── tsconfig.json              # TypeScript compilation setup
├── vite.config.ts             # Vite development server config
├── tailwind.config.js         # Styling & custom glowing animations
├── electron/
│   ├── main.ts                # Main process: Kiosk mode, window creation, IPC
│   └── preload.ts             # Secure contextBridge API for lock toggling
└── src/
    ├── main.tsx               # React application entrypoint
    ├── App.tsx                # Main container orchestrating timer & overlay
    ├── index.css              # Global Tailwind imports & scrollbar styles
    ├── types/
    │   └── pose.ts            # TypeScript schemas for landmarks, exercises & state
    ├── services/
    │   ├── poseEngine.ts      # Core CV Math Engine (Vector geometry, holds, error mode)
    │   ├── canvasRenderer.ts  # Skeletal landmark drawing, gauges, status rings
    │   └── audioService.ts    # Web Audio API sound synthesizer
    ├── hooks/
    │   └── usePostureTimer.ts # Screen-time countdown hook with Electron IPC
    └── components/
        ├── Dashboard.tsx            # Dark-mode dashboard with countdown timer & presets
        ├── BlockerOverlay.tsx       # Fullscreen non-closable lockscreen overlay
        ├── CameraFeed.tsx           # Webcam stream & MediaPipe PoseLandmarker hook
        ├── ExerciseInstructions.tsx # Step-by-step visual exercise cards
        ├── RepProgressBar.tsx       # Rep counter progress bar & hold indicator
        ├── FeedbackBadge.tsx        # Live status pill with real-time posture hints
        └── EmergencyBypassModal.tsx # Emergency PIN override modal
```

---

## 📐 Computer Vision Geometry & Math Logic

### 1. Scapular Squeeze (Chest Opener)
- **Landmarks**: Left/Right Shoulders (`11`, `12`), Left/Right Elbows (`13`, `14`), Ears (`7`, `8`).
- **Elbow Expansion Ratio**:
  $$R_{elbow} = \frac{\| L_{elbow} - R_{elbow} \|}{\| L_{shoulder} - R_{shoulder} \|}$$
- **Hold Validation**: When $R_{elbow} \ge 1.32$ and vertical shoulder offset is minimal, a 1.5-second hold timer starts. The rep counts when `elapsedHold >= 1500ms`.

### 2. Neck Rotations & Head Tilts
- **Landmarks**: Left/Right Ears (`7`, `8`), Left/Right Shoulders (`11`, `12`).
- **Head Roll Angle**:
  $$\theta_{ear} = \arctan2(\Delta y_{ears}, \Delta x_{ears}) \times \frac{180}{\pi}$$
  $$\theta_{shoulder} = \arctan2(\Delta y_{shoulders}, \Delta x_{shoulders}) \times \frac{180}{\pi}$$
  $$\theta_{roll} = \theta_{ear} - \theta_{shoulder}$$
- **Cycle Validation**: State machine transition: `Center` $\rightarrow$ `Left Tilt (\theta \le -18^\circ)` $\rightarrow$ `Center` $\rightarrow$ `Right Tilt (\theta \ge 18^\circ)` $\rightarrow$ `Center` $\Rightarrow$ **1 Completed Rep**.

---

## 🚀 Step-by-Step Setup & Local Run Guide

### Requirements
- **Node.js**: v18.0.0 or later
- **npm** or **yarn**
- Standard Webcam

### 1. Installation
Clone or navigate to the project directory and install dependencies:
```bash
cd posture-lock
npm install
```

### 2. Run in Web Browser Development Mode (Fastest for testing UI & CV)
```bash
npm run dev
```
Open your browser at [http://localhost:3000](http://localhost:3000).

### 3. Run in Full Electron Desktop Mode (Includes Fullscreen Overlay Kiosk Interception)
```bash
npm run electron:dev
```

---

## 🧪 Testing the Prototype with Webcam

1. Click **"Test Camera & Skeleton"** on the Dashboard to verify webcam permission and inspect real-time MediaPipe skeleton tracking.
2. Click **"Lock Screen Now (Test)"** to trigger the full-screen restricted overlay.
3. Select an exercise (e.g. **Scapular Squeeze**):
   - Position yourself in front of the camera.
   - Squeeze your shoulder blades back and pull elbows wide.
   - Watch the hold arc timer count up to 100% (1.5s).
   - Hear the audio chime when each rep is registered.
4. After completing 5 reps, the lockscreen will automatically dismiss with a fanfare sound, rewarding you with full screen time!
5. (Optional) To test emergency unlock, click **"Emergency Bypass"** and enter PIN `1234`.
