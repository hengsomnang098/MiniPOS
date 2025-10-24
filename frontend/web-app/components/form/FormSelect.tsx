"use client";

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FieldError } from "react-hook-form";

interface Option {
    label: string;
    value: string;
}

interface FormSelectProps {
    id: string;
    label: string;
    value?: string;
    options: Option[];
    onChange: (value: string) => void;
    error?: FieldError;
    placeholder: string;
}

export function FormSelect({
    id,
    label,
    value,
    options,
    onChange,
    error,
    placeholder,
}: FormSelectProps) {
    return (
        <div className="space-y-2 w-full">
            <Label htmlFor={id}>{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger id={id} className="w-full">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="w-full">
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error.message}</p>}
        </div>
    );
}
