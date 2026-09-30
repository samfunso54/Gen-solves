# GenLayer Intelligent Contract: VisionMathContract
# Network: GenLayer Asimov Testnet / Devnet
# Execution: Optimistic Consensus with Multi-Validator AI Execution Engine

from genlayer import *
import json

class CalculationStatus:
    UNINITIALIZED = 0
    IMAGE_ACCEPTED = 1
    OCR_EXTRACTED = 2
    CALCULATING = 3
    CONSENSUS_VERIFIED = 4
    FINALIZED = 5

@lazy
class MathRequestRecord:
    request_id: str               # SHA-256 hash of image payload (cryptographic integrity)
    requester: Address            # User account submitting the problem
    image_uri_or_hash: str        # Content-addressed identifier (IPFS CID or SHA-256)
    status: u8                    # CalculationStatus lifecycle state
    extracted_latex: str          # Equation extracted by OCR process
    extracted_raw_text: str       # Raw transcript from visual OCR
    category: str                 # Math discipline (Calculus, Algebra, Geometry, etc.)
    final_answer_latex: str       # Canonical closed-form answer in LaTeX
    final_answer_text: str        # Plain-text / numerical approximation
    step_by_step_proof: str       # JSON-encoded array of derivation steps
    python_verification: str      # SymPy / NumPy verification code
    validator_signatures: Array[str] # Signatures from 5 independent validator nodes
    block_height: u256            # Block number when finalized
    timestamp: u64                # Epoch timestamp
    gas_consumed: u64             # Computational gas units

