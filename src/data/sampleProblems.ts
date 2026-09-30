// High-resolution math problem presets generated locally to avoid fragile external image URLs

export interface MathPreset {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  previewLatex: string;
  description: string;
  renderToDataUrl: () => string;
}

function createTextbookImage(
  title: string,
  problemLatexLines: string[],
  diagramType?: 'integral' | 'matrix' | 'triangle' | 'differential' | 'kinematics'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background: Deep blackboard / dark slate academic paper style
  const gradient = ctx.createLinearGradient(0, 0, 800, 480);
  gradient.addColorStop(0, '#0a0f1d');
  gradient.addColorStop(1, '#050811');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 480);

  // Subtle grid lines (like engineering graph paper)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const step = 20;
  for (let x = 0; x < 800; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 480);
    ctx.stroke();
  }
  for (let y = 0; y < 480; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(800, y);
    ctx.stroke();
  }

  // Header Bar
  ctx.fillStyle = '#10b981';
  ctx.fillRect(40, 36, 4, 24);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('GENLAYER MATHEMATICAL BENCHMARK SPECIMEN', 54, 52);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 24px system-ui, -apple-system, sans-serif';
  ctx.fillText(title, 40, 105);

  // Draw problem body
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '500 20px "Courier New", Courier, monospace';

  let currentY = 160;
  problemLatexLines.forEach((line) => {
    ctx.fillText(line, 40, currentY);
    currentY += 36;
  });

  // Optional diagrams
  if (diagramType === 'triangle') {
    // Draw geometry triangle with coordinates and angles
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(560, 380);
    ctx.lineTo(720, 380);
    ctx.lineTo(620, 220);
    ctx.closePath();
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#38bdf8';
    ctx.font = '14px monospace';
    ctx.fillText('A(0,0)', 530, 400);
    ctx.fillText('B(12,0)', 725, 400);
    ctx.fillText('C(5, 8)', 610, 205);
    ctx.fillText('θ = ?', 580, 365);

    // Incircle hint
    ctx.strokeStyle = '#10b981';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(630, 325, 45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (diagramType === 'integral') {
    // Coordinate axis & bell curve / integral area
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(520, 380);
    ctx.lineTo(760, 380); // X axis
    ctx.moveTo(640, 420);
    ctx.lineTo(640, 200); // Y axis
    ctx.stroke();

    // Gaussian curve
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 530; x <= 750; x++) {
      const normX = (x - 640) / 35;
      const y = 380 - 150 * Math.exp(-(normX * normX));
      if (x === 530) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Shaded area
    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.beginPath();
    ctx.moveTo(580, 380);
    for (let x = 580; x <= 700; x++) {
      const normX = (x - 640) / 35;
      const y = 380 - 150 * Math.exp(-(normX * normX));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(700, 380);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#c084fc';
    ctx.font = '13px monospace';
    ctx.fillText('f(x) = e^(-x²)', 660, 220);
  } else if (diagramType === 'matrix') {
    // 3x3 matrix bracket illustration
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    // Left bracket
    ctx.beginPath();
    ctx.moveTo(560, 230);
    ctx.lineTo(540, 230);
    ctx.lineTo(540, 370);
    ctx.lineTo(560, 370);
    ctx.stroke();

    // Right bracket
    ctx.beginPath();
    ctx.moveTo(720, 230);
    ctx.lineTo(740, 230);
    ctx.lineTo(740, 370);
    ctx.lineTo(720, 370);
    ctx.stroke();

    ctx.fillStyle = '#fde68a';
    ctx.font = '16px monospace';
    ctx.fillText('λ₁ = ?', 580, 270);
    ctx.fillText('λ₂ = ?', 650, 270);
    ctx.fillText('det(A - λI) = 0', 580, 340);
  }

  // Footer notes & verification indicator
  ctx.fillStyle = '#475569';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('Image Proof for GenLayer Multimodal Contract Submission', 40, 440);

  return canvas.toDataURL('image/png');
}

export const SAMPLE_MATH_PRESETS: MathPreset[] = [
  {
    id: 'gaussian-integral',
    title: 'Gaussian Double Integral & Polar Transformation',
    category: 'Multivariable Calculus',
    difficulty: 'University / Advanced',
    previewLatex: 'I = \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
    description: 'Evaluate the definite integral of e^(-x²) over the entire real line using double integral polar coordinate transformation.',
    renderToDataUrl: () =>
      createTextbookImage(
        'Definite Integral: Gaussian Distribution',
        [
          'Evaluate the improper integral:',
          '  I = ∫_{-∞}^{+∞} exp(-x²) dx',
          '',
          'Consider I² = (∫ exp(-x²) dx)(∫ exp(-y²) dy)',
          'Transform to polar coordinates (r, θ):',
          '  dA = r dr dθ',
          'Solve for I strictly in closed form.'
        ],
        'integral'
      ),
  },
  {
    id: 'eigenvalues-matrix',
    title: '3x3 Matrix Eigenvalues & Characteristic Polynomial',
    category: 'Linear Algebra',
    difficulty: 'Undergraduate',
    previewLatex: 'A = \\begin{pmatrix} 2 & 1 & 0 \\\\ 1 & 3 & 1 \\\\ 0 & 1 & 2 \\end{pmatrix}, \\quad \\det(A - \\lambda I) = 0',
    description: 'Find all eigenvalues λ and the trace/determinant invariants of the symmetric tridiagonal matrix A.',
    renderToDataUrl: () =>
      createTextbookImage(
        'Matrix Spectrum Analysis',
        [
          'Let A be the symmetric 3x3 matrix:',
          '  [ 2   1   0 ]',
          '  [ 1   3   1 ]',
          '  [ 0   1   2 ]',
          '',
          '1. Compute the characteristic polynomial det(A - λI) = 0',
          '2. Find all 3 distinct real eigenvalues λ₁, λ₂, λ₃',
          '3. Verify that tr(A) = Σ λ_i and det(A) = Π λ_i'
        ],
        'matrix'
      ),
  },
  {
    id: 'second-order-ode',
    title: 'Second-Order Damped Harmonic Oscillator ODE',
    category: 'Differential Equations',
    difficulty: 'STEM Engineering',
    previewLatex: 'y\'\' + 4y\' + 13y = 26, \\quad y(0)=0, \\, y\'(0)=3',
    description: 'Solve the initial value problem for a forced harmonic oscillator with damping and constant driving force.',
    renderToDataUrl: () =>
      createTextbookImage(
        'Initial Value Problem (Oscillator ODE)',
        [
          'Solve the non-homogeneous 2nd order ODE:',
          '  d²y/dt² + 4(dy/dt) + 13y = 26',
          '',
          'Initial Conditions:',
          '  y(0) = 0',
          '  y\'(0) = 3',
          '',
          'Find the particular and homogeneous solutions y(t).'
        ],
        'differential'
      ),
  },
  {
    id: 'geometry-circle-triangle',
    title: 'Incircle Radius & Coordinate Triangle Area',
    category: 'Euclidean Geometry',
    difficulty: 'Competition / Olympiad',
    previewLatex: 'r = \\frac{K}{s}, \\quad A(0,0), \\, B(12,0), \\, C(5,12)',
    description: 'Compute the exact area, perimeter, and inscribed circle radius r of triangle ABC using Heron\'s formula.',
    renderToDataUrl: () =>
      createTextbookImage(
        'Coordinate Geometry & Incircle Theorem',
        [
          'Given triangle ABC with vertices:',
          '  A = (0, 0)',
          '  B = (12, 0)',
          '  C = (5, 12)',
          '',
          '1. Calculate side lengths a, b, c',
          '2. Calculate Area K and semi-perimeter s = (a+b+c)/2',
          '3. Determine the incircle radius r = K / s'
        ],
        'triangle'
      ),
  },
  {
    id: 'complex-analysis-residue',
    title: 'Contour Integration via Cauchy Residue Theorem',
    category: 'Complex Analysis',
    difficulty: 'Advanced STEM',
    previewLatex: '\\oint_{|z|=2} \\frac{e^z}{z(z-1)^2} dz = 2\\pi i \\sum \\text{Res}',
    description: 'Evaluate the closed contour integral around circle |z| = 2 enclosing simple pole at z=0 and double pole at z=1.',
    renderToDataUrl: () =>
      createTextbookImage(
        'Cauchy Residue Theorem Evaluation',
        [
          'Evaluate the contour integral counterclockwise:',
          '  ∮_{|z|=2} [ e^z / ( z * (z - 1)² ) ] dz',
          '',
          'Poles located at:',
          '  z = 0 (simple pole)',
          '  z = 1 (pole of order 2)',
          'Apply Residue Theorem to find the exact value in terms of π and e.'
        ],
        'integral'
      ),
  },
];
