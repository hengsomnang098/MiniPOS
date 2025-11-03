"use client";

import { useState, useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface AppSearchProps {
    placeholder?: string;
    onSearch: (term: string) => Promise<void> | void; // supports async search
    defaultValue?: string;
    className?: string;
}

export function AppSearch({
    placeholder = "Search...",
    onSearch,
    defaultValue = "",
    className = "",
}: AppSearchProps) {
    const [term, setTerm] = useState(defaultValue);
    const [isPending, startTransition] = useTransition();

    // ✅ Memoized search submission handler
    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            startTransition(() => {
                onSearch(term.trim());
            });
        },
        [term, onSearch]
    );

    // ✅ Memoized clear handler
    const handleClear = useCallback(() => {
        setTerm("");
        startTransition(() => {
            onSearch("");
        });
    }, [onSearch]);

    return (
        <motion.form
            onSubmit={handleSubmit}
            className={`flex items-center gap-2 ${className}`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />

                {term && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        aria-label="Clear search"
                    >
                        ✕
                    </button>
                )}

                <Input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder={placeholder}
                    className="pl-9 pr-8"
                    disabled={isPending}
                />
            </div>

            <Button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
                disabled={isPending}
            >
                {isPending ? "Searching..." : "Search"}
            </Button>
        </motion.form>
    );
}
