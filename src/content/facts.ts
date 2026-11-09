/**
 * VERIFIED FACTS — the only biographical claims allowed on this site.
 * Every factual sentence in the UI must come from (or map to) an entry here.
 * Each entry has a stable id (F1, F2, ...) used by the content audit in AUDIT.md.
 * Do not add testimonials, evaluation scores, student results, class sizes or awards.
 */

export const person = {
  name: 'Syeda Alishba Fatima',
  roleLine: 'Mathematics Educator · Calculus · Analysis · Algebra',
  roleTitle: 'Mathematics Educator',
  subjects: [
    { glyph: '∫', name: 'Calculus' },
    { glyph: 'ε', name: 'Analysis' },
    { glyph: 'λ', name: 'Algebra' },
  ],
  email: 'alishbafatima25@gmail.com',
  linkedin: 'https://www.linkedin.com/in/syeda-alishba-fatima-695711135',
  github: 'https://github.com/AlishbaFatima12',
  scopus: '59726882200',
  notesRepo: 'https://github.com/AlishbaFatima12/agent-reliability-notes',
} as const;

export const education = [
  {
    id: 'F1',
    degree: 'MSc Pure Mathematics',
    institution: 'University of Karachi',
    year: '2017',
    result: '91.4%',
    honour: 'Gold Medal: 1st in the Department of Mathematics, 2nd in the Faculty of Science',
  },
  {
    id: 'F2',
    degree: 'BSc (Hons) Mathematics',
    institution: 'University of Karachi',
    year: '2016',
    result: '85.43%',
    honour: '3rd in the Department, 4th in the Faculty of Science',
  },
  {
    id: 'F3',
    degree: 'MS Computer Science & IT',
    institution: 'NED University of Engineering & Technology',
    year: '2024',
    result: 'CGPA 3.55 / 4.00',
    honour: '',
  },
] as const;

export type Role = {
  id: string;
  title: string;
  org: string;
  dates: string;
  start: string; // ISO yyyy-mm for <time>
  end: string | null;
  points: string[];
  tags: string[];
};

export const roles: Role[] = [
  {
    id: 'F8',
    title: 'Assistant Director',
    org: 'National Commission for Human Development',
    dates: 'Oct 2023 – present',
    start: '2023-10',
    end: null,
    points: [
      'Supervises volunteer teachers in the Each One Teach One literacy program, from briefing to learner assessment.',
      'Designs digital training content.',
    ],
    tags: ['Teacher supervision', 'Training design'],
  },
  {
    id: 'F7',
    title: 'Class Instructor (part-time)',
    org: 'PIAIC',
    dates: 'Current',
    start: '',
    end: null,
    points: ['Teaches Python, agentic AI and cloud-native tools to adult learners.'],
    tags: ['Python', 'AI', 'Adult learners'],
  },
  {
    id: 'F4',
    title: 'Lecturer in Mathematics (BS-17)',
    org: 'Islamabad Model College for Girls, F-11/3 · Federal Directorate of Education',
    dates: 'Jun 2022 – Oct 2023',
    start: '2022-06',
    end: '2023-10',
    points: [
      "Appointed on the recommendation of Pakistan's Federal Public Service Commission.",
      'Taught FSc Pre-Engineering mathematics (Grades 11–12) to large classes: precalculus, differential and integral calculus, analytic geometry, matrices and vectors.',
    ],
    tags: ['Calculus', 'Matrices & vectors', 'FPSC'],
  },
  {
    id: 'F5',
    title: 'Senior Mathematics Teacher',
    org: "The Froebel's School, Karachi",
    dates: 'Jul 2018 – Aug 2021',
    start: '2018-07',
    end: '2021-08',
    points: [
      'Taught Cambridge O Level and AKU-EB mathematics; designed tests and coursework.',
      'Supported weaker learners and stretched able students.',
      'Prepared students for the 14th National Inter-School Mathematics Olympiad (2018; about 14,000 participants) and organized its examination at the school, receiving a Certificate of Appreciation from Pak-Turk Maarif International Schools & Colleges.',
    ],
    tags: ['O Level', 'AKU-EB', 'Olympiad'],
  },
  {
    id: 'F6',
    title: 'Teaching Intern',
    org: 'Department of Mathematics, University of Karachi',
    dates: 'Jan – Apr 2018',
    start: '2018-01',
    end: '2018-04',
    points: ['Delivered undergraduate Numerical Analysis lectures and ran MATLAB laboratory sessions.'],
    tags: ['Numerical Analysis', 'MATLAB'],
  },
];

export const development = [
  { id: 'F9a', text: 'AKU-EB General and Subject-Specific Training for Mathematics', year: '2018' },
  { id: 'F9b', text: 'Presidential Initiative for AI & Computing certifications', year: '2026' },
  { id: 'F9c', text: 'Panaversity CAARE program', year: '2024 – present' },
] as const;

export const aiFinding = {
  id: 'F10',
  tool: 'Teach Me Panel',
  what: 'an LLM tutoring agent',
  method: 'a three-layer evaluation and 14 edge cases',
  aggregate: 80,
  truePass: 17,
  sentence:
    'I built Teach Me Panel, an LLM tutoring agent, and evaluated it with a three-layer evaluation and 14 edge cases: an 80% aggregate score concealed a 17% true pass rate on the hardest cases.',
} as const;

export const research = {
  id: 'F11',
  sentence:
    '5 peer-reviewed applied data-analytics publications, including 2 Springer book chapters.',
  publications: 5,
  springerChapters: 2,
} as const;

/** F12 — courses prepared to teach at SFU (titles verified against the SFU Academic Calendar, 2026). */
export const sfuCourses = [
  'FAN X99', 'MATH 100', 'MATH 150', 'MATH 151', 'MATH 152', 'MATH 154', 'MATH 157',
  'MATH 251', 'MATH 232', 'MATH 240', 'MATH 260', 'MACM 316',
] as const;
