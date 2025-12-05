'use client';

import React, { useRef, useEffect } from 'react';

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
  overlayColor = 'rgba(0,0,0,0.6)'
}: SocialPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1920;
    canvas.height = 1080;

    // HELPER MISURAZIONE
    const measureHeight = (text: string, maxWidth: number, fontSize: number, fontFace: string, lineHeight: number) => {
        if (!text) return 0;
        ctx.font = `${fontSize}px ${fontFace}`;
        const words = text.split(' ');
        let currentLine = ''; // Rinominato per evitare confusioni
        let linesCount = 1;
        for (let n = 0; n < words.length; n++) {
            const testLine = currentLine + words[n] + ' ';
            if (ctx.measureText(testLine).width > maxWidth && n > 0) {
                currentLine = words[n] + ' ';
                linesCount++;
            } else {
                currentLine = testLine;
            }
        }
        return linesCount * lineHeight;
    };

    // HELPER DISEGNO
    const drawText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, fontSize: number, fontFace: string) => {
        if (!text) return y;
        ctx.font = `${fontSize}px ${fontFace}`;
        const words = text.split(' ');
        let currentLine = ''; // Rinominato
        let currentY = y;
        for (let n = 0; n < words.length; n++) {
            const testLine = currentLine + words[n] + ' ';
            if (ctx.measureText(testLine).width > maxWidth && n > 0) {
                ctx.fillText(currentLine.trim(), x, currentY);
                currentLine = words[n] + ' ';
                currentY += lineHeight;
            } else {
                currentLine = testLine;
            }
        }
        ctx.fillText(currentLine.trim(), x, currentY);
        return currentY + lineHeight;
    };

    const draw = (bgImage: HTMLImageElement | null) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (bgImage) {
        const scale = Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height);
        const x = (canvas.width / 2) - (bgImage.width / 2) * scale;
        const y = (canvas.height / 2) - (bgImage.height / 2) * scale;
        ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.fillStyle = overlayColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- MOTORE DI AUTO-FIT ---
      
      let scaleFactor = 1.0;
      
      let finalTitleSize = 0, finalTitleLH = 0;
      let finalDescSize = 0, finalDescLH = 0;
      let finalLocSize = 0, finalLocLH = 0;
      let finalAgendaSize = 0, finalAgendaLH = 0;
      let totalHeight = 0;
      
      const agendaLines = texts.agenda ? texts.agenda.split('\n').map(l => l.trim()).filter(l => l) : [];
      const count = agendaLines.length;

      for (let i = 0; i < 15; i++) {
          finalTitleSize = Math.floor(160 * scaleFactor); 
          finalTitleLH = finalTitleSize + 10;
          
          finalDescSize = Math.floor(50 * scaleFactor);
          finalDescLH = Math.floor(60 * scaleFactor);
          
          finalLocSize = Math.floor(40 * scaleFactor);
          finalLocLH = Math.floor(50 * scaleFactor);

          let baseAgendaSize = 45;
          if (count > 12) baseAgendaSize = 30;
          else if (count > 8) baseAgendaSize = 36;
          
          finalAgendaSize = Math.floor(baseAgendaSize * scaleFactor);
          finalAgendaLH = Math.floor(finalAgendaSize * 1.5);

          // Logica larghezza simulata
          const blockWidthFactor = 0.50 + (0.35 * scaleFactor);
          const totalAgendaBlockWidth = canvas.width * blockWidthFactor;
          const colGap = 80 * scaleFactor;
          const singleColWidth = (totalAgendaBlockWidth - colGap) / 2;

          const gapSmall = Math.floor(30 * scaleFactor);
          const gapLarge = Math.floor(60 * scaleFactor);

          const hTitle = measureHeight((texts.title||'').toUpperCase(), 1600, finalTitleSize, 'bold sans-serif', finalTitleLH);
          const hDesc = texts.description ? measureHeight(texts.description, 1400, finalDescSize, 'sans-serif', finalDescLH) : 0;
          const hLoc = measureHeight(`📍 ${texts.location}`, 1400, finalLocSize, 'bold sans-serif', finalLocLH);
          
          let hAgenda = 0;
          if (count > 0) {
             if (count > 4) {
                 const mid = Math.ceil(count / 2);
                 let hL = 0, hR = 0;
                 agendaLines.slice(0, mid).forEach(l => hL += measureHeight(l, singleColWidth, finalAgendaSize, 'monospace', finalAgendaLH));
                 agendaLines.slice(mid).forEach(l => hR += measureHeight(l, singleColWidth, finalAgendaSize, 'monospace', finalAgendaLH));
                 hAgenda = Math.max(hL, hR);
             } else {
                 agendaLines.forEach(l => hAgenda += measureHeight(l, 1200, finalAgendaSize, 'monospace', finalAgendaLH));
             }
          }

          totalHeight = hTitle + 40 + (hDesc > 0 ? hDesc + gapSmall : 0) + hLoc + (hAgenda > 0 ? gapLarge + hAgenda : 0);

          if (totalHeight < (canvas.height - 150)) {
              break; 
          }
          scaleFactor -= 0.08; 
      }

      // --- RENDERING FINALE ---
      
      const gapSmall = Math.floor(30 * scaleFactor);
      const gapLarge = Math.floor(60 * scaleFactor);

      let cursorY = (canvas.height - totalHeight) / 2;
      if (cursorY < 50) cursorY = 50;

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // 1. Titolo
      cursorY = drawText((texts.title||'').toUpperCase(), canvas.width/2, cursorY, 1600, finalTitleLH, finalTitleSize, 'bold sans-serif');
      cursorY += 40; 

      // 2. Descrizione
      if (texts.description) {
          ctx.shadowBlur = 5;
          cursorY = drawText(texts.description, canvas.width/2, cursorY, 1400, finalDescLH, finalDescSize, 'sans-serif');
          cursorY += gapSmall;
      }

      // 3. Location
      ctx.shadowBlur = 5;
      ctx.fillStyle = '#facc15';
      cursorY = drawText(`📍 ${texts.location||''}`, canvas.width/2, cursorY, 1400, finalLocLH, finalLocSize, 'bold sans-serif');
      
      // 4. Agenda
      if (count > 0) {
          cursorY += gapLarge;
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 0;
          
          const startAgendaY = cursorY;

          if (count > 4) {
              // 1. TROVARE LA LARGHEZZA MASSIMA REALE DEL TESTO
              // Misuriamo qual è la riga più lunga in pixel con il font attuale
              ctx.font = `${finalAgendaSize}px monospace`;
              let maxTextWidth = 0;
              agendaLines.forEach(line => {
                  const w = ctx.measureText(line).width;
                  if (w > maxTextWidth) maxTextWidth = w;
              });

              // Aggiungiamo un piccolo buffer di sicurezza
              const effectiveColWidth = maxTextWidth + 20;
              
              // Gap fisso tra le colonne (ridotto se il font è piccolo)
              const colGap = 60 * scaleFactor;

              // Larghezza Totale del Blocco
              const totalBlockWidth = (effectiveColWidth * 2) + colGap;

              // Calcolo Start X per centrare il blocco
              const startX = (canvas.width - totalBlockWidth) / 2;

              // Coordinate
              const leftX = startX;
              const rightX = startX + effectiveColWidth + colGap;

              ctx.textAlign = 'left'; 
              const mid = Math.ceil(count / 2);
              
              let leftY = startAgendaY;
              agendaLines.slice(0, mid).forEach(l => {
                  // Disegniamo forzando la larghezza massima calcolata
                  leftY = drawText(l, leftX, leftY, effectiveColWidth, finalAgendaLH, finalAgendaSize, 'monospace');
              });
              
              let rightY = startAgendaY;
              agendaLines.slice(mid).forEach(l => {
                  rightY = drawText(l, rightX, rightY, effectiveColWidth, finalAgendaLH, finalAgendaSize, 'monospace');
              });
          } else {
              ctx.textAlign = 'center';
              agendaLines.forEach(l => {
                  cursorY = drawText(l, canvas.width/2, cursorY, 1200, finalAgendaLH, finalAgendaSize, 'monospace');
              });
          }
      }
    };

    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      img.onload = () => draw(img);
      img.onerror = () => draw(null);
    } else {
      draw(null);
    }

  }, [imageUrl, texts, overlayColor]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if(canvas){
        const link = document.createElement('a');
        link.download = `social-post-${Date.now()}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative w-full rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
        <canvas ref={canvasRef} className="w-full h-auto block" />
        {loading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )}
      </div>
      <div className="flex justify-center">
        <button onClick={handleDownload} disabled={!imageUrl || loading} className={`flex items-center gap-2 px-8 py-3 font-bold rounded-full shadow-lg transition-all text-white ${(!imageUrl || loading) ? 'bg-slate-600 opacity-50 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}>
          Scarica Post Social (HD)
        </button>
      </div>
    </div>
  );
}
