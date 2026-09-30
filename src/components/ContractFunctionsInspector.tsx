import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  CheckCircle2,
  FileCode,
  Layers,
  Terminal,
  ChevronRight,
  Eye,
  Cpu,
  Database,
  ExternalLink,
} from 'lucide-react';
import { MathView } from './MathView';

export interface ContractFunctionDef {
  id: number;
  name: string;
  type: 'write' | 'view';
  stepTitle: string;
  purpose: string;
  signature: string;
  inputs: Array<{ name: string; type: string; desc: string }>;
  outputs: string;
  securityMechanisms: string[];
  efficiencyGains: string[];
  eventEmitted?: string;
  sampleCode: string;
}

export const CONTRACT_FUNCTIONS: ContractFunctionDef[] = [
  {
    id: 1,
    name: 'accept_math_image',
    type: 'write',
    stepTitle: '1. Accept Image of Math Problem',
    purpose: 'Accepts and validates visual input payload from caller, enforcing cryptographic integrity and payload size limits.',
    signature: 'accept_math_image(image_hash: str, image_b64_payload: str, hint: str = "") -> str',
    inputs: [
      { name: 'image_hash', type: 'str (hex 64)', desc: 'SHA-256 hash of the problem image for deduplication and integrity' },
      { name: 'image_b64_payload', type: 'str (base64)', desc: 'Ephemeral transaction calldata containing image pixel data' },
      { name: 'hint', type: 'str', desc: 'Optional user constraint or focus direction' },
    ],
    outputs: 'request_id: str (SHA-256 identifier)',
    securityMechanisms: [
      'Asserts len(image_hash) == 64 to prevent spoofed/truncated identifier injection',
      'DoS Protection: Enforces strict max_payload_kb boundary to eliminate transaction memory exhaustion',
      'Replay attack guard: Checks state registry to prevent duplicate state overwrites',
    ],
    efficiencyGains: [
      'Off-Chain Storage Economy: Only the 32-byte cryptographic hash is persisted in state tree',
      'Image bytes remain ephemeral in transaction calldata rather than occupying permanent disk gas',
      'Cache Hit Optimization: If problem was previously finalized, returns existing verified state immediately',
    ],
    eventEmitted: 'MathImageAccepted(request_id, requester, timestamp)',
    sampleCode: `@public.write
def accept_math_image(self, image_hash: str, image_b64_payload: str, hint: str = "") -> str:
    assert len(image_hash) == 64, "Invalid SHA-256 length"
    assert len(image_b64_payload) <= self.max_payload_kb * 1024, "Payload exceeds limit"
    
    # Check cache to save gas
    existing = self.requests.get(image_hash, None)
    if existing and existing.status == CalculationStatus.FINALIZED:
        return image_hash
        
    record = MathRequestRecord(request_id=image_hash, requester=gl.message.sender, ...)
    self.requests[image_hash] = record
    gl.emit_event("MathImageAccepted", {"request_id": image_hash, "requester": gl.message.sender})
    return image_hash`,
  },
  {
    id: 2,
    name: 'trigger_ocr_extraction',
    type: 'write',
    stepTitle: '2. Trigger OCR to Extract Equation',
    purpose: 'Invokes GenLayer decentralized multimodal vision engine across validators to transcribe handwritten or printed math into canonical LaTeX.',
    signature: 'trigger_ocr_extraction(request_id: str, image_b64_payload: str) -> str',
    inputs: [
      { name: 'request_id', type: 'str', desc: 'Unique request tracking ID' },
      { name: 'image_b64_payload', type: 'str', desc: 'Raw visual input payload for OCR processing' },
    ],
    outputs: 'extracted_latex: str (Canonical LaTeX equation)',
    securityMechanisms: [
      'State lifecycle check: Asserts request is in IMAGE_ACCEPTED state before executing OCR',
      'Isolated AI Sandbox: Vision extraction runs within deterministic validator containers via gl.exec_prompt()',
      'Symbol Normalization: Enforces canonical LaTeX formatting to eliminate character ambiguities',
    ],
    efficiencyGains: [
      'Parallel Vision Pipeline: Validators independently extract equation structures simultaneously',
      'Deterministic Prompting: Zero temperature ensures identical symbolic representations across honest nodes',
    ],
    eventEmitted: 'EquationExtractedOCR(request_id, equation_latex, category)',
    sampleCode: `@public.write
def trigger_ocr_extraction(self, request_id: str, image_b64_payload: str) -> str:
    record = self.requests.get(request_id, None)
    assert record and record.status >= CalculationStatus.IMAGE_ACCEPTED
    
    ocr_prompt = "Transcribe equations in this image into canonical LaTeX JSON."
    ocr_result_raw = gl.exec_prompt(ocr_prompt, multimodal_payload=image_b64_payload)
    ocr_data = json.loads(ocr_result_raw)
    
    record.extracted_latex = ocr_data["equation_latex"]
    record.status = CalculationStatus.OCR_EXTRACTED
    self.requests[request_id] = record
    return record.extracted_latex`,
  },
  {
    id: 3,
    name: 'dispatch_to_calculation_engine',
    type: 'write',
    stepTitle: '3. Send Extracted Equation to Calculation Engine',
    purpose: 'Dispatches the extracted and normalized mathematical equation to the high-precision symbolic calculation and theorem-proving engine.',
    signature: 'dispatch_to_calculation_engine(request_id: str, hint: str = "") -> str',
    inputs: [
      { name: 'request_id', type: 'str', desc: 'Unique request tracking ID' },
      { name: 'hint', type: 'str', desc: 'Domain boundaries or specific evaluation conditions' },
    ],
    outputs: 'raw_solution_payload: str (Serialized mathematical derivation & closed-form result)',
    securityMechanisms: [
      'Input Validation: Ensures equation string contains valid mathematical tokens prior to compute allocation',
      'Execution Gas Limits: Caps computational steps to prevent infinite series or unbounded integration loops',
      'Discipline-Specific Routing: Automatically identifies calculus, linear algebra, or ODE constraints',
    ],
    efficiencyGains: [
      'Optimistic Execution: Leader validator generates the candidate proof while other validators prepare equivalence checkers',
      'Symbolic Tree Reduction: Simplifies complex expressions before numerical approximation',
    ],
    eventEmitted: 'None (Internal state transition to CALCULATING)',
    sampleCode: `@public.write
def dispatch_to_calculation_engine(self, request_id: str, hint: str = "") -> str:
    record = self.requests.get(request_id, None)
    assert record and record.status >= CalculationStatus.OCR_EXTRACTED
    record.status = CalculationStatus.CALCULATING
    
    calc_prompt = f"Solve with mathematical rigor: {record.extracted_latex}. Context: {hint}"
    raw_solution = gl.exec_prompt(calc_prompt)
    return raw_solution`,
  },
  {
    id: 4,
    name: 'receive_and_verify_solution',
    type: 'write',
    stepTitle: '4. Receive Solution & Verify Consensus',
    purpose: 'Receives the calculated proof, runs the Equivalence Principle across 5 independent validator nodes, verifies consensus threshold (>=80%), and commits state.',
    signature: 'receive_and_verify_solution(request_id: str, solution_json: str) -> bool',
    inputs: [
      { name: 'request_id', type: 'str', desc: 'Unique request tracking ID' },
      { name: 'solution_json', type: 'str (JSON)', desc: 'Derivation steps, final LaTeX, and SymPy verification code' },
    ],
    outputs: 'success: bool (True when optimistic consensus is reached)',
    securityMechanisms: [
      'Equivalence Testing: Validators verify that SymPy AST of candidate equals their independent computation',
      'Multi-Signature Quorum: Collects 5 independent cryptographic signatures from decentralized validator nodes',
      'Schema Enforcement: Verifies presence of final_answer_latex and derivation steps before acceptance',
    ],
    efficiencyGains: [
      'Equivalence over Exact Hashing: Allows algebraically equivalent answers (e.g. 1/2 vs 2/4 or x+1 vs 1+x) without consensus failure',
      'Batched Signature Verification: Verifies quorum in a single cryptographic operation',
    ],
    eventEmitted: 'MathSolutionFinalized(request_id, final_answer_latex, block_height, validators_count)',
    sampleCode: `@public.write
def receive_and_verify_solution(self, request_id: str, solution_json: str) -> bool:
    record = self.requests.get(request_id, None)
    assert record and record.status >= CalculationStatus.CALCULATING
    
    sol_data = json.loads(solution_json)
    record.final_answer_latex = sol_data["final_answer_latex"]
    record.step_by_step_proof = json.dumps(sol_data["step_by_step"])
    record.validator_signatures = [gl.get_validator_signature(i) for i in range(5)]
    
    record.status = CalculationStatus.FINALIZED
    self.requests[request_id] = record
    self.total_solved += 1
    gl.emit_event("MathSolutionFinalized", {...})
    return True`,
  },
  {
    id: 5,
    name: 'get_solution',
    type: 'view',
    stepTitle: '5. Return Solution to User',
    purpose: 'Public view function that retrieves the finalized solution, step-by-step mathematical proof, and validator signatures from the on-chain ledger.',
    signature: 'get_solution(request_id: str) -> dict',
    inputs: [
      { name: 'request_id', type: 'str', desc: 'Cryptographic request ID to look up' },
    ],
    outputs: 'MathSolutionOutput: dict (Full record with LaTeX, steps, signatures, and block timestamp)',
    securityMechanisms: [
      'Read-Only Gas Freedom: Zero gas cost for users when calling as a view method',
      'Immutability: Returns cryptographically sealed data that cannot be altered post-consensus',
      'Integrity Guarantee: Result is bound to block number and validator signatures',
    ],
    efficiencyGains: [
      'Direct O(1) TreeMap lookup by image hash',
      'Zero on-chain computation required at read time',
    ],
    eventEmitted: 'None (Read-only view method)',
    sampleCode: `@public.view
def get_solution(self, request_id: str) -> dict:
    record = self.requests.get(request_id, None)
    assert record, "Request not found"
    assert record.status == CalculationStatus.FINALIZED, "Processing in progress"
    
    return {
        "request_id": record.request_id,
        "equation_latex": record.extracted_latex,
        "final_answer_latex": record.final_answer_latex,
        "final_answer_text": record.final_answer_text,
        "step_by_step_proof": json.loads(record.step_by_step_proof),
        "validator_signatures": list(record.validator_signatures),
        "block_height": int(record.block_height),
        "timestamp": int(record.timestamp)
    }`,
  },
];

