import React from 'react';
import { Trash2, Type, Sliders, Layers, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Annotation } from '../../types/pdf';

interface PropertiesSidebarProps {
  selectedAnnotation: Annotation | null;
  onUpdateAnnotation: (updated: Partial<Annotation>) => void;
  onDeleteAnnotation: (id: string) => void;
}

export const PropertiesSidebar: React.FC<PropertiesSidebarProps> = ({
  selectedAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
}) => {
  if (!selectedAnnotation) {
    return (
      <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 flex flex-col h-full shrink-0 select-none text-slate-500">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <Sliders className="w-4 h-4" />
          <span>Properties</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <Layers className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            No Object Selected
          </p>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Select any text, drawing, shape, or signature on the canvas to customize its typography, colors, borders, and position.
          </p>
        </div>
      </aside>
    );
  }

  const colors = [
    { label: 'Black', hex: '#0F172A' },
    { label: 'Slate', hex: '#64748B' },
    { label: 'Blue', hex: '#2563EB' },
    { label: 'Emerald', hex: '#10B981' },
    { label: 'Red', hex: '#DC2626' },
    { label: 'Amber', hex: '#F59E0B' },
    { label: 'Purple', hex: '#8B5CF6' },
  ];

  const highlightFills = [
    { label: 'Yellow', hex: '#FEF08A' },
    { label: 'Green', hex: '#BBF7D0' },
    { label: 'Blue', hex: '#BAE6FD' },
    { label: 'Pink', hex: '#FBCFE8' },
    { label: 'Orange', hex: '#FED7AA' },
  ];

  return (
    <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 flex flex-col h-full shrink-0 select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-blue-600" />
          {selectedAnnotation.type.toUpperCase()} Object
        </span>
        <button
          onClick={() => onDeleteAnnotation(selectedAnnotation.id)}
          className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
          title="Delete element"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 text-xs">
        {/* If Text Object */}
        {selectedAnnotation.type === 'text' && (
          <>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Text Content
              </label>
              <textarea
                value={selectedAnnotation.text || ''}
                onChange={e => onUpdateAnnotation({ text: e.target.value })}
                rows={3}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Font Family
              </label>
              <select
                value={selectedAnnotation.fontFamily || 'Helvetica'}
                onChange={e => onUpdateAnnotation({ fontFamily: e.target.value as 'Helvetica' | 'TimesRoman' | 'Courier' })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Helvetica">Helvetica (Sans-Serif)</option>
                <option value="TimesRoman">Times New Roman (Academic)</option>
                <option value="Courier">Courier (Monospace)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Font Size (pt)
                </label>
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={selectedAnnotation.fontSize || 16}
                  onChange={e => onUpdateAnnotation({ fontSize: parseInt(e.target.value) || 16 })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alignment
                </label>
                <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
                  <button
                    onClick={() => onUpdateAnnotation({ textAlign: 'left' })}
                    className={`flex-1 py-1.5 flex justify-center ${selectedAnnotation.textAlign === 'left' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateAnnotation({ textAlign: 'center' })}
                    className={`flex-1 py-1.5 flex justify-center ${selectedAnnotation.textAlign === 'center' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateAnnotation({ textAlign: 'right' })}
                    className={`flex-1 py-1.5 flex justify-center ${selectedAnnotation.textAlign === 'right' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Primary Color Palette */}
        {selectedAnnotation.type !== 'redaction' && (
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {selectedAnnotation.type === 'text' ? 'Text Color' : 'Stroke Color'}
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button
                  key={c.hex}
                  onClick={() => onUpdateAnnotation({ color: c.hex })}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    selectedAnnotation.color === c.hex ? 'border-blue-500 scale-110 shadow-sm' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* Highlight Fill Palette */}
        {selectedAnnotation.type === 'highlight' && (
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Highlight Color
            </label>
            <div className="flex flex-wrap gap-2">
              {highlightFills.map(f => (
                <button
                  key={f.hex}
                  onClick={() => onUpdateAnnotation({ color: f.hex, fillColor: f.hex })}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    selectedAnnotation.color === f.hex ? 'border-slate-900 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: f.hex }}
                  title={f.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* Shape Fill */}
        {(selectedAnnotation.type === 'rectangle' || selectedAnnotation.type === 'circle') && (
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Fill Style
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateAnnotation({ fillColor: undefined })}
                className={`px-3 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                  !selectedAnnotation.fillColor ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200'
                }`}
              >
                Transparent
              </button>
              <button
                onClick={() => onUpdateAnnotation({ fillColor: selectedAnnotation.color })}
                className={`px-3 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                  selectedAnnotation.fillColor ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200'
                }`}
              >
                Solid Fill
              </button>
            </div>
          </div>
        )}

        {/* Stroke Width */}
        {(selectedAnnotation.type === 'draw' || selectedAnnotation.type === 'rectangle' || selectedAnnotation.type === 'circle' || selectedAnnotation.type === 'line') && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Stroke Thickness
              </label>
              <span className="font-mono text-slate-500">{selectedAnnotation.strokeWidth || 2}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              value={selectedAnnotation.strokeWidth || 2}
              onChange={e => onUpdateAnnotation({ strokeWidth: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>
        )}

        {/* Opacity */}
        {selectedAnnotation.type !== 'redaction' && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Opacity
              </label>
              <span className="font-mono text-slate-500">
                {Math.round((selectedAnnotation.opacity ?? 1) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={selectedAnnotation.opacity ?? 1}
              onChange={e => onUpdateAnnotation({ opacity: parseFloat(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>
        )}

        {/* Geometry & Coordinates */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
            PDF Page Coordinates
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
            <div className="bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
              X: {Math.round(selectedAnnotation.x)} pt
            </div>
            <div className="bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
              Y: {Math.round(selectedAnnotation.y)} pt
            </div>
            <div className="bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
              W: {Math.round(selectedAnnotation.width)} pt
            </div>
            <div className="bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
              H: {Math.round(selectedAnnotation.height)} pt
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
