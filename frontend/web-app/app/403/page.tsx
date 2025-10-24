"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LockKeyhole } from "lucide-react";

export default function ForbiddenPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 px-4">
            <Card className="w-full max-w-md shadow-lg border border-slate-200">
                <CardHeader className="flex flex-col items-center text-center space-y-4">
                    <div className="bg-slate-900 text-white p-4 rounded-full">
                        <LockKeyhole className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-slate-900">
                        403 — Access Denied
                    </CardTitle>
                </CardHeader>

                <CardContent className="text-center">
                    <p className="text-slate-600 mb-6">
                        You don’t have permission to access this page.<br />
                        If you think this is a mistake, please contact your administrator.
                    </p>

                    <Button asChild className="w-full">
                        <Link href="/dashboard">Go Back to Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>

            <p className="mt-6 text-sm text-slate-400">
                &copy; {new Date().getFullYear()} Mini POS — All rights reserved.
            </p>
        </div>
    );
}
