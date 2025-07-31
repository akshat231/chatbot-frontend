'use client';

import '../global.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash } from "lucide-react";

interface Bot {
    botId: string;
    botName: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [bots, setBots] = useState<Bot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newBotName, setNewBotName] = useState('');
    const [creating, setCreating] = useState(false);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    useEffect(() => {
        const tokenObject = localStorage.getItem('auth_token');
        const parsedTokenObject = tokenObject ? JSON.parse(tokenObject) : null;
        const token = parsedTokenObject?.token;
        const expiresAt = parsedTokenObject?.expiresAt;
        if (!token || !expiresAt || new Date() > new Date(expiresAt)) {
            router.push('/login');
            return;
        }

        const fetchBots = async () => {
            try {
                const res = await fetch(`${baseUrl}/api/bot/getBots`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error('Failed to fetch bots');

                const data = await res.json();
                setBots(data.data.bots); // expects each bot to have id and botName
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBots();
    }, [router, newBotName]);

    const handleDeleteBot = async (botId: string, botName: string) => {
        const tokenObject = localStorage.getItem("auth_token");
        const parsedTokenObject = tokenObject ? JSON.parse(tokenObject) : null;
        const token = parsedTokenObject?.token;
        const expiresAt = parsedTokenObject?.expiresAt;
        if (!token || !expiresAt || new Date() > new Date(expiresAt)) {
            router.push('/login');
            return;
        }
        try {
            const res = await fetch(`${baseUrl}/api/bot/deleteBot`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ botId, name: botName }),
            });

            if (!res.ok) throw new Error("Failed to delete bot");

            // remove from local state
            setBots((prev) => prev.filter((b) => b.botId !== botId));
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error("Error deleting bot:", err);
                alert("Could not delete bot: " + err.message);
            } else {
                console.error("Unknown error deleting bot:", err);
                alert("Could not delete bot: An unknown error occurred");
            }
        }
    };

    const handleCreateBot = async () => {
        if (!newBotName.trim()) return;

        setCreating(true);
        const tokenObject = localStorage.getItem('auth_token');
        const parsedTokenObject = tokenObject ? JSON.parse(tokenObject) : null;
        const token = parsedTokenObject?.token;

        try {
            const res = await fetch(`${baseUrl}/api/bot/createBot?name=${newBotName}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.message || 'Failed to create bot');

            const createdBot = result.data; // expects to contain id and botName
            setBots((prev) => [...prev, createdBot]);
            setNewBotName('');
            setShowModal(false);
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert('An unknown error occurred');
            }
        } finally {
            setCreating(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-200 to-pink-100 p-6 sm:p-10">
             <title>Dashboard</title>
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-extrabold text-gray-800">Your Bots</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition duration-200 shadow-md cursor-pointer"
                    >
                        + Create Bot
                    </button>
                </div>

                {loading ? (
                    <p className="text-lg text-gray-600 animate-pulse">Loading bots...</p>
                ) : error ? (
                    <p className="text-red-600 text-md">{error}</p>
                ) : bots.length === 0 ? (
                    <p className="text-gray-600 text-lg">You have no bots yet. Start by creating your first one!</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
                        {bots.map((bot) => (
                            <div
                                key={bot.botId}
                                onClick={() => router.push(`/bot/${bot.botName}__${bot.botId}`)}
                                className="relative bg-white p-6 rounded-xl hover:shadow-xl transition duration-200 shadow-indigo-600 shadow-2xl cursor-pointer group"
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteBot(bot.botId, bot.botName);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 z-10"
                                    title="Delete Bot"
                                >
                                    <Trash className="w-5 h-5 cursor-pointer" />
                                </button>
                                <h2 className="text-xl font-semibold text-gray-800 mb-1">{bot.botName}</h2>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Create a New Bot</h2>
                        <input
                            type="text"
                            placeholder="Bot Name"
                            value={newBotName}
                            onChange={(e) => setNewBotName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                        />
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateBot}
                                disabled={creating}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                            >
                                {creating ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}