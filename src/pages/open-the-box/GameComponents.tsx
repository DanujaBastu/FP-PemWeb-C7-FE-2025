// PATH: src/pages/open-the-box/GameComponents.tsx
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Lock, Check, Settings, Play, RotateCcw } from "lucide-react";

export interface BoxContent {
  id: string | number;
  text: string;
  options: string[];
  answer: string;
}

export type BoxStatus = "closed" | "correct" | "wrong";

interface BoxProps {
  index: number;
  status: BoxStatus;
  text: string;
  onClick: () => void;
}

// --- 1. KOMPONEN KOTAK (GRID) ---
export const BoxItem = ({ index, status, text, onClick }: BoxProps) => {
  return (
    <div className="relative w-full h-full perspective-1000 group">
      <motion.div
        // Event Handler
        onClick={status === "closed" ? onClick : undefined}
        // Animasi Putar Kartu (Parent)
        animate={{
          rotateY: status === "correct" ? 180 : 0,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={cn(
          "w-full aspect-square rounded-2xl shadow-2xl transition-all flex flex-col items-center justify-center relative overflow-hidden border-[3px]",
          // Styles
          status === "closed" &&
            "bg-slate-900 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:border-cyan-400 cursor-pointer hover:scale-[1.02]",
          status === "correct" &&
            "bg-emerald-800 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] cursor-default",
          status === "wrong" &&
            "bg-slate-800 border-red-600 shadow-none cursor-not-allowed",
        )}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

        {/* --- STATE 1: TERTUTUP (Closed) --- */}
        {status === "closed" && (
          <div className="z-10 flex flex-col items-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-2 border border-cyan-500/50 shadow-inner">
              <span className="text-2xl font-black text-cyan-400 font-mono">
                {index + 1}
              </span>
            </div>
            <div className="text-[10px] text-cyan-500/80 tracking-[0.2em] uppercase font-bold">
              Open Me
            </div>
          </div>
        )}

        {/* --- STATE 2: BENAR (Correct) --- */}
        {status === "correct" && (
          // [FIX UTAMA] transform: rotateY(180deg) DI SINI.
          // Ini wajib ada untuk memutar balik teks agar tidak seperti cermin.
          <div
            className="w-full h-full flex flex-col items-center justify-center z-10 p-2 text-center"
            style={{ transform: "rotateY(180deg)" }}
          >
            <div className="text-xl font-black text-white leading-tight mb-2 drop-shadow-md">
              {text}
            </div>
            <div className="bg-emerald-500 p-1.5 rounded-full shadow-lg">
              <Check className="w-6 h-6 text-white" strokeWidth={4} />
            </div>
          </div>
        )}

        {/* --- STATE 3: SALAH (Wrong/Locked) --- */}
        {status === "wrong" && (
          <div className="z-10 flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="bg-red-900/30 p-3 rounded-full border border-red-500/50 mb-2">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
              LOCKED
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- 2. MODAL SOAL (NO ANIMATION - STABILITY FIRST) ---
interface QuestionModalProps {
  content: BoxContent;
  timeLeft: number;
  onAnswer: (text: string) => void;
}

export const QuestionModal = ({
  content,
  timeLeft,
  onAnswer,
}: QuestionModalProps) => {
  if (!content) return null;

  return (
    // [FIX] Menggunakan div biasa (bukan motion.div) untuk container utama
    // z-index: 9999 agar selalu paling atas
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/95 p-4"
      style={{ zIndex: 9999 }}
    >
      {/* Kartu Soal */}
      <div className="relative bg-slate-900 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col md:flex-row min-h-[400px] border border-slate-600 ring-1 ring-cyan-500/50 overflow-hidden">
        {/* KIRI: SOAL */}
        <div className="md:w-5/12 bg-gradient-to-br from-violet-900 to-slate-900 flex flex-col items-center justify-center p-8 text-white text-center border-b md:border-b-0 md:border-r border-slate-600 relative">
          <h3 className="text-violet-300 text-xs font-bold tracking-[0.2em] uppercase mb-4">
            Translate This
          </h3>

          <div className="text-7xl md:text-8xl font-black text-white drop-shadow-[0_0_25px_rgba(139,92,246,0.8)] mb-6">
            {content.text}
          </div>

          <div
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-full font-mono font-bold text-lg border shadow-lg transition-colors",
              timeLeft <= 10
                ? "bg-red-500/20 border-red-500 text-red-400"
                : "bg-slate-800 border-slate-600 text-cyan-300",
            )}
          >
            <span>⏳</span>
            <span>{timeLeft}s Left</span>
          </div>
        </div>

        {/* KANAN: OPSI */}
        <div className="md:w-7/12 p-8 flex flex-col justify-center bg-slate-950 gap-4">
          <h4 className="text-slate-400 font-medium text-center mb-2">
            Select the correct answer:
          </h4>
          <div className="grid gap-3">
            {content.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => onAnswer(opt)}
                className="w-full py-4 px-6 text-lg font-bold text-slate-300 bg-slate-900 border border-slate-700 rounded-xl hover:bg-violet-600 hover:border-violet-500 hover:text-white hover:scale-[1.01] active:scale-[0.98] transition-all text-left flex justify-between items-center group shadow-md"
              >
                <span>{opt}</span>
                <div className="w-3 h-3 rounded-full bg-slate-700 group-hover:bg-white transition-colors"></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 3. MODAL SETTINGS (NO ANIMATION - STABILITY FIRST) ---
interface SettingsModalProps {
  onResume: () => void;
  onRestart: () => void;
}

export const SettingsModal = ({ onResume, onRestart }: SettingsModalProps) => {
  return (
    // [FIX] Menggunakan div biasa, z-index 9999
    <div
      onClick={onResume}
      className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      style={{ zIndex: 9999 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-slate-500 ring-4 ring-black"
      >
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 ring-2 ring-slate-600">
          <Settings className="w-8 h-8 text-slate-300 animate-spin-slow" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Game Paused</h2>
        <p className="text-slate-400 text-sm mb-8">
          Game stopped. Ready to continue?
        </p>

        <div className="space-y-4">
          <Button
            onClick={onResume}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-6 text-lg font-bold shadow-lg shadow-cyan-900/50"
          >
            <Play className="w-5 h-5 mr-2 fill-current" /> Resume
          </Button>
          <Button
            onClick={onRestart}
            variant="outline"
            className="w-full py-6 text-lg border-slate-600 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-white"
          >
            <RotateCcw className="w-5 h-5 mr-2" /> Restart Game
          </Button>
        </div>
      </div>
    </div>
  );
};
