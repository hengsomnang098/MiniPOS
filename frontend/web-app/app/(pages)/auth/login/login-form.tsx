'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

// ✅ Validation Schema
const formSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { toast } = useToast();
    const params = useSearchParams();
    const alert = params.get("alert");  

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: FormData) => {
        setError(null);
        setLoading(true);

        const result = await signIn('credentials', {
            redirect: false,
            email: data.email,
            password: data.password,
        });

        setLoading(false);

        if (result?.error) {
            setError(result.error || 'Invalid email or password');
            return;
        }

        router.push('/');
    };

    useEffect(() => {
        if (alert === "unauthorized") {
            toast({
                title: "Session expired",
                description: "Please log in again to continue.",
                variant: "destructive",
            });
        }
    }, [alert, toast]);

    return (
        <div
            className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#002a4a] via-[#003b66] to-[#004d80] text-slate-100 relative overflow-hidden"
        >
            {/* Background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,200,255,0.15),transparent_60%)]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md px-4"
            >
                <Card className="relative backdrop-blur-xl bg-[#001a33]/70 border border-cyan-500/20 shadow-[0_0_25px_rgba(0,120,200,0.2)] rounded-2xl overflow-hidden">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(0,180,255,0.3)]">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-slate-300/80 mt-2">
                            Sign in to access your dashboard
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent className="space-y-5">
                            {/* Email */}
                            <div>
                                <Label htmlFor="email" className="text-cyan-200">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register('email')}
                                    className="mt-2 bg-[#002244]/60 border-cyan-600/30 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <Label htmlFor="password" className="text-cyan-200">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register('password')}
                                    className="mt-2 bg-[#002244]/60 border-cyan-600/30 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Error Alert */}
                            {error && (
                                <Alert variant="destructive" className="bg-red-900/30 border-red-700/30 text-red-200">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-3 mt-2">
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    type="submit"
                                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-[0_0_15px_rgba(0,160,255,0.3)]"
                                    disabled={loading}
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </Button>
                            </motion.div>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
