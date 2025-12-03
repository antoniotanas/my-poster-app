'use client';

import React, { useState, useTransition } from 'react';
import dynamic from 'next/dynamic';

// Import actions
import { analyzeStyle, ExtractedStyle } from './actions/analyzeStyle';
import { generateBackgroundWithStyle } from './actions/generateImage';

// Import PDF components
import { PosterDocument } from './documents/PosterDocument';


// In cima a page.tsx
const PosterPreviewDynamic = dynamic(
  () => import('./components/PosterPreview'),
  { ssr: false, loading: () => <p>Caricamento...</p> }
);

export default function Home() {
  // --- STATE ---
  const [isPending, startTransition] = useTransition();

  // Form Data
  const [title, setTitle] = useState("My Event");
  const [description, setDescription] = useState("An amazing techno party on the beach.");
  const [agenda, setAgenda] = useState("10:00 - Welcome\n12:00 - Music Start");

  // Style State
  const [extractedStyle, setExtractedStyle] = useState<ExtractedStyle | null>(null);
 // IMPOSTA L'IMMAGINE DI DEFAULT QUI:
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    "https://res.cloudinary.com/df6c6fogf/image/upload/v1764764285/my-poster-app/vertex-generations/img_1764764284010_708.png"
  );
  
  // --- HANDLERS ---

  // 1. Analyze Style (Step 1)
  const handleStyleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      // Convert to Base64 for Server Action
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const result = await analyzeStyle(base64);

        if (result) {
          setExtractedStyle(result);
          console.log("Style Extracted:", result);
        } else {
          alert("Failed to analyze style.");
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // 2. Generate Background (Step 2)
  const handleGenerate = () => {
    startTransition(async () => {
      // If we have an extracted style, use it. Otherwise use a default generic style.
      const stylePrompt = extractedStyle?.styleDescription ||
        "Abstract, modern, clean, high quality event poster background";

      const url = await generateBackgroundWithStyle({
        userTopic: `${title} - ${description}`,
        styleDescription: stylePrompt
      });

      if (url) {
        setGeneratedImageUrl(url);
      } else {
        alert("Failed to generate image.");
      }
    });
  };

  // Data object for PDF
  const posterData = {
    title,
    description,
    agenda,
    imageUrl: generatedImageUrl,
    // Use the overlay color suggested by AI, or fallback to default
    overlayColor: extractedStyle?.overlayColor || 'rgba(0,0,0,0.4)',
    showBackground: true
  };

  return (
    <main className="flex min-h-screen flex-col md:flex-row p-6 gap-6 bg-gray-50 font-sans">

      {/* --- LEFT COLUMN: CONTROLS --- */}
      <div className="w-full md:w-1/3 space-y-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">

        <h1 className="text-2xl font-bold text-gray-800 mb-6">AI Poster Generator</h1>

        {/* Section 1: Style Reference */}
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h2 className="font-semibold flex items-center gap-2 text-gray-700">
            <span>📂</span> 1. Carica Stile di Riferimento
          </h2>
          <p className="text-xs text-slate-500">
            Carica un poster che ti piace. L'IA copierà lo stile per il tuo sfondo.
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={handleStyleUpload}
            disabled={isPending}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 cursor-pointer"
          />

          {extractedStyle && (
            <div className="text-xs text-green-600 font-medium animate-pulse border-l-2 border-green-500 pl-2 mt-2">
              ✓ Stile Estratto: "{extractedStyle.styleDescription.slice(0, 30)}..."
            </div>
          )}
        </div>

        {/* Section 2: Content */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-700 border-b pb-2">2. Contenuto Evento</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titolo Evento</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione / Vibe</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
            <textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Section 3: Generate Action */}
        <button
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          onClick={handleGenerate}
          disabled={isPending}
        >
          {isPending ? (
            <><span>⏳</span> Elaborazione in corso...</>
          ) : (
            <><span>✨</span> Genera Poster</>
          )}
        </button>
      </div>

      {/* --- RIGHT COLUMN: PREVIEW --- */}
      <div className="w-full md:w-2/3 bg-slate-200 rounded-xl border border-slate-300 flex flex-col items-center justify-center p-8 min-h-[600px]">

        <h2 className="text-xl font-bold text-slate-700 mb-4">Anteprima & Export</h2>

        {/* Passiamo il documento come prop "document" (non children) perché usePDF lo vuole così */}
        <PosterPreviewDynamic document={<PosterDocument data={posterData} />} />

      </div>
    </main>
  );
}
