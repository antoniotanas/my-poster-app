'use client';

import React, { useRef, useEffect, useState } from 'react';

interface SocialPreviewProps {
  imageUrl: string | null;
  loading: boolean;
  texts: {
    title: string;
    description?: string;
    location: string;
    agenda: string;
  };
  overlayColor?: string;
}

export default function SocialPreview({
  imageUrl,
  loading,
  texts,
  overlayColor = 'rgba(0,0,0,0.5)'
}: SocialPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Questa funzione disegna tutto sul Canvas invisibile e genera l'URL
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Impostiamo una risoluzione interna fissa (HD Standard)
    // Questo è il "foglio" su cui disegniamo. Non cambia mai dimensione.
    canvas.width = 1920; 
    canvas.height = 1080;

    // Funzione di disegno principale
    const draw = (bgImage: HTMLImageElement | null) => {
      // A. Pulisci tutto
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // B. Disegna Sfondo o Placeholder
      if (bgImage) {
        // Disegna l'immagine adattandola (object-cover logic)
        const scale = Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height);
        const x = (canvas.width / 2) - (bgImage.width / 2) * scale;
        const y = (canvas.height / 2) - (bgImage.height / 2) * scale;
        ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
      } else {
        ctx.fillStyle = '#1e293b'; // Slate-800
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // C. Disegna Overlay Scuro
      ctx.fillStyle = overlayColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // D. Configurazione Testi
      const centerX = canvas.width / 2;
      let cursorY = 150; // Punto di partenza dall'alto

      // --- TITOLO ---
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      // Titolo Grande
      ctx.font = 'bold 90px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 15;
      ctx.fillText((texts.title || 'Titolo Evento').toUpperCase(), centerX, cursorY);
      cursorY += 110;

      // --- DESCRIZIONE ---
      if (texts.description) {
        ctx.font = '50px sans-serif';
        ctx.shadowBlur = 10;
        ctx.fillText(texts.description, centerX, cursorY);
        cursorY += 80;
      }

      // --- LOCATION ---
      ctx.font = 'bold 40px sans-serif';
      ctx.fillStyle = '#facc15'; // Yellow-400
      ctx.fillText(`📍 ${texts.location || 'Luogo Evento'}`, centerX, cursorY);
      cursorY += 120; // Spazio abbondante prima dell'agenda

      // --- AGENDA ---
      if (texts.agenda) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '45px monospace'; // Font monospaziato per allineamento
        ctx.shadowBlur = 5;

        const lines = texts.agenda.split('\n').map(l => l.trim()).filter(l => l);
        const lineHeight = 70;

        if (lines.length > 4) {
            // --- LAYOUT A DUE COLONNE ---
            const midPoint = Math.ceil(lines.length / 2);
            const leftCol = lines.slice(0, midPoint);
            const rightCol = lines.slice(midPoint);

            // Impostiamo l'allineamento a SINISTRA per le colonne
            ctx.textAlign = 'left';

            // Colonna 1: Inizia al 10% della larghezza
            const col1X = canvas.width * 0.10;
            // Colonna 2: Inizia al 55% della larghezza
            const col2X = canvas.width * 0.55;

            leftCol.forEach((line, i) => {
                ctx.fillText(line, col1X, cursorY + (i * lineHeight));
            });

            rightCol.forEach((line, i) => {
                ctx.fillText(line, col2X, cursorY + (i * lineHeight));
            });
        } else {
            // --- LAYOUT COLONNA SINGOLA (Centrata) ---
            ctx.textAlign = 'center';
            lines.forEach((line, i) => {
                ctx.fillText(line, centerX, cursorY + (i * lineHeight));
            });
        }
      }
    };

    // Caricamento Immagine (se esiste)
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      img.onload = () => draw(img);
      img.onerror = () => draw(null); // Fallback se l'immagine fallisce
    } else {
      draw(null);
    }

  }, [imageUrl, texts, overlayColor]);

  // Funzione di download semplice (scarica direttamente il canvas)
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `social-post-${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9); // Qualità alta JPG
    link.click();
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative w-full rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
        
        {/* CANVAS REALE: 
            È nascosto visivamente o scalato via CSS, ma mantiene la risoluzione 1920x1080 internamente.
            La classe 'w-full h-auto' fa sì che il browser lo rimpicciolisca visivamente 
            mantenendo l'aspect ratio, ma NON cambia i pixel interni. */}
        <canvas 
            ref={canvasRef} 
            className="w-full h-auto block"
        />

        {/* Loader Overlay */}
        {loading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )}
      </div>

      <div className="flex justify-center">
        <button 
          onClick={handleDownload}
          disabled={!imageUrl || loading}
          className={`flex items-center gap-2 px-8 py-3 font-bold rounded-full shadow-lg transition-all text-white
            ${(!imageUrl || loading) 
              ? 'bg-slate-600 opacity-50 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'}`}
        >
          Scarica Post Social (HD)
        </button>
      </div>
    </div>
  );
}
