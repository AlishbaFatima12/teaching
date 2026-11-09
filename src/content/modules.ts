/** Interactive Lab module catalogue and teaching content (shared by Home, Lab index and module pages). */
export interface LabModule {
  slug: string;
  letter: string;
  title: string;
  course: string; // matching SFU course(s)
  courseNote: string;
  blurb: string;
  intro: string;
  formula: string; // KaTeX
  outcomes: string[];
  questions: { q: string; a: string }[];
  /** 50-minute class or workshop plan */
  notes: { t: string; what: string }[];
  notesTip: string;
  /** tiny decorative path in a 100×60 box for preview cards */
  glyph: string;
}

export const modules: LabModule[] = [
  {
    slug: 'secant-tangent',
    letter: 'A',
    title: 'Secant to tangent',
    course: 'MATH 150 / 151',
    courseNote: 'Calculus I: the definition of the derivative',
    blurb: 'Shrink h and watch the difference quotient settle on the derivative.',
    intro:
      'The derivative is defined as a limit, and the limit is the hardest idea in the first weeks of calculus. Here students choose a function and a point, then shrink h themselves and watch the secant line turn into the tangent while the numbers settle.',
    formula: String.raw`f'(a)=\lim_{h\to 0}\frac{f(a+h)-f(a)}{h}`,
    outcomes: [
      'Interpret the difference quotient as the slope of a secant line.',
      'Explain the derivative as the limit of secant slopes, from both sides.',
      'Estimate f′(a) numerically and judge how close the estimate is.',
      'Recognize where the limit fails to exist (try √x near 0).',
    ],
    questions: [
      { q: 'For f(x) = x², use the limit table at a = 1. What pattern do you see in the difference quotients, and why?', a: 'They are 2 + h exactly: (1+h)² − 1 = 2h + h², so dividing by h leaves 2 + h, which tends to 2.' },
      { q: 'Switch to h < 0. Do the left-hand quotients approach the same number? What would it mean if they did not?', a: 'For a smooth function they agree. If the one-sided limits differed (as for |x| at 0) the derivative would not exist there.' },
      { q: 'For √x, move a towards 0. What happens to f′(a), and what does the graph show?', a: 'f′(a) = 1/(2√a) grows without bound: the tangent becomes vertical, so √x is not differentiable at 0.' },
    ],
    notes: [
      { t: '0–5', what: 'Prompt: "How steep is y = x² at x = 1?" Students commit to a guess.' },
      { t: '5–15', what: 'Project the module. Shrink h live; students record slopes in the limit table and predict the next row.' },
      { t: '15–30', what: 'Pairs answer the three guided questions on their own devices; I circulate and listen for "the slope at a point".' },
      { t: '30–42', what: 'Board work: derive 2a + h algebraically and connect it to the table. Introduce the notation.' },
      { t: '42–50', what: 'Exit question: estimate the derivative of eˣ at 0 from three quotients. I read them before the next class.' },
    ],
    notesTip: 'In a TA-led workshop, the √x question is the stretch task for students who finish early.',
    glyph: 'M4 52 C 30 50, 46 30, 60 18 S 86 6, 96 5 M10 50 L92 10',
  },
  {
    slug: 'riemann-sums',
    letter: 'B',
    title: 'Riemann sums and the Fundamental Theorem',
    course: 'MATH 151 / 152',
    courseNote: 'Calculus I–II: the definite integral',
    blurb: 'Left, right, midpoint and trapezoid sums, and how fast their error falls.',
    intro:
      'Students build the definite integral from rectangles, then check every sum against the exact value from the Fundamental Theorem of Calculus. The log–log error plot makes the order of each rule visible.',
    formula: String.raw`\begin{aligned}\int_a^b f(x)\,dx&=\lim_{n\to\infty}\sum_{i=1}^{n} f(x_i^{*})\,\Delta x\\&=F(b)-F(a)\end{aligned}`,
    outcomes: [
      'Compute left, right, midpoint and trapezoid approximations of a definite integral.',
      'Use the Fundamental Theorem of Calculus to find the exact value and the error.',
      'Interpret the integral as signed area (pieces below the axis count as negative).',
      'Compare methods by how their error shrinks as n grows: 1/n versus 1/n².',
    ],
    questions: [
      { q: 'For x² on [0, 2], is the left sum an over- or under-estimate? The right sum? Explain using the graph.', a: 'x² is increasing, so left rectangles sit under the curve (under-estimate) and right rectangles over it (over-estimate).' },
      { q: 'Double n from 10 to 20 with the left rule, then with the midpoint rule. By what factor does each error shrink?', a: 'Left: about 2 (error ∝ 1/n). Midpoint: about 4 (error ∝ 1/n²). The log–log slopes are −1 and −2.' },
      { q: 'Choose x³ − x on [−1, 1.5]. Why can a sum be small even though the shaded region is large?', a: 'Pieces below the axis are negative and cancel pieces above. The integral is signed area; total area needs |f|.' },
    ],
    notes: [
      { t: '0–8', what: 'Hand-compute a left sum with n = 4 for x² on [0, 2] in pairs; compare answers.' },
      { t: '8–20', what: 'Module: switch rules and increase n; students predict which rule is best before looking.' },
      { t: '20–32', what: 'Introduce F(b) − F(a) and verify the module\'s exact value by hand.' },
      { t: '32–44', what: 'Error plot: students read the slopes and state the error order of each rule.' },
      { t: '44–50', what: 'One-minute paper: "Why is the integral of sin x on [0, 2π] equal to 0?"' },
    ],
    notesTip: 'In a workshop, the signed-area question pairs naturally with the signed-area item in the AI Verification Lab.',
    glyph: 'M10 56V40H22V56M22 56V30H34V56M34 56V22H46V56M46 56V17H58V56M58 56V15H70V56M70 56V17H82V56M4 46 C 30 20, 60 8, 96 18',
  },
  {
    slug: 'taylor',
    letter: 'C',
    title: 'Taylor polynomials',
    course: 'MATH 152',
    courseNote: 'Calculus II: series and approximation',
    blurb: 'Raise the degree and see where the approximation can be trusted.',
    intro:
      'A Taylor polynomial is only useful if you know where to trust it. The shaded band shows exactly where the error is below a tolerance you choose, so "interval of convergence" stops being an abstract phrase.',
    formula: String.raw`\begin{gathered}P_n(x)=\sum_{k=0}^{n}\frac{f^{(k)}(0)}{k!}\,x^k\\[4pt]|R_n(x)|\le \frac{M\,|x|^{n+1}}{(n+1)!}\end{gathered}`,
    outcomes: [
      'Build Maclaurin polynomials for sin x, eˣ and ln(1 + x).',
      'Describe how the interval of good approximation grows with the degree.',
      'Use the Lagrange remainder to bound the error for sin x.',
      'Explain why the ln(1 + x) polynomials fail beyond x = 1, whatever the degree.',
    ],
    questions: [
      { q: 'For sin x, raise the degree from 1 to 3 to 5. Why does the polynomial only change at odd degrees?', a: 'sin x is odd, so every even-power coefficient is 0: P₂ = P₁, P₄ = P₃, and so on.' },
      { q: 'With tolerance 0.01, how wide is the trusted interval for sin x at degree 1? Check with the Lagrange bound.', a: 'About |x| < 0.39. The bound |x|³/6 < 0.01 gives |x| < 0.39, which matches.' },
      { q: 'For ln(1 + x), push the degree to 15 and look at x = 1.5. What happens, and why?', a: 'The error grows with n: the series only converges on (−1, 1]. More terms make things worse outside that interval.' },
    ],
    notes: [
      { t: '0–8', what: 'Question: "How does a calculator find sin 0.3?" Collect ideas.' },
      { t: '8–20', what: 'Build P₁, P₃ for sin x by matching derivatives at 0; check them in the module.' },
      { t: '20–35', what: 'Guided questions in pairs; the tolerance control makes students quantify "good approximation".' },
      { t: '35–45', what: 'Lagrange bound on the board; verify it numerically with the module\'s readout.' },
      { t: '45–50', what: 'Exit task: how many terms of eˣ guarantee e to 3 decimal places?' },
    ],
    notesTip: 'The ln(1 + x) case is the stretch task: it sets up the ratio test later in the course.',
    glyph: 'M4 30 C 20 4, 34 4, 50 30 S 80 56, 96 30 M14 6 C 30 50, 70 50, 86 6',
  },
  {
    slug: 'linear-maps',
    letter: 'D',
    title: 'Linear transformations in 2D',
    course: 'MATH 232 / 240',
    courseNote: 'Linear algebra: matrices as maps',
    blurb: 'Drag a matrix and watch the unit square, the grid and the determinant respond.',
    intro:
      'A matrix is easier to understand as a motion of the plane than as a table of numbers. Drag the images of the basis vectors and watch the grid, the unit square, the determinant and the eigenvectors respond together.',
    formula: String.raw`\begin{gathered}A=\begin{pmatrix}a_{11}&a_{12}\\a_{21}&a_{22}\end{pmatrix}\\[4pt]\det A = a_{11}a_{22}-a_{12}a_{21},\qquad A\mathbf v=\lambda\mathbf v\end{gathered}`,
    outcomes: [
      'Read the columns of a matrix as the images of the standard basis vectors.',
      'Interpret the determinant as the signed area scale factor (negative means orientation is reversed).',
      'Identify eigenvectors as directions that are only stretched, and recognize when none are real.',
      'Connect det A = 0 to a collapsed image and a non-invertible matrix.',
    ],
    questions: [
      { q: 'Choose the Reflect preset. What is det A, and what happened to the unit square?', a: 'det A = −1: area is unchanged but orientation is reversed (the square is flipped, shown hatched).' },
      { q: 'Choose Rotate 60°. Why are there no dashed eigenvector lines?', a: 'A rotation turns every non-zero vector, so no real direction is preserved: the eigenvalues are complex, 0.5 ± 0.87i.' },
      { q: 'Drag Ae₂ until it lies on the line through Ae₁. What does the determinant do, and what does that say about solving Ax = b?', a: 'det A → 0 and the square collapses to a segment. A is not invertible: Ax = b has no solution or infinitely many.' },
    ],
    notes: [
      { t: '0–7', what: 'Warm-up: where does [[2, 1], [1, 2]] send (1, 0) and (0, 1)? Students sketch.' },
      { t: '7–20', what: 'Module: presets one by one; students describe each motion in words before seeing det A.' },
      { t: '20–35', what: 'Guided questions in pairs; the "make det A = 0" challenge.' },
      { t: '35–45', what: 'Board: derive det A as area of the parallelogram; connect to invertibility.' },
      { t: '45–50', what: 'Exit question: give a matrix with det A = 6 that is not diagonal.' },
    ],
    notesTip: 'For MATH 240, extend to a proof that det(AB) = det A · det B using areas.',
    glyph: 'M30 52 L50 52 L50 32 L30 32 Z M30 52 L72 40 L88 12 L46 24 Z',
  },
  {
    slug: 'root-finding',
    letter: 'E',
    title: "Bisection and Newton's method",
    course: 'MACM 316',
    courseNote: 'Numerical Analysis I: solving nonlinear equations',
    blurb: 'Compare convergence, read the iteration table, and break Newton on purpose.',
    intro:
      'Students step through both methods side by side, compare their convergence on a log scale, and then break Newton on purpose with a zero derivative and a 2-cycle. The same algorithms run as editable Python in the browser.',
    formula: String.raw`\begin{gathered}m_k=\frac{a_k+b_k}{2}\\[4pt]x_{k+1}=x_k-\frac{f(x_k)}{f'(x_k)}\end{gathered}`,
    outcomes: [
      'Carry out bisection and Newton iterations and read an iteration table.',
      'Distinguish linear from quadratic convergence on a log-scale error plot.',
      'Predict and explain Newton failures: zero derivative and cycling.',
      'Implement both methods in Python with a stopping test and an error message.',
    ],
    questions: [
      { q: 'For x² − 2, how many bisection steps are needed to reach 10⁻¹⁰ on [0, 2]? Predict first, then check the table.', a: 'log₂(2/10⁻¹⁰) ≈ 34.2, so 35 steps: each step halves the interval. Newton from x₀ = 2 needs only 6.' },
      { q: 'On the Newton error column, roughly how do the number of correct digits change from one step to the next?', a: 'They roughly double each step: quadratic convergence, |e_{k+1}| ≈ C|e_k|².' },
      { q: 'Choose the cycling problem. Why does Newton fail, and why does bisection still succeed?', a: 'From x₀ = 0 the tangent lines send 0 → 1 → 0. Bisection only needs a sign change and continuity, so it is guaranteed to converge.' },
    ],
    notes: [
      { t: '0–8', what: 'Hand-compute two bisection steps for √2; discuss a stopping rule.' },
      { t: '8–20', what: 'Newton geometrically: tangent to axis. Module stepping, side by side.' },
      { t: '20–32', what: 'Error plot: classify the convergence; compare iteration counts.' },
      { t: '32–44', what: 'Lab: students edit the Python cell (change f, tolerance) and make Newton fail.' },
      { t: '44–50', what: 'Exit question: when would you choose bisection over Newton?' },
    ],
    notesTip: 'This module is designed for a computing-lab session; the Python cell can be swapped for MATLAB with the same structure.',
    glyph: 'M4 50 C 30 48, 50 30, 96 4 M4 30 H96 M62 30 L80 12 L80 30 L70 30',
  },
  {
    slug: 'foundations',
    letter: 'F',
    title: 'Percentages, growth and break-even',
    course: 'FAN X99',
    courseNote: 'Foundations of Analytical and Quantitative Reasoning',
    blurb: 'Percent change, compounding, linear versus exponential, and two-plan break-even.',
    intro:
      'Quantitative reasoning sticks when it answers a real question. Three everyday contexts (a price that rises and then falls, two ways money can grow, and two phone plans) target the misconceptions FAN X99 students most often bring.',
    formula: String.raw`\begin{gathered}\text{new}=\text{old}\times\Bigl(1+\tfrac{p}{100}\Bigr)\\[4pt]A=P\Bigl(1+\tfrac{r}{k}\Bigr)^{kt}\\[4pt]q^{*}=\frac{F_B-F_A}{r_A-r_B}\end{gathered}`,
    outcomes: [
      'Calculate percent change and apply successive percentage changes with multipliers.',
      'Explain why a 20% rise followed by a 20% fall is not a return to the start.',
      'Compare linear and exponential models and find when one overtakes the other.',
      'Set up and solve a break-even problem and decide which option is cheaper.',
    ],
    questions: [
      { q: 'A price rises 20% and then falls 20%. Before using the module, predict the final price of an $80 jacket. Then explain the difference.', a: '$76.80, a 4% loss: the fall is 20% of a larger number. Multipliers: 1.2 × 0.8 = 0.96.' },
      { q: 'With $100 added per year versus 7% growth on $1,000, when does the exponential option pull ahead? What changes if you compound monthly?', a: 'Linear leads at first ($70 of interest is less than $100 added). Exponential pulls ahead in year 11 with yearly compounding, and in year 10 with monthly compounding.' },
      { q: 'For the default phone plans, at what usage do the plans cost the same? Write and solve the equation.', a: '20 + 0.10m = 5 + 0.25m gives m = 100 minutes, costing $30. Below 100 minutes Plan B is cheaper; above, Plan A.' },
    ],
    notes: [
      { t: '0–8', what: 'Poll: "+20% then −20%: up, down or the same?" Record the class split.' },
      { t: '8–20', what: 'Percent tab: students test their prediction, then rewrite each change as a multiplier.' },
      { t: '20–33', what: 'Growth tab: describe each model in words, then in symbols; find the crossover.' },
      { t: '33–45', what: 'Break-even tab in pairs: solve algebraically first, then confirm on the graph.' },
      { t: '45–50', what: 'Exit ticket: a real decision (two transit fares) solved with the same method.' },
    ],
    notesTip: 'Each tab starts with a prediction, so students who are returning to mathematics engage before any formula appears.',
    glyph: 'M4 54 L96 20 M4 50 C 40 50, 70 40, 96 6 M54 36 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0',
  },
];
