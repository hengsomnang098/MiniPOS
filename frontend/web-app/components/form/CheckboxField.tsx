import React from "react";
import { Controller, Control } from "react-hook-form";
// Import shadcn/ui Checkbox and helper components (adjust path to your project)
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // optional classNames helper

export type CheckboxFieldProps = {
    control: Control<any>;
    name: string;
    label?: React.ReactNode;
    description?: React.ReactNode;
    rules?: any;
    disabled?: boolean;
    className?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
};


export default function CheckboxField({
    control,
    name,
    label,
    description,
    rules,
    disabled = false,
    className = "",
    checked,
    onCheckedChange,
}: CheckboxFieldProps) {
    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field, fieldState }) => {
                const { value, onChange, ref } = field;
                const { error } = fieldState;

                return (
                    <div className={cn("flex flex-col space-y-1", className)}>
                        <label className="flex items-start gap-2">
                            <Checkbox
                                checked={checked ?? !!value}
                                onCheckedChange={(checked) => {
                                    if (onCheckedChange) onCheckedChange(!!checked);
                                    else onChange(checked ?? false);
                                }}
                                ref={ref}
                                disabled={disabled}
                            />


                            <div className="flex flex-col">
                                {label ? (
                                    <Label className={disabled ? "opacity-60" : ""}>{label}</Label>
                                ) : null}
                                {description ? (
                                    <span className="text-sm text-muted-foreground">{description}</span>
                                ) : null}
                            </div>
                        </label>

                        {error ? (
                            <p className="text-sm text-destructive" role="alert">
                                {error.message?.toString()}
                            </p>
                        ) : null}
                    </div>
                );
            }}
        />
    );
}
