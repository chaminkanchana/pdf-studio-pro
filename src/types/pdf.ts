export type ToolCategory = 
  | 'all' 
  | 'edit' 
  | 'organize' 
  | 'convert' 
  | 'optimize' 
  | 'security' 
  | 'student' 
  | 'advanced';

export interface ToolItem {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  iconName: string;
  tag?: string;
  status: 'working' | 'backend-required' | 'preview-mode';
  popular?: boolean;
  studentToolkit?: boolean;
}

export type AnnotationType = 
  | 'text' 
  | 'image' 
  | 'draw' 
  | 'highlight' 
  | 'rectangle' 
  | 'circle' 
  | 'line' 
  | 'signature'
  | 'redaction';

export interface Point {
  x: number;
  y: number;
}

export interface Annotation {
  id: string;
  type: AnnotationType;
  page: number; // 1-indexed
  x: number; // PDF points coordinate
  y: number; // PDF points coordinate (origin bottom-left in PDF or top-left converted)
  width: number;
  height: number;
  color: string;
  fillColor?: string;
  opacity: number;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: 'Helvetica' | 'TimesRoman' | 'Courier';
  textAlign?: 'left' | 'center' | 'right';
  imageData?: string; // base64 / data URL
  points?: Point[]; // for pen freehand drawing
  rotation?: number;
}

export interface UniversityCoverPageData {
  universityName: string;
  department: string;
  moduleCode: string;
  moduleName: string;
  assignmentTitle: string;
  subtitle: string;
  studentName: string;
  studentId: string;
  lecturerName: string;
  submissionDate: string;
  academicYear: string;
  accentColor: string; // hex
}

export interface PageNumberConfig {
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-center';
  format: 'number' | 'page-of-total' | 'dash-number';
  startNumber: number;
  fontSize: number;
  color: string;
  skipFirstPage: boolean;
}

export interface WatermarkConfig {
  text: string;
  fontSize: number;
  opacity: number;
  color: string;
  rotation: number; // in degrees, e.g. 45 or -45
  applyToAllPages: boolean;
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount: number;
  fileSizeBytes: number;
  fileName: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
