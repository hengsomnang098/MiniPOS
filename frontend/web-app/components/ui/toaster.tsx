"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
    return (
        <Sonner
            position="top-right" // ✅ top-right position
            richColors
            closeButton
            visibleToasts={3} // optional limit
            toastOptions={{
                style: {
                    fontSize: "0.9rem",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
            }}
        />
    );
}
