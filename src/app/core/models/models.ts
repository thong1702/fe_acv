export interface User {
  id?: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'EDITOR';
  enabled: boolean;
  fullName?: string;
  password?: string; // only used in creation/editing
}

export interface CompanyInfo {
  id?: number;
  introduction: string;
  history: string;
  contactInfo: string;
}

export interface Category {
  id?: number;
  name: string;
  slug: string;
  type: 'POST' | 'BUSINESS';
  description: string;
}

export interface Post {
  id?: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  thumbnail: string;
  viewCount: number;
  status: 'DRAFT' | 'PUBLISHED';
  category: Category;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentInfo {
  id?: number;
  docNumber: string;
  publishDate: string;
  title: string;
  description: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  originalFileName?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  username: string;
  role: 'ADMIN' | 'EDITOR';
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface OrganizationNode {
  id?: number;
  name: string;
  position: string;
  description?: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  orderIndex?: number;
  parentId?: number;
  parentName?: string;
  updatedAt?: string;
}
