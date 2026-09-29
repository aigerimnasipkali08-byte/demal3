import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Clock, X } from 'lucide-react';

interface EmergencyBypassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBypass: (snoozeMinutes: number) => void;
}

export const EmergencyBypassModal: React.FC<EmergencyBypassModalProps> = ({
  isOpen,
  onClose,
  onBypass,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo emergency PIN: "1234" or "PASS"
    if (passcode === '1234' || passcode.toUpperCase() === 'UNLOCK') {
      onBypass(15); // Gives +15 min emergency time
      onClose();
    } else {
      setError('Invalid emergency PIN code. Default code is "1234".');
    }
  };

  const handlePenaltySnooze = () => {
    // Immediate 5 min snooze with penalty logged
    onBypass(5);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-2 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100">Emergency Override</h3>
            <p className="text-xs text-slate-400">Bypass physical verification overlay</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          Need urgent access for a call or work emergency? You can use an emergency passcode or trigger a temporary +5 minute snooze.
        </p>

        <form onSubmit={handlePasscodeSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> Emergency PIN (Default: 1234)
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError('');
              }}
              placeholder="Enter PIN..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono outline-none"
            />
            {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-lg transition"
          >
            Unlock with PIN (+15 Min)
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-3 text-slate-500 font-semibold">Or</span>
          </div>
        </div>

        <button
          onClick={handlePenaltySnooze}
          className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition"
        >
          <Clock className="w-4 h-4 text-amber-400" />
          Snooze 5 Minutes (Logged in Stats)
        </button>
      </div>
    </div>
  );
};
