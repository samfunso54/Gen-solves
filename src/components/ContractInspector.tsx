import React, { useState } from 'react';
import { Copy, Check, Download, Code2, ShieldCheck, Cpu, Terminal, ExternalLink, Layers } from 'lucide-react';
import { ContractFunctionsInspector } from './ContractFunctionsInspector';

interface ContractInspectorProps {
  pythonCode: string;
  contractMetadata: {
    address: string;
    network: string;
    contractName: string;
    compilerVersion: string;
    consensusType: string;
    minValidators: number;
    executionType: string;
  };
  totalSolved: number;
}

export const ContractInspector: React.FC<ContractInspectorProps> = ({
  pythonCode,
  contractMetadata,
  totalSolved,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'functions' | 'source' | 'architecture' | 'abi'>('functions');

  const copyCode = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VisionMathContract.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Info Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span className="font-semibold text-emerald-400">{contractMetadata.contractName}</span>
            <span className="text-neutral-600">·</span>
            <span className="font-mono">{contractMetadata.address.slice(0, 8)}...{contractMetadata.address.slice(-6)}</span>
          </div>
          <p className="text-xs text-neutral-400 max-w-xl">
            Python smart contract executing multimodal extraction, symbolic solving, and optimistic consensus verification.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-750 rounded-md transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={downloadCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download .py
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-neutral-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('functions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'functions'
              ? 'bg-neutral-800 text-emerald-400'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Functions
        </button>
        <button
          onClick={() => setActiveTab('source')}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'source'
              ? 'bg-neutral-800 text-emerald-400'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          Python Source
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'architecture'
              ? 'bg-neutral-800 text-emerald-400'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Consensus Architecture
        </button>
        <button
          onClick={() => setActiveTab('abi')}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'abi'
              ? 'bg-neutral-800 text-emerald-400'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Public ABI
        </button>
      </div>

      {/* Tab 0: 5 Contract Functions */}
      {activeTab === 'functions' && (
        <ContractFunctionsInspector />
      )}

      {/* Tab 1: Python Source Code */}
      {activeTab === 'source' && (
        <div className="relative rounded-xl border border-neutral-800 bg-[#090d16] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800 text-xs text-neutral-400">
            <span className="font-mono text-neutral-300">VisionMathSolver.py</span>
            <div className="flex items-center gap-3">
              <span>Lines: {pythonCode.split('\n').length}</span>
              <span>Encoding: UTF-8</span>
              <span className="text-emerald-400 font-mono">genlayer-python v0.8.4</span>
            </div>
          </div>
          <div className="p-4 overflow-x-auto max-h-[600px] text-xs font-mono leading-relaxed">
            <pre className="text-neutral-300">
              {pythonCode.split('\n').map((line, idx) => (
                <div key={idx} className="table-row hover:bg-white/5">
                  <span className="table-cell pr-4 text-right select-none text-neutral-600 font-mono text-[11px] w-10">
                    {idx + 1}
                  </span>
                  <span className="table-cell whitespace-pre">
                    {formatPythonSyntax(line)}
                  </span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Architecture & Consensus */}
      {activeTab === 'architecture' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-semibold text-neutral-100">
                Optimistic Consensus & Equivalence Principle
              </h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Unlike traditional blockchains (e.g. Ethereum EVM) that demand strict bit-level determinism, <strong>GenLayer</strong> enables non-deterministic execution such as vision AI processing and natural language proofs.
            </p>
            <div className="space-y-2 mt-1">
              <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <span className="text-xs font-medium text-emerald-400 block mb-0.5">1. Multimodal Leader Proposal</span>
                <p className="text-[11px] text-neutral-400">
                  The leader validator ingest the image payload (hash + base64), runs multimodal vision extraction, and constructs a mathematical execution proof.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <span className="text-xs font-medium text-emerald-400 block mb-0.5">2. Validator Quorum & Equivalence Check</span>
                <p className="text-[11px] text-neutral-400">
                  Four or more independent validator nodes verify that their derived mathematical result matches the leader's canonical state through symbolic equivalence testing (e.g. SymPy AST equivalence).
                </p>
              </div>
              <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <span className="text-xs font-medium text-emerald-400 block mb-0.5">3. Cryptographic State Finality</span>
                <p className="text-[11px] text-neutral-400">
                  When consensus reaches $\ge 80\%$, the record is sealed into contract storage and an on-chain event `MathProblemSolved` is emitted.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sky-400">
              <Cpu className="w-5 h-5" />
              <h3 className="text-sm font-semibold text-neutral-100">
                Network & Runtime Parameters
              </h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">Network</span>
                <span className="font-mono text-neutral-200">{contractMetadata.network}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">Contract Address</span>
                <span className="font-mono text-emerald-400 text-[11px]">{contractMetadata.address}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">Consensus Mode</span>
                <span className="text-neutral-200">{contractMetadata.consensusType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">Minimum Active Validators</span>
                <span className="font-mono text-neutral-200">{contractMetadata.minValidators} Nodes</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-800">
                <span className="text-neutral-400">Total Solved Specimen</span>
                <span className="font-mono text-emerald-400 tabular-nums">{totalSolved} Problems</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-neutral-400">Execution Sandbox</span>
                <span className="text-neutral-200 font-mono">gl.exec_prompt() Multimodal</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: ABI Specification */}
      {activeTab === 'abi' && (
        <div className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            GenLayer Intelligent Contract ABI & Methods
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-neutral-950/60 border border-neutral-800">
              <span className="font-mono text-xs text-amber-400 font-semibold block">@public.write solve_from_image</span>
              <p className="text-xs text-neutral-400 mt-1">
                Submits the mathematical visual proof to validator nodes. Returns consensus confirmation, block number, and solved LaTeX.
              </p>
              <div className="mt-3 p-2 rounded bg-neutral-900 font-mono text-[11px] text-neutral-300 space-y-1">
                <div><span className="text-neutral-500">param:</span> image_sha256: str</div>
                <div><span className="text-neutral-500">param:</span> image_b64_payload: str</div>
                <div><span className="text-neutral-500">param:</span> hint: str = &quot;&quot;</div>
                <div className="text-emerald-400 pt-1 border-t border-neutral-800">returns: dict(status, problem_id, final_answer_latex)</div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-neutral-950/60 border border-neutral-800">
              <span className="font-mono text-xs text-sky-400 font-semibold block">@public.view get_solution</span>
              <p className="text-xs text-neutral-400 mt-1">
                Reads historical verified mathematical solution from on-chain storage array with block height and validator signatures.
              </p>
              <div className="mt-3 p-2 rounded bg-neutral-900 font-mono text-[11px] text-neutral-300 space-y-1">
                <div><span className="text-neutral-500">param:</span> index: int</div>
                <div className="text-sky-400 pt-1 border-t border-neutral-800">returns: MathSolutionRecord struct</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function formatPythonSyntax(line: string) {
  // Simple syntax color highlights
  if (line.trim().startsWith('#')) {
    return <span className="text-neutral-500 italic">{line}</span>;
  }
  if (line.includes('@public.') || line.includes('@lazy')) {
    return <span className="text-purple-400 font-semibold">{line}</span>;
  }
  if (line.includes('class ') || line.includes('def ')) {
    return <span className="text-sky-300">{line}</span>;
  }
  if (line.includes('return ') || line.includes('assert ')) {
    return <span className="text-rose-300">{line}</span>;
  }
  return <span>{line}</span>;
}
