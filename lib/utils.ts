import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { nanoid } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateAccessKey(): string {
  return nanoid(32);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getPostTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    blackboard_special: 'Blackboard Special',
    drink_special: 'Drink Special',
    event: 'Event / Entertainment',
    promotion: 'Promotion / Giveaway',
    other: 'Other',
  };
  return labels[type] || type;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: 'New',
    needs_info: 'Needs Info',
    ready: 'Ready',
    scheduled: 'Scheduled',
    completed: 'Completed',
    denied: 'Denied',
    archived: 'Archived',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    needs_info: 'bg-amber-100 text-amber-800',
    ready: 'bg-green-100 text-green-800',
    scheduled: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    denied: 'bg-red-100 text-red-800',
    archived: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function isImageFile(type: string): boolean {
  return type.startsWith('image/');
}

export function isVideoFile(type: string): boolean {
  return type.startsWith('video/');
}

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WebP, MP4, MOV`,
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${formatFileSize(file.size)}. Max: 50MB`,
    };
  }
  return { valid: true };
}
