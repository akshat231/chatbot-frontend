'use client';
import '../global.css';

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from 'next/navigation';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [apiError, setApiError] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [accountSignupLoading, setAccountSignupLoading] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

        if (e.target.name === "password") {
            validatePassword(e.target.value);
        }
    };

    useEffect(() => {
        localStorage.removeItem('verify_token'); // Clear any existing token on signup page load
        localStorage.removeItem('auth_token');
    }, []);

    const validatePassword = (password: string) => {
        if (!passwordRegex.test(password)) {
            setPasswordError(
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
            );
        } else {
            setPasswordError("");
        }
    };

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (passwordError) return;

        setAccountSignupLoading(true); // start loader

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const res = await fetch(`${baseUrl}/api/user/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (res.ok) {
                console.log("Signup successful:", result);
                const token = result.data.token;
                const tokenObject = {
                    token,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour expiration
                };
                localStorage.setItem('verify_token', JSON.stringify(tokenObject));
                router.push('/verify'); // redirect
            } else if (res.status === 409) {
                setApiError("Email is already registered");
            } else {
                setApiError(result.message || "An unknown error occurred");
            }
        } catch (err) {
            console.error("Signup error:", err);
            setApiError("Failed to sign up. Please try again.");
        } finally {
            setAccountSignupLoading(false); // stop loader on error or completion
        }
    };



    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 flex items-center justify-center p-4">
             <title>Signup</title>
            {(accountSignupLoading || loginLoading) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl shadow-xl flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            )}

            <div className="relative w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">Sign Up</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className={`w-full border rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${passwordError ? "border-red-500 focus:ring-red-500" : "focus:ring-indigo-500"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={togglePassword}
                                className="absolute right-3 top-2.5 text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {passwordError && (
                            <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className={`w-full py-2 rounded-xl font-semibold transition cursor-pointer ${accountSignupLoading
                            ? 'bg-indigo-400 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                        disabled={!!passwordError || accountSignupLoading}
                    >
                        {accountSignupLoading ? "Creating Account..." : "Create Account"}
                    </button>

                </form>
                {apiError && (
                    <p className="text-red-600 text-center mt-4 text-sm font-medium">{apiError}</p>
                )}
                <p className="text-sm text-center mt-6">
                    Already have an account?{' '}
                    <button
                        onClick={() => {
                            setLoginLoading(true);
                            router.push('/login');
                            setLoginLoading(false);
                        }}
                        className="text-indigo-600 hover:underline font-medium disabled:opacity-50 cursor-pointer"
                        disabled={loginLoading}
                    >
                        {loginLoading ? "Redirecting..." : "Log in instead"}
                    </button>
                </p>
                <div className="absolute inset-0 -z-10 animate-pulse bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-200 rounded-2xl blur-2xl opacity-40"></div>
            </div>
        </main>
    );
}