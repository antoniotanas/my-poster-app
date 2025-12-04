'use client';

import React, { useState, useTransition } from 'react';
//import dynamic from 'next/dynamic';
// Usa l'import standard
import PosterPreview from './components/PosterPreview';

// Import actions
import { analyzeStyle, StyleTemplate } from './actions/analyzeStyle';
import { generateBackgroundWithStyle } from './actions/generateImage';

// Import PDF components
// import { PosterDocument } from './documents/PosterDocument';

import { MOCK_REFERENCE_URL, MOCK_STYLE, MOCK_IMAGE_URL } from '@/app/data/mockData';
// SWITCH PER MODALITÀ SVILUPPO (Mettilo a true quando lavori sul PDF)
const USE_DEV_MOCK = true;


// In cima a page.tsx
//const PosterPreview = dynamic(
//  () => import('./components/PosterPreview'),
//  { ssr: false, loading: () => <p>Caricamento...</p> }
//);

export default function Home() {
  // --- STATE ---
  const [isPending, startTransition] = useTransition();

  // Form Data
  // Inizializza gli stati con i MOCK se il flag è attivo
  const [title, setTitle] = useState<string>(USE_DEV_MOCK && MOCK_STYLE?.texts ? MOCK_STYLE.texts.title : "My Event");
  const [description, setDescription] = useState<string>(USE_DEV_MOCK && MOCK_STYLE?.texts ? MOCK_STYLE.texts.description : "An amazing techno party on the beach.");
  const [location, setLocation] = useState<string>(USE_DEV_MOCK && MOCK_STYLE?.texts ? MOCK_STYLE.texts.location : "An amazing techno party on the beach.");
  const [agenda, setAgenda] = useState<string>(USE_DEV_MOCK && MOCK_STYLE?.texts ? MOCK_STYLE.texts.agenda.join('\n') : "10:00 - Welcome\n12:00 - Music Start");
  const [stylePrompt, setStylePrompt] = useState<string>(USE_DEV_MOCK && MOCK_STYLE ? MOCK_STYLE.styleDescription : '');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(USE_DEV_MOCK ? MOCK_IMAGE_URL : null);
  const [extractedStyle, setExtractedStyle] = useState<StyleTemplate | null>(USE_DEV_MOCK ? MOCK_STYLE : null);
  // Stato per l'URL dell'anteprima locale
  const [previewUrl, setPreviewUrl] = useState<string | null>(USE_DEV_MOCK ? MOCK_REFERENCE_URL : null);

  // --- HANDLERS ---

  // 1. Analyze Style (Step 1)
  // Aggiorna la funzione handleStyleUpload
  const handleStyleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Crea URL locale per anteprima immediata
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    startTransition(async () => {
      // Convert to Base64 for Server Action
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const result = await analyzeStyle(base64);

        if (result) {
          //console.log("DATA FROM AI:", result); 
          setExtractedStyle(result);
          setStylePrompt(result.styleDescription);

          if (result.texts) {
            setTitle(result.texts.title || "");
            setDescription(result.texts.description || "");
            setLocation(result.texts.location || "");
            setAgenda(result.texts.agenda ? result.texts.agenda.join('\n') : "");
          }
        } else {
          alert("Failed to analyze style.");
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // 2. Generate Background (Step 2)
  const handleGenerate = async () => {
    startTransition(async () => {
      const styleDescription =
        stylePrompt && stylePrompt.trim().length > 0
          ? stylePrompt
          : extractedStyle?.styleDescription ||
          'Abstract, modern, high-quality event poster background';

      const url = await generateBackgroundWithStyle({
        userTopic: title + ' - ' + description,
        styleDescription,
      });

      if (url) {
        setGeneratedImageUrl(url);
      } else {
        alert('Failed to generate image.');
      }
    });
  };
  // Data object for PDF
  const posterData = {
    title,
    description,
    agenda,
    location,
    imageUrl: generatedImageUrl,
    overlayColor: extractedStyle?.suggestedOverlayColor || 'rgba(0,0,0,0.4)',
    layout: extractedStyle?.layout,
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
          {/* NUOVO: Anteprima Immagine Caricata */}
          {previewUrl && (
            <div className="mt-3 relative group">
              <p className="text-xs text-gray-500 mb-1">Immagine caricata:</p>
              <div className="w-32 h-48 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                <img
                  src={previewUrl}
                  alt="Reference Style"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {extractedStyle && (
            <div className="text-xs text-green-600 font-medium animate-pulse border-l-2 border-green-500 pl-2 mt-2">
              ✓ Stile Estratto: "{extractedStyle.styleDescription.slice(0, 30)}..."
            </div>
          )}
        </div>
        {/* Section: Style Prompt (editabile) */}
        <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h2 className="font-semibold text-gray-700">
            1.b Prompt di Stile (editabile)
          </h2>
          <p className="text-xs text-slate-500 mb-1">
            Questo testo descrive lo stile grafico che verrà usato per generare lo sfondo. Puoi modificarlo liberamente.
          </p>
          <textarea
            value={stylePrompt}
            onChange={(e) => setStylePrompt(e.target.value)}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Section 2: Contenuto Evento */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-700 border-b pb-2">
            2. Contenuto Evento
          </h2>

          {/* Titolo Evento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titolo Evento
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Descrizione / Vibe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione / Vibe
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* NUOVO: Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Agenda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agenda
            </label>
            <textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono text-sm"
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

      {/* Colonna Destra */}
      <div className="w-full"> {/* Rimuovi lg:w-1/2 o simili se fissi, usa grid-cols-1 lg:grid-cols-2 nel parent */}

        {/* Se c'è uno sticky, ok, ma assicurati che sia w-full */}
        <div className="lg:sticky lg:top-8 h-fit w-full">

          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>🎨</span> Anteprima & Export
          </h2>

          {/* QUESTO DIV DEVE ESSERE w-full */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 w-full">
            <PosterPreview data={posterData} />
          </div>

        </div>
      </div>s    </main>
  );
}
