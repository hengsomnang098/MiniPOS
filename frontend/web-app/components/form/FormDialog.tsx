"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface FormDialogProps {
    open: boolean;
    setOpen: (v: boolean) => void;
    title: string;
    children: ReactNode;
    onCancel?: () => void;
    onSubmit?: () => void;
    submitLabel?: string;
    isSubmitting?: boolean;
    disabled?: boolean;
}

export function FormDialog({
    open,
    setOpen,
    title,
    children,
    onCancel,
    onSubmit,
    submitLabel = "Save",
    isSubmitting = false,
    disabled = false,
}: FormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">{children}</div>

                <DialogFooter className="pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setOpen(false);
                            onCancel?.();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        onClick={onSubmit}
                        disabled={isSubmitting || disabled}
                        className="bg-cyan-500 hover:bg-cyan-600"
                    >
                        {isSubmitting ? "Saving..." : submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
