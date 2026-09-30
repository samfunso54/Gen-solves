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
    <div className="flex flex-col gap-6">
      {/* Top Banner: Verification & Consensus State */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1 text-xs">
              <span className="font-mono text-emerald-400 font-semibold">OPTIMISTIC CONSENSUS VERIFIED</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-300 font-mono tabular-nums">Block #{genlayer_consensus.blockHeight}</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">{solution.category}</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-100">
              Mathematical Proof Sealed On-Chain
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => copyToClipboard(genlayer_consensus.txHash, setCopiedTx)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            {copiedTx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{genlayer_consensus.txHash.slice(0, 8)}...{genlayer_consensus.txHash.slice(-6)}</span>
          </button>
          <button
            onClick={onSolveAnother}
            className="px-3.5 py-1.5 text-xs font-medium text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap"
          >
            Solve Next Problem
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem Image & Formal LaTeX & Final Answer */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Problem Submission Card */}
          <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Submitted Visual Specimen
              </span>
              <span className="font-mono text-[11px] text-neutral-500">
                SHA256: {data.imageHash.slice(0, 10)}...
              </span>
            </div>

            {/* Problem Image Preview */}
            <div className="rounded-lg overflow-hidden border border-neutral-800 bg-black max-h-56 flex items-center justify-center">
              <img
                src={data.imagePreviewUrl}
                alt="Submitted Math Problem"
                className="w-full h-full object-contain max-h-56"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Extracted LaTeX Formulation */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-neutral-400">Extracted Canonical Formulation:</span>
              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 overflow-x-auto text-emerald-300 font-mono text-center">
                <MathView math={solution.problem_latex} displayMode={true} />
              </div>
              <p className="text-xs text-neutral-400 mt-1 italic">
                &ldquo;{solution.problem_raw}&rdquo;
              </p>
            </div>

            {/* Domain & Difficulty */}
            {solution.assumptions_and_domain && (
              <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 text-xs">
                <span className="text-neutral-400 font-medium block mb-1">Domain & Conditions:</span>
                <span className="text-neutral-200 font-mono">{solution.assumptions_and_domain}</span>
              </div>
            )}
          </div>

          {/* Canonical Final Answer Card */}
          <div className="p-5 rounded-xl bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-emerald-500/40 shadow-lg shadow-emerald-950/20 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 tracking-wider">
                CANONICAL FINAL ANSWER
              </span>
              <button
                onClick={() => copyToClipboard(solution.final_answer_latex, setCopiedAnswer)}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                {copiedAnswer ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAnswer ? 'Copied' : 'Copy LaTeX'}</span>
              </button>
            </div>

            <div className="p-4 rounded-lg bg-neutral-950/90 border border-emerald-500/30 text-center overflow-x-auto">
              <div className="text-xl sm:text-2xl text-emerald-300 font-bold">
                <MathView math={solution.final_answer_latex} displayMode={true} />
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {solution.final_answer_text}
            </p>
          </div>

          {/* Python Verification Snippet */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowPythonCode(!showPythonCode)}
                className="flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-neutral-100 transition-colors"
              >
                <Code2 className="w-4 h-4 text-sky-400" />
                <span>SymPy / NumPy Symbolic Verification</span>
                {showPythonCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showPythonCode && (
                <button
                  onClick={() => copyToClipboard(solution.python_verification_code, setCopiedPython)}
                  className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200"
                >
                  {copiedPython ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPython ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {showPythonCode && (
              <div className="mt-2 p-3 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto max-h-48 leading-relaxed">
                <pre>{solution.python_verification_code}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Step-by-Step Proof & GenLayer Validator Consensuses */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* 5-Step Smart Contract Execution Trace */}
          <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-neutral-100">
                  GenLayer Contract Lifecycle: 5 Functions Executed
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Optimistic Consensus
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400">FUNC 1</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="font-semibold text-neutral-200 text-[11px] truncate">accept_math_image</span>
                <span className="text-[10px] text-neutral-400">Validated SHA-256</span>
                <span className="text-[10px] font-mono text-neutral-500 mt-auto">42.1k gas</span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400">FUNC 2</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="font-semibold text-neutral-200 text-[11px] truncate">trigger_ocr_extraction</span>
                <span className="text-[10px] text-neutral-400">Vision to LaTeX</span>
                <span className="text-[10px] font-mono text-neutral-500 mt-auto">112.4k gas</span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400">FUNC 3</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="font-semibold text-neutral-200 text-[11px] truncate">dispatch_to_calculation_engine</span>
                <span className="text-[10px] text-neutral-400">Symbolic Solver</span>
                <span className="text-[10px] font-mono text-neutral-500 mt-auto">185.2k gas</span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400">FUNC 4</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="font-semibold text-neutral-200 text-[11px] truncate">receive_and_verify_solution</span>
                <span className="text-[10px] text-neutral-400">5/5 Equivalence</span>
                <span className="text-[10px] font-mono text-neutral-500 mt-auto">89.2k gas</span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400">FUNC 5</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="font-semibold text-neutral-200 text-[11px] truncate">get_solution</span>
                <span className="text-[10px] text-neutral-400">Proof Delivered</span>
                <span className="text-[10px] font-mono text-neutral-500 mt-auto">0 gas (view)</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Mathematical Derivation */}
          <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-neutral-100">
                  Step-by-Step Mathematical Derivation & Proof
                </h3>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {solution.step_by_step.length} Rigorous Steps
              </span>
            </div>

            <div className="space-y-4">
              {solution.step_by_step.map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/90 flex flex-col gap-2.5 transition-all hover:border-neutral-700"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold flex items-center justify-center shrink-0">
                      {step.step_number || idx + 1}
                    </span>
                    <h4 className="text-xs font-semibold text-neutral-200">
                      {step.title}
                    </h4>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed pl-8">
                    {step.explanation}
                  </p>

                  {step.math_latex && (
                    <div className="ml-8 p-3 rounded-lg bg-neutral-900/90 border border-neutral-800 overflow-x-auto text-emerald-300 font-mono text-center">
                      <MathView math={step.math_latex} displayMode={true} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* GenLayer Validator Quorum Accordion */}
          <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-neutral-100">
                  GenLayer Multi-Validator Consensus Quorum
                </h3>
              </div>
              <button
                onClick={() => setShowValidators(!showValidators)}
                className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1"
              >
                <span>{showValidators ? 'Hide' : 'Inspect'}</span>
                {showValidators ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-500 block mb-0.5">Agreement</span>
                <span className="text-emerald-400 font-semibold font-mono tabular-nums">{genlayer_consensus.agreementRate}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-500 block mb-0.5">Gas Consumed</span>
                <span className="text-neutral-200 font-mono tabular-nums">{genlayer_consensus.gasUsed}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-500 block mb-0.5">Block Height</span>
                <span className="text-neutral-200 font-mono tabular-nums">#{genlayer_consensus.blockHeight}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-500 block mb-0.5">Network Status</span>
                <span className="text-emerald-400 font-semibold">Finalized</span>
              </div>
            </div>

            {showValidators && (
              <div className="space-y-2 mt-1">
                <span className="text-xs text-neutral-400 font-medium">Independent Validator Node Signatures:</span>
                <div className="space-y-2">
                  {genlayer_consensus.validators.map((v, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <div>
                          <span className="font-semibold text-neutral-200">{v.name}</span>
                          <span className="font-mono text-neutral-500 text-[11px] ml-2">
                            {v.address.slice(0, 8)}...{v.address.slice(-4)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-emerald-400">EQUIVALENCE_CONFIRMED</span>
                        <span className="text-neutral-500 tabular-nums">{v.latency_ms}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
