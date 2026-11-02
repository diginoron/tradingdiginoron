import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

export interface PdfExportOptions {
  orientation?: 'portrait' | 'landscape';
  format?: 'a4';
  marginMm?: number;
  quality?: number;
}

export interface PdfExportResult {
  success: boolean;
  url?: string;
  blob?: Blob;
  filename: string;
  error?: string;
}

/**
 * High-fidelity PDF exporter using native browser rendering (SVG foreignObject)
 * Fully compatible with Tailwind CSS v4 (oklch color model), Persian & English typography,
 * and iframe environments.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  filename: string,
  options: PdfExportOptions = {}
): Promise<PdfExportResult> {
  const {
    orientation = 'portrait',
    marginMm = 8,
    quality = 0.95,
  } = options;

  const cleanFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;

  // A4 dimensions in mm: 210 x 297
  const pageWidthMm = orientation === 'portrait' ? 210 : 297;
  const pageHeightMm = orientation === 'portrait' ? 297 : 210;
  const contentWidthMm = pageWidthMm - marginMm * 2;
  const maxContentHeightMm = pageHeightMm - marginMm * 2;

  try {
    // 1. Render DOM node to high-res PNG data URL (handles modern CSS, Tailwind 4 oklch colors)
    let imgData: string;
    try {
      imgData = await toPng(element, {
        quality,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        style: {
          margin: '0',
          padding: '24px',
          backgroundColor: '#ffffff',
        }
      });
    } catch (fontErr) {
      // If font embedding fails (CORS), retry with skipFonts
      console.warn('Initial toPng failed, retrying without embedded fonts:', fontErr);
      imgData = await toPng(element, {
        quality,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipFonts: true,
      });
    }

    if (!imgData || imgData.length < 100) {
      throw new Error('Failed to generate image data from DOM element');
    }

    // 2. Measure image dimensions
    const img = new Image();
    img.src = imgData;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load generated image for PDF placement'));
    });

    const imgWidth = img.naturalWidth || img.width || 800;
    const imgHeight = img.naturalHeight || img.height || 1100;

    // 3. Initialize jsPDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const imgWidthMm = contentWidthMm;
    const imgHeightMm = (imgHeight * imgWidthMm) / imgWidth;

    let heightLeftMm = imgHeightMm;
    let positionYMm = marginMm;

    // Render first page
    pdf.addImage(imgData, 'PNG', marginMm, positionYMm, imgWidthMm, imgHeightMm, undefined, 'FAST');
    heightLeftMm -= maxContentHeightMm;

    // Multi-page split if content exceeds one A4 page
    while (heightLeftMm > 2) {
      positionYMm = marginMm - (imgHeightMm - heightLeftMm);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', marginMm, positionYMm, imgWidthMm, imgHeightMm, undefined, 'FAST');
      heightLeftMm -= maxContentHeightMm;
    }

    // 4. Generate Blob & trigger download
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    // Trigger download via anchor element
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = cleanFilename;
    link.setAttribute('download', cleanFilename);
    link.style.display = 'none';
    document.body.appendChild(link);

    // MouseEvent click for maximum browser/iframe compatibility
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    link.dispatchEvent(clickEvent);

    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch {}
    }, 2000);

    return {
      success: true,
      url: blobUrl,
      blob: pdfBlob,
      filename: cleanFilename,
    };
  } catch (err: any) {
    console.error('exportElementToPdf error:', err);
    return {
      success: false,
      filename: cleanFilename,
      error: err?.message || 'Unknown error occurred while generating PDF',
    };
  }
}
