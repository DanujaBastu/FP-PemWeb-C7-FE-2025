import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { TextareaField } from "@/components/ui/textarea-field";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Typography } from "@/components/ui/typography";
import { ArrowLeft, EyeIcon, Plus, SaveIcon, Trash2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

function CreateQuiz() {
  const [questions, setQuestions] = useState([1]);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, prev.length + 1]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen flex flex-col">
      <div className="bg-white h-fit w-full flex justify-between items-center px-8 py-4">
        <Button size="sm" variant="ghost" className="hidden md:flex">
          <ArrowLeft /> Back
        </Button>
        <Button size="sm" variant="ghost" className="block md:hidden">
          <ArrowLeft />
        </Button>
      </div>
      <div className="w-full h-full p-8 justify-center items-center flex flex-col">
        <div className="max-w-3xl w-full space-y-6">
          <div>
            <Typography variant="h3">Create Quiz Game</Typography>
            <Typography variant="p" className="mt-2">
              Build your quiz by adding questions and multiple choice answers
            </Typography>
          </div>
          <div className="bg-white w-full h-full p-6 space-y-6 rounded-xl border">
            <FormField label="Game Title" placeholder="Title" type="text" />
            <TextareaField
              label="Description"
              placeholder="Describe your quiz game"
              rows={4}
            />
          </div>
          <div className="flex justify-between items-center">
            <Typography variant="p">
              Questions {`(${questions.length})`}
            </Typography>
            <Button variant="outline" onClick={addQuestion}>
              <Plus /> Add Question
            </Button>
          </div>
          {questions.map((_, index) => (
            <div
              key={index}
              className="bg-white w-full h-full p-6 space-y-6 rounded-xl border"
            >
              <div className="flex justify-between">
                <Typography variant="p">Question {index + 1}</Typography>
                <Trash2
                  size={20}
                  className={`${
                    questions.length === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-red-500 cursor-pointer"
                  }`}
                  onClick={() => {
                    if (questions.length > 1) removeQuestion(index);
                  }}
                />
              </div>

              <TextareaField
                label="Question"
                placeholder="Type your question here"
                rows={4}
              />

              <div className="grid w-full items-center gap-1.5">
                <Label>Answer Options</Label>

                <div className="space-x-4 flex">
                  <div className="space-y-3 mt-3">
                    <Input placeholder="1" className="bg-[#F3F3F5]" />
                    <Input placeholder="2" className="bg-[#F3F3F5]" />
                    <Input placeholder="3" className="bg-[#F3F3F5]" />
                    <Input placeholder="4" className="bg-[#F3F3F5]" />
                  </div>

                  <div className="flex items-stretch justify-center mt-3">
                    <RadioGroup>
                      {[1, 2, 3, 4].map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                          <RadioGroupItem value={`option-${opt}`} />
                          <Label className="font-normal">Correct</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-white w-full h-full p-6 space-y-6 rounded-xl border">
            <Typography variant="p">Settings</Typography>
            <div className="flex justify-between items-center">
              <div>
                <Label>Shuffle Questions</Label>
                <Typography variant="small">
                  Randomize questions order for each player
                </Typography>
              </div>
              <div>
                <Switch />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <Label>Show Score</Label>
                <Typography variant="small">
                  Display score at the end of the quiz
                </Typography>
              </div>
              <div>
                <Switch />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <FormField
                label="Time Limit (seconds)"
                placeholder="e.g., 30"
                type="string"
              />
            </div>
          </div>
          <div className="flex gap-4 justify-end w-full">
            <Button size="sm" variant="destructive">
              <X /> Cancel
            </Button>
            <Button size="sm" variant="outline">
              <SaveIcon /> Save Draft
            </Button>
            <Button size="sm" variant="outline" className="bg-black text-white">
              <EyeIcon /> Publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateQuiz;
