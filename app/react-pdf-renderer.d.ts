declare module '@react-pdf/renderer' {
  import * as React from 'react';

  export interface DocumentProps {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    keywords?: string;
    onRender?: (params: { blob: Blob }) => void;
    children?: React.ReactNode;
  }

  export class Document extends React.Component<DocumentProps> {}

  export interface PageProps {
    size?: string | [number, number] | { width: number; height: number };
    orientation?: 'portrait' | 'landscape';
    style?: any;
    wrap?: boolean;
    debug?: boolean;
    children?: React.ReactNode;
  }

  export class Page extends React.Component<PageProps> {}

  export interface TextProps {
    style?: any;
    wrap?: boolean;
    debug?: boolean;
    render?: (props: { pageNumber: number; totalPages: number }) => React.ReactNode;
    fixed?: boolean;
    children?: React.ReactNode;
  }

  export class Text extends React.Component<TextProps> {}

  export interface ViewProps {
    style?: any;
    wrap?: boolean;
    debug?: boolean;
    render?: (props: { pageNumber: number }) => React.ReactNode;
    fixed?: boolean;
    children?: React.ReactNode;
  }

  export class View extends React.Component<ViewProps> {}

  export interface ImageProps {
    src: string | { uri: string; method: string; body: any; headers: any };
    style?: any;
    fixed?: boolean;
    cache?: boolean;
  }

  export class Image extends React.Component<ImageProps> {}

  export class StyleSheet {
    static create<T>(styles: T): T;
  }

  export class Font {
    static register(options: { family: string; src?: string; fonts?: any[] }): void;
  }

  export const pdf: (document: React.ReactElement) => {
    toBlob: () => Promise<Blob>;
    toBuffer: () => Promise<Buffer>;
    toString: () => string;
  };

  // Importante: esporta renderToBuffer se lo usi nell'API
  export const renderToBuffer: (element: React.ReactElement) => Promise<Buffer>;
  export const renderToStream: (element: React.ReactElement) => Promise<NodeJS.ReadableStream>;
}
