"use client";

import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "react-hook-form";

interface FormTextareaProps {
  id: string;
  label: string;
  placeholder?: string;
  register: any; // field from Controller
  disabled?: boolean;
  required?: boolean;
  className?: string;
  rows?: number;
  error?: FieldError;
}

export function FormTextarea({
  id,
  label,
  placeholder,
  register,
  disabled = false,
  required = false,
  className,
  rows = 3,
  error,
}: FormTextareaProps) {
  return (
    <div className={`mb-4 ${className ?? ""}`}>
      <label
        htmlFor={id}
        className={`block text-sm font-medium mb-1 ${
          required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""
        }`}
      >
        {label}
      </label>
      <Textarea
        id={id}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`w-full resize-none ${error ? "border-red-500" : ""}`}
        {...register}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
    </div>
  );
}
