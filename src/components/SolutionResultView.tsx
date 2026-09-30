import React, { useState } from 'react';
import { MathView } from './MathView';
import {
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Code2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Share2,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

export interface SolvedMathData {
  imageHash: string;
  imagePreviewUrl: string;
  solution: {
    problem_raw: string;
    problem_latex: string;
    category: string;
    difficulty?: string;
    assumptions_and_domain?: string;
    step_by_step: Array<{
      step_number: number;
      title: string;
      explanation: string;
      math_latex: string;
    }>;
    verification_method?: string;
    verification_proof?: string;
    verification_passed?: boolean;
    numerical_evaluation?: string;
    mathjs_verified?: boolean;
    mathjs_value?: string;
    final_answer_latex: string;
    final_answer_text: string;
    python_verification_code: string;
    confidence_score?: number;
  };
  contract_lifecycle?: {
    function1_accept: {
      functionName: string;
      stepNumber: number;
      stepTitle: string;
      status: string;
      requestId: string;
      inputHash: string;
      caller: string;
      payloadSizeKb: string;
      gasConsumed: string;
      securityVerification: string;
    };
    function2_ocr: {
      functionName: string;
      stepNumber: number;
      stepTitle: string;
      status: string;
      extractedEquationLatex: string;
      extractedRawTranscript: string;
      detectedDiscipline: string;
      gasConsumed: string;
      engine: string;
    };
    function3_dispatch: {
      functionName: string;
      stepNumber: number;
      stepTitle: string;
      status: string;
      dispatchedLatex: string;
      symbolicTarget: string;
      domainInvariants: string;
      gasConsumed: string;
    };
    function4_receive_verify: {
      functionName: string;
      stepNumber: number;
      stepTitle: string;
      status: string;
      finalAnswerLatex: string;
      stepCount: number;
      equivalenceVerification: string;
      signaturesCollected: number;
      gasConsumed: string;
    };
    function5_return: {
      functionName: string;
      stepNumber: number;
      stepTitle: string;
      status: string;
      blockHeight: number;
      txHash: string;
      stateRoot: string;
      returnedOutput: string;
    };
  };
  genlayer_consensus: {
    contractAddress: string;
    txHash: string;
    blockHeight: number;
    timestamp: number;
    consensusStatus: string;
    agreementRate: string;
    gasUsed: string;
    stateRoot: string;
    leaderNode: string;
    validators: Array<{
      address: string;
      name: string;
      status: string;
      signature: string;
      latency_ms: number;
    }>;
  };
}

interface SolutionResultViewProps {
  data: SolvedMathData;
  onSolveAnother: () => void;
}

export const SolutionResultView: React.FC<SolutionResultViewProps> = ({
  data,
  onSolveAnother,
}) => {
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);
  const [showValidators, setShowValidators] = useState(true);
  const [showPythonCode, setShowPythonCode] = useState(false);

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const { solution, genlayer_consensus } = data;

  return (
    <div className="flex flex-col gap-5">
      {/* Top Bar: Status & Actions */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-neutral-200">Consensus Finalized</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400 font-mono tabular-nums">Block #{genlayer_consensus.blockHeight}</span>
            <span className="text-neutral-600">·</span>
            <span className="text-emerald-400 font-medium">{solution.category}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(genlayer_consensus.txHash, setCopiedTx)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-neutral-400 hover:text-neutral-200 bg-neutral-950 rounded border border-neutral-850 transition-colors"
          >
            {copiedTx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{genlayer_consensus.txHash.slice(0, 8)}...{genlayer_consensus.txHash.slice(-6)}</span>
          </button>
          <button
            onClick={onSolveAnother}
            className="px-3 py-1 text-xs font-medium text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors whitespace-nowrap"
          >
            New Solve
          </button>
        </div>
      </div>

      {/* 5-Function Pipeline Trace - Compact Stepper */}
      <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[500px] text-xs">
          {[
            { label: 'accept_image', note: 'Hash Check' },
            { label: 'ocr_extract', note: 'LaTeX Transcribed' },
            { label: 'dispatch_engine', note: 'Symbolic Solving' },
            { label: 'verify_consensus', note: '5/5 Quorum' },
            { label: 'get_solution', note: 'Finalized' },
          ].map((fn, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono text-xs text-neutral-300">{fn.label}</span>
              </div>
              {idx < 4 && <span className="text-neutral-600 mx-2">→</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Visual Input & Canonical Result */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Solution Result Card */}
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-emerald-500/30 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300">Final Answer</span>
              <button
                onClick={() => copyToClipboard(solution.final_answer_latex, setCopiedAnswer)}
                className="flex items-center gap-1 text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                {copiedAnswer ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAnswer ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 text-center overflow-x-auto">
              <div className="text-lg sm:text-xl text-emerald-300 font-bold">
                <MathView math={solution.final_answer_latex} displayMode={true} />
              </div>
            </div>

            <p className="text-xs text-neutral-300">
              {solution.final_answer_text}
            </p>

            {/* Formal Mathematical Verification Badge */}
            {(solution.verification_method || solution.mathjs_verified) && (
              <div className="pt-2 border-t border-neutral-800/80 flex flex-col gap-1.5 text-[11px]">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Mathematically Verified</span>
                  </span>
                  <span className="font-mono text-neutral-500 text-[10px]">
                    {solution.mathjs_verified ? 'CAS + MathJS Confirmed' : 'Inverse Proof Confirmed'}
                  </span>
                </div>
                {solution.verification_method && (
                  <p className="text-neutral-400 font-mono text-[10px] leading-tight">
                    {solution.verification_method}
                  </p>
                )}
                {solution.verification_proof && (
                  <div className="px-2 py-1 rounded bg-neutral-950 border border-neutral-850 font-mono text-emerald-300 text-[10px] overflow-x-auto">
                    {solution.verification_proof}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Problem Formulation & Image */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs">
              <span className="font-medium text-neutral-300">Extracted Problem</span>
              <span className="font-mono text-neutral-500 text-[11px] truncate max-w-[150px]">
                {data.imageHash.slice(0, 12)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 overflow-x-auto text-emerald-300 font-mono text-center">
              <MathView math={solution.problem_latex} displayMode={true} />
            </div>

            {/* Problem Image Thumbnail */}
            <div className="rounded-lg overflow-hidden border border-neutral-800 bg-black max-h-40 flex items-center justify-center">
              <img
                src={data.imagePreviewUrl}
                alt="Problem"
                className="w-full h-full object-contain max-h-40"
                referrerPolicy="no-referrer"
              />
            </div>

            {solution.assumptions_and_domain && (
              <div className="text-[11px] text-neutral-400 border-t border-neutral-800/80 pt-2 font-mono">
                {solution.assumptions_and_domain}
              </div>
            )}
          </div>

          {/* Python Verification Snippet */}
          <div className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowPythonCode(!showPythonCode)}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>SymPy Verification Code</span>
                {showPythonCode ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showPythonCode && (
                <button
                  onClick={() => copyToClipboard(solution.python_verification_code, setCopiedPython)}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200"
                >
                  {copiedPython ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPython ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {showPythonCode && (
              <div className="p-2.5 rounded bg-neutral-950 border border-neutral-850 font-mono text-[11px] text-neutral-300 overflow-x-auto max-h-40 leading-relaxed">
                <pre>{solution.python_verification_code}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Step-by-Step Derivation & Validators */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Step-by-Step Proof */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs">
              <span className="font-semibold text-neutral-200">
                Derivation Steps
              </span>
              <span className="text-neutral-500 font-mono text-[11px]">
                {solution.step_by_step.length} Steps
              </span>
            </div>

            <div className="space-y-3">
              {solution.step_by_step.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-850 flex flex-col gap-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 font-medium">
                      {step.step_number || idx + 1}.
                    </span>
                    <h4 className="text-xs font-medium text-neutral-200">
                      {step.title}
                    </h4>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed pl-4">
                    {step.explanation}
                  </p>

                  {step.math_latex && (
                    <div className="ml-4 p-2 rounded bg-neutral-900 border border-neutral-800 overflow-x-auto text-emerald-300 font-mono text-center text-xs">
                      <MathView math={step.math_latex} displayMode={true} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Validator Consensus Summary */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-neutral-300">
                Validator Quorum
              </span>
              <button
                onClick={() => setShowValidators(!showValidators)}
                className="text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1"
              >
                <span>{showValidators ? 'Hide Nodes' : 'Show Nodes'}</span>
                {showValidators ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded bg-neutral-950 border border-neutral-850">
                <span className="text-[11px] text-neutral-500 block">Agreement</span>
                <span className="text-emerald-400 font-medium font-mono tabular-nums">{genlayer_consensus.agreementRate}</span>
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-850">
                <span className="text-[11px] text-neutral-500 block">Gas</span>
                <span className="text-neutral-300 font-mono tabular-nums">{genlayer_consensus.gasUsed}</span>
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-850">
                <span className="text-[11px] text-neutral-500 block">Nodes</span>
                <span className="text-neutral-300 font-mono tabular-nums">5/5 Signed</span>
              </div>
            </div>

            {showValidators && (
              <div className="space-y-1.5 pt-1">
                {genlayer_consensus.validators.map((v, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-neutral-950/80 border border-neutral-850 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="font-medium text-neutral-300">{v.name}</span>
                      <span className="font-mono text-neutral-500 text-[10px]">
                        {v.address.slice(0, 6)}...{v.address.slice(-4)}
                      </span>
                    </div>
                    <span className="text-neutral-500 font-mono text-[10px] tabular-nums">{v.latency_ms}ms</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
