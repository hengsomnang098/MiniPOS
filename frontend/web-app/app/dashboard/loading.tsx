"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LoadingPage() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Hide after 2 seconds (adjust as needed)
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 flex flex-col items-center justify-center bg-white z-9999"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Logo or Animation */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <Image
                            src="https://techhl.b-cdn.net/Logo.webp"
                            alt="Logo"
                            width={160}
                            height={160}
                            unoptimized
                        />
                    </motion.div>

                    {/* Optional loading text or spinner */}
                    <motion.p
                        className="mt-4 text-gray-600 text-sm tracking-wide"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Loading, please wait...
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
