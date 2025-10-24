"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "react-hook-form";

interface FormInputProps {
    id: string;
    label: string;
    type?: string;
    placeholder?: string;
    register?: any;
    error?: FieldError;
    disabled?: boolean;
}

export function FormInput({
    id,
    label,
    type = "text",
    placeholder,
    register,
    error,
    disabled,
}: FormInputProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input 
                id={id} 
                type={type} 
                placeholder={placeholder} 
                disabled={disabled}
                {...register} 
            />
            {error && (
                Array.isArray(error.message) 
                    ? error.message.map((msg, i) => (
                        <p key={i} className="text-sm text-red-500">{msg}</p>
                    ))
                    : <p className="text-sm text-red-500">{error.message}</p>
            )}
        </div>
    );
}
