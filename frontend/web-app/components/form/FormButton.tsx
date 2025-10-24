"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormButtonProps {
    label: string;
    loading?: boolean;
    disabled?: boolean;
    variant?: "default" | "outline" | "destructive";
    onClick?: () => void;
}

export function FormButton({
    label,
    loading,
    disabled,
    variant = "default",
    onClick,
}: FormButtonProps) {
    return (
        <Button
            onClick={onClick}
            disabled={disabled || loading}
            variant={variant}
            className="flex items-center gap-2"
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {label}
        </Button>
    );
}
