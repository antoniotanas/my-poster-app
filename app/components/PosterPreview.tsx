'use client';
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { usePDF } from '@react-pdf/renderer';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configura il worker CDN (essenziale per Next.js)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PosterPreviewProps {
  // MODIFICA QUI: Usa 'any' per il tipo generico per placare TypeScript
  document: React.ReactElement<any>; 
}

const PosterPreview = ({ document: MyDoc }: PosterPreviewProps) => {
  // 1. Generiamo il blob URL del PDF usando l'hook di renderer
  const [instance, updateInstance] = usePDF({ document: MyDoc });
  const [numPages, setNumPages] = useState<number>(0);

  useEffect(() => {
    updateInstance(MyDoc);
  }, [MyDoc, updateInstance]);

  if (instance.loading) return <div className="text-center p-10">Generazione PDF...</div>;
  if (instance.error) return <div className="text-red-500">Errore: {instance.error}</div>;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 
        VISUALIZZAZIONE COME IMMAGINE (CANVAS)
        Questo renderizza il PDF come se fosse una JPG perfetta.
      */}
      <div className="shadow-2xl rounded-sm overflow-hidden border border-gray-200">
        <Document
          file={instance.url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          className="flex justify-center"
        >
          <Page 
            pageNumber={1} 
            width={500} // Larghezza fissa anteprima (o rendila responsive)
            renderTextLayer={false} // Rimuove selezione testo per look "immagine"
            renderAnnotationLayer={false}
          />
        </Document>
      </div>

      {/* BOTTONI AZIONE */}
      <div className="flex gap-4 mt-4">
        {/* Download PDF */}
        <a 
          href={instance.url || '#'} 
          download="poster.pdf"
          className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition"
        >
          Scarica PDF (Stampa)
        </a>

        {/* TODO: Per scaricare come JPG servirebbe convertire il canvas, 
            ma per ora lo screenshot è identico all'anteprima sopra */}
      </div>
    </div>
  );
};

export default PosterPreview;
