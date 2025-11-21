import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function TextareaField({
  label,
  className,
  ...props
}: TextareaFieldProps) {
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label>{label}</Label>
      <Textarea className={className ?? "bg-[#F3F3F5]"} {...props} />
    </div>
  );
}
