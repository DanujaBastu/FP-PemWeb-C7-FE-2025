// PATH: src/pages/open-the-box/createOpenTheBox.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { TextareaField } from "@/components/ui/textarea-field";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Dropzone from "@/components/ui/dropzone";
import { Typography } from "@/components/ui/typography";
import { ArrowLeft, Plus, SaveIcon, Trash2, X, EyeIcon } from "lucide-react";

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

// Import dengan type keyword untuk fix TypeScript error
import {
  CreateOpenTheBoxApi,
  type Question,
} from "@/api/open-the-box/useCreateOpenTheBox";

function CreateOpenTheBox() {
  const navigate = useNavigate();

  // --- STATE ---
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [questions, setQuestions] = useState<Question[]>([
    {
      questionText: "",
      answers: [
        { text: "", isCorrect: true }, // Default opsi 1 benar
        { text: "", isCorrect: false },
      ],
    },
  ]);

  const [settings, setSettings] = useState({
    isPublishImmediately: false,
    scorePerQuestion: 1,
  });

  // --- HANDLERS ---
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: "",
        answers: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error("At least one question is required");
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    // Clear error untuk question yang dihapus
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`questions.${index}.questionText`];
      delete newErrors[`questions.${index}.answers`];
      return newErrors;
    });
  };

  const addAnswer = (qIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].answers.length >= 6) {
      toast.error("Maximum 6 options per question");
      return;
    }
    newQuestions[qIndex].answers.push({ text: "", isCorrect: false });
    setQuestions(newQuestions);
  };

  const removeAnswer = (qIndex: number, aIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].answers.length <= 2) {
      toast.error("Minimum 2 options per question");
      return;
    }

    const isRemovingCorrectAnswer =
      newQuestions[qIndex].answers[aIndex].isCorrect;
    newQuestions[qIndex].answers.splice(aIndex, 1);

    // Jika yang dihapus adalah jawaban benar, set opsi pertama jadi benar
    if (isRemovingCorrectAnswer) {
      newQuestions[qIndex].answers[0].isCorrect = true;
    }

    setQuestions(newQuestions);
  };

  const handleAnswerChange = (
    qIndex: number,
    aIndex: number,
    value: string,
  ) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers[aIndex].text = value;
    setQuestions(newQuestions);

    // Clear error saat user mulai mengisi
    if (formErrors[`questions.${qIndex}.answers`]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`questions.${qIndex}.answers`];
        return newErrors;
      });
    }
  };

  const handleCorrectAnswer = (qIndex: number, aIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers.forEach((a, i) => {
      a.isCorrect = i === aIndex;
    });
    setQuestions(newQuestions);
  };

  const handleQuestionTextChange = (qIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].questionText = value;
    setQuestions(newQuestions);

    // Clear error saat user mulai mengisi
    if (formErrors[`questions.${qIndex}.questionText`]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`questions.${qIndex}.questionText`];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validasi title
    if (!title.trim()) {
      errors["title"] = "Title is required";
    } else if (title.trim().length < 3) {
      errors["title"] = "Title must be at least 3 characters";
    }

    // Validasi thumbnail
    if (!thumbnail) {
      errors["thumbnail"] = "Thumbnail is required";
    }

    // Validasi questions
    questions.forEach((q, idx) => {
      if (!q.questionText.trim()) {
        errors[`questions.${idx}.questionText`] = "Question text is required";
      }

      // Cek apakah semua jawaban sudah diisi
      const emptyAnswers = q.answers.filter((a) => !a.text.trim());
      if (emptyAnswers.length > 0) {
        errors[`questions.${idx}.answers`] =
          "All answer options must be filled";
      }

      // Cek apakah ada jawaban yang benar
      const hasCorrectAnswer = q.answers.some((a) => a.isCorrect);
      if (!hasCorrectAnswer) {
        errors[`questions.${idx}.answers`] = "Please select a correct answer";
      }
    });

    // Validasi score
    if (settings.scorePerQuestion < 1) {
      errors["score"] = "Score must be at least 1";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (publish = false) => {
    // Validasi form
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      // Scroll to first error
      const firstErrorKey = Object.keys(formErrors)[0];
      if (firstErrorKey) {
        const errorElement = document.querySelector(
          `[data-error="${firstErrorKey}"]`,
        );
        errorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        thumbnail: thumbnail!,
        questions: questions.map((q) => ({
          questionText: q.questionText.trim(),
          answers: q.answers.map((a) => ({
            text: a.text.trim(),
            isCorrect: a.isCorrect,
          })),
        })),
        settings: {
          ...settings,
          isPublishImmediately: publish,
        },
      };

      await CreateOpenTheBoxApi(payload);

      toast.success(
        publish
          ? "Game created and published successfully!"
          : "Game saved as draft successfully!",
      );

      // Navigate after short delay untuk user lihat toast
      setTimeout(() => {
        navigate("/create-projects");
      }, 1000);
    } catch (error) {
      // Error sudah dihandle di useCreateOpenTheBox hook
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/create-projects");
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white h-fit w-full flex justify-between items-center px-8 py-4 border-b">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="w-full h-full p-8 justify-center items-center flex flex-col pb-24">
        <div className="max-w-3xl w-full space-y-6">
          {/* Header Section */}
          <div>
            <Typography variant="h3">Create Open The Box</Typography>
            <Typography variant="p" className="mt-2 text-slate-500">
              Tap each box to open it and reveal the question inside.
            </Typography>
          </div>

          {/* Form Utama */}
          <div className="bg-white w-full h-full p-6 space-y-6 rounded-xl border shadow-sm">
            <div data-error="title">
              <FormField
                required
                label="Game Title"
                placeholder="Ex: Math Quiz"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (formErrors["title"]) {
                    setFormErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors["title"];
                      return newErrors;
                    });
                  }
                }}
                disabled={isSubmitting}
              />
              {formErrors["title"] && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors["title"]}
                </p>
              )}
            </div>

            <TextareaField
              label="Description"
              placeholder="Describe your activity..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />

            <div data-error="thumbnail">
              <div
                className={isSubmitting ? "opacity-50 pointer-events-none" : ""}
              >
                <Dropzone
                  required
                  label="Thumbnail Image"
                  allowedTypes={["image/png", "image/jpeg", "image/jpg"]}
                  maxSize={2 * 1024 * 1024} // 2MB
                  onChange={(file) => {
                    if (!isSubmitting) {
                      setThumbnail(file);
                      if (formErrors["thumbnail"]) {
                        setFormErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors["thumbnail"];
                          return newErrors;
                        });
                      }
                    }
                  }}
                />
              </div>
              {formErrors["thumbnail"] && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors["thumbnail"]}
                </p>
              )}
            </div>
          </div>

          {/* Questions List */}
          <div className="flex justify-between items-center">
            <Typography variant="p" className="font-semibold">
              Questions ({questions.length})
            </Typography>
            <Button
              variant="outline"
              onClick={addQuestion}
              disabled={isSubmitting}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>

          {questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className="bg-white w-full h-full p-6 space-y-6 rounded-xl border shadow-sm relative"
              data-error={`questions.${qIndex}.questionText`}
            >
              <div className="flex justify-between items-start">
                <Typography variant="p" className="font-medium text-slate-700">
                  Question {qIndex + 1}
                </Typography>
                <Trash2
                  size={18}
                  className={
                    questions.length === 1 || isSubmitting
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-red-500 cursor-pointer hover:text-red-600"
                  }
                  onClick={() => {
                    if (questions.length > 1 && !isSubmitting) {
                      removeQuestion(qIndex);
                    }
                  }}
                />
              </div>

              <div>
                <TextareaField
                  required
                  label="Question Text"
                  placeholder="Type your question here"
                  rows={2}
                  value={q.questionText}
                  onChange={(e) =>
                    handleQuestionTextChange(qIndex, e.target.value)
                  }
                  disabled={isSubmitting}
                />
                {formErrors[`questions.${qIndex}.questionText`] && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors[`questions.${qIndex}.questionText`]}
                  </p>
                )}
              </div>

              {/* Answers */}
              <div
                className="space-y-4"
                data-error={`questions.${qIndex}.answers`}
              >
                <Label>
                  Answers (Select correct one){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={q.answers.findIndex((a) => a.isCorrect).toString()}
                  onValueChange={(val) => {
                    if (!isSubmitting) {
                      handleCorrectAnswer(qIndex, Number(val));
                    }
                  }}
                >
                  <div className="space-y-3">
                    {q.answers.map((a, aIndex) => (
                      <div key={aIndex} className="flex items-center gap-3">
                        <RadioGroupItem
                          value={aIndex.toString()}
                          disabled={isSubmitting}
                        />
                        <div className="flex-1 relative">
                          <Input
                            placeholder={`Option ${aIndex + 1}`}
                            value={a.text}
                            onChange={(e) =>
                              handleAnswerChange(qIndex, aIndex, e.target.value)
                            }
                            className="pr-8"
                            disabled={isSubmitting}
                          />
                          {q.answers.length > 2 && !isSubmitting && (
                            <X
                              size={16}
                              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-red-500"
                              onClick={() => removeAnswer(qIndex, aIndex)}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                {formErrors[`questions.${qIndex}.answers`] && (
                  <p className="text-sm text-red-500">
                    {formErrors[`questions.${qIndex}.answers`]}
                  </p>
                )}

                {q.answers.length < 6 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addAnswer(qIndex)}
                    className="text-blue-600 pl-0 hover:bg-transparent hover:text-blue-700"
                    disabled={isSubmitting}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Option
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Settings */}
          <div className="bg-white w-full h-full p-6 space-y-6 rounded-xl border shadow-sm">
            <Typography variant="p" className="font-semibold">
              Settings
            </Typography>
            <div className="flex justify-between items-center">
              <FormField
                label="Score Per Question"
                placeholder="1"
                type="number"
                value={settings.scorePerQuestion}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 1) {
                    setSettings((prev) => ({
                      ...prev,
                      scorePerQuestion: value,
                    }));
                    if (formErrors["score"]) {
                      setFormErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors["score"];
                        return newErrors;
                      });
                    }
                  }
                }}
                min={1}
                disabled={isSubmitting}
              />
            </div>
            {formErrors["score"] && (
              <p className="text-sm text-red-500">{formErrors["score"]}</p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 justify-end w-full pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={isSubmitting}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
                  <AlertDialogDescription>
                    All unsaved changes will be lost. This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Editing</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>
                    Discard
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
            >
              <SaveIcon className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Draft"}
            </Button>

            <Button
              size="sm"
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
            >
              <EyeIcon className="mr-2 h-4 w-4" />
              {isSubmitting ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOpenTheBox;
