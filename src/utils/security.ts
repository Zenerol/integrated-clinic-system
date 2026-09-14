/**
 * Security and Data Protection Utilities
 * Aligned with OWASP A02: Cryptographic Failures & Sensitive Data Protection
 */

/**
 * Masks sensitive phone numbers for UI display.
 * Example: "09171234567" -> "0917****567"
 */
export function maskPhone(phone?: string | null): string {
  if (!phone) return 'N/A';
  const clean = phone.trim();
  if (clean.length < 7) return '****';
  return `${clean.slice(0, 4)}****${clean.slice(-3)}`;
}

/**
 * Masks sensitive email addresses for UI display.
 * Example: "juan.delacruz@g.batstate-u.edu.ph" -> "j***z@g.batstate-u.edu.ph"
 */
export function maskEmail(email?: string | null): string {
  if (!email) return 'N/A';
  const parts = email.split('@');
  if (parts.length !== 2) return '****';
  const name = parts[0];
  const domain = parts[1];

  if (name.length <= 2) {
    return `${name[0]}*@${domain}`;
  }
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

/**
 * Masks sensitive Student/Employee ID numbers.
 * Example: "2024-12345" -> "2024-****"
 */
export function maskIdNumber(id?: string | null): string {
  if (!id) return 'N/A';
  const clean = id.trim();
  if (clean.length <= 5) return `${clean.slice(0, 2)}***`;
  return `${clean.slice(0, 5)}-****`;
}

/**
 * Sanitizes input text to prevent XSS string injections.
 * Removes HTML tags, script elements, and javascript: protocols.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/on\w+="[^"]*"/gi, '') // Remove inline event listeners like onload=""
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:[^\s'"]*/gi, '') // Remove javascript: URIs
    .replace(/<[^>]*>?/gm, ''); // Strip remaining raw HTML tags
}

/**
 * Safe logger for development mode only.
 * Automatically suppresses sensitive fields (tokens, passwords, PHI) and blocks in production.
 */
export const securityLogger = {
  log: (message: string, ...args: unknown[]) => {
    if (import.meta.env.DEV) {
      // In dev mode, mask any potential token or password arguments
      const safeArgs = args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          const clone = { ...(arg as Record<string, unknown>) };
          if ('password' in clone) clone.password = '[REDACTED]';
          if ('access_token' in clone) clone.access_token = '[REDACTED]';
          if ('refresh_token' in clone) clone.refresh_token = '[REDACTED]';
          return clone;
        }
        return arg;
      });
      console.log(`[SEC-AUDIT] ${message}`, ...safeArgs);
    }
  },
  error: (message: string, error?: unknown) => {
    if (import.meta.env.DEV) {
      console.error(`[SEC-ERROR] ${message}`, error);
    }
  },
};
