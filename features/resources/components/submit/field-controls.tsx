import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { INPUT_BASE_CLASS, TEXTAREA_BASE_CLASS } from "./constants";

export function FieldLabel({
    htmlFor,
    children,
}: {
    htmlFor?: string;
    children: ReactNode;
}) {
    return (
        <label htmlFor={htmlFor} className="text-[14px] text-[#343131]">
            {children}
        </label>
    );
}

type StyledInputProps = React.ComponentProps<typeof Input>;

export function StyledInput({ className, ...props }: StyledInputProps) {
    return <Input className={cn(INPUT_BASE_CLASS, className)} {...props} />;
}

type StyledTextareaProps = React.ComponentProps<typeof Textarea>;

export function StyledTextarea({ className, ...props }: StyledTextareaProps) {
    return (
        <Textarea className={cn(TEXTAREA_BASE_CLASS, className)} {...props} />
    );
}
