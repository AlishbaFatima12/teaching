/**
 * Courses prepared to teach at SFU (fact F12). Titles are taken from the SFU Academic Calendar (2026).
 * Approach notes describe how I would teach; they are plans, not claims about past outcomes.
 */
export interface Course {
  code: string;
  title: string;
  approach: string;
  modules: string[]; // lab module slugs
  ai?: string; // AI-lab course filter label
  grounded?: string; // fact-based link to experience
}

export interface CourseGroup { id: string; name: string; courses: Course[] }

export const courseGroups: CourseGroup[] = [
  {
    id: 'foundations',
    name: 'Foundations and precalculus',
    courses: [
      {
        code: 'FAN X99', title: 'Foundations of Analytical and Quantitative Reasoning',
        approach: 'Start from what students can already do and rebuild confidence through real contexts: percentages, rates, linear and exponential models. Frequent low-stakes checks so that no gap goes unnoticed.',
        modules: ['foundations'], ai: 'FAN X99',
      },
      {
        code: 'MATH 100', title: 'Precalculus',
        approach: 'Functions as the language of calculus: graphs, transformations, exponentials, logarithms and trigonometry, each connected to the calculus idea it prepares for.',
        modules: ['foundations', 'secant-tangent'],
        grounded: 'Taught precalculus in FSc Pre-Engineering mathematics (Grades 11–12).',
      },
    ],
  },
  {
    id: 'calculus',
    name: 'Calculus',
    courses: [
      {
        code: 'MATH 150', title: 'Calculus I with Review',
        approach: 'Calculus I with review placed at the point of need: fractions, exponents and function notation are revisited in the same lesson that uses them, not in a separate block.',
        modules: ['secant-tangent', 'riemann-sums'], ai: 'Calculus I',
      },
      {
        code: 'MATH 151', title: 'Calculus I',
        approach: 'Limits and derivatives taught picture-first (secant to tangent), then the rules, then applications such as optimization and related rates, with a numerical check for every rule.',
        modules: ['secant-tangent', 'riemann-sums'], ai: 'Calculus I',
        grounded: 'Taught differential and integral calculus in FSc Pre-Engineering mathematics.',
      },
      {
        code: 'MATH 152', title: 'Calculus II',
        approach: 'Integration, applications, sequences and series, with checking built in: differentiate every antiderivative, estimate every integral, and compute partial sums before trusting a convergence claim.',
        modules: ['riemann-sums', 'taylor'], ai: 'Calculus II',
      },
      {
        code: 'MATH 154', title: 'Mathematics for the Life Sciences I',
        approach: 'Calculus through models of growth, decay and rates of change in biological settings, so each new technique answers a question about a living system.',
        modules: ['foundations', 'secant-tangent'],
      },
      {
        code: 'MATH 157', title: 'Calculus I for the Social Sciences',
        approach: 'Calculus through economic and social contexts: marginal change, optimization and compound growth, with interpretation in words valued as much as the computation.',
        modules: ['foundations', 'secant-tangent'],
      },
      {
        code: 'MATH 251', title: 'Calculus III',
        approach: 'Multivariable calculus that extends single-variable intuition: surfaces, level curves and gradients visualized before they are computed.',
        modules: ['linear-maps', 'taylor'],
      },
    ],
  },
  {
    id: 'linear-algebra',
    name: 'Linear algebra',
    courses: [
      {
        code: 'MATH 232', title: 'Applied Linear Algebra',
        approach: 'Matrices as transformations first and as systems second: row reduction, determinants and eigenvalues, with computation used to explore examples too large to do by hand.',
        modules: ['linear-maps'], ai: 'Linear algebra',
        grounded: 'Taught matrices and vectors in FSc Pre-Engineering mathematics.',
      },
      {
        code: 'MATH 240', title: 'Algebra I: Linear Algebra',
        approach: 'Proof-based linear algebra built on geometric intuition: examples before abstraction, and every definition tested against a picture and a counterexample.',
        modules: ['linear-maps'], ai: 'Linear algebra',
      },
    ],
  },
  {
    id: 'numerical',
    name: 'Differential equations and numerical analysis',
    courses: [
      {
        code: 'MATH 260', title: 'Introduction to Ordinary Differential Equations',
        approach: 'Three views of every equation: qualitative (slope fields), analytic (solution methods) and numerical (Euler\'s method compared against the exact solution).',
        modules: ['root-finding', 'taylor'],
      },
      {
        code: 'MACM 316', title: 'Numerical Analysis I',
        approach: 'Algorithms together with their errors: root-finding, interpolation, numerical integration and linear systems, each implemented, tested and broken on purpose in a computing lab.',
        modules: ['root-finding', 'riemann-sums'],
        grounded: 'Delivered undergraduate Numerical Analysis lectures and ran MATLAB laboratory sessions at the University of Karachi.',
      },
    ],
  },
];
