import { useEffect, useState } from "react";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { mazeChaseSchema } from "@/validation/mazeChaseSchema";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import Dropzone from "@/components/ui/dropzone";
import { Typography } from "@/components/ui/typography";
import { ArrowLeft, Plus, SaveIcon, Trash2, X, ChevronDown, Sparkles } from "lucide-react";
import { AVAILABLE_MAPS } from "@/constants/maps";
import backgroundImage from "@/assets/maze-chase/backgroundcreate.jpg";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

// --- Type Definitions (Identical to Logic) ---
interface Answer {
  text: string;
  isCorrect: boolean;
}

type MaybeFileOrUrl = File | string | null;

interface Question {
  questionText: string;
  questionImages: MaybeFileOrUrl;
  answers: Answer[];
}

interface ApiAnswer {
  answer_text?: string;
  is_correct?: boolean;
}

interface ApiQuestion {
  question_text?: string;
  question_image?: string | null;
  answers?: ApiAnswer[];
}

interface QuestionPayload {
  question_text: string;
  answers: {
    answer_text: string;
    is_correct: boolean;
  }[];
  question_image_array_index?: number | string;
}

function EditMazeChase() {
  const navigate = useNavigate();
  const { id } = useParams();

  // --- State Management ---
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  
  // UI State
  const [showMapDropdown, setShowMapDropdown] = useState(false);

  // Data State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mapId, setMapId] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([
    {
      questionText: "",
      questionImages: null,
      answers: Array(4).fill({ text: "", isCorrect: false }),
    },
  ]);

  const [settings, setSettings] = useState({
    isQuestionRandomized: false,
    isAnswerRandomized: false,
    countdownMinutes: 5,
  });

  // --- Fetch Data Logic (Edit Specific) ---
  useEffect(() => {
    if (!id) return setLoading(false);

    const fetchMazeChase = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/game/game-type/maze-chase/${id}`);
        const data = res.data.data;

        setTitle(data.name || "");
        setDescription(data.description || "");
        setMapId(data.map_id || "");

        if (data.thumbnail_image) {
          setThumbnailPreview(
            `${import.meta.env.VITE_API_URL}/${data.thumbnail_image}`,
          );
        } else setThumbnailPreview(null);
        setThumbnail(null);

        const mappedQuestions: Question[] = (
          data.game_json?.questions || []
        ).map((q: ApiQuestion) => ({
          questionText: q.question_text || "",
          questionImages: q.question_image
            ? q.question_image.startsWith("http")
              ? q.question_image
              : `${import.meta.env.VITE_API_URL}/${q.question_image}`
            : null,
          answers: (q.answers || []).map((a: ApiAnswer) => ({
            text: a.answer_text ?? "",
            isCorrect: Boolean(a.is_correct),
          })),
        }));

        const normalized = mappedQuestions.map((q) => {
          const arr = q.answers.slice(0, 4);
          while (arr.length < 4) arr.push({ text: "", isCorrect: false });
          return { ...q, answers: arr };
        });

        setQuestions(
          normalized.length
            ? normalized
            : [
                {
                  questionText: "",
                  questionImages: null,
                  answers: Array(4).fill({ text: "", isCorrect: false }),
                },
              ]
        );

        setSettings({
          isQuestionRandomized: !!data.game_json?.is_question_randomized,
          isAnswerRandomized: !!data.game_json?.is_answer_randomized,
          countdownMinutes: Number(data.game_json?.countdown_minutes ?? 5),
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load maze chase game data");
      } finally {
        setLoading(false);
      }
    };

    fetchMazeChase();
  }, [id]);

  // --- Logic Functions ---

  const addQuestion = () => {
    if (questions.length >= 10) {
      toast.error("Maximum 10 Question allowed");
      return;
    }
    setQuestions((prev) => [
      ...prev,
      {
        questionText: "",
        questionImages: null,
        answers: Array(4).fill({ text: "", isCorrect: false }),
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
       toast.error("Minimum 1 question required");
       return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (qIndex: number, newData: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, ...newData } : q)),
    );
  };

  const handleAnswerChange = (qIndex: number, aIndex: number, value: string) => {
    const newAnswers = [...questions[qIndex].answers];
    newAnswers[aIndex] = { ...newAnswers[aIndex], text: value };
    updateQuestion(qIndex, { answers: newAnswers });
  };

  const handleCorrectAnswer = (qIndex: number, aIndex: number) => {
    const newAnswers = questions[qIndex].answers.map((a, i) => ({
      ...a,
      isCorrect: i === aIndex,
    }));
    updateQuestion(qIndex, { answers: newAnswers });
  };

  const handleQuestionTextChange = (qIndex: number, value: string) => {
    updateQuestion(qIndex, { questionText: value });
  };

  const handleThumbnailChange = (file: File | null) => {
    setThumbnail(file);
    if (file) setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleQuestionImageChange = (qIndex: number, file: File | null) => {
    updateQuestion(qIndex, { questionImages: file });
  };

  const handleSaveDraft = () => {
    const draftData = {
      title,
      description,
      thumbnail: thumbnail ? "image_updated" : "image_existing",
      mapId,
      questions,
      settings,
      savedAt: new Date().toLocaleString(),
    };

    try {
      localStorage.setItem("mazeChase_draft", JSON.stringify(draftData));
      toast.success("Draft saved successfully!");
    } catch (err) {
      console.error("Failed to save draft:", err);
      toast.error("Failed to save draft. Storage might be full.");
    }
  };

  // --- Submit Handler (UPDATE/PATCH) ---
  const handleSubmit = async () => {
    if (!thumbnail && !thumbnailPreview) {
      setFormErrors((prev) => ({ ...prev, thumbnail: "Thumbnail is required" }));
      return toast.error("Thumbnail is required");
    }
    if (!mapId) {
      setFormErrors((prev) => ({ ...prev, mapId: "Map ID is required" }));
      return toast.error("Map ID is required");
    }

    // Validation Logic
    const validationPayload = {
      title,
      description,
      thumbnail: thumbnail ?? null,
      mapId,
      questions: questions.map((q) => ({
        questionText: q.questionText,
        questionImages: q.questionImages instanceof File ? q.questionImages : null,
        answers: q.answers.map((a) => ({
          text: a.text,
          isCorrect: a.isCorrect,
        })),
      })),
      settings,
    };

    // Conditional schema if thumbnail exists as URL
    let schemaToUse: z.ZodTypeAny = mazeChaseSchema;
    if (!thumbnail && thumbnailPreview) {
      schemaToUse = mazeChaseSchema.extend({
        thumbnail: z.union([z.string().url(), z.null()]),
      });
    }

    const result = schemaToUse.safeParse(validationPayload);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      });
      setFormErrors(fieldErrors);
      toast.error("Please fix the highlighted errors");
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append("name", title);
    if (description) formData.append("description", description);
    formData.append("map_id", mapId);
    if (thumbnail instanceof File) {
      formData.append("thumbnail_image", thumbnail);
    }

    formData.append("is_question_randomized", String(settings.isQuestionRandomized));
    formData.append("is_answer_randomized", String(settings.isAnswerRandomized));
    formData.append("countdown_minutes", String(settings.countdownMinutes));

    const filesToUpload: File[] = [];
    const questionImageFileIndex: (number | string | undefined)[] = new Array(questions.length);

    questions.forEach((q, qi) => {
      if (q.questionImages instanceof File) {
        questionImageFileIndex[qi] = filesToUpload.length;
        filesToUpload.push(q.questionImages);
      } else if (typeof q.questionImages === "string") {
        const base = import.meta.env.VITE_API_URL ?? "";
        const relative = q.questionImages.replace(base + "/", "");
        questionImageFileIndex[qi] = relative;
      } else {
        questionImageFileIndex[qi] = undefined;
      }
    });

    filesToUpload.forEach((f) => formData.append("files_to_upload[]", f));

    const questionsPayload: QuestionPayload[] = questions.map((q, qi) => {
      const payload: QuestionPayload = {
        question_text: q.questionText,
        answers: q.answers.map((a) => ({
          answer_text: a.text,
          is_correct: a.isCorrect,
        })),
      };
      const idx = questionImageFileIndex[qi];
      if (idx !== undefined) {
        payload.question_image_array_index = idx as number | string;
      }
      return payload;
    });

    formData.append("questions", JSON.stringify(questionsPayload));

    try {
      setLoading(true);
      await api.patch(`/api/game/game-type/maze-chase/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Maze Chase game updated successfully!");
      navigate("/my-projects");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update maze chase game");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div 
        className="w-full h-screen flex justify-center items-center bg-cover bg-fixed bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="backdrop-blur-md bg-[#899a95]/80 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#3f4441] border-t-[#c9a961]"></div>
            <p className="mt-4 font-gothic text-xl text-[#3f4441]">Loading Labyrinth...</p>
        </div>
      </div>
    );
  }

  // --- Render (Strict Style Implementation) ---
  return (
    <div 
      className="w-full min-h-screen bg-cover bg-fixed bg-center relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {/* Font Injection */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Pirata+One&family=UnifrakturMaguntia&family=Inter:wght@300;400;500;600;700&display=swap');
          .font-gothic { font-family: 'Pirata One', cursive; letter-spacing: 0.05em; }
          .font-body { font-family: 'Inter', sans-serif; }
        `}
      </style>

      {/* Dark Overlay for Readability of background */}
      <div className="fixed inset-0 bg-black/40 z-0" />

      {/* Navbar - Gothic Style */}
      <nav className="backdrop-blur-md bg-black/50 border-b border-[#899a95]/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="font-gothic text-3xl text-[#c9a961] tracking-wider">
              Maze Chase
            </h1>
            <button 
              onClick={() => navigate("/my-projects")}
              className="font-body text-gray-300 hover:text-[#c9a961] transition-colors duration-300 text-sm flex items-center"
            >
              <ArrowLeft className="inline mr-2" size={16} />
              Back to Projects
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full py-12 px-4 md:px-8 flex justify-center font-body relative z-10">
        <div className="max-w-4xl w-full space-y-8">
            
            {/* Header Outside Form */}
            <div className="text-center">
                <h1 className="font-gothic text-5xl md:text-6xl text-[#c9a961] tracking-wider mb-2 drop-shadow-md">
                   Edit Your Maze
                </h1>
                <p className="text-gray-300 text-lg">
                   Modify the paths and secrets of your existing labyrinth
                </p>
            </div>

            {/* --- FORM CONTAINER (Strict Sage Grey Style) --- */}
            <div className="bg-[#899a95] rounded-2xl shadow-2xl p-8 md:p-10 border border-[#7a8b86]">
                
                {/* Section: Game Configuration */}
                <div className="space-y-8">
                    <h2 className="font-gothic text-3xl text-[#3f4441] mb-6 border-b border-[#3f4441]/20 pb-2">
                        Game Configuration
                    </h2>

                    {/* Title Input */}
                    <div className="space-y-3">
                        <Label className="text-[#3f4441] font-bold text-base">
                            Game Title <span className="text-red-700">*</span>
                        </Label>
                        <Input
                            placeholder="Enter maze title..."
                            className="bg-[#f0f2f1] border-[#6b7c77] text-[#3f4441] placeholder:text-[#3f4441]/50 focus:border-[#c9a961] focus:ring-1 focus:ring-[#c9a961] rounded-xl px-4 py-6 text-lg shadow-inner"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        {formErrors["title"] && <p className="text-red-800 text-sm font-medium">⚠ {formErrors["title"]}</p>}
                    </div>

                    {/* Description Input */}
                    <div className="space-y-3">
                        <Label className="text-[#3f4441] font-bold text-base">
                            Description
                        </Label>
                        <textarea
                            placeholder="Describe the challenges..."
                            className="w-full bg-[#f0f2f1] border-[#6b7c77] text-[#3f4441] placeholder:text-[#3f4441]/50 focus:border-[#c9a961] focus:ring-1 focus:ring-[#c9a961] rounded-xl px-4 py-4 resize-none shadow-inner"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                         {formErrors["description"] && <p className="text-red-800 text-sm font-medium">⚠ {formErrors["description"]}</p>}
                    </div>

                    {/* Map Selection */}
                    <div className="space-y-3">
                         <Label className="text-[#3f4441] font-bold text-base">
                            Select Map <span className="text-red-700">*</span>
                        </Label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowMapDropdown(!showMapDropdown)}
                                className="w-full flex items-center justify-between px-4 py-4 bg-[#f0f2f1] border border-[#6b7c77] rounded-xl text-[#3f4441] hover:border-[#c9a961] transition-all shadow-sm"
                            >
                                <span className="font-medium">
                                    {mapId ? AVAILABLE_MAPS.find((m) => m.id === mapId)?.name : "Select a map..."}
                                </span>
                                <ChevronDown size={20} className={`text-[#3f4441] transition-transform ${showMapDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showMapDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-20 p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {AVAILABLE_MAPS.map((map) => (
                                        <button
                                            key={map.id}
                                            type="button"
                                            onClick={() => {
                                                setMapId(map.id);
                                                setShowMapDropdown(false);
                                            }}
                                            className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                                                mapId === map.id ? "border-[#c9a961] ring-2 ring-[#c9a961]/30" : "border-gray-200 hover:border-[#c9a961]"
                                            }`}
                                        >
                                            <img src={map.image} alt={map.name} className="w-full h-24 object-cover" />
                                            <div className={`p-2 text-xs font-bold text-center ${mapId === map.id ? "bg-[#c9a961] text-white" : "bg-gray-100 text-gray-700"}`}>
                                                {map.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Thumbnail Dropzone */}
                    <div className="space-y-3">
                        <Label className="text-[#3f4441] font-bold text-base">Thumbnail</Label>
                        <div className="bg-[#f0f2f1]/50 p-2 rounded-xl border border-[#6b7c77] border-dashed">
                             <Dropzone
                                required
                                defaultValue={thumbnailPreview ?? undefined}
                                label="Upload Game Thumbnail"
                                allowedTypes={["image/png", "image/jpeg"]}
                                maxSize={2 * 1024 * 1024}
                                onChange={handleThumbnailChange}
                            />
                        </div>
                    </div>
                </div>

                <hr className="my-8 border-[#3f4441]/20" />

                {/* Section: Challenges */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                         <div>
                           <h2 className="font-gothic text-3xl text-[#3f4441]">Challenges</h2>
                           <p className="text-gray-600 text-sm mt-1">Maximum 10 question ({questions.length}/10)</p>
                         </div>
                         <Button 
                            onClick={addQuestion}
                            disabled={questions.length >= 10}
                            className="bg-[#3f4441] hover:bg-[#2a2e2c] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                            <Plus size={18} className="mr-2" /> Add Question
                         </Button>
                    </div>

                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-[#f0f2f1] rounded-xl p-6 shadow-md border border-[#d1d6d4] space-y-5 relative">
                             {/* Question Header */}
                             <div className="flex justify-between items-start">
                                <div className="bg-[#3f4441] text-white px-3 py-1 rounded-lg font-bold text-sm">
                                    Q{qIndex + 1}
                                </div>
                                <button 
                                    onClick={() => removeQuestion(qIndex)}
                                    disabled={questions.length === 1}
                                    className={`p-2 rounded-full transition-colors ${questions.length === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-100'}`}
                                >
                                    <Trash2 size={18} />
                                </button>
                             </div>

                             {/* Question Text */}
                             <div className="space-y-2">
                                <Label className="text-[#3f4441] font-semibold">Question Text</Label>
                                <textarea
                                    value={q.questionText}
                                    onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-[#3f4441] focus:border-[#c9a961] focus:ring-1 focus:ring-[#c9a961]"
                                    rows={2}
                                    placeholder="Enter question..."
                                />
                             </div>

                             {/* Question Image */}
                             <div className="space-y-2">
                                <Label className="text-[#3f4441] font-semibold">Image (Optional)</Label>
                                <Dropzone
                                    defaultValue={typeof q.questionImages === "string" ? q.questionImages : undefined}
                                    label="Upload Question Image"
                                    allowedTypes={["image/png", "image/jpeg"]}
                                    maxSize={2 * 1024 * 1024}
                                    onChange={(file) => handleQuestionImageChange(qIndex, file)}
                                />
                             </div>

                             {/* Answers */}
                             <div className="space-y-3 bg-[#e2e6e4] p-4 rounded-lg">
                                <Label className="text-[#3f4441] font-semibold block mb-2">Answers</Label>
                                {q.answers.map((a, aIndex) => (
                                    <div key={aIndex} className="flex items-center gap-3">
                                        <Input
                                            value={a.text}
                                            onChange={(e) => handleAnswerChange(qIndex, aIndex, e.target.value)}
                                            placeholder={`Option ${aIndex + 1}`}
                                            className="bg-white border-gray-300 text-[#3f4441]"
                                        />
                                        <RadioGroup
                                            value={q.answers.findIndex(ans => ans.isCorrect).toString()}
                                            onValueChange={(val) => handleCorrectAnswer(qIndex, Number(val))}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value={aIndex.toString()} id={`q${qIndex}-a${aIndex}`} className="border-[#3f4441] text-[#3f4441]" />
                                            </div>
                                        </RadioGroup>
                                    </div>
                                ))}
                             </div>
                        </div>
                    ))}
                </div>

                <hr className="my-8 border-[#3f4441]/20" />

                {/* Section: Settings */}
                <div className="space-y-6">
                    <h2 className="font-gothic text-3xl text-[#3f4441]">Game Settings</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between items-center p-4 bg-[#f0f2f1] rounded-xl border border-[#d1d6d4]">
                            <div>
                                <Label className="text-[#3f4441] font-bold">Shuffle Questions</Label>
                                <p className="text-xs text-gray-600">Randomize order</p>
                            </div>
                            <Switch 
                                checked={settings.isQuestionRandomized}
                                onCheckedChange={(val) => setSettings(p => ({...p, isQuestionRandomized: val}))}
                                className="data-[state=checked]:bg-[#c9a961]"
                            />
                        </div>

                        <div className="flex justify-between items-center p-4 bg-[#f0f2f1] rounded-xl border border-[#d1d6d4]">
                            <div>
                                <Label className="text-[#3f4441] font-bold">Shuffle Answers</Label>
                                <p className="text-xs text-gray-600">Randomize options</p>
                            </div>
                            <Switch 
                                checked={settings.isAnswerRandomized}
                                onCheckedChange={(val) => setSettings(p => ({...p, isAnswerRandomized: val}))}
                                className="data-[state=checked]:bg-[#c9a961]"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-[#f0f2f1] rounded-xl border border-[#d1d6d4]">
                        <Label className="text-[#3f4441] font-bold mb-2 block">Timer (Minutes)</Label>
                        <Input
                            type="number"
                            value={String(settings.countdownMinutes)}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if(val >= 1 && val <= 60) setSettings(p => ({...p, countdownMinutes: val}));
                            }}
                            className="bg-white border-gray-300 text-[#3f4441]"
                        />
                    </div>
                </div>

                {/* Section: Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end mt-10 pt-6 border-t border-[#3f4441]/20">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="lg" className="border-[#3f4441] text-[#3f4441] hover:bg-[#3f4441] hover:text-white rounded-xl">
                                <X size={18} className="mr-2" /> Cancel
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#f0f2f1] border border-[#3f4441]">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-[#3f4441] font-gothic text-2xl">Discard Changes?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                    Are you sure? All modifications will be lost.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="text-[#3f4441]">Keep Editing</AlertDialogCancel>
                                <AlertDialogAction onClick={() => navigate("/my-projects")} className="bg-red-600 hover:bg-red-700 text-white">
                                    Discard
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                     </AlertDialog>

                    <Button 
                        onClick={handleSaveDraft}
                        size="lg"
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl border border-gray-500 transition-all"
                    >
                        <SaveIcon size={18} className="mr-2" /> Save Draft
                    </Button>

                    <Button 
                        onClick={handleSubmit}
                        size="lg"
                        className="bg-[#3f4441] hover:bg-[#2a2e2c] text-[#c9a961] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <SaveIcon size={18} className="mr-2" /> Update Maze
                    </Button>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}

export default EditMazeChase;