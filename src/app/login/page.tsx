'use client';
import '../global.css';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [signupLoading, setSignupLoading] = useState(false);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        localStorage.removeItem('verify_token');
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoginLoading(true);

        try {
            const res = await fetch(`${baseUrl}/api/user/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (res.status === 200) {
                const token = result.data.token;
                const tokenObject = {
                    token,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
                };
                const tokenString = JSON.stringify(tokenObject);
                localStorage.setItem('auth_token', tokenString);
                router.push('/dashboard');
            } else if (res.status === 404) {
                setError('User not found. Please sign up first or check your email/password.');
            } else {
                setError(result.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again later.');
        } finally {
            setLoginLoading(false); // stop loader
        }
    };


    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 flex items-center justify-center p-4">
             <title>Login</title>
            {(loginLoading || signupLoading) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl shadow-xl flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            )}
            <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">
                <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>

                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-9 text-gray-600"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition duration-200"
                    >
                        Login
                    </button>
                </form>

                <p className="text-sm text-center mt-4">
                    Not a user?{' '}
                    <button
                        type="button"
                        onClick={() => { setSignupLoading(true); router.push('/signup'); setSignupLoading(false); }}
                        className="text-indigo-600 hover:underline cursor-pointer"
                    >
                        Signup instead
                    </button>
                </p>
            </div>
        </main>
    );
}
