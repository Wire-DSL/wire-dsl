declare module 'svg-to-pdfkit' {
  export interface SVGtoPDFOptions {
    width?: number;
    height?: number;
    assumePt?: boolean;
    [key: string]: any;
  }

  export default function SVGtoPDF(
    doc: any,
    svg: string,
    x: number,
    y: number,
    options?: SVGtoPDFOptions
  ): void;
}
