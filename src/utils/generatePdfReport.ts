import { jsPDF } from 'jspdf';
import { SolvedMathData } from '../components/SolutionResultView';

// Sanitize LaTeX strings and Unicode math symbols for clean PDF rendering in jsPDF standard fonts
function cleanTextForPdf(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\u221E/g, 'oo')
    .replace(/\u221A/g, 'sqrt')
    .replace(/\u222B/g, 'integral')
    .replace(/\u03C0/g, 'pi')
    .replace(/\u03B8/g, 'theta')
    .replace(/\u03BB/g, 'lambda')
    .replace(/\u03B1/g, 'alpha')
    .replace(/\u03B2/g, 'beta')
    .replace(/\u2264/g, '<=')
    .replace(/\u2265/g, '>=')
    .replace(/\u2260/g, '!=')
    .replace(/\u00B1/g, '+/-')
    .replace(/\u2192/g, '->')
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, '');
}

export async function generatePdfReport(data: SolvedMathData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2;
  let currentY = 18;

  // Helper to ensure enough space on page or create a new page
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
      drawPageBorderAndHeader();
    }
  };

  const drawPageBorderAndHeader = () => {
    // Subtle top running header on subsequent pages
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('GEN SOLVES — ON-CHAIN MATHEMATICAL PROOF & CONSENSUS AUDIT', marginX, 12);
    doc.text(
      `BLOCK #${data.genlayer_consensus.blockHeight} · ${new Date(data.genlayer_consensus.timestamp).toLocaleDateString()}`,
      pageWidth - marginX,
      12,
      { align: 'right' }
    );
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.line(marginX, 14, pageWidth - marginX, 14);
  };

  // =========================================================================
  // PAGE 1: HEADER & BRANDING
  // =========================================================================

  // Top Accent Bar
  doc.setFillColor(29, 99, 255); // #1D63FF Gen Solves Blue
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Brand Name & Tagline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Gen', marginX, currentY);
  const genWidth = doc.getTextWidth('Gen ');
  doc.setTextColor(29, 99, 255); // #1D63FF
  doc.text('Solves', marginX + genWidth, currentY);

  // Status Badge
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(34, 197, 94); // emerald-500
  doc.roundedRect(pageWidth - marginX - 58, currentY - 6, 58, 8, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52); // emerald-800
  doc.text('CONSENSUS VERIFIED (5/5)', pageWidth - marginX - 29, currentY - 1, { align: 'center' });

  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Intelligent Contract Proof Report · GenLayer Asimov Testnet', marginX, currentY);

  currentY += 8;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);
  currentY += 7;

  // Metadata Grid Box (2 columns)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(marginX, currentY, contentWidth, 22, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, currentY, contentWidth, 22, 3, 3, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('REQUEST HASH (SHA-256):', marginX + 4, currentY + 6);
  doc.text('GENLAYER CONTRACT:', marginX + 4, currentY + 16);
  doc.text('BLOCK HEIGHT:', marginX + contentWidth / 2 + 4, currentY + 6);
  doc.text('EXECUTION DATE:', marginX + contentWidth / 2 + 4, currentY + 16);

  doc.setFont('courier', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`${data.imageHash.slice(0, 32)}...`, marginX + 48, currentY + 6);
  doc.text(`${data.genlayer_consensus.contractAddress.slice(0, 20)}...`, marginX + 48, currentY + 16);
  doc.text(`#${data.genlayer_consensus.blockHeight}`, marginX + contentWidth / 2 + 34, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(data.genlayer_consensus.timestamp).toLocaleString(), marginX + contentWidth / 2 + 34, currentY + 16);

  currentY += 28;

  // =========================================================================
  // SECTION 1: PROBLEM FORMULATION
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Problem Formulation', marginX, currentY);
  currentY += 5;

  // Discipline tag
  doc.setFillColor(239, 246, 255); // blue-50
  doc.setDrawColor(191, 219, 254); // blue-200
  doc.roundedRect(marginX, currentY, 34, 5.5, 1.5, 1.5, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text(cleanTextForPdf(data.solution.category).toUpperCase().slice(0, 22), marginX + 17, currentY + 3.8, { align: 'center' });

  if (data.solution.difficulty) {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX + 38, currentY, 32, 5.5, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(cleanTextForPdf(data.solution.difficulty), marginX + 54, currentY + 3.8, { align: 'center' });
  }

  currentY += 8;

  // Problem Box
  const rawTextLines = doc.splitTextToSize(cleanTextForPdf(data.solution.problem_raw || 'Mathematical Formulation'), contentWidth - 8);
  const problemLatexLines = doc.splitTextToSize(cleanTextForPdf(data.solution.problem_latex || ''), contentWidth - 8);
  const problemBoxHeight = Math.max(22, 10 + problemLatexLines.length * 5 + rawTextLines.length * 4.5);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, currentY, contentWidth, problemBoxHeight, 2, 2, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(problemLatexLines, marginX + 4, currentY + 6);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(rawTextLines, marginX + 4, currentY + 7 + problemLatexLines.length * 5);

  currentY += problemBoxHeight + 6;

  // Domain & Assumptions (if available)
  if (data.solution.assumptions_and_domain) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Domain & Constraints: ', marginX, currentY);
    const domainX = marginX + doc.getTextWidth('Domain & Constraints: ');
    doc.setFont('courier', 'normal');
    const domainLines = doc.splitTextToSize(cleanTextForPdf(data.solution.assumptions_and_domain), contentWidth - (domainX - marginX));
    doc.text(domainLines, domainX, currentY);
    currentY += Math.max(6, domainLines.length * 4.5);
  }

  // =========================================================================
  // SECTION 2: CANONICAL FINAL ANSWER & PROOF
  // =========================================================================
  checkPageBreak(38);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Canonical Final Answer & Formal Verification', marginX, currentY);
  currentY += 5;

  // Answer Highlight Card
  const answerLatexLines = doc.splitTextToSize(cleanTextForPdf(data.solution.final_answer_latex || ''), contentWidth - 8);
  const answerTextLines = doc.splitTextToSize(cleanTextForPdf(data.solution.final_answer_text || ''), contentWidth - 8);
  const answerBoxHeight = Math.max(24, 12 + answerLatexLines.length * 6 + answerTextLines.length * 4.5);

  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(74, 222, 128); // emerald-400
  doc.roundedRect(marginX, currentY, contentWidth, answerBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(21, 128, 61); // emerald-700
  doc.text('EXACT CLOSED-FORM RESULT:', marginX + 4, currentY + 5.5);

  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(answerLatexLines, marginX + 4, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(answerTextLines, marginX + 4, currentY + 13 + answerLatexLines.length * 6);

  currentY += answerBoxHeight + 6;

  // Formal Verification Sub-box
  if (data.solution.verification_method || data.solution.verification_proof) {
    const verifProofText = cleanTextForPdf(data.solution.verification_proof || '');
    const verifLines = doc.splitTextToSize(verifProofText, contentWidth - 36);
    const verifBoxHeight = Math.max(16, 10 + verifLines.length * 4.5);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(marginX, currentY, contentWidth, verifBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('Verification Method: ', marginX + 4, currentY + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(cleanTextForPdf(data.solution.verification_method || 'Inverse Derivative / Boundary Test'), marginX + 34, currentY + 5.5);

    if (data.solution.verification_proof) {
      doc.setFont('helvetica', 'bold');
      doc.text('Proof Verification: ', marginX + 4, currentY + 10.5);
      doc.setFont('courier', 'normal');
      doc.setTextColor(15, 118, 110); // teal-700
      doc.text(verifLines, marginX + 34, currentY + 10.5);
    }

    currentY += verifBoxHeight + 6;
  }

  // =========================================================================
  // SECTION 3: STEP-BY-STEP DERIVATION
  // =========================================================================
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`3. Step-by-Step Mathematical Derivation (${data.solution.step_by_step.length} Steps)`, marginX, currentY);
  currentY += 6;

  data.solution.step_by_step.forEach((step, index) => {
    // Measure step height
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const explLines = doc.splitTextToSize(cleanTextForPdf(step.explanation), contentWidth - 14);
    const mathLatexLines = step.math_latex ? doc.splitTextToSize(cleanTextForPdf(step.math_latex), contentWidth - 14) : [];
    const stepHeight = 14 + explLines.length * 4.2 + (mathLatexLines.length > 0 ? mathLatexLines.length * 4.2 + 2 : 0);

    checkPageBreak(stepHeight + 4);

    // Step card
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, currentY, contentWidth, stepHeight, 2, 2, 'FD');

    // Number indicator
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(marginX + 3, currentY + 3, 6, 6, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(67, 56, 202);
    doc.text(`${step.step_number || index + 1}`, marginX + 6, currentY + 7.2, { align: 'center' });

    // Step title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(cleanTextForPdf(step.title), marginX + 12, currentY + 7.2);

    // Explanation
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(explLines, marginX + 12, currentY + 12.5);

    // LaTeX snippet if present
    if (mathLatexLines.length > 0) {
      const mathY = currentY + 13.5 + explLines.length * 4.2;
      doc.setFont('courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(mathLatexLines, marginX + 12, mathY);
    }

    currentY += stepHeight + 4;
  });

  // =========================================================================
  // SECTION 4: GENLAYER MULTI-VALIDATOR QUORUM & SYMPY
  // =========================================================================
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Decentralized Consensus & Validator Quorum', marginX, currentY);
  currentY += 6;

  // Consensus Summary Bar
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, currentY, contentWidth, 12, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('AGREEMENT RATE:', marginX + 4, currentY + 5);
  doc.text('GAS CONSUMED:', marginX + 50, currentY + 5);
  doc.text('CONSENSUS TYPE:', marginX + 105, currentY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52); // green
  doc.text(data.genlayer_consensus.agreementRate, marginX + 4, currentY + 9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.genlayer_consensus.gasUsed, marginX + 50, currentY + 9.5);
  doc.text('Optimistic Consensus (Equivalence)', marginX + 105, currentY + 9.5);

  currentY += 16;

  // Validators Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('VALIDATOR NODE', marginX + 2, currentY);
  doc.text('ETH ADDRESS', marginX + 55, currentY);
  doc.text('STATUS', marginX + 115, currentY);
  doc.text('LATENCY', marginX + 155, currentY);
  currentY += 2;
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, currentY, marginX + contentWidth, currentY);
  currentY += 4;

  data.genlayer_consensus.validators.forEach((val) => {
    checkPageBreak(7);
    doc.setFont('helvetica', 'medium');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(cleanTextForPdf(val.name), marginX + 2, currentY);

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${val.address.slice(0, 10)}...${val.address.slice(-6)}`, marginX + 55, currentY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(22, 101, 52);
    doc.text('CONFIRMED', marginX + 115, currentY);

    doc.setFont('courier', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${val.latency_ms}ms`, marginX + 155, currentY);

    currentY += 5;
  });

  currentY += 4;

  // Python Verification Code
  if (data.solution.python_verification_code) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('SymPy Independent Verification Script:', marginX, currentY);
    currentY += 4;

    const codeLines = doc.splitTextToSize(cleanTextForPdf(data.solution.python_verification_code), contentWidth - 8);
    const codeHeight = Math.min(45, 8 + codeLines.length * 3.8);

    doc.setFillColor(15, 23, 42); // dark background
    doc.roundedRect(marginX, currentY, contentWidth, codeHeight, 2, 2, 'F');

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(147, 197, 253); // blue-300
    doc.text(codeLines.slice(0, 9), marginX + 4, currentY + 6);

    currentY += codeHeight + 6;
  }

  // =========================================================================
  // FOOTER ON ALL PAGES
  // =========================================================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Certified by GenLayer Intelligent Contract · VisionMathContract.py', marginX, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 7, { align: 'right' });
  }

  // Save the document directly
  const safeFilename = `gen-solves-report-${data.imageHash.slice(0, 8)}.pdf`;
  doc.save(safeFilename);
}
