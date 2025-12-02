// app/components/PDFViewerWrapper.tsx
'use client';

import React from 'react';
// Import the runtime library as usual for CJS compatibility
import ReactPDF from '@react-pdf/renderer';
// Import the specific type definition for Document props
import type { DocumentProps } from '@react-pdf/renderer';

const { PDFViewer } = ReactPDF;

interface PDFViewerWrapperProps {
  // FIX: We specifically type children to be a ReactElement that has DocumentProps.
  // This satisfies the strict typing of PDFViewer.
  children: React.ReactElement<DocumentProps>;
  className?: string;
}

const PDFViewerWrapper = ({ children, className }: PDFViewerWrapperProps) => {
  return (
    <PDFViewer className={className} showToolbar={true}>
      {children}
    </PDFViewer>
  );
};

export default PDFViewerWrapper;