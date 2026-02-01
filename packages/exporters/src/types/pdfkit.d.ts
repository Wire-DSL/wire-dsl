declare module 'pdfkit' {
  export interface PDFDocumentOptions {
    size?: [number, number] | string;
    margin?: number;
    bufferPages?: boolean;
    [key: string]: any;
  }

  export interface PDFDocument {
    pipe(destination: any): void;
    addPage(options: any): void;
    end(): void;
    on(event: string, handler: Function): void;
    [key: string]: any;
  }

  export default class PDFDocument implements PDFDocument {
    constructor(options?: PDFDocumentOptions);
    pipe(destination: any): void;
    addPage(options: any): void;
    end(): void;
    on(event: string, handler: Function): void;
    [key: string]: any;
  }
}
