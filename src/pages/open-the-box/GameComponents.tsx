// PATH: src/pages/open-the-box/GameComponents.tsx
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
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
  layoutId?: string;
}

export const BoxItem = ({
  index,
  status,
  text,
  onClick,
  layoutId,
}: BoxProps) => {
  const isClickable = status === "closed";

  return (
    <div className="relative w-full h-full perspective-1000 group z-10">
      <motion.div
        layout
        layoutId={layoutId}
        onClick={isClickable ? onClick : undefined}
        whileTap={isClickable ? { scale: 0.95 } : {}}
        whileHover={isClickable ? { y: -5, zIndex: 20 } : {}}
        animate={{
          rotateY: status === "correct" ? 180 : 0,
          x: status === "wrong" ? [0, -10, 10, -10, 10, 0] : 0,
          scale: status === "correct" ? [1, 1.05, 1] : 1,
          boxShadow:
            status === "correct"
              ? "0 0 40px rgba(52,211,153,0.6)"
              : status === "wrong"
                ? "0 0 0px rgba(0,0,0,0)"
                : "0 0 15px rgba(6,182,212,0.3)",
        }}
        transition={{
          layout: { duration: 0.4, ease: "easeInOut" },
          rotateY: { type: "spring", stiffness: 200, damping: 20 },
          x: { duration: 0.4, ease: "easeInOut" },
          scale: { duration: 0.5 },
          boxShadow: { duration: 0.5 },
        }}
        className={cn(
          "w-full aspect-square rounded-2xl shadow-2xl transition-colors flex flex-col items-center justify-center relative overflow-hidden border-[3px] bg-slate-900",
          status === "closed" && "border-cyan-500/50 cursor-pointer",
          status === "correct" &&
            "bg-emerald-800 border-emerald-400 cursor-default",
          status === "wrong" &&
            "bg-slate-800 border-red-600 cursor-not-allowed",
        )}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

        <AnimatePresence mode="wait">
          {status === "closed" && (
            <motion.div
              key="closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="z-10 flex flex-col items-center pointer-events-none"
            >
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-2 border border-cyan-500/50 shadow-inner">
                <span className="text-2xl font-black text-cyan-400 font-mono">
                  {index + 1}
                </span>
              </div>
              <div className="text-[10px] text-cyan-500/80 tracking-[0.2em] uppercase font-bold">
                Open Me
              </div>
            </motion.div>
          )}

          {status === "correct" && (
            <motion.div
              key="correct"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-col items-center justify-center z-10 p-2 text-center"
              style={{ transform: "rotateY(180deg)" }}
            >
              <div className="text-xl font-black text-white leading-tight mb-2 drop-shadow-md">
                {text}
              </div>
              <div className="bg-emerald-500 p-1.5 rounded-full shadow-lg">
                <Check className="w-6 h-6 text-white" strokeWidth={4} />
              </div>
            </motion.div>
          )}

          {status === "wrong" && (
            <motion.div
              key="wrong"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="z-10 flex flex-col items-center"
            >
              <div className="bg-red-900/30 p-3 rounded-full border border-red-500/50 mb-2">
                <Lock className="w-8 h-8 text-red-500" />
              </div>
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
                LOCKED
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

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

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / 30;
  const dashOffset = circumference - progress * circumference;
  const isUrgent = timeLeft <= 10;
  const timerColor = isUrgent ? "text-red-500" : "text-cyan-400";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      style={{ zIndex: 9999 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-slate-900 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col md:flex-row min-h-[400px] border border-slate-600 ring-1 ring-cyan-500/50 overflow-hidden"
      >
        <div className="absolute top-4 right-4 z-20 flex items-center justify-center pointer-events-none">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-slate-800"
              />
              <motion.circle
                cx="32"
                cy="32"
                r={radius}
                stroke="currentColor"
                strokeWidth="4"
                fill="rgba(15, 23, 42, 0.8)"
                strokeLinecap="round"
                className={cn("transition-colors duration-300", timerColor)}
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1, ease: "linear" }}
                style={{
                  strokeDasharray: circumference,
                }}
              />
            </svg>
            <div
              className={cn(
                "absolute text-lg font-black font-mono",
                timerColor,
              )}
            >
              {timeLeft}
            </div>
          </div>
        </div>

        <div className="md:w-5/12 bg-gradient-to-br from-violet-900 to-slate-900 flex flex-col items-center justify-center p-8 text-white text-center border-b md:border-b-0 md:border-r border-slate-600 relative">
          <h2 className="text-violet-300 text-3xl font-bold tracking-[0.2em] uppercase mb-4">
            Question
          </h2>
          <div className="text-6xl md:text-7xl font-black text-white drop-shadow-[0_0_25px_rgba(139,92,246,0.8)] leading-tight">
            {content.text}
          </div>
        </div>

        <div className="md:w-7/12 p-8 pt-16 md:pt-8 flex flex-col justify-center bg-slate-950 gap-4 relative">
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
      </motion.div>
    </motion.div>
  );
};

interface SettingsModalProps {
  onResume: () => void;
  onRestart: () => void;
}

export const SettingsModal = ({ onResume, onRestart }: SettingsModalProps) => {
  return (
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
