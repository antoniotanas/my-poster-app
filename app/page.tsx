'use client';

import React, { useState, useTransition } from 'react';
import PosterPreview, { PosterData } from './components/PosterPreview';
import SocialPreview from './components/SocialPreview';

// Action aggiornata (rinominata per chiarezza nell'uso)
import { generateImage } from './actions/generateImages';
import { analyzeStyle, StyleTemplate } from './actions/analyzeStyle';

import { MOCK_REFERENCE_URL, MOCK_STYLE, MOCK_IMAGE_URL } from '@/app/data/mockData';

const USE_DEV_MOCK = true;

// Interfaccia per la gallery
interface Creation {
  id: string;
  url: string;
  format: 'A4' | 'POST';
}

export default function Home() {
  // --- STATE ---
  const [isPending, startTransition] = useTransition(); // Usato per Analisi Stile
  const [isGenerating, startGenerateTransition] = useTransition(); // Usato per Generazione Immagini

  // Tabs State
  const [activeTab, setActiveTab] = useState<'pdf' | 'social'>('pdf');

  // Form Data
  const [title, setTitle] = useState<string>(USE_DEV_MOCK && MOCK_STYLE?.texts ? MOCK_STYLE.texts.title : "My Event");
  const [description, setDescription] = useState<string>(USE_DEV_MOCK && MOCK_STYLE?.texts ? MOCK_STYLE.texts.description : "An amazing techno party on the beach.");
  const [location, setLocation] = useState<string>(USE_DEV_MOCK && MOCK_STYLE?.texts ? MOCK_STYLE.texts.location : "Ustica Island, Sicily");
  const [agenda, setAgenda] = useState<string>(USE_DEV_MOCK && MOCK_STYLE?.texts ? MOCK_STYLE.texts.agenda.join('\n') : "10:00 - Welcome\n12:00 - Music Start");
  const [stylePrompt, setStylePrompt] = useState<string>(USE_DEV_MOCK && MOCK_STYLE ? MOCK_STYLE.styleDescription : '');

  // Assets & Styles
  const [extractedStyle, setExtractedStyle] = useState<StyleTemplate | null>(USE_DEV_MOCK ? MOCK_STYLE : null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(USE_DEV_MOCK ? MOCK_REFERENCE_URL : null);

  // Active Images (Separati per formato)
  const [activePdfBgUrl, setActivePdfBgUrl] = useState<string | null>(USE_DEV_MOCK ? MOCK_IMAGE_URL : null);
  const [activeSocialUrl, setActiveSocialUrl] = useState<string | null>(null);

  // Creations Gallery
  const [creations, setCreations] = useState<Creation[]>(
    USE_DEV_MOCK ? [{ id: 'mock-1', url: MOCK_IMAGE_URL, format: 'A4' }] : []
  );

  // --- HANDLERS ---

  // 1. Analyze Style (Invariato)
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

  // 2. Generate A4 Background (Sfondo Verticale)
  const handleGenerateA4 = () => {
    startGenerateTransition(async () => {
      const url = await generateImage({
        userTopic: `${title} - ${description}`,
        styleDescription: stylePrompt || extractedStyle?.styleDescription || 'modern event poster',
        format: 'A4',
        //includeText: false
      });

      if (url) {
        const newCreation: Creation = { id: crypto.randomUUID(), url, format: 'A4' };
        setCreations(prev => [newCreation, ...prev]);
        setActivePdfBgUrl(url);
        setActiveTab('pdf'); // Switch to PDF tab
      } else {
        alert('Failed to generate A4 background.');
      }
    });
  };

  // 3. Generate Social Post (Orizzontale con testo)
  const handleGenerateSocial = () => {
    startGenerateTransition(async () => {
      const url = await generateImage({
        userTopic: `${title} - ${description}`,
        styleDescription: stylePrompt || extractedStyle?.styleDescription || 'modern social banner',
        format: 'POST'
        /*includeText: true,
        textData: {// Passiamo i testi per il render AI
          title,
          description,
          location,
          agenda, // Passato come stringa unica con \n
        }*/
      });

      if (url) {
        const newCreation: Creation = { id: crypto.randomUUID(), url, format: 'POST' };
        setCreations(prev => [newCreation, ...prev]);
        setActiveSocialUrl(url);
        setActiveTab('social'); // Switch to Social tab
      } else {
        alert('Failed to generate Social Post.');
      }
    });
  };

  // 4. Select from Gallery
  const handleSelectCreation = (creation: Creation) => {
    if (creation.format === 'A4') {
      setActivePdfBgUrl(creation.url);
      setActiveTab('pdf');
    } else {
      setActiveSocialUrl(creation.url);
      setActiveTab('social');
    }
  };

  // Data object for PDF Preview
  const posterData: PosterData = {
    title, description, agenda, location,
    imageUrl: activePdfBgUrl,
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
          {/* COLONNA SINISTRA: PREVIEW (Sticky) - 7 su 12 colonne      */}
          {/* --------------------------------------------------------- */}
          <div className="lg:col-span-7 lg:sticky lg:top-8 h-fit w-full order-first lg:order-first z-10">

            {/* TABS Navigation */}
            <div className="flex bg-slate-200/50 rounded-t-2xl p-1 gap-1 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('pdf')}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'pdf'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:bg-white/50'
                  }`}
              >
                📄 A4 Poster
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'social'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-slate-500 hover:bg-white/50'
                  }`}
              >
                🖼️ Social Post
              </button>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="bg-white p-4 rounded-b-2xl shadow-xl border border-slate-200 w-full min-h-[600px]">

              {/* TAB 1: PDF PREVIEW */}
              <div className={activeTab === 'pdf' ? 'block' : 'hidden'}>
                <PosterPreview data={posterData} isAnalizing={isPending} />
              </div>

              {/* TAB 2: SOCIAL PREVIEW */}
              <div className={activeTab === 'social' ? 'block' : 'hidden'}>
                <SocialPreview
                  imageUrl={activeSocialUrl}
                  loading={isGenerating && activeTab === 'social'}
                  texts={{
                    title,
                    description,   // <--- aggiunto
                    location,
                    agenda,
                  }}
                  overlayColor={extractedStyle?.suggestedOverlayColor}
                />             {activeTab === 'social' && activeSocialUrl && (
                  <div className="mt-4 p-3 bg-purple-50 text-purple-800 text-xs rounded border border-purple-100">
                    <strong>Nota:</strong> I testi sono stati renderizzati dall'IA. Se ci sono errori, rigenera l'immagine.
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* COLONNA DESTRA: CONTROLLI (Scrollable) - 5 su 12 colonne  */}
          {/* --------------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-6">

            {/* Section 1: Style & Upload */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                <span>📂</span> 1. Stile & Atmosfera
              </h2>
              <div className="space-y-4">
                {/* Upload Input */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStyleUpload}
                    disabled={isPending}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {/* Reference Preview */}
                  {previewUrl && (
                    <div className="mt-4 flex gap-4 items-start">
                      <img src={previewUrl} alt="Ref" className="w-16 h-20 object-cover rounded border border-slate-300" />
                      {extractedStyle && (
                        <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200 flex-1">
                          ✓ Stile analizzato: <span className="italic">"{extractedStyle.styleDescription.slice(0, 50)}..."</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Prompt Editabile */}
                <textarea
                  value={stylePrompt}
                  onChange={(e) => setStylePrompt(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrizione stile..."
                />
              </div>
            </section>

            {/* Section 2: Contenuti */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                <span>📝</span> 2. Contenuti Evento
              </h2>
              <div className="space-y-3">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded" placeholder="Titolo Evento" />
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-2 border rounded" placeholder="Location" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full p-2 border rounded" placeholder="Descrizione breve" />
                <textarea value={agenda} onChange={(e) => setAgenda(e.target.value)} rows={4} className="w-full p-2 border rounded font-mono text-sm" placeholder="Agenda / Lineup" />
              </div>
            </section>

            {/* Section 3: CREATIONS GALLERY (NUOVO) */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-4 text-slate-800">Galleria Creazioni</h2>
              {creations.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {creations.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectCreation(item)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${(item.url === activePdfBgUrl || item.url === activeSocialUrl)
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-transparent hover:border-slate-300'
                        }`}
                    >
                      <img src={item.url} className="w-full h-full object-cover" />
                      <span className={`absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded text-white ${item.format === 'A4' ? 'bg-blue-600' : 'bg-purple-600'
                        }`}>
                        {item.format}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  Le tue generazioni appariranno qui.
                </div>
              )}
            </section>

            {/* Section 4: ACTION BUTTONS */}
            <section className="grid grid-cols-1 gap-3">
              {/* Generate A4 */}
              <button
                onClick={handleGenerateA4}
                disabled={isGenerating}
                className="flex items-center justify-center gap-3 bg-white border-2 border-blue-100 hover:border-blue-500 hover:bg-blue-50 text-blue-700 font-bold py-3 px-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating && activeTab === 'pdf' ? <div className="animate-spin w-5 h-5 border-2 border-blue-600 rounded-full border-t-transparent" /> : <span>📄</span>}
                Genera Sfondo A4
              </button>

              {/* Generate Social */}
              <button
                onClick={handleGenerateSocial}
                disabled={isGenerating}
                className="flex items-center justify-center gap-3 bg-white border-2 border-purple-100 hover:border-purple-500 hover:bg-purple-50 text-purple-700 font-bold py-3 px-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating && activeTab === 'social' ? <div className="animate-spin w-5 h-5 border-2 border-purple-600 rounded-full border-t-transparent" /> : <span>✨</span>}
                Genera Post Social
              </button>
            </section>

          </div>

        </div>
      </div>
    </main>
  );
}
