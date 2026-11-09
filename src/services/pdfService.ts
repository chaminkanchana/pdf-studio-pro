import { PDFDocument, rgb, degrees, StandardFonts, PDFPage } from 'pdf-lib';
import { pdfjsLib } from '../utils/pdfWorker';
import { 
  Annotation, 
  WatermarkConfig, 
  PageNumberConfig, 
  UniversityCoverPageData,
  DocumentMetadata 
} from '../types/pdf';

/**
 * Converts hex color to pdf-lib rgb format
 */
export function hexToRgb(hex: string) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return rgb(r, g, b);
}

/**
 * Helper to download any Uint8Array / Blob as a file
 */
export function downloadFile(data: Uint8Array | Blob, fileName: string, mimeType = 'application/pdf') {
  const blob = data instanceof Blob ? data : new Blob([data as unknown as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Safely copies a Uint8Array into a standalone ArrayBuffer
 */
export function uint8ArrayToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer as ArrayBuffer;
}

/**
 * Reads a File into an ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Reads a File into a DataURL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Inspects PDF document metadata
 */
export async function getPdfMetadata(pdfBuffer: ArrayBuffer, fileName = 'document.pdf'): Promise<DocumentMetadata> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  return {
    title: pdfDoc.getTitle() || undefined,
    author: pdfDoc.getAuthor() || undefined,
    subject: pdfDoc.getSubject() || undefined,
    keywords: pdfDoc.getKeywords()?.split(';') || undefined,
    creator: pdfDoc.getCreator() || undefined,
    producer: pdfDoc.getProducer() || undefined,
    creationDate: pdfDoc.getCreationDate() || undefined,
    modificationDate: pdfDoc.getModificationDate() || undefined,
    pageCount: pdfDoc.getPageCount(),
    fileSizeBytes: pdfBuffer.byteLength,
    fileName,
  };
}

/**
 * Generates an authentic multi-page Sample PDF for testing and demonstration
 */
export async function createSamplePdf(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Page 1: University Report Title Page
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width: p1W, height: p1H } = page1.getSize();

  // Top header banner
  page1.drawRectangle({
    x: 0,
    y: p1H - 120,
    width: p1W,
    height: 120,
    color: rgb(0.06, 0.09, 0.16),
  });

  page1.drawRectangle({
    x: 0,
    y: p1H - 126,
    width: p1W,
    height: 6,
    color: rgb(0.14, 0.38, 0.92), // Primary Blue
  });

  page1.drawText('FACULTY OF COMPUTING & INFORMATICS', {
    x: 40,
    y: p1H - 50,
    size: 11,
    font: boldFont,
    color: rgb(0.6, 0.7, 0.9),
  });

  page1.drawText('ACADEMIC YEAR 2026 / 2027', {
    x: p1W - 220,
    y: p1H - 50,
    size: 10,
    font: font,
    color: rgb(0.7, 0.75, 0.85),
  });

  page1.drawText('FINAL COURSE PROJECT REPORT', {
    x: 40,
    y: p1H - 85,
    size: 20,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  // Body content
  page1.drawText('PDF Studio Pro: High-Performance Web Document Engine', {
    x: 40,
    y: p1H - 200,
    size: 18,
    font: boldFont,
    color: rgb(0.1, 0.15, 0.25),
  });

  page1.drawText('A Client-Side Document Manipulation & Analysis Architecture', {
    x: 40,
    y: p1H - 225,
    size: 13,
    font: font,
    color: rgb(0.35, 0.4, 0.5),
  });

  // Metadata block
  const metaY = p1H - 340;
  page1.drawRectangle({
    x: 40,
    y: metaY,
    width: p1W - 80,
    height: 120,
    color: rgb(0.97, 0.98, 1.0),
    borderColor: rgb(0.85, 0.9, 0.98),
    borderWidth: 1,
  });

  page1.drawText('Student Name:  Alex Rivera', { x: 60, y: metaY + 90, size: 11, font: boldFont, color: rgb(0.1, 0.15, 0.25) });
  page1.drawText('Student ID:    CS-2026-8942', { x: 60, y: metaY + 65, size: 11, font: font, color: rgb(0.2, 0.25, 0.35) });
  page1.drawText('Module:        CS402 - Distributed Software Architecture', { x: 60, y: metaY + 40, size: 11, font: font, color: rgb(0.2, 0.25, 0.35) });
  page1.drawText('Supervisor:    Prof. Eleanor Vance', { x: 60, y: metaY + 15, size: 11, font: font, color: rgb(0.2, 0.25, 0.35) });

  page1.drawText('Executive Abstract:', {
    x: 40,
    y: p1H - 500,
    size: 13,
    font: boldFont,
    color: rgb(0.1, 0.15, 0.25),
  });

  const abstractLines = [
    'This research artifact evaluates browser-executable PDF modification pipelines.',
    'By executing document vector mathematics and byte compilation natively within client runtime,',
    'enterprise document handling is accelerated while preserving zero-retention data privacy.',
    'Test operations include page reordering, digital signatures, vector annotation overlays, and',
    'high-resolution canvas rasterization for universal cross-platform parity.'
  ];

  abstractLines.forEach((line, i) => {
    page1.drawText(line, {
      x: 40,
      y: p1H - 530 - (i * 20),
      size: 10,
      font: font,
      color: rgb(0.25, 0.3, 0.4),
    });
  });

  page1.drawText('Page 1 of 3 - PDF Studio Pro Verification Sample', {
    x: 40,
    y: 35,
    size: 9,
    font: font,
    color: rgb(0.5, 0.55, 0.65),
  });

  // Page 2: System Architecture Diagram & Data Table
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  const { width: p2W, height: p2H } = page2.getSize();

  page2.drawText('Section 2: Pipeline Benchmark Analysis', {
    x: 40,
    y: p2H - 60,
    size: 16,
    font: boldFont,
    color: rgb(0.06, 0.09, 0.16),
  });

  page2.drawText('Comparative throughput across execution layers:', {
    x: 40,
    y: p2H - 85,
    size: 11,
    font: font,
    color: rgb(0.35, 0.4, 0.5),
  });

  // Table header
  const tableY = p2H - 130;
  page2.drawRectangle({
    x: 40,
    y: tableY,
    width: p2W - 80,
    height: 30,
    color: rgb(0.14, 0.38, 0.92),
  });

  page2.drawText('Operation Tool', { x: 55, y: tableY + 9, size: 10, font: boldFont, color: rgb(1, 1, 1) });
  page2.drawText('Execution Model', { x: 220, y: tableY + 9, size: 10, font: boldFont, color: rgb(1, 1, 1) });
  page2.drawText('Avg Latency', { x: 360, y: tableY + 9, size: 10, font: boldFont, color: rgb(1, 1, 1) });
  page2.drawText('Integrity Status', { x: 455, y: tableY + 9, size: 10, font: boldFont, color: rgb(1, 1, 1) });

  const rows = [
    { op: 'Merge Multi-Document', model: 'Browser pdf-lib', latency: '42 ms', status: '100% Vector Parity' },
    { op: 'Page Rotation & Split', model: 'Browser pdf-lib', latency: '12 ms', status: 'Instant Matrix Update' },
    { op: 'Vector Annotations', model: 'Canvas to PostScript', latency: '28 ms', status: 'Clean Layer Merge' },
    { op: 'JPG / PNG to PDF', model: 'Binary Image Embedding', latency: '65 ms', status: 'Lossless Packing' },
    { op: 'University Cover Page', model: 'Dynamic Typography Engine', latency: '18 ms', status: 'Vector Compliant' },
  ];

  rows.forEach((r, idx) => {
    const rowY = tableY - 26 * (idx + 1);
    const bg = idx % 2 === 0 ? rgb(0.97, 0.98, 0.99) : rgb(1, 1, 1);
    page2.drawRectangle({
      x: 40,
      y: rowY,
      width: p2W - 80,
      height: 26,
      color: bg,
      borderColor: rgb(0.9, 0.92, 0.95),
      borderWidth: 0.5,
    });
    page2.drawText(r.op, { x: 55, y: rowY + 8, size: 9, font: boldFont, color: rgb(0.15, 0.2, 0.3) });
    page2.drawText(r.model, { x: 220, y: rowY + 8, size: 9, font: font, color: rgb(0.3, 0.35, 0.45) });
    page2.drawText(r.latency, { x: 360, y: rowY + 8, size: 9, font: font, color: rgb(0.1, 0.5, 0.2) });
    page2.drawText(r.status, { x: 455, y: rowY + 8, size: 9, font: font, color: rgb(0.2, 0.25, 0.35) });
  });

  page2.drawText('Sample visual diagram for page annotation testing:', {
    x: 40,
    y: p2H - 330,
    size: 11,
    font: boldFont,
    color: rgb(0.15, 0.2, 0.3),
  });

  // Decorative box
  page2.drawRectangle({
    x: 40,
    y: p2H - 520,
    width: p2W - 80,
    height: 170,
    color: rgb(0.95, 0.97, 1),
    borderColor: rgb(0.7, 0.8, 0.95),
    borderWidth: 1.5,
  });

  page2.drawText('WORKSPACE ANNOTATION CANVAS', {
    x: p2W / 2 - 110,
    y: p2H - 420,
    size: 12,
    font: boldFont,
    color: rgb(0.14, 0.38, 0.92),
  });

  page2.drawText('Try adding highlights, stamps, text notes or signatures on this page in the Visual Editor!', {
    x: p2W / 2 - 180,
    y: p2H - 445,
    size: 9.5,
    font: font,
    color: rgb(0.35, 0.45, 0.6),
  });

  page2.drawText('Page 2 of 3 - PDF Studio Pro Verification Sample', {
    x: 40,
    y: 35,
    size: 9,
    font: font,
    color: rgb(0.5, 0.55, 0.65),
  });

  // Page 3: Summary & Verification Checklist
  const page3 = pdfDoc.addPage([595.28, 841.89]);
  const { width: p3W, height: p3H } = page3.getSize();

  page3.drawText('Section 3: Verification Sign-off', {
    x: 40,
    y: p3H - 60,
    size: 16,
    font: boldFont,
    color: rgb(0.06, 0.09, 0.16),
  });

  page3.drawText('This document can be used to test splitting, rotating, watermarking, and reordering.', {
    x: 40,
    y: p3H - 85,
    size: 10.5,
    font: font,
    color: rgb(0.35, 0.4, 0.5),
  });

  // Signature line box
  page3.drawRectangle({
    x: 40,
    y: p3H - 300,
    width: 240,
    height: 100,
    borderColor: rgb(0.75, 0.8, 0.88),
    borderWidth: 1,
  });

  page3.drawLine({
    start: { x: 60, y: p3H - 260 },
    end: { x: 260, y: p3H - 260 },
    thickness: 1,
    color: rgb(0.5, 0.55, 0.65),
  });

  page3.drawText('Authorized Examiner Signature', {
    x: 60,
    y: p3H - 280,
    size: 9,
    font: font,
    color: rgb(0.4, 0.45, 0.55),
  });

  page3.drawText('Page 3 of 3 - PDF Studio Pro Verification Sample', {
    x: 40,
    y: 35,
    size: 9,
    font: font,
    color: rgb(0.5, 0.55, 0.65),
  });

  pdfDoc.setTitle('PDF Studio Pro Verification Sample');
  pdfDoc.setAuthor('Alex Rivera');
  pdfDoc.setSubject('PDF Manipulation Benchmark Document');

  return await pdfDoc.save();
}

/**
 * Merge multiple PDF files into one
 */
export async function mergePdfs(pdfBuffers: ArrayBuffer[]): Promise<Uint8Array> {
  if (pdfBuffers.length === 0) {
    throw new Error('At least one PDF file is required to merge');
  }

  const mergedDoc = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
    copiedPages.forEach(page => mergedDoc.addPage(page));
  }

  return await mergedDoc.save();
}

/**
 * Split a PDF by page ranges or extracted page list (1-indexed array of page numbers)
 */
export async function splitPdf(
  pdfBuffer: ArrayBuffer, 
  pagesToExtract: number[] // 1-indexed
): Promise<Uint8Array> {
  const sourceDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = sourceDoc.getPageCount();

  const newDoc = await PDFDocument.create();
  const validIndices = pagesToExtract
    .filter(p => p >= 1 && p <= totalPages)
    .map(p => p - 1);

  if (validIndices.length === 0) {
    throw new Error('No valid pages selected for extraction');
  }

  const copiedPages = await newDoc.copyPages(sourceDoc, validIndices);
  copiedPages.forEach(page => newDoc.addPage(page));

  return await newDoc.save();
}

/**
 * Rotate specific pages in a PDF
 * rotations is a map of pageNumber (1-indexed) -> degrees (e.g. 90, 180, 270)
 */
export async function rotatePdfPages(
  pdfBuffer: ArrayBuffer,
  rotations: Record<number, number>
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = doc.getPageCount();

  for (let p = 1; p <= totalPages; p++) {
    const delta = rotations[p];
    if (delta) {
      const page = doc.getPage(p - 1);
      const currentRotation = page.getRotation().angle;
      const newAngle = (currentRotation + delta) % 360;
      page.setRotation(degrees(newAngle));
    }
  }

  return await doc.save();
}

/**
 * Delete specified pages from a PDF (pageNumbers is 1-indexed)
 */
export async function deletePdfPages(
  pdfBuffer: ArrayBuffer,
  pageNumbersToDelete: number[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = doc.getPageCount();

  if (pageNumbersToDelete.length >= totalPages) {
    throw new Error('Cannot delete all pages of the document');
  }

  // Sort descending so indices don't shift during removal
  const sortedIndices = [...new Set(pageNumbersToDelete)]
    .filter(p => p >= 1 && p <= totalPages)
    .map(p => p - 1)
    .sort((a, b) => b - a);

  for (const index of sortedIndices) {
    doc.removePage(index);
  }

  return await doc.save();
}

/**
 * Reorder pages in a PDF (newOrder is an array of 1-indexed page numbers)
 */
export async function reorderPdfPages(
  pdfBuffer: ArrayBuffer,
  newOrder: number[]
): Promise<Uint8Array> {
  const sourceDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  const zeroIndexed = newOrder.map(p => p - 1);
  const copiedPages = await newDoc.copyPages(sourceDoc, zeroIndexed);
  copiedPages.forEach(page => newDoc.addPage(page));

  return await newDoc.save();
}

/**
 * Duplicate specified pages in a PDF
 */
export async function duplicatePdfPages(
  pdfBuffer: ArrayBuffer,
  pageNumbersToDuplicate: number[]
): Promise<Uint8Array> {
  const sourceDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();
  const totalPages = sourceDoc.getPageCount();

  for (let p = 1; p <= totalPages; p++) {
    const [originalPage] = await newDoc.copyPages(sourceDoc, [p - 1]);
    newDoc.addPage(originalPage);

    if (pageNumbersToDuplicate.includes(p)) {
      const [dupPage] = await newDoc.copyPages(sourceDoc, [p - 1]);
      newDoc.addPage(dupPage);
    }
  }

  return await newDoc.save();
}

/**
 * Add Page Numbers to a PDF
 */
export async function addPageNumbersToPdf(
  pdfBuffer: ArrayBuffer,
  config: PageNumberConfig
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const totalPages = doc.getPageCount();
  const color = hexToRgb(config.color);

  for (let i = 0; i < totalPages; i++) {
    if (config.skipFirstPage && i === 0) continue;

    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    const pageNum = i + config.startNumber;

    let text = `${pageNum}`;
    if (config.format === 'page-of-total') {
      text = `Page ${pageNum} of ${totalPages}`;
    } else if (config.format === 'dash-number') {
      text = `- ${pageNum} -`;
    }

    const textWidth = font.widthOfTextAtSize(text, config.fontSize);
    let x = (width - textWidth) / 2; // default center
    let y = 30; // default bottom

    if (config.position === 'bottom-right') {
      x = width - textWidth - 40;
      y = 30;
    } else if (config.position === 'bottom-left') {
      x = 40;
      y = 30;
    } else if (config.position === 'top-right') {
      x = width - textWidth - 40;
      y = height - 40;
    } else if (config.position === 'top-center') {
      x = (width - textWidth) / 2;
      y = height - 40;
    }

    page.drawText(text, {
      x,
      y,
      size: config.fontSize,
      font,
      color,
    });
  }

  return await doc.save();
}

/**
 * Add Watermark to a PDF
 */
export async function addWatermarkToPdf(
  pdfBuffer: ArrayBuffer,
  config: WatermarkConfig
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const totalPages = doc.getPageCount();
  const color = hexToRgb(config.color);

  for (let i = 0; i < totalPages; i++) {
    if (!config.applyToAllPages && i !== 0) continue;

    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(config.text, config.fontSize);

    // Center point
    const cx = width / 2;
    const cy = height / 2;

    // Draw rotated watermark text centered
    page.drawText(config.text, {
      x: cx - (textWidth / 2) * Math.cos(config.rotation * Math.PI / 180),
      y: cy - (textWidth / 2) * Math.sin(config.rotation * Math.PI / 180),
      size: config.fontSize,
      font,
      color,
      opacity: config.opacity,
      rotate: degrees(config.rotation),
    });
  }

  return await doc.save();
}

/**
 * Convert JPG/PNG images to a single PDF
 */
export async function imagesToPdf(
  images: { dataUrl: string; name: string }[],
  pageSize: 'fit' | 'a4' = 'a4'
): Promise<Uint8Array> {
  if (images.length === 0) {
    throw new Error('Please upload at least one image');
  }

  const doc = await PDFDocument.create();

  for (const imgItem of images) {
    const isPng = imgItem.dataUrl.startsWith('data:image/png');
    // Extract base64 bytes
    const base64Data = imgItem.dataUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const embeddedImage = isPng 
      ? await doc.embedPng(imageBytes)
      : await doc.embedJpg(imageBytes);

    const { width: imgW, height: imgH } = embeddedImage;

    if (pageSize === 'fit') {
      const page = doc.addPage([imgW, imgH]);
      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: imgW,
        height: imgH,
      });
    } else {
      // Standard A4
      const a4Width = 595.28;
      const a4Height = 841.89;
      const page = doc.addPage([a4Width, a4Height]);
      
      // Compute best fit with 30pt margin
      const margin = 30;
      const maxW = a4Width - margin * 2;
      const maxH = a4Height - margin * 2;
      const scale = Math.min(maxW / imgW, maxH / imgH, 1);

      const renderW = imgW * scale;
      const renderH = imgH * scale;
      const x = (a4Width - renderW) / 2;
      const y = (a4Height - renderH) / 2;

      page.drawImage(embeddedImage, {
        x,
        y,
        width: renderW,
        height: renderH,
      });
    }
  }

  return await doc.save();
}

