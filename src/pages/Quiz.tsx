import { Button } from "@/components/ui/button";
import { useState } from "react";
import toast from "react-hot-toast";
import * as Progress from "@radix-ui/react-progress";
import { Typography } from "@/components/ui/typography";
import { ArrowLeft } from "lucide-react";

function Quiz() {
  const questions = [
    {
      question: "What is the capital of France?",
      options: ["Berlin", "Madrid", "Paris", "Rome"],
      correct: "Paris",
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      correct: "Mars",
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;

  const handleNext = () => {
    if (!selectedAnswer) return;
    if (!isLastQuestion) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      // Submit quiz logic here
      toast.success("Quiz submitted!");
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen flex flex-col">
      <div className="bg-white h-fit w-full flex justify-between items-center px-8 py-4">
        <div>
          <Button size="sm" variant="ghost" className="hidden md:flex">
            <ArrowLeft /> Exit Game
          </Button>
          <Button size="sm" variant="ghost" className="block md:hidden">
            <ArrowLeft />
          </Button>
        </div>
        <div>
          <Typography variant="p">Time Left: 20s</Typography>
        </div>
      </div>
      <div className="w-full h-full p-8 justify-center items-center flex flex-col">
        <div className="max-w-3xl w-full space-y-6">
          <div className="flex w-full mb-4 justify-between items-center">
            <Typography variant="p">
              Question {currentQuestion + 1} of {questions.length}
            </Typography>
            <Typography variant="p">{progress}%</Typography>
          </div>
          <div>
            <Progress.Root
              className="w-full h-3 bg-slate-300 rounded overflow-hidden"
              value={progress}
            >
              <Progress.Indicator className="h-full bg-slate-800 transition-all w-1/2" />
            </Progress.Root>
          </div>
          <div className="bg-white w-full h-full p-8 text-center space-y-6 rounded-xl border">
            <Typography variant="p">
              {questions[currentQuestion].question}
            </Typography>
            <div className="grid grid-cols-1 gap-4">
              {questions[currentQuestion].options.map((opt, idx) => {
                const letter = ["A", "B", "C", "D"][idx];
                const isSelected = selectedAnswer === opt;
                return (
                  <Button
                    key={opt}
                    variant="outline"
                    className={`w-full justify-start p-7 gap-2 transition 
                                ${isSelected ? "transition-all ease-in-out bg-primary text-white" : ""}`}
                    onClick={() => setSelectedAnswer(opt)}
                  >
                    <span
                      className={`w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center 
                                ${isSelected ? "bg-white text-primary" : "text-black"}`}
                    >
                      {letter}
                    </span>
                    <span className="font-normal">{opt}</span>
                  </Button>
                );
              })}
            </div>
            <div
              className={`mt-8 flex w-full ${isFirstQuestion ? "justify-end" : "justify-between"}`}
            >
              {isFirstQuestion ? null : (
                <Button
                  onClick={() => {
                    setCurrentQuestion((prev) => prev - 1);
                    setSelectedAnswer(null);
                  }}
                >
                  <ArrowLeft className="mr-1" /> Previous
                </Button>
              )}
              <Button disabled={!selectedAnswer} onClick={handleNext}>
                {isLastQuestion ? "Submit Quiz" : "Next Question"}
                {!isLastQuestion && <ArrowLeft className="rotate-180 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
