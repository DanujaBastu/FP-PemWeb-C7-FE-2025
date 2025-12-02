import { Button } from "@/components/ui/button";
// FIX: Menambahkan 'type' agar TypeScript tidak error saat compile
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Tipe Data ---
export interface Answer {
  answer_text: string;
  is_correct: boolean;
}

export interface Question {
  id: string | number;
  question_text: string;
  question_image: string | null;
  answers: Answer[];
}

interface BoxProps {
  index: number;
  questionId: string | number;
  status: "closed" | "opened" | "completed";
  onClick: () => void;
}

// --- 1. Komponen Kotak (Grid Item) ---
export const BoxItem = ({ index, questionId, status, onClick }: BoxProps) => {
  // Sembunyikan jika sudah selesai
  if (status === "completed") {
    return <div className="invisible aspect-square" />;
  }

  return (
    <div className="aspect-square w-full h-full relative perspective-1000">
      <motion.div
        layoutId={`box-${questionId}`}
        onClick={onClick}
        initial={false}
        animate={{
          opacity: status === "opened" ? 0 : 1,
          scale: status === "closed" ? 1 : 0.8,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "cursor-pointer w-full h-full absolute inset-0 rounded-xl",
          // Gaya Peti Kayu
          "bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950",
          "border-[4px] border-amber-900/50 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2),0_8px_16px_rgba(0,0,0,0.4)]",
          "flex items-center justify-center overflow-hidden z-10",
          status === "closed" ? "hover:brightness-110" : "",
        )}
      >
        {/* Tekstur Kayu */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-repeat"
          style={{ backgroundSize: "200px" }}
        ></div>
        {/* Garis-garis papan */}
        <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none opacity-20">
          <div className="h-0.5 bg-amber-950 w-full"></div>
          <div className="h-0.5 bg-amber-950 w-full"></div>
        </div>

        {/* Angka */}
        <motion.span
          layoutId={`number-${questionId}`}
          className="text-4xl md:text-6xl font-black text-amber-100 drop-shadow-[0_3px_3px_rgba(0,0,0,0.8)] z-20 font-mono"
        >
          {index + 1}
        </motion.span>
      </motion.div>

      {/* Bayangan Lantai */}
      <div className="absolute bottom-0 left-2 right-2 h-4 bg-black/30 blur-md rounded-[50%] translate-y-2 -z-10"></div>
    </div>
  );
};

// --- 2. Komponen Modal Pertanyaan (Surat Terbuka) ---
interface QuestionModalProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
  onClose: () => void;
}

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3,
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export const QuestionModal = ({
  question,
  onAnswer,
  onClose,
}: QuestionModalProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        layoutId={`box-${question.id}`}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-3xl relative overflow-hidden shadow-2xl rounded-2xl",
          "bg-[#fffbf0] border-2 border-[#e8dfc8]",
        )}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        style={{ transformOrigin: "center center" }}
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,#e8dfc8,#e8dfc8_10px,#fffbf0_10px,#fffbf0_20px)] opacity-50"></div>

        {/* Header Surat */}
        <div className="bg-blue-600/90 p-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <motion.h2
            layoutId={`number-${question.id}`}
            className="text-2xl md:text-3xl font-bold text-white tracking-wide relative z-10"
          >
            Pertanyaan
          </motion.h2>
        </div>

        {/* Konten */}
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="p-6 md:p-8 flex flex-col items-center gap-6 relative z-10"
        >
          {question.question_image && (
            <motion.img
              variants={contentVariants}
              src={
                import.meta.env.VITE_API_URL
                  ? `${import.meta.env.VITE_API_URL}/${question.question_image}`
                  : question.question_image
              }
              alt="Question"
              className="max-h-52 object-contain rounded-lg border-2 border-slate-200 shadow-md bg-white p-1"
            />
          )}

          <motion.p
            variants={contentVariants}
            className="text-xl md:text-3xl text-center font-bold text-slate-800 leading-relaxed font-serif"
          >
            {question.question_text}
          </motion.p>

          <motion.div
            variants={contentVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4"
          >
            {question.answers.map((ans, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="h-auto py-4 px-6 text-lg md:text-xl font-medium border-2 border-slate-300 hover:bg-blue-50 hover:border-blue-400 text-slate-700 transition-colors whitespace-normal rounded-xl flex items-center justify-start group bg-white"
                onClick={() => onAnswer(ans.is_correct)}
              >
                <div className="bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 font-bold w-10 h-10 flex items-center justify-center rounded-full mr-4 shrink-0 transition-colors border border-slate-200">
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-left group-hover:text-blue-800 transition-colors">
                  {ans.answer_text}
                </span>
              </Button>
            ))}
          </motion.div>
        </motion.div>

        {/* Lipatan kertas pojok kanan bawah */}
        <div
          className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-slate-200/50 to-transparent pointer-events-none"
          style={{ clipPath: "polygon(100% 0, 0% 100%, 100% 100%)" }}
        ></div>
      </motion.div>
    </motion.div>
  );
};
