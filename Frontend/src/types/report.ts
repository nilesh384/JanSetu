// Report Types for Frontend
export interface Report {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  mediaUrls: string[];
  audioUrl?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  department: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  timeTakenToResolve?: string;
}

export interface CreateReportData {
  userId: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  mediaUrls?: string[];
  audioUrl?: string;
  latitude: number;
  longitude: number;
  address: string;
  department: string;
}

export interface UpdateReportData {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  mediaUrls?: string[];
  audioUrl?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  department?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  status?: 'resolved' | 'pending';
  category?: string;
  priority?: string;
}

export interface ReportStats {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  averageResolutionTime?: string;
  reportsByCategory: { [category: string]: number };
  reportsByPriority: { [priority: string]: number };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  currentPage: number;
  totalPages: number;
}

// Report Categories
export const REPORT_CATEGORIES = [
  'roads',
  'water',
  'sanitation', 
  'electricity',
  'infrastructure',
  'environment',
  'safety',
  'other'
] as const;

export type ReportCategory = typeof REPORT_CATEGORIES[number];

// Report Priorities
export const REPORT_PRIORITIES = [
  'low',
  'medium', 
  'high',
  'critical'
] as const;

export type ReportPriority = typeof REPORT_PRIORITIES[number];

// Department mappings
export const DEPARTMENT_MAP: Record<ReportCategory, string> = {
  roads: 'Public Works',
  water: 'Water Board',
  sanitation: 'Sanitation Dept',
  electricity: 'Electricity Board', 
  infrastructure: 'Municipal Corp',
  environment: 'Environment Dept',
  safety: 'Police Dept',
  other: 'General'
};