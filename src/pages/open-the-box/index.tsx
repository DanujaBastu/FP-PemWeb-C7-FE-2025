import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Pause, Sparkles } from "lucide-react";
import {
  BoxItem,
  QuestionModal,
  SettingsModal,
  type BoxContent,
  type BoxStatus,
} from "./GameComponents";
import api from "../../api/axios";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = any;

export default function OpenTheBoxGame() {
  const navigate = useNavigate();
  const { id } = useParams();

  const correctSfx = useRef(new Audio("/sound/Correct.wav"));
  const wrongSfx = useRef(new Audio("/sound/wrong.MP3"));
  const tickSfx = useRef(new Audio("/sound/Tiktok.MP3"));

  const playSound = (audioRef: React.MutableRefObject<HTMLAudioElement>) => {
    audioRef.current.currentTime = 0;
    audioRef.current.volume = 0.5;
    audioRef.current.play().catch((e) => console.log("Audio play failed:", e));
  };

  const stopSound = (audioRef: React.MutableRefObject<HTMLAudioElement>) => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const [items, setItems] = useState<BoxContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameTitle, setGameTitle] = useState("");

  const [boxStatus, setBoxStatus] = useState<BoxStatus[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/game/game-list/open-the-box/${id}`);
        let targetData = res.data?.data || res.data;
        if (!targetData.game_json) targetData = res.data;

        if (targetData && targetData.game_json) {
          setGameTitle(targetData.name);
          const allItems = targetData.game_json.items.map(
            (item: AnyObject) => ({
              id: item.id,
              text: item.text,
              options: item.options,
              answer: item.answer,
            }),
          );

          const shuffled = [...allItems].sort(() => 0.5 - Math.random());
          const selectedItems = shuffled.slice(0, 10);

          setItems(selectedItems);
          setBoxStatus(new Array(selectedItems.length).fill("closed"));
        }
      } catch (err) {
        console.error(err);
        alert("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [id]);

  useEffect(() => {
    if (!loading && !isGameOver && !isSettingsOpen && isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 10) {
            playSound(tickSfx);
          }
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, isGameOver, isSettingsOpen, isTimerRunning]);

  const handleBoxClick = (index: number) => {
    if (boxStatus[index] === "closed" && !isGameOver) {
      setActiveItemIndex(index);
      setIsTimerRunning(true);
    }
  };

  const handleAnswer = (answerText: string) => {
    if (activeItemIndex === null) return;
    const currentItem = items[activeItemIndex];
    const isCorrect = answerText === currentItem.answer;
    const newStatus = [...boxStatus];

    stopSound(tickSfx);

    if (isCorrect) {
      playSound(correctSfx);

      newStatus[activeItemIndex] = "correct";
      setScore((p) => p + 100);
      setCorrectCount((p) => p + 1);

      setTimeLeft(30);

      setIsTimerRunning(false);
      setActiveItemIndex(null);
    } else {
      playSound(wrongSfx);

      newStatus[activeItemIndex] = "wrong";
      setActiveItemIndex(null);
    }

    setBoxStatus(newStatus);
    if (newStatus.every((s) => s !== "closed")) handleGameOver();
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };
  const handleResume = () => {
    setIsSettingsOpen(false);
  };
  const handleRestart = () => {
    window.location.reload();
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    setIsTimerRunning(false);
    setActiveItemIndex(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-500 font-mono font-bold tracking-widest">
        INITIALIZING...
      </div>
    );

  if (isGameOver) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 p-10 rounded-3xl text-center max-w-md w-full shadow-2xl relative overflow-hidden z-50">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none"></div>
          <Trophy className="w-24 h-24 mx-auto text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-wider">
            {timeLeft === 0 ? "Mission Failed" : "Mission Complete"}
          </h1>
          <p className="text-slate-400 mb-6">
            Accuracy: {Math.round((correctCount / items.length) * 100)}%
          </p>
          <div className="text-6xl font-black text-cyan-400 mb-8 font-mono drop-shadow-lg">
            {score}
          </div>
          <div className="flex gap-4 relative z-10">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              className="flex-1 py-6 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700"
            >
              Exit
            </Button>
            <Button
              onClick={handleRestart}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-6 font-bold shadow-lg shadow-cyan-500/20"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans flex flex-col relative bg-[#0B0F19] text-slate-100 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-40 pointer-events-none z-0"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {isSettingsOpen && (
        <SettingsModal onResume={handleResume} onRestart={handleRestart} />
      )}

      <div className="absolute top-0 left-0 w-full pt-6 px-6 flex justify-between items-start z-20">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-slate-400 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Back
        </Button>

        <div className="flex flex-col items-end gap-2">
          <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            Time Remaining
          </div>
          <div
            className={`text-3xl font-mono font-black px-4 py-1 rounded-lg border-2 transition-all ${
              timeLeft <= 10
                ? "bg-red-950/80 border-red-500 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                : "bg-slate-900/80 border-cyan-500/30 text-cyan-400"
            }`}
          >
            {timeLeft}
            <span className="text-sm ml-1 opacity-50">s</span>
          </div>
        </div>
      </div>

      {activeItemIndex !== null && (
        <QuestionModal
          content={items[activeItemIndex]}
          timeLeft={timeLeft}
          onAnswer={handleAnswer}
        />
      )}

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 w-full h-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">
              {gameTitle || "Loading..."}
            </span>
          </div>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-400 drop-shadow-sm">
            SCORE: {score}
          </div>
        </div>

        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {items.map((item, index) => (
              <div key={item.id} className="w-full">
                <BoxItem
                  index={index}
                  text={item.text}
                  status={boxStatus[index]}
                  onClick={() => handleBoxClick(index)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-6 z-40">
        <Button
          size="icon"
          onClick={handleOpenSettings}
          className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700 hover:border-white shadow-xl transition-all active:scale-95"
          title="Pause Game"
        >
          <Pause className="h-6 w-6 fill-current" />
        </Button>
      </div>
    </div>
  );
}
