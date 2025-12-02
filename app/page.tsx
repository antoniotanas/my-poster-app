// app/page.tsx
'use client';

import React, { useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { generateBackground } from './actions/generateImage';
import { PosterDocument } from './documents/PosterDocument';
import './globals.css';

const PDFViewerDynamic = dynamic(
  () => import('./components/PDFViewerWrapper'),
  { ssr: false, loading: () => <div className="h-[600px] bg-gray-100 animate-pulse flex items-center justify-center text-gray-500 font-medium">Loading PDF Engine...</div> }
);

// --- NEW: Define a reliable placeholder image URL (A4 portrait ratio) ---
const PLACEHOLDER_IMAGE_URL = "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3";

export default function Home() {
  const [formData, setFormData] = useState({
    title: 'AI in 2025 Summit',
    agenda: '09:00 AM - Keynote: The Future of Models\n10:30 AM - Workshop: Prompt Engineering\n01:00 PM - Panel: Ethics & Safety\n03:00 PM - Closing Remarks',
    description: 'A futuristic conference discussing the advancements of generative models in professional workflows. Exploring the boundaries of creativity and logic.',
  });

  // --- CHANGED: Initialize with the placeholder URL instead of null ---
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(PLACEHOLDER_IMAGE_URL);

  // State for the background toggle (defaults to true)
  const [showBackground, setShowBackground] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Determine if the switch should be active based on if we have an image URL
  // (With placeholder, this is now always true initially)
  const hasImage = !!generatedImageUrl;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        // Client-side logging
        console.log("[Client] Requesting new background generation...");
        const result = await generateBackground({
          title: formData.title,
          description: formData.description,
        });

        if (result.error) {
          console.error("[Client] Server reported error:", result.error);
          setError(result.error);
        } else if (result.url) {
          console.log(`[Client] Success. Received image URL (Length: ${result.url.length}). Updating state.`);
          // Replace the placeholder with the generated image
          setGeneratedImageUrl(result.url);
          setShowBackground(true);
        }
      } catch (err) {
          console.error("--- CRITICAL CLIENT ERROR ---", err);
          setError("An unexpected error occurred on the client.");
      }
    });
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 h-full">

      {/* LEFT COLUMN: INPUT FORM */}
      <div className="w-full md:w-1/3 bg-white p-6 rounded-xl shadow-lg h-fit border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Event Poster Creator</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">Description (Influences Background)</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 resize-none"
              required
            />
          </div>

          <div>
            <label htmlFor="agenda" className="block text-sm font-semibold text-gray-700 mb-2">Agenda (One item per line)</label>
            <textarea
              id="agenda"
              name="agenda"
              rows={6}
              value={formData.agenda}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 resize-none font-mono text-sm"
              required
            />
          </div>

          {/* UPDATED TOGGLE SWITCH UI */}
          <div className={`flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border ${hasImage ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
            <input
                type="checkbox"
                id="showBgSwitch"
                disabled={!hasImage}
                checked={hasImage && showBackground}
                onChange={(e) => setShowBackground(e.target.checked)}
                className={`w-5 h-5 rounded border-gray-300 focus:ring-blue-500 ${hasImage ? 'text-blue-600 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
            />
            <label htmlFor="showBgSwitch" className={`text-sm font-medium select-none ${hasImage ? 'text-gray-700 cursor-pointer' : 'text-gray-500 cursor-not-allowed'}`}>
                {hasImage ? 'Show Background Image' : 'Generate an image to enable background'}
            </label>
          </div>


          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-md">
              <strong>Error:</strong> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md
              ${isPending
                ? 'bg-blue-400 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }
            `}
          >
            {isPending ? (
              <span className="flex items-center justify-center">
                <span className="loader mr-3"></span>
                Generating Image...
              </span>
            ) : 'Generate New Background'}
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: PDF PREVIEW */}
      <div className="w-full md:w-2/3 bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-2xl p-4 flex items-center justify-center overflow-hidden border border-gray-700">
        <div className="h-[85vh] w-full max-w-[60vh] shadow-xl rounded-lg overflow-hidden bg-white">
             <PDFViewerDynamic className="w-full h-full">
                 <PosterDocument data={{
                   ...formData,
                   imageUrl: generatedImageUrl,
                   // Pass the combined truthy state to the PDF
                   showBackground: hasImage && showBackground
                  }} />
             </PDFViewerDynamic>
        </div>
      </div>

      </div>
    </main>
  );
}