declare module 'pdfkit' {
  export interface PDFDocumentOptions {
    size?: [number, number];
    margin?: number;
    font?: string | null;
  }

  export interface PDFDocument {
    pipe(stream: any): void;
    addPage(options: any): void;
    end(): void;
    on(event: string, callback: (...args: any[]) => void): void;
    registerFont(name: string, path: string): void;
    font(src: string, family?: string | number, size?: number): void;
  }

  export default class PDFDocument {
    constructor(options?: PDFDocumentOptions);
    pipe(stream: any): void;
    addPage(options: any): void;
    end(): void;
    on(event: string, callback: (...args: any[]) => void): void;
    registerFont(name: string, path: string): void;
    font(src: string, family?: string | number, size?: number): void;
  }
}

declare module 'svg-to-pdfkit' {
  export default function SVGtoPDF(
    doc: any,
    svg: string,
    x: number,
    y: number,
    options?: any
  ): void;
}