/**
 * Render PDF pages to images (PNG or JPEG) using pdfjsLib
 */
export async function pdfToImages(
  pdfBuffer: ArrayBuffer,
  format: 'png' | 'jpeg' = 'png',
  scale = 1.8
): Promise<{ pageNum: number; dataUrl: string; width: number; height: number }[]> {
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const results: { pageNum: number; dataUrl: string; width: number; height: number }[] = [];

  for (let p = 1; p <= numPages; p++) {
    const page = await pdfDoc.getPage(p);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) continue;

    // Fill white background for JPEGs
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render page
    const renderContext = {
      canvasContext: ctx,
      viewport,
    };
    // @ts-ignore - pdfjs typing differs across versions
    await page.render(renderContext).promise;

    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mime, 0.92);
    results.push({
      pageNum: p,
      dataUrl,
      width: viewport.width,
      height: viewport.height,
    });
  }

  return results;
}

/**
 * Extract text from PDF document using pdfjsLib
 */
export async function extractTextFromPdf(pdfBuffer: ArrayBuffer): Promise<{
  fullText: string;
  pageTexts: { pageNum: number; text: string; wordCount: number }[];
  totalWords: number;
  totalCharacters: number;
}> {
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const pageTexts: { pageNum: number; text: string; wordCount: number }[] = [];
  let fullText = '';

  for (let p = 1; p <= numPages; p++) {
    const page = await pdfDoc.getPage(p);
    const content = await page.getTextContent();
    const strings = content.items
      .map(item => ('str' in item ? (item as { str: string }).str : ''))
      .filter(Boolean);

    const pageStr = strings.join(' ').replace(/\s+/g, ' ').trim();
    const wordCount = pageStr.length > 0 ? pageStr.split(/\s+/).length : 0;

    pageTexts.push({
      pageNum: p,
      text: pageStr,
      wordCount,
    });

    fullText += `--- Page ${p} ---\n\n${pageStr}\n\n`;
  }

  const cleanFull = fullText.trim();
  const totalWords = pageTexts.reduce((acc, curr) => acc + curr.wordCount, 0);

  return {
    fullText: cleanFull,
    pageTexts,
    totalWords,
    totalCharacters: cleanFull.length,
  };
}

