import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { ArrowLeft, Pause, Play, Clock, Trophy } from "lucide-react";
import toast from "react-hot-toast";
import { BoxItem, QuestionModal, type Question } from "./GameComponents";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

// Interface Data Game
interface GameData {
  id: string;
  name: string;
  description: string;
  questions: Question[]; // FIX: Menggunakan tipe Question yang spesifik
  score_per_question: number;
}

// --- DATA DUMMY ---
const DUMMY_DATA: GameData = {
  id: "test-1",
  name: "Open The Box",
  description: "Mode testing tanpa backend.",
  score_per_question: 10,
  questions: Array.from({ length: 15 }).map((_, i) => ({
    id: `q-${i}`,
    question_text: `Pertanyaan Nomor ${i + 1}. Jika kotak ini dibuka, dia akan zoom ke tengah seperti surat.`,
    question_image: null,
    answers: [
      { answer_text: "Jawaban Benar", is_correct: true },
      { answer_text: "Jawaban Salah A", is_correct: false },
      { answer_text: "Jawaban Salah B", is_correct: false },
      { answer_text: "Jawaban Salah C", is_correct: false },
    ],
  })),
};

export default function OpenTheBoxGame() {
  const navigate = useNavigate();

  // State
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [boxStatus, setBoxStatus] = useState<
    ("closed" | "opened" | "completed")[]
  >([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(
    null,
  );
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Load Data
  useEffect(() => {
    const loadData = () => {
      const data = DUMMY_DATA;
      setGameData(data);
      // FIX: Langsung set tanpa mapping 'any', karena tipe data sudah cocok
      setQuestions(data.questions);
      setBoxStatus(new Array(data.questions.length).fill("closed"));
      setLoading(false);
    };
    setTimeout(loadData, 300);
  }, []);

  // 2. Timer Logic
  useEffect(() => {
    if (!loading && !finished && !isPaused && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, finished, isPaused, questions.length]);

  // 3. Handle Klik Box
  const handleBoxClick = (index: number) => {
    if (isPaused || finished || boxStatus[index] !== "closed") return;

    const newStatus = [...boxStatus];
    newStatus[index] = "opened";
    setBoxStatus(newStatus);

    setActiveQuestionIndex(index);
  };

  // 4. Handle Close Modal (tanpa jawab)
  const handleCloseModal = () => {
    if (activeQuestionIndex === null) return;
    const newStatus = [...boxStatus];
    newStatus[activeQuestionIndex] = "closed";
    setBoxStatus(newStatus);
    setActiveQuestionIndex(null);
  };

  // 5. Handle Jawaban
  const handleAnswer = (isCorrect: boolean) => {
    if (activeQuestionIndex === null) return;

    // Tutup modal
    setActiveQuestionIndex(null);

    setTimeout(() => {
      if (isCorrect) {
        toast.success("Benar! +1 Poin", { icon: "👏" });
        setScore((prev) => prev + 1);
      } else {
        toast.error("Salah!", { icon: "❌" });
      }

      // Update status jadi completed
      const newStatus = [...boxStatus];
      // Cek lagi apakah index valid setelah timeout
      if (activeQuestionIndex !== null) {
        newStatus[activeQuestionIndex] = "completed";
        setBoxStatus(newStatus);

        const remainingBoxes = newStatus.filter((s) => s === "closed").length;
        if (remainingBoxes === 0) handleFinishGame();
      }
    }, 300);
  };

  const handleFinishGame = () => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleExit = () => {
    navigate("/");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-[#000033]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-900 border-t-blue-400"></div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-[#000033] flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-blue-950/80 backdrop-blur-md border-4 border-blue-500 rounded-3xl p-8 max-w-md w-full text-center space-y-8 shadow-2xl"
        >
          <Trophy className="w-24 h-24 mx-auto text-yellow-400 drop-shadow-lg animate-bounce" />
          <Typography variant="h1" className="text-white tracking-wider">
            Selesai!
          </Typography>
          <div className="bg-blue-900/50 p-6 rounded-2xl border border-blue-700">
            <p className="text-blue-200 text-lg uppercase tracking-widest mb-2">
              Skor Akhir
            </p>
            <p className="text-6xl font-black text-white drop-shadow-[0_4px_0_#000]">
              {score} / {questions.length}
            </p>
          </div>
          <div className="flex justify-between text-blue-300 font-medium px-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" /> {formatTime(timeElapsed)}
            </div>
            <div>Akurasi: {Math.round((score / questions.length) * 100)}%</div>
          </div>
          <Button
            onClick={handleExit}
            size="lg"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold text-xl rounded-xl py-6 shadow-lg border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 transition-all"
          >
            Main Lagi / Keluar
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000033] font-sans flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-40 px-4 py-3 flex justify-between items-center text-white pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExit}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Exit
          </Button>
          {/* FIX: Menampilkan Judul Game agar variabel gameData terpakai */}
          <div className="hidden md:block bg-blue-950/30 px-4 py-1 rounded-full border border-white/10 backdrop-blur-sm">
            <span className="font-semibold text-blue-200">
              {gameData?.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-blue-950/50 backdrop-blur-md p-1.5 rounded-full border border-blue-800/50 pointer-events-auto">
          <div className="bg-blue-800/80 text-white px-4 py-1.5 rounded-full font-bold text-sm border border-blue-700">
            Skor: {score}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full font-mono font-medium text-blue-100">
            <Clock className="w-4 h-4" />
            <span className="tracking-wider">{formatTime(timeElapsed)}</span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsPaused(!isPaused)}
            className={cn(
              "rounded-full h-8 w-8 hover:bg-white/20 text-white",
              isPaused && "bg-yellow-500/20 text-yellow-400 animate-pulse",
            )}
          >
            {isPaused ? (
              <Play className="h-4 w-4 fill-current" />
            ) : (
              <Pause className="h-4 w-4 fill-current" />
            )}
          </Button>
        </div>
      </div>

      {/* Game Area */}
      <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center relative z-10">
        {isPaused && (
          <div className="absolute inset-0 z-50 bg-[#000033]/90 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-in fade-in">
            <h2 className="text-5xl font-black mb-8 tracking-widest drop-shadow-lg">
              DIJEDA
            </h2>
            <Button
              size="lg"
              onClick={() => setIsPaused(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl px-12 py-6 rounded-2xl shadow-lg border-b-4 border-blue-900"
            >
              Lanjutkan
            </Button>
          </div>
        )}

        <AnimatePresence>
          {activeQuestionIndex !== null && (
            <QuestionModal
              question={questions[activeQuestionIndex]}
              onAnswer={handleAnswer}
              onClose={handleCloseModal}
            />
          )}
        </AnimatePresence>

        {/* Grid Frame */}
        <div
          className={cn(
            "w-full max-w-6xl mx-auto",
            "bg-blue-500/20 backdrop-blur-sm rounded-[3rem]",
            "border-[6px] border-blue-400/30 shadow-[0_0_40px_rgba(0,100,255,0.3)]",
            "p-6 md:p-10 lg:p-12",
            "transition-all duration-500 ease-in-out",
            isPaused || activeQuestionIndex !== null
              ? "scale-95 opacity-50 blur-sm pointer-events-none"
              : "scale-100 opacity-100",
          )}
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 md:gap-6 lg:gap-8 place-items-center">
            {boxStatus.map((status, index) => (
              <div
                key={questions[index].id}
                className="w-full h-full aspect-square z-0"
              >
                <BoxItem
                  index={index}
                  questionId={questions[index].id}
                  status={status}
                  onClick={() => handleBoxClick(index)}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
