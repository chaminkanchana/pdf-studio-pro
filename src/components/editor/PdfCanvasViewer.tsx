import React, { useRef, useEffect, useState } from 'react';
import { pdfjsLib } from '../../utils/pdfWorker';
import { Annotation, AnnotationType, Point } from '../../types/pdf';
import { Loader2 } from 'lucide-react';

interface PdfCanvasViewerProps {
  pdfBuffer: ArrayBuffer | null;
  currentPage: number;
  zoom: number;
  activeTool: 'select' | AnnotationType;
  annotations: Annotation[];
  selectedId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onAddAnnotation: (ann: Annotation) => void;
  onUpdateAnnotation: (id: string, updated: Partial<Annotation>) => void;
}

export const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({
  pdfBuffer,
  currentPage,
  zoom,
  activeTool,
  annotations,
  selectedId,
  onSelectAnnotation,
  onAddAnnotation,
  onUpdateAnnotation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({ width: 595, height: 842 });
  const [isLoading, setIsLoading] = useState(false);

  // Interaction tracking state
  const isInteracting = useRef(false);
  const startPos = useRef<Point>({ x: 0, y: 0 });
  const [currentDrawPoints, setCurrentDrawPoints] = useState<Point[]>([]);
  const [dragPreviewRect, setDragPreviewRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Moving existing annotation state
  const draggingAnnotationId = useRef<string | null>(null);
  const dragOffset = useRef<Point>({ x: 0, y: 0 });

  // Render current PDF page
  useEffect(() => {
    let isCancelled = false;
    if (!pdfBuffer || !canvasRef.current) return;

    setIsLoading(true);

    pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) }).promise.then(async doc => {
      if (isCancelled) return;
      if (currentPage > doc.numPages) return;

      const page = await doc.getPage(currentPage);
      // Native PDF page points (scale = 1.0)
      const baseViewport = page.getViewport({ scale: 1.0 });
      setPageSize({ width: baseViewport.width, height: baseViewport.height });

      // Render at target zoom factor (multiplied by devicePixelRatio for razor-sharp text)
      const dpr = window.devicePixelRatio || 1;
      const renderViewport = page.getViewport({ scale: zoom * dpr });

      const canvas = canvasRef.current;
      if (!canvas || isCancelled) return;

      canvas.width = renderViewport.width;
      canvas.height = renderViewport.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // @ts-ignore
      await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;
      if (!isCancelled) setIsLoading(false);
    }).catch(err => {
      console.error('PDF render error:', err);
      if (!isCancelled) setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [pdfBuffer, currentPage, zoom]);

  // Convert client click coordinate (relative to overlay div) to unscaled PDF point coordinates
  const getPdfCoordinates = (e: React.MouseEvent<HTMLDivElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    return {
      x: clientX / zoom,
      y: clientY / zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const pt = getPdfCoordinates(e);
    startPos.current = pt;
    isInteracting.current = true;

    if (activeTool === 'select') {
      // Check if user clicked on background to deselect
      if ((e.target as HTMLElement).getAttribute('data-is-canvas-bg') === 'true') {
        onSelectAnnotation(null);
      }
      return;
    }

    if (activeTool === 'draw') {
      setCurrentDrawPoints([pt]);
    } else if (activeTool === 'text') {
      // Immediate text object creation
      const newAnn: Annotation = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'text',
        page: currentPage,
        x: pt.x,
        y: pt.y,
        width: 160,
        height: 35,
        color: '#0F172A',
        fontSize: 16,
        fontFamily: 'Helvetica',
        text: 'Type text here',
        opacity: 1,
      };
      onAddAnnotation(newAnn);
      onSelectAnnotation(newAnn.id);
      isInteracting.current = false;
    } else {
      // Shapes / highlights / redaction start drag
      setDragPreviewRect({ x: pt.x, y: pt.y, w: 0, h: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteracting.current) return;
    const pt = getPdfCoordinates(e);

    if (activeTool === 'draw') {
      setCurrentDrawPoints(prev => [...prev, pt]);
    } else if (activeTool === 'select' && draggingAnnotationId.current) {
      // Move selected annotation
      const annId = draggingAnnotationId.current;
      const newX = pt.x - dragOffset.current.x;
      const newY = pt.y - dragOffset.current.y;
      onUpdateAnnotation(annId, { x: Math.max(0, newX), y: Math.max(0, newY) });
    } else if (['rectangle', 'circle', 'line', 'highlight', 'redaction'].includes(activeTool)) {
      const x = Math.min(startPos.current.x, pt.x);
      const y = Math.min(startPos.current.y, pt.y);
      const w = Math.abs(pt.x - startPos.current.x);
      const h = Math.abs(pt.y - startPos.current.y);
      setDragPreviewRect({ x, y, w, h });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteracting.current) return;
    isInteracting.current = false;
    const pt = getPdfCoordinates(e);

    if (activeTool === 'draw') {
      if (currentDrawPoints.length > 1) {
        // Compute bounding box
        const xs = currentDrawPoints.map(p => p.x);
        const ys = currentDrawPoints.map(p => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const newAnn: Annotation = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'draw',
          page: currentPage,
          x: minX,
          y: minY,
          width: Math.max(20, maxX - minX),
          height: Math.max(20, maxY - minY),
          color: '#2563EB',
          strokeWidth: 2.5,
          opacity: 1,
          points: currentDrawPoints,
        };
        onAddAnnotation(newAnn);
        onSelectAnnotation(newAnn.id);
      }
      setCurrentDrawPoints([]);
    } else if (['rectangle', 'circle', 'line', 'highlight', 'redaction'].includes(activeTool)) {
      if (dragPreviewRect && (dragPreviewRect.w > 5 || dragPreviewRect.h > 5)) {
        let color = '#2563EB';
        let fillColor: string | undefined = undefined;
        let opacity = 1.0;

        if (activeTool === 'highlight') {
          color = '#FEF08A';
          fillColor = '#FEF08A';
          opacity = 0.4;
        } else if (activeTool === 'redaction') {
          color = '#000000';
          fillColor = '#000000';
          opacity = 1.0;
        }

        const newAnn: Annotation = {
          id: Math.random().toString(36).substring(2, 9),
          type: activeTool as AnnotationType,
          page: currentPage,
          x: dragPreviewRect.x,
          y: dragPreviewRect.y,
          width: Math.max(10, dragPreviewRect.w),
          height: Math.max(10, dragPreviewRect.h),
          color,
          fillColor,
          opacity,
          strokeWidth: activeTool === 'redaction' ? 0 : 2,
        };
        onAddAnnotation(newAnn);
        onSelectAnnotation(newAnn.id);
      }
      setDragPreviewRect(null);
    }

    draggingAnnotationId.current = null;
  };

  // Start dragging an existing annotation
  const handleAnnotationMouseDown = (e: React.MouseEvent, ann: Annotation) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    onSelectAnnotation(ann.id);

    const pt = getPdfCoordinates(e as unknown as React.MouseEvent<HTMLDivElement>);
    draggingAnnotationId.current = ann.id;
    dragOffset.current = {
      x: pt.x - ann.x,
      y: pt.y - ann.y,
    };
    isInteracting.current = true;
  };

  // Filter annotations belonging to the current page
  const pageAnnotations = annotations.filter(a => a.page === currentPage);

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-slate-200/80 dark:bg-[#070C18] overflow-auto flex items-center justify-center p-8 select-none relative"
    >
      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-xs">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Rendering Page {currentPage}...</span>
          </div>
        </div>
      )}

      {/* Scaled PDF Canvas & Interactive Overlay Sheet */}
      <div
        style={{
          width: `${pageSize.width * zoom}px`,
          height: `${pageSize.height * zoom}px`,
        }}
        className="relative bg-white shadow-2xl rounded-sm transition-all"
      >
        {/* Rasterized PDF background canvas */}
        <canvas
          ref={canvasRef}
          style={{
            width: `${pageSize.width * zoom}px`,
            height: `${pageSize.height * zoom}px`,
          }}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Interactive Annotation Overlay */}
        <div
          data-is-canvas-bg="true"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            width: `${pageSize.width * zoom}px`,
            height: `${pageSize.height * zoom}px`,
          }}
          className={`absolute inset-0 ${
            activeTool === 'select'
              ? 'cursor-default'
              : activeTool === 'text'
              ? 'cursor-text'
              : 'cursor-crosshair'
          }`}
        >
          {/* Render Page Annotations */}
          {pageAnnotations.map(ann => {
            const isSelected = ann.id === selectedId;
            const screenX = ann.x * zoom;
            const screenY = ann.y * zoom;
            const screenW = ann.width * zoom;
            const screenH = ann.height * zoom;

            return (
              <div
                key={ann.id}
                onMouseDown={e => handleAnnotationMouseDown(e, ann)}
                style={{
                  position: 'absolute',
                  left: `${screenX}px`,
                  top: `${screenY}px`,
                  width: `${screenW}px`,
                  height: `${screenH}px`,
                  opacity: ann.opacity ?? 1,
                }}
                className={`group ${
                  isSelected
                    ? 'ring-2 ring-blue-500 ring-offset-1 z-20 cursor-move'
                    : 'hover:ring-1 hover:ring-blue-400/60 z-10'
                }`}
              >
                {/* Text render */}
                {ann.type === 'text' && (
                  <div
                    style={{
                      color: ann.color,
                      fontSize: `${(ann.fontSize || 16) * zoom}px`,
                      fontFamily: ann.fontFamily === 'Courier' ? 'monospace' : ann.fontFamily === 'TimesRoman' ? 'serif' : 'sans-serif',
                      textAlign: ann.textAlign || 'left',
                    }}
                    className="w-full h-full font-bold select-none overflow-hidden leading-tight"
                  >
                    {ann.text || 'Text'}
                  </div>
                )}

                {/* Rectangle render */}
                {ann.type === 'rectangle' && (
                  <div
                    style={{
                      borderWidth: `${(ann.strokeWidth || 2) * zoom}px`,
                      borderColor: ann.color,
                      backgroundColor: ann.fillColor || 'transparent',
                    }}
                    className="w-full h-full border-solid"
                  />
                )}

                {/* Redaction render (Solid black block) */}
                {ann.type === 'redaction' && (
                  <div
                    style={{
                      backgroundColor: '#000000',
                    }}
                    className="w-full h-full shadow-xs flex items-center justify-center text-[9px] text-white/50 font-mono uppercase tracking-wider"
                  >
                    REDACTED
                  </div>
                )}

                {/* Highlight render */}
                {ann.type === 'highlight' && (
                  <div
                    style={{
                      backgroundColor: ann.color || '#FEF08A',
                    }}
                    className="w-full h-full"
                  />
                )}

                {/* Circle render */}
                {ann.type === 'circle' && (
                  <div
                    style={{
                      borderWidth: `${(ann.strokeWidth || 2) * zoom}px`,
                      borderColor: ann.color,
                      backgroundColor: ann.fillColor || 'transparent',
                    }}
                    className="w-full h-full rounded-full border-solid"
                  />
                )}

                {/* Line render */}
                {ann.type === 'line' && (
                  <svg className="w-full h-full overflow-visible pointer-events-none">
                    <line
                      x1="0"
                      y1="0"
                      x2={screenW}
                      y2={screenH}
                      stroke={ann.color}
                      strokeWidth={(ann.strokeWidth || 2) * zoom}
                    />
                  </svg>
                )}

                {/* Signature / Image render */}
                {(ann.type === 'signature' || ann.type === 'image') && ann.imageData && (
                  <img
                    src={ann.imageData}
                    alt="Signature / Embedded Image"
                    className="w-full h-full object-contain pointer-events-none select-none"
                  />
                )}

                {/* Draw pen stroke render */}
                {ann.type === 'draw' && ann.points && (
                  <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                    <polyline
                      points={ann.points
                        .map(p => `${(p.x - ann.x) * zoom},${(p.y - ann.y) * zoom}`)
                        .join(' ')}
                      fill="none"
                      stroke={ann.color}
                      strokeWidth={(ann.strokeWidth || 2.5) * zoom}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            );
          })}

          {/* Live Drawing Pen Polyline Preview */}
          {activeTool === 'draw' && currentDrawPoints.length > 1 && (
            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-30">
              <polyline
                points={currentDrawPoints.map(p => `${p.x * zoom},${p.y * zoom}`).join(' ')}
                fill="none"
                stroke="#2563EB"
                strokeWidth={2.5 * zoom}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {/* Drag Preview Rectangle */}
          {dragPreviewRect && (
            <div
              style={{
                left: `${dragPreviewRect.x * zoom}px`,
                top: `${dragPreviewRect.y * zoom}px`,
                width: `${dragPreviewRect.w * zoom}px`,
                height: `${dragPreviewRect.h * zoom}px`,
              }}
              className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10 z-30 pointer-events-none"
            />
          )}
        </div>
      </div>
    </div>
  );
};
