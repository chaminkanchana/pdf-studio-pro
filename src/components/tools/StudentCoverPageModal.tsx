import React, { useState } from 'react';
import { X, GraduationCap, CheckCircle2, FileDown, Layers, Loader2 } from 'lucide-react';
import { UniversityCoverPageData } from '../../types/pdf';
import { 
  generateUniversityCoverPagePdf, 
  prependCoverPageToPdf, 
  downloadFile,
  uint8ArrayToArrayBuffer 
} from '../../services/pdfService';

interface StudentCoverPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBuffer: ArrayBuffer | null;
  fileName?: string;
  onToast: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  onUpdatePdfBuffer?: (newBuffer: ArrayBuffer) => void;
}

export const StudentCoverPageModal: React.FC<StudentCoverPageModalProps> = ({
  isOpen,
  onClose,
  pdfBuffer,
  fileName = 'assignment.pdf',
  onToast,
  onUpdatePdfBuffer,
}) => {
  const [formData, setFormData] = useState<UniversityCoverPageData>({
    universityName: 'Faculty of Computing & Informatics',
    department: 'Department of Software Engineering',
    moduleCode: 'CS402',
    moduleName: 'Distributed Systems & Web Architecture',
    assignmentTitle: 'Design and Implementation of a High-Performance PDF Document Engine',
    subtitle: 'Final Term University Capstone Project',
    studentName: 'Alex Rivera',
    studentId: 'CS-2026-8942',
    lecturerName: 'Prof. Eleanor Vance',
    submissionDate: new Date().toISOString().split('T')[0],
    academicYear: '2026 / 2027',
    accentColor: '#2563EB',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof UniversityCoverPageData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const colorThemes = [
    { label: 'Sapphire Blue', color: '#2563EB' },
    { label: 'Deep Navy', color: '#0F172A' },
    { label: 'Emerald Green', color: '#10B981' },
    { label: 'Crimson Red', color: '#DC2626' },
    { label: 'Amethyst Purple', color: '#7C3AED' },
  ];

  const handleDownloadStandalone = async () => {
    try {
      setIsProcessing(true);
      const bytes = await generateUniversityCoverPagePdf(formData);
      downloadFile(bytes, 'University_Report_Cover_Page.pdf');
      onToast('Cover Page Generated', 'Your academic cover sheet has been downloaded.', 'success');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate cover page';
      onToast('Error', msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrependToCurrent = async () => {
    if (!pdfBuffer) {
      onToast('No Document Loaded', 'Please load an assignment PDF first or download the standalone cover page.', 'warning');
      return;
    }

    try {
      setIsProcessing(true);
      const combinedBytes = await prependCoverPageToPdf(pdfBuffer, formData);
      const combinedBuffer = uint8ArrayToArrayBuffer(combinedBytes);

      if (onUpdatePdfBuffer) {
        onUpdatePdfBuffer(combinedBuffer);
      }

      const baseName = fileName.replace(/\.[^/.]+$/, '');
      downloadFile(combinedBytes, `${baseName}_with_CoverPage.pdf`);
      onToast('Cover Page Prepended', 'Generated cover page and combined with your assignment!', 'success');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to prepend cover page';
      onToast('Error', msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              University Report & Thesis Cover Page Generator
            </h2>
            <p className="text-xs text-slate-500">
              Generate standardized institutional title sheets with academic declarations
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Color theme strip */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Theme Accent:</span>
            <div className="flex items-center gap-2">
              {colorThemes.map(t => (
                <button
                  key={t.color}
                  onClick={() => handleChange('accentColor', t.color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                    formData.accentColor === t.color ? 'border-slate-900 dark:border-white scale-110 shadow-sm' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: t.color }}
                  title={t.label}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* University & Department */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                University / Institution Name
              </label>
              <input
                type="text"
                value={formData.universityName}
                onChange={e => handleChange('universityName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Faculty / Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={e => handleChange('department', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Module code and name */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Module Code
              </label>
              <input
                type="text"
                value={formData.moduleCode}
                onChange={e => handleChange('moduleCode', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Module Name
              </label>
              <input
                type="text"
                value={formData.moduleName}
                onChange={e => handleChange('moduleName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Assignment title & subtitle */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project / Assignment Title
              </label>
              <input
                type="text"
                value={formData.assignmentTitle}
                onChange={e => handleChange('assignmentTitle', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subtitle / Description
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={e => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 italic"
              />
            </div>

            {/* Student Name & ID */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={e => handleChange('studentName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Student ID / Registration No.
              </label>
              <input
                type="text"
                value={formData.studentId}
                onChange={e => handleChange('studentId', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            {/* Lecturer & Date */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Supervisor / Lecturer
              </label>
              <input
                type="text"
                value={formData.lecturerName}
                onChange={e => handleChange('lecturerName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Submission Date
              </label>
              <input
                type="date"
                value={formData.submissionDate}
                onChange={e => handleChange('submissionDate', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            {pdfBuffer ? `Ready to attach to loaded "${fileName}"` : 'No document currently loaded'}
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadStandalone}
              disabled={isProcessing}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download Cover Page Only</span>
            </button>

            <button
              onClick={handlePrependToCurrent}
              disabled={isProcessing || !pdfBuffer}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              title="Prepends this cover page to your assignment report and downloads complete PDF"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span>Prepend & Download Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
