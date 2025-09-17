// Utility date helpers to safely parse server timestamps (ISO or SQL-like) and format for display
export function parseServerDate(value: string | null): Date | null {
  if (!value) return null;
  // If format is "YYYY-MM-DD HH:MM:SS" (no timezone), treat as UTC by appending 'Z'
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    try {
      return new Date(value.replace(' ', 'T') + 'Z');
    } catch (e) {
      return null;
    }
  }

  // Otherwise, try native parsing (handles ISO strings, with or without offset)
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d;
}

export function formatDateParts(value: string | null) {
  const d = parseServerDate(value);
  if (!d) return { date: 'N/A', time: 'N/A' };
  return {
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

export function formatTimeAgo(value: string | null) {
  const d = parseServerDate(value);
  if (!d) return '';
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? 's' : ''} ago`;
}
