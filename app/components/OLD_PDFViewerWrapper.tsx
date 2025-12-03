// app/components/PDFViewerWrapper.tsx
'use client';
import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';

const { PDFViewer } = ReactPDF;

interface PDFViewerWrapperProps {
  children: React.ReactElement<DocumentProps>;
  className?: string;
}

const PDFViewerWrapper = ({ children, className }: PDFViewerWrapperProps) => {
  return (
    <PDFViewer 
      width="100%" 
      height="100%" 
      className={className}
      showToolbar={false}
      style={{ 
        border: 'none', 
        height: '100%', 
        width: '100%',
        backgroundColor: 'transparent' // Prova a togliere il colore di background dell'iframe
      }} 
    >
      {children}
    </PDFViewer>
  );
};
export default PDFViewerWrapper;
