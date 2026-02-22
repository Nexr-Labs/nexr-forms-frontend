export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
}

export enum FieldType {
  SHORT_TEXT = 'SHORT_TEXT',
  LONG_TEXT = 'LONG_TEXT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',  // New: radio buttons
  DROPDOWN = 'DROPDOWN',
  CHECKBOX = 'CHECKBOX',
  FILE_UPLOAD = 'FILE_UPLOAD',  // New
  DATE = 'DATE',  // New
  TIME = 'TIME',  // New
  RATING = 'RATING',  // New: star rating
  LINEAR_SCALE = 'LINEAR_SCALE',  // New: 1-5, 1-10 scale
  SECTION = 'SECTION', // New: Visual separator with title/description
}

export interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
}

export interface EventField {
  id: string;
  eventId: string;
  label: string;
  type: FieldType;
  required: boolean;
  order: number;
  options?: string[]; // For dropdown/checkbox/multiple choice
  description?: string; // Help text for the question
  minValue?: number; // For LINEAR_SCALE, character limits
  maxValue?: number; // For LINEAR_SCALE, character limits
  fileTypes?: string[]; // For FILE_UPLOAD (e.g., ['pdf', 'jpg'])
  maxFileSize?: number; // For FILE_UPLOAD (bytes)
  imageUrl?: string; // New: Organizer image/QR code
  logic?: { [option: string]: string }; // Map option string to section_id string
}

export interface EventData {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  maxSeats: number | null;
  status: EventStatus;
  createdAt: string;
  fields: EventField[];
  registrationCount?: number;
  limitOneResponse?: boolean;
  whatsappLink?: string;
  isPaid?: boolean;
}

export interface Registration {
  id: string;
  eventId: string;
  submittedAt: string;
  answers: Record<string, any>; // Keyed by fieldId
  verified: boolean;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

export interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalEvents: number;
  totalRegistrations: number;
  upcomingEvents: number;
}