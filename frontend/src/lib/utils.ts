import { TRACKED_USERS } from './config';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserName(userId: string): string {
  return TRACKED_USERS[userId]?.name || 'User';
}

export function timeAgo(timestamp: number): string {
  const ts = String(timestamp).length === 10 ? timestamp * 1000 : timestamp;
  const now = Date.now();
  const diff = Math.floor((now - ts) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

export function spotifyUrl(uri?: string): string {
  if (!uri) return '#';

  const parts = uri.split(':');
  if (parts.length < 3) {
    return 'https://open.spotify.com';
  }

  const [, type, id] = parts;
  const baseUrl = 'https://open.spotify.com';

  switch (type) {
    case 'track':
      return `${baseUrl}/track/${id}`;
    case 'artist':
      return `${baseUrl}/artist/${id}`;
    case 'album':
      return `${baseUrl}/album/${id}`;
    case 'user':
      return `${baseUrl}/user/${id}`;
    default:
      return baseUrl;
  }
}