/**
 * Generate a University / Academic Report Cover Page
 */
export async function generateUniversityCoverPagePdf(data: UniversityCoverPageData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await doc.embedFont(StandardFonts.HelveticaOblique);

  // A4 dimensions
  const a4W = 595.28;
  const a4H = 841.89;
  const page = doc.addPage([a4W, a4H]);

  const accentRgb = hexToRgb(data.accentColor || '#2563EB');
  const darkNavy = rgb(0.06, 0.09, 0.16);

  // Top elegant banner
  page.drawRectangle({
    x: 0,
    y: a4H - 140,
    width: a4W,
    height: 140,
    color: darkNavy,
  });

  // Thin accent stripe
  page.drawRectangle({
    x: 0,
    y: a4H - 146,
    width: a4W,
    height: 6,
    color: accentRgb,
  });

  // University & Department
  page.drawText(data.universityName.toUpperCase(), {
    x: 50,
    y: a4H - 65,
    size: 16,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  page.drawText(data.department || 'FACULTY OF ENGINEERING & COMPUTER SCIENCE', {
    x: 50,
    y: a4H - 95,
    size: 10,
    font: font,
    color: rgb(0.7, 0.78, 0.9),
  });

  page.drawText(data.academicYear || 'ACADEMIC SESSION 2026 / 2027', {
    x: a4W - 220,
    y: a4H - 95,
    size: 9.5,
    font: font,
    color: rgb(0.7, 0.78, 0.9),
  });

  // Module Tag
  const moduleCodeStr = `${data.moduleCode}: ${data.moduleName}`.toUpperCase();
  page.drawText(moduleCodeStr, {
    x: 50,
    y: a4H - 220,
    size: 11,
    font: boldFont,
    color: accentRgb,
  });

  // Main Assignment Title (wrapping if long)
  const titleWords = data.assignmentTitle.split(' ');
  let titleLine1 = '';
  let titleLine2 = '';
  
  for (const w of titleWords) {
    if ((titleLine1 + ' ' + w).length < 32) {
      titleLine1 += (titleLine1 ? ' ' : '') + w;
    } else {
      titleLine2 += (titleLine2 ? ' ' : '') + w;
    }
  }

  page.drawText(titleLine1, {
    x: 50,
    y: a4H - 260,
    size: 24,
    font: boldFont,
    color: rgb(0.08, 0.12, 0.2),
  });

  if (titleLine2) {
    page.drawText(titleLine2, {
      x: 50,
      y: a4H - 295,
      size: 24,
      font: boldFont,
      color: rgb(0.08, 0.12, 0.2),
    });
  }

  // Subtitle
  if (data.subtitle) {
    page.drawText(data.subtitle, {
      x: 50,
      y: a4H - (titleLine2 ? 335 : 300),
      size: 13,
      font: italicFont,
      color: rgb(0.35, 0.42, 0.52),
    });
  }

  // Divider line
  page.drawLine({
    start: { x: 50, y: a4H - 370 },
    end: { x: a4W - 50, y: a4H - 370 },
    thickness: 1.5,
    color: rgb(0.85, 0.88, 0.94),
  });

  // Student & Submission Details Card
  const boxY = a4H - 570;
  page.drawRectangle({
    x: 50,
    y: boxY,
    width: a4W - 100,
    height: 170,
    color: rgb(0.98, 0.99, 1),
    borderColor: rgb(0.85, 0.9, 0.98),
    borderWidth: 1,
  });

  page.drawText('CANDIDATE & SUBMISSION DETAILS', {
    x: 75,
    y: boxY + 135,
    size: 10,
    font: boldFont,
    color: rgb(0.35, 0.4, 0.5),
  });

  // Table rows
  const detailItems = [
    { label: 'Student Name:', value: data.studentName || 'Alex Rivera' },
    { label: 'Student ID / Registration:', value: data.studentId || 'CS-2026-8942' },
    { label: 'Lecturer / Supervisor:', value: data.lecturerName || 'Prof. Eleanor Vance' },
    { label: 'Submission Date:', value: data.submissionDate || new Date().toISOString().split('T')[0] },
  ];

  detailItems.forEach((item, idx) => {
    const rowY = boxY + 105 - (idx * 26);
    page.drawText(item.label, { x: 75, y: rowY, size: 10, font: boldFont, color: rgb(0.18, 0.22, 0.3) });
    page.drawText(item.value, { x: 250, y: rowY, size: 10, font: font, color: rgb(0.12, 0.16, 0.24) });
  });

  // Declaration of originality note
  page.drawText('Academic Integrity Declaration:', {
    x: 50,
    y: boxY - 45,
    size: 10,
    font: boldFont,
    color: rgb(0.2, 0.25, 0.35),
  });

  const declaration = 'I hereby declare that this assignment represents my own original research and academic work in accordance with the institution policy on academic ethics and plagiarism.';
  page.drawText(declaration.substring(0, 85), { x: 50, y: boxY - 65, size: 8.5, font: italicFont, color: rgb(0.4, 0.45, 0.55) });
  page.drawText(declaration.substring(85), { x: 50, y: boxY - 80, size: 8.5, font: italicFont, color: rgb(0.4, 0.45, 0.55) });

  // Bottom footer accent
  page.drawLine({
    start: { x: 50, y: 55 },
    end: { x: a4W - 50, y: 55 },
    thickness: 1,
    color: rgb(0.85, 0.88, 0.94),
  });

  page.drawText('Generated via PDF Studio Pro Academic Toolkit', {
    x: 50,
    y: 40,
    size: 8,
    font: font,
    color: rgb(0.55, 0.6, 0.7),
  });

  return await doc.save();
}

/**
 * Prepend a generated University Cover Page to an existing PDF
 */
export async function prependCoverPageToPdf(
  originalPdfBuffer: ArrayBuffer,
  coverPageData: UniversityCoverPageData
): Promise<Uint8Array> {
  const coverBytes = await generateUniversityCoverPagePdf(coverPageData);
  const coverDoc = await PDFDocument.load(coverBytes);
  const mainDoc = await PDFDocument.load(originalPdfBuffer, { ignoreEncryption: true });

  const finalDoc = await PDFDocument.create();

  // Add cover page first
  const [coverPage] = await finalDoc.copyPages(coverDoc, [0]);
  finalDoc.addPage(coverPage);

  // Add remaining pages
  const mainPages = await finalDoc.copyPages(mainDoc, mainDoc.getPageIndices());
  mainPages.forEach(p => finalDoc.addPage(p));

  return await finalDoc.save();
}

/**
 * Remove document metadata for privacy and security
 */
export async function removePdfMetadata(pdfBuffer: ArrayBuffer): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  doc.setTitle('');
  doc.setAuthor('');
  doc.setSubject('');
  doc.setKeywords([]);
  doc.setProducer('');
  doc.setCreator('');
  return await doc.save();
}

/**
 * Apply Visual Annotations (text, images, drawing, shapes, signature, redactions)
 * to an existing PDF and export
 */
export async function applyAnnotationsToPdf(
  pdfBuffer: ArrayBuffer,
  annotations: Annotation[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const helvetica = await doc.embedFont(StandardFonts.HelveticaBold);
  const times = await doc.embedFont(StandardFonts.TimesRomanBold);
  const courier = await doc.embedFont(StandardFonts.CourierBold);

  for (const ann of annotations) {
    if (ann.page < 1 || ann.page > doc.getPageCount()) continue;
    const page = doc.getPage(ann.page - 1);
    const { width: pWidth, height: pHeight } = page.getSize();

    // Map screen coordinate system (y from top) to PDF coordinate system (y from bottom)
    const pdfX = ann.x;
    const pdfY = pHeight - ann.y - ann.height;

    const strokeRgb = hexToRgb(ann.color);
    const fillRgb = ann.fillColor ? hexToRgb(ann.fillColor) : undefined;

    switch (ann.type) {
      case 'text': {
        const text = ann.text || 'Sample Text';
        const fontSize = ann.fontSize || 16;
        let selectedFont = helvetica;
        if (ann.fontFamily === 'TimesRoman') selectedFont = times;
        if (ann.fontFamily === 'Courier') selectedFont = courier;

        page.drawText(text, {
          x: pdfX,
          y: pHeight - ann.y - (fontSize * 0.9), // adjust baseline
          size: fontSize,
          font: selectedFont,
          color: strokeRgb,
          opacity: ann.opacity ?? 1,
        });
        break;
      }

      case 'rectangle': {
        page.drawRectangle({
          x: pdfX,
          y: pdfY,
          width: ann.width,
          height: ann.height,
          borderColor: strokeRgb,
          borderWidth: ann.strokeWidth || 2,
          color: fillRgb,
          opacity: ann.opacity ?? 1,
        });
        break;
      }

      case 'redaction': {
        // Redaction is a permanent solid black block covering sensitive content
        page.drawRectangle({
          x: pdfX,
          y: pdfY,
          width: ann.width,
          height: ann.height,
          color: rgb(0, 0, 0),
          opacity: 1.0,
        });
        break;
      }

      case 'highlight': {
        // Transparent highlight block
        page.drawRectangle({
          x: pdfX,
          y: pdfY,
          width: ann.width,
          height: ann.height,
          color: fillRgb || strokeRgb,
          opacity: ann.opacity || 0.35,
        });
        break;
      }

      case 'circle': {
        const rx = ann.width / 2;
        const ry = ann.height / 2;
        page.drawEllipse({
          x: pdfX + rx,
          y: pdfY + ry,
          xScale: rx,
          yScale: ry,
          borderColor: strokeRgb,
          borderWidth: ann.strokeWidth || 2,
          color: fillRgb,
          opacity: ann.opacity ?? 1,
        });
        break;
      }

      case 'line': {
        page.drawLine({
          start: { x: pdfX, y: pHeight - ann.y },
          end: { x: pdfX + ann.width, y: pdfY },
          thickness: ann.strokeWidth || 2,
          color: strokeRgb,
          opacity: ann.opacity ?? 1,
        });
        break;
      }

      case 'draw': {
        if (ann.points && ann.points.length > 1) {
          for (let i = 0; i < ann.points.length - 1; i++) {
            const pt1 = ann.points[i];
            const pt2 = ann.points[i + 1];
            page.drawLine({
              start: { x: pt1.x, y: pHeight - pt1.y },
              end: { x: pt2.x, y: pHeight - pt2.y },
              thickness: ann.strokeWidth || 2.5,
              color: strokeRgb,
              opacity: ann.opacity ?? 1,
            });
          }
        }
        break;
      }

      case 'signature':
      case 'image': {
        if (ann.imageData) {
          try {
            const isPng = ann.imageData.startsWith('data:image/png');
            const base64 = ann.imageData.split(',')[1];
            const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            const embedded = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);

            page.drawImage(embedded, {
              x: pdfX,
              y: pdfY,
              width: ann.width,
              height: ann.height,
              opacity: ann.opacity ?? 1,
            });
          } catch (err) {
            console.error('Failed to embed image/signature annotation:', err);
          }
        }
        break;
      }
    }
  }

  return await doc.save();
}

/**
 * Flatten annotations and form fields in a PDF
 */
export async function flattenPdf(pdfBuffer: ArrayBuffer): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  try {
    const form = doc.getForm();
    form.flatten();
  } catch {
    // Document might not have interactive form fields
  }
  return await doc.save();
}
