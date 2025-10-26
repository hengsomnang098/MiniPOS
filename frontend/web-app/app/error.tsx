"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Custom500Page() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4 text-center">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="shadow-lg border border-gray-200 rounded-2xl">
                    <CardHeader>
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                                <AlertTriangle className="h-8 w-8" />
                            </div>
                            <CardTitle className="text-2xl font-semibold text-gray-800">
                                500 – Internal Server Error
                            </CardTitle>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <p className="text-gray-500 mb-6">
                            Oops! Something went wrong on our end. Please try again later or
                            return to the homepage.
                        </p>
                        <div className="flex justify-center gap-3">
                            <Link href="/">
                                <Button variant="default" className="rounded-full cursor-pointer">
                                    Go Home
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                className="rounded-full cursor-pointer"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <p className="mt-8 text-sm text-gray-400">
                &copy; {new Date().getFullYear()} MiniPOS. All rights reserved.
            </p>
        </div>
    );
}
