"use client";

import Image from "next/image";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";

interface FormImageProps {
    label?: string;
    initialPreview?: string | null;
    onFileSelect: (file: File | null, previewUrl: string | null) => void;
    height?: number;
    className?: string;
}

export function FormImage({
    label = "Upload Image",
    initialPreview = null,
    onFileSelect,
    height = 260,
    className,
}: FormImageProps) {
    const [preview, setPreview] = useState<string | null>(initialPreview);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = useCallback(
        (file?: File) => {
            if (!file) {
                setPreview(null);
                setFileName(null);
                onFileSelect(null, null);
                return;
            }

            const url = URL.createObjectURL(file);
            setPreview(url);
            setFileName(file.name);
            onFileSelect(file, url);
        },
        [onFileSelect]
    );

    return (
        <div className={cn("flex flex-col", className)}>
            {label && (
                <label className="block text-sm font-medium mb-2">{label}</label>
            )}

            <div
                className={cn(
                    "relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition bg-muted/5 hover:border-primary/70",
                    preview ? "bg-muted/20" : "",
                )}
                style={{ height }}
            >
                {!preview ? (
                    <>
                        <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Click or drag an image to upload
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileChange(file);
                            }}
                        />
                    </>
                ) : (
                    <div className="relative w-full h-full">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover rounded-xl"
                            priority={false}
                        />
                        <div className="absolute top-2 right-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => handleFileChange(undefined)}
                                className="bg-white/70 hover:bg-white/90"
                            >
                                <X className="w-4 h-4 mr-1" /> Remove
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {fileName && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                    Selected: {fileName}
                </p>
            )}
        </div>
    );
}
