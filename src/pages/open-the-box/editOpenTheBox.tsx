import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams untuk ambil ID dari URL
import {
  Trash2,
  Plus,
  Copy,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Loader2, // Icon loading
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- TIPE DATA (Sama) ---
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

const generateId = () => Math.random().toString(36).substr(2, 9);

const EditOpenTheBox = () => {
  const { id } = useParams(); // Ambil ID game dari URL, misal: /edit/open-the-box/123
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<QuestionItem[]>([]);

  // --- FETCH DATA SAAT KOMPONEN DIMUAT ---
  useEffect(() => {
    // Simulasi Fetch Data dari API
    const fetchGameData = async () => {
      setIsLoading(true);
      try {
        // const response = await api.get(`/games/${id}`);
        // const data = response.data;

        // --- MOCK DATA (Ganti dengan API Call nanti) ---
        // Pura-puranya ini data dari database untuk game "Open The Box"
        const mockData = {
          title: "English Numbers Challenge", // Contoh judul dari screenshot Anda
          items: [
            {
              id: "q1",
              question: "What comes after Two?",
              answers: [
                { id: "a1", text: "Three", isCorrect: true },
                { id: "a2", text: "Four", isCorrect: false },
              ],
            },
            {
              id: "q2",
              question: "Translation of 'Sepuluh'",
              answers: [
                { id: "a3", text: "Ten", isCorrect: true },
                { id: "a4", text: "Twenty", isCorrect: false },
              ],
            },
          ],
        };

        // Set State
        setTitle(mockData.title);
        setItems(mockData.items);
      } catch (error) {
        console.error("Error fetching game data", error);
        alert("Could not load game data.");
        navigate("/"); // Redirect jika error
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchGameData();
    }
  }, [id, navigate]);

  // --- LOGIC HELPER SAMA PERSIS DENGAN CREATE ---
  // (Anda bisa memindahkan logika ini ke custom hook useGameEditor Logic agar tidak duplikat kode)

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
  // ... (Paste fungsi removeQuestion, duplicateQuestion, moveQuestion, handleQuestionChange di sini) ...
  // ... (Paste fungsi addAnswer, removeAnswer, handleAnswerChange, toggleCorrect di sini) ...
  // Agar kode tidak terlalu panjang di sini, saya asumsikan Anda menyalin fungsi-fungsi
  // manipulasi state yang SAMA PERSIS dari createOpenTheBox.tsx
  const removeQuestion = (index: number) => {
    if (items.length <= 1) return;
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
    newItems[qIndex].answers[aIndex].isCorrect =
      !newItems[qIndex].answers[aIndex].isCorrect;
    setItems(newItems);
  };

  // --- LOGIC: UPDATE ---
  const handleUpdate = async () => {
    if (!title.trim()) {
      alert("Please enter an activity title.");
      return;
    }

    const payload = {
      id, // Kirim ID game yang diedit
      title,
      type: "OpenTheBox",
      content: items,
    };

    console.log("Updating Data:", payload);

    try {
      // await api.put(`/games/${id}`, payload); // Panggil API update
      alert("Game Updated Successfully!");
      navigate("/my-activities"); // Kembali ke dashboard
    } catch (error) {
      console.error("Failed to update game", error);
      alert("Failed to update game.");
    }
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-gray-700 pb-20">
      {/* HEADER TITLE (EDIT MODE) */}
      <div className="bg-white border-b border-gray-300 p-6 mb-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex-1">
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2 tracking-wide">
              Edit Activity
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-semibold border-gray-300 focus:border-blue-500 h-12"
              placeholder="Enter title here..."
            />
          </div>
          {/* Indikator Mode Edit (Opsional) */}
          <div className="ml-4 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full uppercase tracking-wider">
            Editing Mode
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* SAMA SEPERTI CREATE: LIST QUESTIONS */}
        {/* ... (Copy paste bagian render list items dari CreateOpenTheBox di sini) ... */}
        {/* Agar tidak terlalu panjang, saya persingkat render map-nya.
            Pada implementasi asli, copy paste seluruh div 'space-y-6' dari file Create di sini.
        */}
        <div className="space-y-6">
          {items.map((item, qIndex) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative group"
            >
              {/* TOOLBAR */}
              <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={() => moveQuestion(qIndex, "up")}
                  disabled={qIndex === 0}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => moveQuestion(qIndex, "down")}
                  disabled={qIndex === items.length - 1}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  onClick={() => duplicateQuestion(qIndex)}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => removeQuestion(qIndex)}
                  disabled={items.length <= 1}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {/* CONTENT */}
              <div className="p-6 pr-12">
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-xl font-bold text-gray-400 min-w-[24px] pt-2">
                    {qIndex + 1}.
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                      Question
                    </label>
                    <Input
                      value={item.question}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, e.target.value)
                      }
                      className="pr-20 py-5 text-lg"
                      placeholder="Type your question..."
                    />
                  </div>
                </div>
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
                        <span className="text-sm font-bold text-gray-400 w-4">
                          {String.fromCharCode(97 + aIndex)}
                        </span>
                        <button
                          onClick={() => toggleCorrect(qIndex, aIndex)}
                          className={`flex items-center justify-center w-8 h-8 rounded border transition-colors ${ans.isCorrect ? "bg-green-100 border-green-500 text-green-600" : "bg-white border-gray-300 text-gray-300 hover:border-gray-400 hover:text-gray-400"}`}
                        >
                          {ans.isCorrect ? (
                            <Check size={18} />
                          ) : (
                            <X size={18} />
                          )}
                        </button>
                        <div className="flex-1 relative">
                          <Input
                            value={ans.text}
                            onChange={(e) =>
                              handleAnswerChange(qIndex, aIndex, e.target.value)
                            }
                            className="pr-8"
                          />
                          {item.answers.length > 1 && (
                            <button
                              onClick={() => removeAnswer(qIndex, aIndex)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 opacity-0 group-hover/answer:opacity-100"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 ml-6 md:ml-0">
                    <button
                      onClick={() => addAnswer(qIndex)}
                      className="text-sm font-semibold text-blue-500 hover:text-blue-700 flex items-center gap-1 py-1 px-2 rounded hover:bg-blue-50"
                    >
                      <Plus size={16} /> Add answer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TOMBOL TAMBAH SOAL */}
        <div className="mt-8 mb-20">
          <button
            onClick={addQuestion}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-semibold flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all text-lg"
          >
            <Plus size={24} /> Add a new item
          </button>
        </div>
      </div>

      {/* FOOTER ACTION BAR (EDIT MODE) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-4 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {items.length} Questions (Editing)
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="text-gray-600"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-8"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOpenTheBox;