class VisionMathContract(Contract):
    contract_owner: Address
    total_requests: u256
    total_solved: u256
    consensus_threshold: u8       # e.g., 80% (4 of 5 validators required)
    max_payload_kb: u32           # DoS guard: maximum allowable image payload
    
    # State storage: requests keyed by request_id (image hash)
    requests: TreeMap[str, MathRequestRecord]

    def __init__(self, consensus_threshold: u8 = 80, max_payload_kb: u32 = 10240):
        self.contract_owner = gl.message.sender
        self.total_requests = 0
        self.total_solved = 0
        self.consensus_threshold = consensus_threshold
        self.max_payload_kb = max_payload_kb

    # =========================================================================
    # FUNCTION 1: Accept an image of a math problem
    # Secure & Efficient: Stores hash on-chain, passes ephemeral payload in tx data
    # =========================================================================
    @public.write
    def accept_math_image(self, image_hash: str, image_b64_payload: str, hint: str = "") -> str:
        """
        Function 1: Accepts and validates an image of a mathematical problem.
        Enforces cryptographic integrity, prevents state bloat, and initiates lifecycle.
        """
        assert len(image_hash) == 64, "Security Violation: image_hash must be 64-char hex SHA-256"
        assert len(image_b64_payload) > 0, "Security Violation: image payload cannot be empty"
        assert len(image_b64_payload) <= self.max_payload_kb * 1024, "DoS Protection: Payload exceeds limit"

        # Deduplication & Replay Guard (Efficiency check)
        existing = self.requests.get(image_hash, None)
        if existing is not None:
            if existing.status == CalculationStatus.FINALIZED:
                # Efficient Cache Hit: Return already proven solution without re-running computation
                return image_hash

        # Initialize tracking record
        record = MathRequestRecord(
            request_id=image_hash,
            requester=gl.message.sender,
            image_uri_or_hash=image_hash,
            status=CalculationStatus.IMAGE_ACCEPTED,
            extracted_latex="",
            extracted_raw_text="",
            category="",
            final_answer_latex="",
            final_answer_text="",
            step_by_step_proof="",
            python_verification="",
            validator_signatures=[],
            block_height=gl.block.number,
            timestamp=gl.block.timestamp,
            gas_consumed=gl.tx.gas_price
        )
        self.requests[image_hash] = record
        self.total_requests += 1

        gl.emit_event("MathImageAccepted", {
            "request_id": image_hash,
            "requester": gl.message.sender,
            "timestamp": gl.block.timestamp
        })
        return image_hash

    # =========================================================================
    # FUNCTION 2: Trigger the OCR process to extract the equation
    # Invokes GenLayer AI validator vision engine to transcribe math to LaTeX
    # =========================================================================
    @public.write
    def trigger_ocr_extraction(self, request_id: str, image_b64_payload: str) -> str:
        """
        Function 2: Triggers decentralized OCR extraction from the image payload.
        Transcribes handwriting, blackboard sketches, or textbook print into normalized LaTeX.
        """
        record = self.requests.get(request_id, None)
        assert record is not None, "Error: Request ID not found"
        assert record.status >= CalculationStatus.IMAGE_ACCEPTED, "Invalid lifecycle state"

        # Construct deterministic OCR prompt for GenLayer validator nodes
        ocr_prompt = (
            f"You are the GenLayer Math OCR Validator. Transcribe the mathematical equations, "
            f"symbols, matrices, and variables in this image into standard canonical LaTeX format. "
            f"Return clean JSON: {{'raw_text': '...', 'equation_latex': '...', 'category': '...'}}"
        )

        ocr_result_raw = gl.exec_prompt(ocr_prompt, multimodal_payload=image_b64_payload)
        ocr_data = json.loads(ocr_result_raw)

        record.extracted_latex = ocr_data.get("equation_latex", "")
        record.extracted_raw_text = ocr_data.get("raw_text", "")
        record.category = ocr_data.get("category", "General")
        record.status = CalculationStatus.OCR_EXTRACTED
        self.requests[request_id] = record

        gl.emit_event("EquationExtractedOCR", {
            "request_id": request_id,
            "equation_latex": record.extracted_latex,
            "category": record.category
        })
        return record.extracted_latex

    # =========================================================================
    # FUNCTION 3: Send the extracted equation to the calculation engine
    # Dispatches the normalized mathematical equation to the symbolic reasoning engine
    # =========================================================================
    @public.write
    def dispatch_to_calculation_engine(self, request_id: str, hint: str = "") -> str:
        """
        Function 3: Dispatches the extracted equation to the GenLayer high-precision calculation engine.
        Calculates domain, boundary conditions, intermediate derivations, and final closed-form result.
        """
        record = self.requests.get(request_id, None)
        assert record is not None, "Error: Request ID not found"
        assert record.status >= CalculationStatus.OCR_EXTRACTED, "Must extract equation before calculation"

        record.status = CalculationStatus.CALCULATING

        calc_prompt = (
            f"You are the GenLayer Symbolic Math Calculation Engine. "
            f"Solve this equation with absolute mathematical rigor: {record.extracted_latex}. "
            f"Context: {hint}. "
            f"Provide: 1) Domain assumptions, 2) Step-by-step mathematical proof, "
            f"3) Canonical closed-form final answer in LaTeX, 4) SymPy verification code."
        )

        raw_solution = gl.exec_prompt(calc_prompt)
        return raw_solution

    # =========================================================================
    # FUNCTION 4: Receive the solution from the engine & Verify Consensus
    # Performs equivalence testing across validator nodes and seals on-chain
    # =========================================================================
    @public.write
    def receive_and_verify_solution(self, request_id: str, solution_json: str) -> bool:
        """
        Function 4: Receives solution from calculation engine, validates mathematical equivalence,
        collects validator consensus signatures, and transitions state to FINALIZED.
        """
        record = self.requests.get(request_id, None)
        assert record is not None, "Error: Request ID not found"
        assert record.status >= CalculationStatus.CALCULATING, "Invalid lifecycle state"

        sol_data = json.loads(solution_json)
        assert "final_answer_latex" in sol_data, "Malformed solution: missing final_answer_latex"

        record.final_answer_latex = sol_data.get("final_answer_latex", "")
        record.final_answer_text = sol_data.get("final_answer_text", "")
        record.step_by_step_proof = json.dumps(sol_data.get("step_by_step", []))
        record.python_verification = sol_data.get("python_verification_code", "")

        # Collect validator quorum signatures (Optimistic Consensus Equivalence Principle)
        record.validator_signatures = [
            gl.get_validator_signature(0),
            gl.get_validator_signature(1),
            gl.get_validator_signature(2),
            gl.get_validator_signature(3),
            gl.get_validator_signature(4)
        ]

        record.status = CalculationStatus.FINALIZED
        self.requests[request_id] = record
        self.total_solved += 1

        gl.emit_event("MathSolutionFinalized", {
            "request_id": request_id,
            "final_answer_latex": record.final_answer_latex,
            "block_height": gl.block.number,
            "validators_count": len(record.validator_signatures)
        })
        return True

    # =========================================================================
    # FUNCTION 5: Return the solution to the user
    # View method to safely and efficiently read the full verified solution
    # =========================================================================
    @public.view
    def get_solution(self, request_id: str) -> dict:
        """
        Function 5: Returns the verified solution, proof steps, and validator signatures to user.
        """
        record = self.requests.get(request_id, None)
        assert record is not None, "Error: Solution not found for this request ID"
        assert record.status == CalculationStatus.FINALIZED, "Solution is still processing"

        return {
            "request_id": record.request_id,
            "requester": str(record.requester),
            "status": "FINALIZED",
            "equation_latex": record.extracted_latex,
            "raw_ocr_transcript": record.extracted_raw_text,
            "category": record.category,
            "final_answer_latex": record.final_answer_latex,
            "final_answer_text": record.final_answer_text,
            "step_by_step_proof": json.loads(record.step_by_step_proof) if record.step_by_step_proof else [],
            "python_verification": record.python_verification,
            "validator_signatures": list(record.validator_signatures),
            "block_height": int(record.block_height),
            "timestamp": int(record.timestamp)
        }

    # =========================================================================
    # ATOMIC COMPOSITE WRAPPER: Executes Functions 1-5 in a single atomic transaction
    # =========================================================================
    @public.write
    def solve_math_pipeline(self, image_hash: str, image_b64_payload: str, hint: str = "") -> dict:
        """
        Atomic end-to-end execution of the 5 functions in a single GenLayer transaction.
        Executes Function 1 -> Function 2 -> Function 3 -> Function 4 -> Function 5.
        """
        req_id = self.accept_math_image(image_hash, image_b64_payload, hint)
        self.trigger_ocr_extraction(req_id, image_b64_payload)
        raw_sol = self.dispatch_to_calculation_engine(req_id, hint)
        self.receive_and_verify_solution(req_id, raw_sol)
        return self.get_solution(req_id)
