import fs from 'node:fs';
import path from 'node:path';
import { siteConfig } from '../site.config';

/** Prefix an internal path with the configured base (/teaching/). */
export function url(p = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const clean = p.replace(/^\//, '');
  return base + clean;
}

/** PDFs that actually exist in public/docs at build time. */
export function availableDocs() {
  return siteConfig.docs.filter((d) => fs.existsSync(path.join(process.cwd(), 'public', 'docs', d.file)));
}

export const nav = [
  { href: '', label: 'Home' },
  { href: 'philosophy/', label: 'Philosophy' },
  { href: 'lab/', label: 'Interactive Lab' },
  { href: 'ai-lab/', label: 'AI Verification Lab' },
  { href: 'courses/', label: 'Courses' },
  { href: 'experience/', label: 'Experience' },
  { href: 'contact/', label: 'Contact' },
] as const;
