/**
 * Site settings you are expected to edit.
 *
 * - youtubeId: paste the ID of your teaching-demonstration video
 *   (the part after "v=" in a YouTube link, e.g. "dQw4w9WgXcQ").
 *   Leave it as '' and the Teaching Demonstration section is hidden.
 * - docs: PDFs live in /public/docs/. A link is shown only if the file exists at build time.
 */
export const siteConfig = {
  title: 'Syeda Alishba Fatima · Teaching Mathematics',
  description:
    'Teaching portfolio of Syeda Alishba Fatima: interactive labs in calculus, analysis and algebra, and an AI verification lab for mathematics students.',
  youtubeId: '',
  youtubeTitle: 'Teaching demonstration',
  docs: [
    { file: 'cv.pdf', label: 'Curriculum vitae' },
    { file: 'teaching-portfolio.pdf', label: 'Teaching portfolio' },
    { file: 'sample-lesson-plan.pdf', label: 'Sample lesson plan' },
  ],
} as const;
