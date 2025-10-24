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

        // ✅ Redirect after success
        router.push('/dashboard');
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
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md shadow-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-semibold">Sign In</CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        {/* Email */}
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                {...register('email')}
                                className='mt-2'
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                {...register('password')}
                                className='mt-2'
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-2 mt-3">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>

                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
