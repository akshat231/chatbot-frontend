'use client';

import './global.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRedirect = (path: string) => {
    setLoading(true);
    setTimeout(() => {
      router.push(path);
    }, 100); // short delay so loader appears visually
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 relative">
      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="text-center py-20 px-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Turn Your Documents into Smart, Searchable AI Chatbots
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Upload PDFs, DOCs, TXT files, URLs, or raw text – create a bot that answers from your content.
        </p>
        <div className="space-x-4">
          <button
            className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl shadow cursor-pointer"
            onClick={() => handleRedirect('/signup')}
          >
            Create Your First Bot
          </button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          {[
            'Create a Bot',
            'Upload Content (PDF, DOCX, TXT, URL, or Text)',
            'AI Processes Your Content',
            'Chat with Your Bot',
          ].map((step, i) => (
            <div key={i} className="p-6 bg-gray-50 rounded-xl shadow-indigo-600 shadow-2xl">
              <div className="text-4xl font-bold text-indigo-600 mb-4">{i + 1}</div>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-gray-100 py-20 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Use Cases</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
          {[
            'Internal Knowledge Bases',
            'Client Support Docs',
            'Research Assistants',
            'Course Materials',
            'Team Wikis',
            'Policy & Legal Docs',
          ].map((useCase, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-indigo-600 shadow-2xl">
              {useCase}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-700 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Build Your First AI Bot?</h2>
        <p className="mb-8">Turn static docs into dynamic conversations.</p>
        <button
          className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl cursor-pointer"
          onClick={() => handleRedirect('/signup')}
        >
          Start Free
        </button>
      </section>
    </main>
  );
}
