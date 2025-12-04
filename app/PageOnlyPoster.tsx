'use client';

import React, { useState, useTransition } from 'react';
// Import standard del componente Preview (ora che usiamo iframe è sicuro)
import PosterPreview from './components/PosterPreview';

// Import actions
import { analyzeStyle, StyleTemplate } from './actions/analyzeStyle';
import { generateBackgroundWithStyle } from './actions/generateImage';

// Import Mocks
import { MOCK_REFERENCE_URL, MOCK_STYLE, MOCK_IMAGE_URL } from '@/app/data/mockData';

// SWITCH PER MODALITÀ SVILUPPO
const USE_DEV_MOCK = true;

export default function Home() {
  // --- STATE ---
  const [isPending, startTransition] = useTransition();

  // Form Data
  const [title, setTitle] = useState<string>(USE_DEV_MOCK && MOCK_STYLE?.texts ? MOCK_STYLE.texts.title : "My Event");
  const [description, setDescription] = useState<string>(USE_DEV_MOCK && MOCK_STYLE?.texts ? MOCK_STYLE.texts.description : "An amazing techno party on the beach.");
  const [location, setLocation] = useState<string>(USE_DEV_MOCK && MOCK_STYLE?.texts ? MOCK_STYLE.texts.location : "Ustica Island, Sicily");
  const [agenda, setAgenda] = useState<string>(USE_DEV_MOCK && MOCK_STYLE?.texts ? MOCK_STYLE.texts.agenda.join('\n') : "10:00 - Welcome\n12:00 - Music Start");
  
  const [stylePrompt, setStylePrompt] = useState<string>(USE_DEV_MOCK && MOCK_STYLE ? MOCK_STYLE.styleDescription : '');
  
  // Images & Style
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(USE_DEV_MOCK ? MOCK_IMAGE_URL : null);
  const [extractedStyle, setExtractedStyle] = useState<StyleTemplate | null>(USE_DEV_MOCK ? MOCK_STYLE : null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(USE_DEV_MOCK ? MOCK_REFERENCE_URL : null);

  // --- HANDLERS ---

  // 1. Analyze Style
  const handleStyleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    startTransition(async () => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const result = await analyzeStyle(base64);

        if (result) {
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

  // 2. Generate Background
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
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">
          AI Poster Generator
        </h1>

        {/* GRID LAYOUT PRINCIPALE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* --------------------------------------------------------- */}
          {/* COLONNA SINISTRA: PREVIEW (Sticky) - 5 su 12 colonne      */}
          {/* order-first assicura che su mobile sia in alto            */}
          {/* --------------------------------------------------------- */}
          <div className="lg:col-span-7 lg:sticky lg:top-8 h-fit w-full order-first lg:order-first z-10">
            
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-200 w-full">
              {/* Header Preview */}
              <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>🎨</span> Anteprima Live
                </h2>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                  A4 Portrait
                </span>
              </div>

              {/* Componente Preview */}
              <PosterPreview data={posterData} />
            </div>

          </div>


          {/* --------------------------------------------------------- */}
          {/* COLONNA DESTRA: CONTROLLI (Scrollable) - 7 su 12 colonne  */}
          {/* --------------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-6">

            {/* Section 1: Style & Upload */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                <span>📂</span> 1. Stile & Atmosfera
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                  <p className="text-sm text-slate-600 mb-2">
                    Carica un poster che ti piace. L'IA copierà lo stile.
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
                      hover:file:bg-blue-100 cursor-pointer transition-colors"
                  />
                  
                  {/* Preview Immagine Caricata */}
                  {previewUrl && (
                    <div className="mt-4 flex gap-4 items-start">
                      <img
                        src={previewUrl}
                        alt="Reference Style"
                        className="w-20 h-28 object-cover rounded-md border border-slate-300 shadow-sm"
                      />
                      {extractedStyle && (
                        <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200 flex-1">
                          <p className="font-semibold mb-1">✓ Stile analizzato!</p>
                          <p className="opacity-80 italic">"{extractedStyle.styleDescription.slice(0, 60)}..."</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Prompt Editabile */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Prompt di Stile (Editabile)
                  </label>
                  <textarea
                    value={stylePrompt}
                    onChange={(e) => setStylePrompt(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-shadow"
                    placeholder="Descrivi lo stile qui..."
                  />
                </div>
              </div>
            </section>


            {/* Section 2: Contenuti */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                <span>📝</span> 2. Contenuti Evento
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Titolo</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrizione / Sottotitolo</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Agenda / Lineup</label>
                  <textarea
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    rows={5}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm bg-slate-50"
                  />
                </div>
              </div>
            </section>


            {/* Section 3: Action Button */}
            <section>
              <button
                className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                onClick={handleGenerate}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generazione in corso...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">✨</span>
                    <span className="text-lg">Genera Nuovo Sfondo</span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-2">
                Cliccando rigenererai l'immagine di sfondo mantenendo i testi.
              </p>
            </section>

          </div>

        </div>
      </div>
    </main>
  );
}
