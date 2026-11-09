/**
 * AI Verification Lab items. Each item is checked numerically in tests/unit/mistakes.test.ts
 * (the AI's claim is shown to be false and the correction true).
 */
export type Course = 'FAN X99' | 'Calculus I' | 'Calculus II' | 'Linear algebra';
export type Level = 'Warm-up' | 'Core' | 'Stretch';

export interface Step { text?: string; tex?: string }

export interface Mistake {
  id: string;
  course: Course;
  sfu: string;
  topic: string;
  level: Level;
  prompt: string;
  promptTex?: string;
  ai: string; // KaTeX for the AI's answer
  aiNote?: string; // the AI's accompanying sentence
  hint: string;
  solution: Step[];
  catchIt: string;
  catchTex?: string;
}

export const COURSES: Course[] = ['FAN X99', 'Calculus I', 'Calculus II', 'Linear algebra'];
export const LEVELS: Level[] = ['Warm-up', 'Core', 'Stretch'];

export const mistakes: Mistake[] = [
  /* ---------------- FAN X99 ---------------- */
  {
    id: 'fan-square', course: 'FAN X99', sfu: 'FAN X99', topic: 'Algebra: expanding brackets', level: 'Warm-up',
    prompt: 'Expand the expression.', promptTex: String.raw`(x+3)^2`,
    ai: String.raw`(x+3)^2 = x^2 + 9`, aiNote: 'Square each term.',
    hint: 'Squaring means multiplying the bracket by itself. Write out (x + 3)(x + 3).',
    solution: [
      { tex: String.raw`(x+3)^2=(x+3)(x+3)=x^2+3x+3x+9=x^2+6x+9` },
      { text: 'The middle term 6x comes from the two cross products. In general:' },
      { tex: String.raw`(a+b)^2=a^2+2ab+b^2\neq a^2+b^2` },
    ],
    catchIt: 'Substitute a number. At x = 1 the left side is 16, but x² + 9 gives 10.',
  },
  {
    id: 'fan-percent-cancel', course: 'FAN X99', sfu: 'FAN X99', topic: 'Percentages', level: 'Warm-up',
    prompt: 'An $80 jacket\'s price rises by 20% and later falls by 20%. What is the final price?',
    ai: String.raw`+20\% - 20\% = 0\% \;\Rightarrow\; \$80`, aiNote: 'The two changes cancel, so the price is back to $80.',
    hint: 'Is the 20% decrease taken from $80, or from the new, higher price?',
    solution: [
      { text: 'Write each change as a multiplier and apply them in order:' },
      { tex: String.raw`80\times 1.20 = 96,\qquad 96\times 0.80 = 76.80` },
      { tex: String.raw`1.20\times 0.80 = 0.96 \;\Rightarrow\; \text{a } 4\% \text{ decrease}` },
    ],
    catchIt: 'Percentages of different amounts do not add. Multiply the multipliers: 1.2 × 0.8 ≠ 1.',
  },
  {
    id: 'fan-reverse-percent', course: 'FAN X99', sfu: 'FAN X99', topic: 'Reverse percentages', level: 'Core',
    prompt: 'After a 25% discount, a jacket costs $60. What was the original price?',
    ai: String.raw`60\times 1.25 = \$75`, aiNote: 'Add the 25% back on.',
    hint: 'The 25% was taken off the original price, not off $60.',
    solution: [
      { text: 'Let P be the original price. A 25% discount leaves 75% of P:' },
      { tex: String.raw`0.75\,P = 60 \;\Rightarrow\; P=\frac{60}{0.75}=\$80` },
    ],
    catchIt: 'Check forwards: 25% off $75 is $56.25, not $60. 25% off $80 is $60.',
  },
  {
    id: 'fan-divide-by-x', course: 'FAN X99', sfu: 'FAN X99', topic: 'Solving equations', level: 'Core',
    prompt: 'Solve the equation.', promptTex: String.raw`x^2 = 5x`,
    ai: String.raw`\frac{x^2}{x}=\frac{5x}{x}\;\Rightarrow\; x=5`, aiNote: 'Divide both sides by x.',
    hint: 'Dividing by x is only allowed if x ≠ 0. What if x = 0?',
    solution: [
      { text: 'Move everything to one side and factor instead of dividing:' },
      { tex: String.raw`x^2-5x=0 \;\Rightarrow\; x(x-5)=0 \;\Rightarrow\; x=0 \ \text{ or } \ x=5` },
    ],
    catchIt: 'Never divide by something that can be zero. Substitute x = 0: 0 = 0, so it is a lost solution.',
  },
  {
    id: 'fan-compound', course: 'FAN X99', sfu: 'FAN X99', topic: 'Compound growth', level: 'Core',
    prompt: 'A $1,000 investment grows by 5% each year for 10 years. How much is it worth?',
    ai: String.raw`10\times 5\% = 50\% \;\Rightarrow\; \$1{,}500`, aiNote: 'Ten years of 5% growth is 50% growth.',
    hint: 'In year two, is the 5% taken from $1,000 or from $1,050?',
    solution: [
      { text: 'Each year multiplies the current balance by 1.05:' },
      { tex: String.raw`1000\times(1.05)^{10}\approx \$1{,}628.89` },
      { text: 'That is about 62.9% growth. The AI used simple (linear) growth, which ignores interest on interest.' },
    ],
    catchIt: 'Check two steps by hand: 1000 → 1050 → 1102.50. The second step already adds more than $50.',
  },

  /* ---------------- Calculus I ---------------- */
  {
    id: 'c1-chain', course: 'Calculus I', sfu: 'MATH 150 / 151', topic: 'Chain rule', level: 'Warm-up',
    prompt: 'Differentiate.', promptTex: String.raw`\frac{d}{dx}\,\sin\!\left(x^2\right)`,
    ai: String.raw`\frac{d}{dx}\,\sin\!\left(x^2\right)=\cos\!\left(x^2\right)`,
    hint: 'This is a composition: an outside function applied to an inside function.',
    solution: [
      { text: 'Chain rule: derivative of the outside, evaluated at the inside, times the derivative of the inside.' },
      { tex: String.raw`\frac{d}{dx}\,\sin\!\left(x^2\right)=\cos\!\left(x^2\right)\cdot 2x` },
    ],
    catchIt: 'Check a point. At x = 0 the graph of sin(x²) is flat (slope 0), but cos(0) = 1 claims slope 1.',
  },
  {
    id: 'c1-product', course: 'Calculus I', sfu: 'MATH 150 / 151', topic: 'Product rule', level: 'Warm-up',
    prompt: 'Differentiate.', promptTex: String.raw`\frac{d}{dx}\left(x^2\sin x\right)`,
    ai: String.raw`\frac{d}{dx}\left(x^2\sin x\right)=2x\cos x`, aiNote: 'Differentiate each factor and multiply.',
    hint: 'The derivative of a product is not the product of the derivatives.',
    solution: [
      { tex: String.raw`(fg)'=f'g+fg'` },
      { tex: String.raw`\frac{d}{dx}\left(x^2\sin x\right)=2x\sin x+x^2\cos x` },
    ],
    catchIt: 'Compare with a difference quotient at x = π: the true slope is −π² ≈ −9.87, the AI\'s formula gives −2π ≈ −6.28.',
  },
  {
    id: 'c1-limit-sin', course: 'Calculus I', sfu: 'MATH 150 / 151', topic: 'Limits', level: 'Core',
    prompt: 'Evaluate the limit.', promptTex: String.raw`\lim_{x\to 0}\frac{\sin(5x)}{x}`,
    ai: String.raw`\lim_{x\to 0}\frac{\sin(5x)}{x}=1`, aiNote: 'Because sin(x)/x → 1.',
    hint: 'The standard limit needs the same expression inside the sine and in the denominator.',
    solution: [
      { tex: String.raw`\frac{\sin(5x)}{x}=5\cdot\frac{\sin(5x)}{5x}\;\xrightarrow[x\to 0]{}\;5\cdot 1=5` },
    ],
    catchIt: 'Plug in a small number: sin(0.05)/0.01 ≈ 4.998, nowhere near 1.',
  },
  {
    id: 'c1-critical', course: 'Calculus I', sfu: 'MATH 150 / 151', topic: 'Critical points', level: 'Stretch',
    prompt: 'Classify the critical point of f(x) = x³ at x = 0.',
    ai: String.raw`f'(0)=0 \;\Rightarrow\; x=0 \text{ is a local max or min}`,
    hint: 'f′(c) = 0 is necessary for an interior extremum. Is it sufficient?',
    solution: [
      { tex: String.raw`f'(x)=3x^2\ge 0 \text{ for all } x` },
      { text: 'f is increasing on both sides of 0, so there is no maximum or minimum. x = 0 is a horizontal point of inflection.' },
      { tex: String.raw`f(-0.1)=-0.001<0<0.001=f(0.1)` },
    ],
    catchIt: 'Check the sign of f′ on each side (the first-derivative test), or simply evaluate f just left and right of 0.',
  },
  {
    id: 'c1-one-to-infinity', course: 'Calculus I', sfu: 'MATH 150 / 151', topic: 'Indeterminate forms', level: 'Stretch',
    prompt: 'Evaluate the limit.', promptTex: String.raw`\lim_{x\to\infty}\left(1+\frac{1}{x}\right)^{x}`,
    ai: String.raw`1+\tfrac1x\to 1 \;\Rightarrow\; 1^{\infty}=1`, aiNote: 'The base tends to 1, and 1 to any power is 1.',
    hint: 'The base approaches 1 while the exponent grows. Which effect wins? Take logarithms.',
    solution: [
      { tex: String.raw`\ln\left(1+\tfrac1x\right)^{x}=x\ln\left(1+\tfrac1x\right)=\frac{\ln(1+t)}{t}\Big|_{t=1/x}\;\xrightarrow[t\to 0]{}\;1` },
      { tex: String.raw`\lim_{x\to\infty}\left(1+\frac1x\right)^x=e^1=e\approx 2.718` },
    ],
    catchIt: '1^∞ is an indeterminate form, not a number. Test x = 1000: (1.001)¹⁰⁰⁰ ≈ 2.717.',
  },

  /* ---------------- Calculus II ---------------- */
  {
    id: 'c2-signed-area', course: 'Calculus II', sfu: 'MATH 151 / 152', topic: 'Area vs. integral', level: 'Core',
    prompt: 'Find the area between y = sin x and the x-axis on [0, 2π].',
    ai: String.raw`\int_0^{2\pi}\sin x\,dx=\big[-\cos x\big]_0^{2\pi}=0 \;\Rightarrow\; \text{Area}=0`,
    hint: 'Part of the region lies below the axis. How does a definite integral count that part?',
    solution: [
      { text: 'The integral is signed area; the two halves cancel. Area needs the absolute value:' },
      { tex: String.raw`\int_0^{2\pi}|\sin x|\,dx=\int_0^{\pi}\sin x\,dx-\int_{\pi}^{2\pi}\sin x\,dx=2+2=4` },
    ],
    catchIt: 'Sketch it. A region you can see cannot have zero area, and area is never negative.',
  },
  {
    id: 'c2-improper', course: 'Calculus II', sfu: 'MATH 152', topic: 'Improper integrals', level: 'Stretch',
    prompt: 'Evaluate the integral.', promptTex: String.raw`\int_{-1}^{1}\frac{1}{x^2}\,dx`,
    ai: String.raw`\int_{-1}^{1}\frac{dx}{x^2}=\left[-\frac1x\right]_{-1}^{1}=-1-1=-2`,
    hint: 'The integrand is positive everywhere it is defined. Can the answer be negative? Where is it undefined?',
    solution: [
      { text: 'The Fundamental Theorem needs f continuous on [−1, 1], but 1/x² blows up at 0. Split and take limits:' },
      { tex: String.raw`\int_{0}^{1}\frac{dx}{x^2}=\lim_{t\to 0^+}\left[-\frac1x\right]_{t}^{1}=\lim_{t\to 0^+}\left(\frac1t-1\right)=\infty` },
      { text: 'So the integral diverges.' },
    ],
    catchIt: 'Sign check: a positive integrand cannot give a negative integral. Then check the theorem\'s hypotheses.',
  },
  {
    id: 'c2-parts', course: 'Calculus II', sfu: 'MATH 152', topic: 'Integration by parts', level: 'Core',
    prompt: 'Find the antiderivative.', promptTex: String.raw`\int x\,e^{x}\,dx`,
    ai: String.raw`\int x\,e^{x}\,dx=\frac{x^2}{2}\,e^{x}+C`, aiNote: 'Integrate each factor.',
    hint: 'There is no "product rule" that lets you integrate factors separately. Try parts with u = x.',
    solution: [
      { tex: String.raw`u=x,\ dv=e^x\,dx \;\Rightarrow\; \int x e^x\,dx = x e^x-\int e^x\,dx = x e^x - e^x + C` },
    ],
    catchIt: 'Differentiate the answer. d/dx[(x²/2)eˣ] = xeˣ + (x²/2)eˣ, which is not xeˣ.',
  },
  {
    id: 'c2-harmonic', course: 'Calculus II', sfu: 'MATH 152', topic: 'Series', level: 'Core',
    prompt: 'Does the series converge?', promptTex: String.raw`\sum_{n=1}^{\infty}\frac1n`,
    ai: String.raw`\frac1n\to 0 \;\Rightarrow\; \sum_{n=1}^{\infty}\frac1n \text{ converges}`,
    hint: 'Terms tending to 0 is necessary for convergence. Is it sufficient?',
    solution: [
      { text: 'Group the terms (or use the integral test):' },
      { tex: String.raw`1+\tfrac12+\left(\tfrac13+\tfrac14\right)+\left(\tfrac15+\cdots+\tfrac18\right)+\cdots\ \ge\ 1+\tfrac12+\tfrac12+\tfrac12+\cdots` },
      { text: 'The partial sums grow without bound (roughly like ln n), so the harmonic series diverges.' },
    ],
    catchIt: 'Compute partial sums: S₁₀₀₀ ≈ 7.49 and S₁₀₀₀₀₀₀ ≈ 14.39. They keep growing.',
  },

  /* ---------------- Linear algebra ---------------- */
  {
    id: 'la-det-sum', course: 'Linear algebra', sfu: 'MATH 232 / 240', topic: 'Determinants', level: 'Core',
    prompt: 'For 2 × 2 matrices A and B, simplify det(A + B).',
    ai: String.raw`\det(A+B)=\det A+\det B`,
    hint: 'Test the claim on the simplest matrices you know.',
    solution: [
      { text: 'Counterexample with A = B = I:' },
      { tex: String.raw`\det(I+I)=\det\begin{pmatrix}2&0\\0&2\end{pmatrix}=4\neq 2=\det I+\det I` },
      { text: 'The determinant is multiplicative, det(AB) = det A · det B, but not additive.' },
    ],
    catchIt: 'Try A = B = I. One small counterexample settles a general claim.',
  },
  {
    id: 'la-inverse-order', course: 'Linear algebra', sfu: 'MATH 232 / 240', topic: 'Matrix inverses', level: 'Core',
    prompt: 'If A and B are invertible, what is (AB)⁻¹?',
    ai: String.raw`(AB)^{-1}=A^{-1}B^{-1}`,
    hint: 'To undo "do B, then A", what do you undo first?',
    solution: [
      { tex: String.raw`(AB)(B^{-1}A^{-1})=A(BB^{-1})A^{-1}=AA^{-1}=I` },
      { tex: String.raw`\Rightarrow\;(AB)^{-1}=B^{-1}A^{-1}` },
      { text: 'Matrix multiplication is not commutative, so the order matters.' },
    ],
    catchIt: 'Multiply the claimed inverse by AB with two specific matrices, e.g. A = [[1,1],[0,1]], B = [[1,0],[1,1]]: you do not get I.',
  },
  {
    id: 'la-cancel', course: 'Linear algebra', sfu: 'MATH 232 / 240', topic: 'Matrix algebra', level: 'Stretch',
    prompt: 'If AB = AC, can we conclude B = C?',
    ai: String.raw`AB=AC \;\Rightarrow\; B=C`, aiNote: 'Cancel A from both sides.',
    hint: 'Cancelling A means multiplying by A⁻¹. Does A⁻¹ always exist?',
    solution: [
      { text: 'Only if A is invertible. Counterexample with a singular A:' },
      { tex: String.raw`A=\begin{pmatrix}1&0\\0&0\end{pmatrix},\ B=\begin{pmatrix}1&0\\0&1\end{pmatrix},\ C=\begin{pmatrix}1&0\\0&2\end{pmatrix}` },
      { tex: String.raw`AB=AC=\begin{pmatrix}1&0\\0&0\end{pmatrix}\ \text{ but } \ B\neq C` },
    ],
    catchIt: 'Ask what justifies each step. "Cancel" is division in disguise, so check that det A ≠ 0.',
  },
];

export const checklist = [
  { k: 'Substitute a number', v: 'Pick an easy value (0, 1, 2) and evaluate both sides. Most algebra errors fail here.' },
  { k: 'Test a special case', v: 'Try A = I, x = 0, n = 1, or a symmetric case where you already know the answer.' },
  { k: 'Estimate size and sign', v: 'Should the answer be positive? Bigger than 1? Roughly 10 or roughly 1000?' },
  { k: 'Reverse the operation', v: 'Differentiate the antiderivative, multiply back, expand the factorization.' },
  { k: 'Check the conditions', v: 'Division by zero, domain, continuity, invertibility: are the theorem\'s hypotheses met?' },
  { k: 'Compute it another way', v: 'A difference quotient, a Riemann sum, a partial sum, a quick sketch.' },
  { k: 'Explain every step', v: 'If a step cannot be justified in words, it is the step to distrust.' },
] as const;