interface ContractFunctionsInspectorProps {
  lifecycleTrace?: any;
}

export const ContractFunctionsInspector: React.FC<ContractFunctionsInspectorProps> = ({
  lifecycleTrace,
}) => {
  const [selectedFuncId, setSelectedFuncId] = useState<number>(1);
  const selectedFunc = CONTRACT_FUNCTIONS.find((f) => f.id === selectedFuncId) || CONTRACT_FUNCTIONS[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/30 via-neutral-900 to-neutral-900 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-emerald-400 font-semibold">
              GENLAYER SMART CONTRACT SPECIFICATION
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-xs text-neutral-400">5 Modular Blockchain Functions</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-neutral-100">
            VisionMathContract: Secure & Efficient 5-Step Pipeline
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Every step is designed for high efficiency on the GenLayer blockchain: keeping large payloads off-state, executing non-deterministic vision in validator AI sandboxes, and proving mathematical equivalence before state commit.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300">
            Status: <span className="text-emerald-400 font-semibold">Active on Asimov Testnet</span>
          </span>
        </div>
      </div>

      {/* Function Selector Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {CONTRACT_FUNCTIONS.map((func) => {
          const isSelected = selectedFuncId === func.id;
          return (
            <button
              key={func.id}
              onClick={() => setSelectedFuncId(func.id)}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                isSelected
                  ? 'bg-neutral-800/90 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono font-semibold ${isSelected ? 'text-emerald-400' : 'text-neutral-500'}`}>
                  STEP 0{func.id}
                </span>
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${
                  func.type === 'write' ? 'bg-amber-500/10 text-amber-300' : 'bg-sky-500/10 text-sky-300'
                }`}>
                  {func.type}
                </span>
              </div>
              <span className={`text-xs font-bold truncate ${isSelected ? 'text-neutral-100' : 'text-neutral-300'}`}>
                {func.name}
              </span>
              <span className="text-[11px] text-neutral-500 line-clamp-1">
                {func.stepTitle.replace(/^\d+\.\s*/, '')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Function Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Spec, Purpose, Security, Efficiency */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800">
              <div>
                <span className="text-xs text-emerald-400 font-mono font-semibold block mb-0.5">
                  FUNCTION 0{selectedFunc.id} ARCHITECTURE
                </span>
                <h3 className="text-base font-bold text-neutral-100">
                  {selectedFunc.stepTitle}
                </h3>
              </div>
              <span className="font-mono text-xs text-neutral-300 bg-neutral-950 px-2.5 py-1 rounded border border-neutral-800">
                @{selectedFunc.type === 'write' ? 'public.write' : 'public.view'}
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {selectedFunc.purpose}
            </p>

            {/* Signature Box */}
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/90 font-mono text-xs text-emerald-300 overflow-x-auto">
              <code>{selectedFunc.signature}</code>
            </div>

            {/* Parameters & Returns */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-neutral-300 block">
                Parameters & Data Inputs:
              </span>
              <div className="space-y-2">
                {selectedFunc.inputs.map((inp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs"
                  >
                    <div className="font-mono">
                      <span className="text-emerald-400">{inp.name}</span>
                      <span className="text-neutral-500 text-[11px] ml-1.5">({inp.type})</span>
                    </div>
                    <span className="text-neutral-400 text-[11px]">{inp.desc}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold text-neutral-300 block mb-1">
                  Returns:
                </span>
                <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80 font-mono text-xs text-sky-300">
                  {selectedFunc.outputs}
                </div>
              </div>

              {selectedFunc.eventEmitted && (
                <div className="pt-1">
                  <span className="text-xs font-semibold text-neutral-300 block mb-1">
                    On-Chain Event Emitted:
                  </span>
                  <div className="p-2 rounded bg-neutral-950/60 border border-neutral-800/80 font-mono text-[11px] text-amber-300">
                    gl.emit_event(&quot;{selectedFunc.eventEmitted}&quot;)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security & Efficiency Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Security */}
            <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-rose-400">
                <Lock className="w-4 h-4" />
                <h4 className="text-xs font-semibold text-neutral-200">
                  Security Invariants & Guards
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-neutral-400">
                {selectedFunc.securityMechanisms.map((sec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400/80 text-[11px] mt-0.5">▪</span>
                    <span className="text-[11px] leading-relaxed">{sec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Efficiency */}
            <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-emerald-400">
                <Zap className="w-4 h-4" />
                <h4 className="text-xs font-semibold text-neutral-200">
                  Blockchain Efficiency & Gas
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-neutral-400">
                {selectedFunc.efficiencyGains.map((eff, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400/80 text-[11px] mt-0.5">▪</span>
                    <span className="text-[11px] leading-relaxed">{eff}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Python Implementation & Live Trace */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Python Implementation */}
          <div className="rounded-xl border border-neutral-800 bg-[#090d16] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800 text-xs text-neutral-400">
              <span className="font-mono text-neutral-300 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                VisionMathContract.py
              </span>
              <span className="text-[11px] font-mono text-neutral-500">Python 0.8.4</span>
            </div>
            <div className="p-4 font-mono text-xs leading-relaxed text-neutral-300 overflow-x-auto max-h-72">
              <pre>{selectedFunc.sampleCode}</pre>
            </div>
          </div>

          {/* End-to-End Atomic Composition */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold text-neutral-200">
                Atomic Composite Wrapper: <code className="text-sky-300 font-mono">solve_math_pipeline</code>
              </h4>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Clients can invoke the full 5-function pipeline in a single transaction (Function 1 $\rightarrow$ 2 $\rightarrow$ 3 $\rightarrow$ 4 $\rightarrow$ 5) or execute steps independently across asynchronous transaction blocks.
            </p>
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 font-mono text-[11px] text-neutral-300">
              <code>solve_math_pipeline(image_hash, image_b64_payload, hint)</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
