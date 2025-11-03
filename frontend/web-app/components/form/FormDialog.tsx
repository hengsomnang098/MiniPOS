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
import { cn } from "@/lib/utils"; // ✅ make sure you have this util for merging classes

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
  className?: string; // ✅ allow custom width/sizing
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
  className,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={cn(
          // ✅ flexible responsive layout
          "max-h-[85vh] overflow-y-auto p-6 sm:rounded-lg",
          "bg-white dark:bg-neutral-900",
          className || "sm:max-w-lg" // fallback to medium size if none provided
        )}
      >
        <DialogHeader className="pb-4 border-b border-border/50">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">{children}</div>

        <DialogFooter className="flex justify-end gap-2 border-t border-border/50 pt-4">
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
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
