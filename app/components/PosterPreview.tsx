'use client';

import React, { useEffect, useState, useRef } from 'react'; // Aggiunto useRef
import { StyleTemplate } from '@/app/actions/analyzeStyle';

export interface PosterData {
  title: string;
  description: string;
  agenda: string;
  location?: string;
  imageUrl: string | null;
  showBackground: boolean;
  layout?: StyleTemplate['layout'];
  overlayColor?: string; // <--- AGGIUNGI QUESTO SE MANCA (col punto interrogativo se opzionale)
}

interface PosterPreviewProps {
  data: PosterData;
  isAnalizing?: boolean;
}

// Funzione helper per sanitizzare il titolo
const getSafeFilename = (title?: string) => {
  if (!title) return 'poster.pdf';
  const safeTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-');

  return `${safeTitle}.pdf`;
};

const PosterPreview = ({ data, isAnalizing = false }: PosterPreviewProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs per gestire debounce e cambio immagine
  const lastImageUrlRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      // SE STA ANALIZZANDO, FERMATI!
      if (isAnalizing) return;

      // 1. CONTROLLO PREVENTIVO
      if (!data.title || !data.description) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("Generazione PDF..."); // Debug log

        const res = await fetch('/api/poster', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${res.status}`);
        }

        const blob = await res.blob();
        if (cancelled) return;

        // Se c'era un URL precedente, puliscilo (opzionale ma buona pratica)
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);

        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

        // Aggiorna ref immagine
        lastImageUrlRef.current = data.imageUrl;

      } catch (e: any) {
        console.error("Preview error:", e);
        if (!cancelled) setError(e.message || 'Errore sconosciuto');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // LOGICA DEBOUNCE INTELLIGENTE
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Se l'immagine è cambiata rispetto all'ultimo render riuscito,
    // usa un debounce brevissimo (100ms) per aggiornare subito.
    // Altrimenti (solo testo cambiato), usa debounce standard (600ms).
    const isImageChange = data.imageUrl !== lastImageUrlRef.current;
    const debounceTime = isImageChange ? 100 : 600;

    timeoutRef.current = setTimeout(() => {
      generate();
    }, debounceTime);

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [
    isAnalizing,
    data.title,
    data.description,
    data.agenda,
    data.location,
    data.showBackground,
    data.imageUrl, // <--- Assicurati che questo sia qui!
    data.overlayColor, // Aggiunto per completezza se cambia colore overlay
    JSON.stringify(data.layout)
  ]);


  // STATO 1: Dati mancanti
  if (!data.title || !data.description) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 p-8 text-center">
        <div className="text-4xl mb-4">✍️</div>
        <p className="font-medium text-lg">In attesa di contenuti</p>
        <p className="text-sm">Inserisci almeno Titolo e Descrizione per generare l'anteprima.</p>
      </div>
    );
  }

  // STATO 2: Caricamento INIZIALE (solo se non c'è ancora un PDF)
  if (loading && !pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-slate-50 border rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Generazione PDF in corso...</p>
      </div>
    );
  }

  // OPZIONALE: Overlay Analisi
  if (isAnalizing) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-slate-50 border rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-purple-700 font-medium animate-pulse">Analisi stile in corso...</p>
        </div>
      </div>
    );
  }

  // STATO 3: Errore
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-lg font-bold text-red-700 mb-2">Errore Generazione</h3>
        <p className="text-red-600 mb-6 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded hover:bg-red-50"
        >
          Riprova
        </button>
      </div>
    );
  }

  // STATO 4: Anteprima pronta
  if (!pdfUrl) return null;

  const filename = getSafeFilename(data.title);

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* Contenitore Preview */}
      <div className="w-full bg-slate-100 rounded-xl border border-slate-200 p-4 relative">

        {/* Overlay di caricamento trasparente (quando rigenera con PDF già visibile) */}
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/50 flex items-center justify-center backdrop-blur-[1px] rounded-xl">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="relative w-full shadow-2xl bg-white aspect-[1/1.414] overflow-hidden rounded-sm">
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            className="absolute border-none"
            title="PDF Preview"
            style={{
              width: '104%',
              height: '104%',
              top: '-2%',
              left: '-2%',
              pointerEvents: 'auto'
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-center">
        <a
          href={pdfUrl}
          download={filename}
          className="flex flex-col items-center group"
        >
          <div className="flex items-center gap-2 px-8 py-3 bg-blue-600 group-hover:bg-blue-700 text-white font-bold rounded-full shadow-lg transition-all transform group-hover:scale-105 group-active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Scarica PDF</span>
          </div>
          <span className="mt-2 text-xs text-slate-400 font-mono">{filename}</span>
        </a>
      </div>
    </div>
  );
};

export default PosterPreview;
