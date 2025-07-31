'use client';
import '../global.css';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyOtpPage() {
    const router = useRouter();

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [resendDisabled, setResendDisabled] = useState(false);
    const [verifyToken, setVerifyToken] = useState<string | null>(null);
    const [timer, setTimer] = useState(60);
    const [resendLoading, setResendLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtp(e.target.value);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setVerifyLoading(true);


        try {
            const res = await fetch(`${baseUrl}/api/user/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${verifyToken}` },
                body: JSON.stringify({ otp }),
            });

            const result = await res.json();
            console.log(result, res);

            if (res.ok) {
                router.push('/login');
                localStorage.removeItem('verify_token');
            } else {
                switch (res.status) {
                    case 400:
                        setError('Invalid OTP. Please try again.');
                        break;
                    case 404:
                        setError('User not found. Please register again.');
                        break;
                    case 429:
                        setError('Too many attempts. Signup Again.');
                        localStorage.removeItem('verify_token');
                        setTimeout(() => {
                                router.push('/signup');
                            }, 2500); // 2.5 seconds delay
                        break;
                    default:
                        setError(result.message || 'Verification failed.');
                        break;
                }
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setResendLoading(true);
            setResendDisabled(true);
            setTimer(60);

            const res = await fetch(`${baseUrl}/api/user/regenerateOtp`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${verifyToken}`,
                },
            });

            if (!res.ok) {
                const result = await res.json();
                setError(result.message || 'Failed to resend OTP');
            }
        } catch (err) {
            setError('Could not resend OTP. Please try again later.');
        } finally {
            setResendLoading(false);
        }
    };

    useEffect(() => {
        const tokenObject = localStorage.getItem('verify_token');

        try {
            const parsed = tokenObject ? JSON.parse(tokenObject) : null;

            if (parsed?.token && parsed?.expiresAt) {
                const now = new Date();
                const expiry = new Date(parsed.expiresAt);
                if (now <= expiry) {
                    setVerifyToken(parsed.token);
                    return;
                }
            }

            router.push('/');
        } catch {
            router.push('/');
        }
    }, [router]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (resendDisabled) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setResendDisabled(false);
                        return 60;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [resendDisabled]);

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 flex items-center justify-center p-4">
             <title>Verify OTP</title>
             {(resendLoading || verifyLoading) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl shadow-xl flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            )}
            <div className="relative w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">Verify OTP</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Enter OTP</label>
                        <input
                            type="text"
                            name="otp"
                            value={otp}
                            onChange={handleChange}
                            required
                            className={`w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-indigo-500'
                                }`}
                        />
                        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700 transition cursor-pointer"
                    >
                        Verify
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={handleResend}
                        disabled={resendDisabled}
                        className={`text-sm font-medium ${resendDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:underline'
                            }`}
                    >
                        {resendDisabled ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                    </button>
                </div>

                <div className="absolute inset-0 -z-10 animate-pulse bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-200 rounded-2xl blur-2xl opacity-40"></div>
            </div>
        </main>
    );
}
