import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FormField({ label, className, ...props }: FormFieldProps) {
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label>{label}</Label>
      <Input className={className ?? "bg-[#F3F3F5]"} {...props} />
    </div>
  );
}
