import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML string to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    return dirty;
  }
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitizes plain text (removes HTML tags)
 */
export function sanitizeText(text: string): string {
  if (typeof window === 'undefined') {
    return text;
  }
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitizes user input for display
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return sanitizeText(input).trim();
}
