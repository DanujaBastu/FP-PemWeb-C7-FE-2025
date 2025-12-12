import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Lock, Check, Settings } from "lucide-react";

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

// --- KOMPONEN KARTU (BOX ITEM) FINAL FIX (LINT PASSED) ---
export const BoxItem = ({
  // index, // HAPUS: Tidak dipakai, bikin error lint
  status,
  // text,  // HAPUS: Tidak dipakai, bikin error lint
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
        animate={{
          rotateY: 0,
          x: status === "wrong" ? [0, -10, 10, -10, 10, 0] : 0,
          scale: status === "correct" ? 1.05 : 1,
          boxShadow:
            status === "correct"
              ? "0 0 40px rgba(16, 185, 129, 0.5)"
              : status === "wrong"
                ? "0 0 30px rgba(185, 28, 28, 0.5)"
                : "0 10px 20px rgba(0,0,0,0.3)",
        }}
        transition={{
          duration: 0.3,
          x: { type: "spring", stiffness: 400, damping: 15 },
        }}
        className={cn(
          "w-full aspect-square rounded-xl relative overflow-hidden transition-all shadow-xl",
          "bg-black",
          status === "closed" ? "border-2 border-amber-800/40" : "border-0",
        )}
      >
        <AnimatePresence mode="wait">
          {/* A. TAMPILAN TERTUTUP */}
          {status === "closed" && (
            <motion.div
              key="closed"
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, duration: 0.1 }}
            >
              <div
                className={cn(
                  "absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-500 ease-out",
                  "scale-110",
                  "bg-[url('/images/card-light-sq.png')] dark:bg-[url('/images/card-dark-sq.png')]",
                  "group-hover:blur-[4px] group-hover:brightness-[0.4]",
                )}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                <div className="opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out text-xl font-serif font-extrabold tracking-[0.3em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                  OPEN
                </div>
              </div>
            </motion.div>
          )}

          {/* B. TAMPILAN BENAR */}
          {status === "correct" && (
            <motion.div
              key="correct"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#10B981] dark:bg-[#059669] cursor-default"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-2 backdrop-blur-sm shadow-inner">
                <Check className="w-8 h-8 text-white" strokeWidth={4} />
              </div>
              <div className="text-xl font-bold text-white tracking-widest uppercase drop-shadow-md font-sans">
                DIVINE
              </div>
              <div className="text-white/80 text-[10px] font-bold tracking-wider mt-1">
                FATE UNLOCKED
              </div>
            </motion.div>
          )}

          {/* C. TAMPILAN SALAH */}
          {status === "wrong" && (
            <motion.div
              key="wrong"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#DC2626] dark:bg-[#991B1B] cursor-not-allowed"
            >
              <div className="w-14 h-14 rounded-full border-[3px] border-white/30 flex items-center justify-center mb-2 bg-black/10 shadow-inner">
                <Lock className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div className="text-xl font-bold text-white tracking-widest uppercase drop-shadow-md font-sans">
                LOCKED
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// --- MODAL SOAL ---
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

  const timerColor = isUrgent
    ? "text-red-500"
    : "text-stone-700 dark:text-amber-100";
  const ringColor = isUrgent
    ? "stroke-red-500"
    : "stroke-stone-700 dark:stroke-amber-500";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      style={{ zIndex: 9999 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-[#F3F1E8] dark:bg-[#1a1a1a] rounded-xl w-full max-w-3xl shadow-2xl flex flex-col md:flex-row min-h-[400px] border border-stone-300 dark:border-amber-900/40 overflow-hidden"
      >
        <div className="absolute top-4 right-4 z-20 flex items-center justify-center pointer-events-none">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                className="text-stone-300 dark:text-stone-800"
              />
              <motion.circle
                cx="32"
                cy="32"
                r={radius}
                stroke="currentColor"
                strokeWidth="3"
                fill="currentColor"
                strokeLinecap="round"
                className={cn(
                  "transition-colors duration-300 fill-[#F3F1E8] dark:fill-[#1a1a1a]",
                  ringColor,
                )}
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1, ease: "linear" }}
                style={{ strokeDasharray: circumference }}
              />
            </svg>
            <div
              className={cn(
                "absolute text-lg font-serif font-bold",
                timerColor,
              )}
            >
              {timeLeft}
            </div>
          </div>
        </div>

        <div className="md:w-5/12 bg-gradient-to-br from-stone-200 to-stone-300 dark:from-black dark:to-[#111] flex flex-col items-center justify-center p-8 text-center border-b md:border-b-0 md:border-r border-stone-300 dark:border-amber-900/30 relative">
          <h2 className="text-stone-500 dark:text-amber-700 text-sm font-bold tracking-[0.3em] uppercase mb-6 font-serif">
            The Riddle
          </h2>
          <div className="text-5xl md:text-6xl font-serif text-stone-800 dark:text-amber-100 drop-shadow-sm leading-tight">
            {content.text}
          </div>
        </div>

        <div className="md:w-7/12 p-6 md:p-8 pt-16 md:pt-8 flex flex-col justify-center bg-[#FDFBF7] dark:bg-[#141414] gap-3 md:gap-4 relative">
          <h4 className="text-stone-400 text-sm font-medium text-center mb-4 font-serif italic tracking-wider">
            Choose your fate
          </h4>
          <div className="grid gap-3">
            {content.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => onAnswer(opt)}
                className="w-full py-4 px-6 text-lg font-serif text-stone-600 dark:text-stone-400 bg-white dark:bg-[#1a1a1a] border border-stone-300 dark:border-stone-800 rounded-lg hover:border-amber-500 dark:hover:border-amber-600 hover:text-amber-700 dark:hover:text-amber-100 hover:bg-amber-50 dark:hover:bg-black transition-all text-center tracking-wide group shadow-sm"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- SETTINGS MODAL ---
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
        className="bg-[#F3F1E8] dark:bg-[#1a1a1a] p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border border-stone-300 dark:border-stone-800"
      >
        <div className="w-16 h-16 bg-white dark:bg-black rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-300 dark:border-stone-800">
          <Settings className="w-6 h-6 text-stone-400 animate-spin-slow" />
        </div>
        <h2 className="text-xl font-serif text-stone-800 dark:text-white mb-2 tracking-widest uppercase">
          Paused
        </h2>
        <div className="space-y-4 mt-8">
          <Button
            onClick={onResume}
            className="w-full bg-stone-800 hover:bg-stone-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white py-6 text-lg font-serif tracking-wider"
          >
            RESUME
          </Button>
          <Button
            onClick={onRestart}
            variant="outline"
            className="w-full py-6 text-lg border-stone-300 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 font-serif tracking-wider"
          >
            RESTART
          </Button>
        </div>
      </div>
    </div>
  );
};
