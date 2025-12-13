import React, { useState } from "react";
import {
  Trash2,
  Plus,
  Copy,
  Image as ImageIcon,
  Mic,
  Check,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Asumsi pakai shadcn/ui atau ganti button biasa
import { Input } from "@/components/ui/input"; // Asumsi pakai shadcn/ui atau ganti input biasa

// --- TIPE DATA ---
interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionItem {
  id: string;
  question: string;
  answers: Answer[];
}

// Helper ID unik sederhana
const generateId = () => Math.random().toString(36).substr(2, 9);

const CreateOpenTheBox = () => {
  // --- STATE ---
  const [title, setTitle] = useState("Untitled7");
  const [items, setItems] = useState<QuestionItem[]>([
    {
      id: generateId(),
      question: "",
      answers: [
        { id: generateId(), text: "", isCorrect: true },
        { id: generateId(), text: "", isCorrect: false },
      ],
    },
  ]);

  // --- LOGIC: SOAL (QUESTION) ---

  const addQuestion = () => {
    setItems([
      ...items,
      {
        id: generateId(),
        question: "",
        answers: [
          { id: generateId(), text: "", isCorrect: false },
          { id: generateId(), text: "", isCorrect: false },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (items.length <= 1) return; // Minimal sisa 1
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const duplicateQuestion = (index: number) => {
    const itemToCopy = items[index];
    const newItem = {
      ...itemToCopy,
      id: generateId(),
      answers: itemToCopy.answers.map((a) => ({ ...a, id: generateId() })),
    };
    const newItems = [...items];
    newItems.splice(index + 1, 0, newItem);
    setItems(newItems);
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;

    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [
      newItems[targetIndex],
      newItems[index],
    ];
    setItems(newItems);
  };

  const handleQuestionChange = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index].question = val;
    setItems(newItems);
  };

  // --- LOGIC: JAWABAN (ANSWER) ---

  const addAnswer = (qIndex: number) => {
    const newItems = [...items];
    newItems[qIndex].answers.push({
      id: generateId(),
      text: "",
      isCorrect: false,
    });
    setItems(newItems);
  };

  const removeAnswer = (qIndex: number, aIndex: number) => {
    const newItems = [...items];
    // Minimal sisa 1 jawaban (opsional, wordwall biasanya min 1 atau 2)
    if (newItems[qIndex].answers.length <= 1) return;
    newItems[qIndex].answers.splice(aIndex, 1);
    setItems(newItems);
  };

  const handleAnswerChange = (qIndex: number, aIndex: number, val: string) => {
    const newItems = [...items];
    newItems[qIndex].answers[aIndex].text = val;
    setItems(newItems);
  };

  const toggleCorrect = (qIndex: number, aIndex: number) => {
    const newItems = [...items];
    // Toggle status (Wordwall membolehkan multiple correct answer)
    newItems[qIndex].answers[aIndex].isCorrect =
      !newItems[qIndex].answers[aIndex].isCorrect;
    setItems(newItems);
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-gray-700 pb-20">
      {/* HEADER TITLE */}
      <div className="bg-white border-b border-gray-300 p-6 mb-6">
        <div className="max-w-4xl mx-auto">
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-wide">
            Activity Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-semibold border-gray-300 focus:border-blue-500 h-12"
            placeholder="Enter title here..."
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* INSTRUCTION (Optional Label) */}
        <div className="mb-4 text-sm text-gray-600">
          <strong>Instructions:</strong> Enter your questions and mark the
          correct answers.
        </div>

        {/* LIST OF QUESTIONS */}
        <div className="space-y-6">
          {items.map((item, qIndex) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative group"
            >
              {/* Toolbar Kanan (Move/Copy/Delete) - Mirip Wordwall */}
              <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={() => moveQuestion(qIndex, "up")}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700"
                  title="Move Up"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => moveQuestion(qIndex, "down")}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700"
                  title="Move Down"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  onClick={() => duplicateQuestion(qIndex)}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"
                  title="Duplicate"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-6 pr-12">
                {/* NOMOR & KOLOM SOAL */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-xl font-bold text-gray-400 min-w-[24px] pt-2">
                    {qIndex + 1}.
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                      Question
                    </label>
                    <div className="relative">
                      <Input
                        value={item.question}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, e.target.value)
                        }
                        className="pr-20 py-5 text-lg"
                        placeholder="Type your question..."
                      />
                      {/* Icons Placeholder inside Input */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <Mic size={18} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <ImageIcon size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KOLOM JAWABAN (Grid Layout) */}
                <div className="pl-10">
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2">
                    Answers
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {item.answers.map((ans, aIndex) => (
                      <div
                        key={ans.id}
                        className="flex items-center gap-2 group/answer"
                      >
                        {/* Label a,b,c,d */}
                        <span className="text-sm font-bold text-gray-400 w-4">
                          {String.fromCharCode(97 + aIndex)}
                        </span>

                        {/* Toggle Benar/Salah */}
                        <button
                          onClick={() => toggleCorrect(qIndex, aIndex)}
                          className={`
                            flex items-center justify-center w-8 h-8 rounded border transition-colors
                            ${
                              ans.isCorrect
                                ? "bg-green-100 border-green-500 text-green-600"
                                : "bg-white border-gray-300 text-gray-300 hover:border-gray-400 hover:text-gray-400"
                            }
                          `}
                          title={
                            ans.isCorrect
                              ? "Mark as Incorrect"
                              : "Mark as Correct"
                          }
                        >
                          {ans.isCorrect ? (
                            <Check size={18} strokeWidth={3} />
                          ) : (
                            <X size={18} strokeWidth={3} />
                          )}
                        </button>

                        {/* Input Jawaban */}
                        <div className="flex-1 relative">
                          <Input
                            value={ans.text}
                            onChange={(e) =>
                              handleAnswerChange(qIndex, aIndex, e.target.value)
                            }
                            className="pr-8" // Space for delete icon
                            placeholder={`Answer option`}
                          />
                          {/* Tombol Hapus Jawaban (Muncul saat hover) */}
                          {item.answers.length > 1 && (
                            <button
                              onClick={() => removeAnswer(qIndex, aIndex)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 opacity-0 group-hover/answer:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* TOMBOL TAMBAH JAWABAN */}
                  <div className="mt-3 ml-6 md:ml-0">
                    <button
                      onClick={() => addAnswer(qIndex)}
                      className="text-sm font-semibold text-blue-500 hover:text-blue-700 flex items-center gap-1 py-1 px-2 rounded hover:bg-blue-50 transition-colors"
                    >
                      <Plus size={16} /> Add answer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TOMBOL TAMBAH SOAL (Bawah) */}
        <div className="mt-8 mb-20">
          <button
            onClick={addQuestion}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-semibold flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all text-lg"
          >
            <Plus size={24} /> Add a new item
          </button>
        </div>
      </div>

      {/* FOOTER ACTION BAR (Sticky) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-4 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {items.length} Questions Created
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="text-gray-600">
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8">
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOpenTheBox;
