import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Pen, RotateCcw, Check, Sparkles } from 'lucide-react';

interface MathWhiteboardProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}

export const MathWhiteboard: React.FC<MathWhiteboardProps> = ({ onCapture, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#38bdf8'); // Sky blue chalk
  const [lineWidth, setLineWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw dark slate chalkboard background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle chalkboard grain & guidelines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 50; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(canvas.width - 20, y);
      ctx.stroke();
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.strokeStyle = isEraser ? '#090d16' : color;
    ctx.lineWidth = isEraser ? 24 : lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Re-draw guidelines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 50; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(canvas.width - 20, y);
      ctx.stroke();
    }
    setHasDrawn(false);
  };

  const handleCapture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onCapture(dataUrl);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Pen className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-neutral-200">
            Handwritten Math Canvas
          </span>
          <span className="text-xs text-neutral-500">· Write equations or draw diagrams</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsEraser(false);
              setColor('#38bdf8');
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              !isEraser && color === '#38bdf8'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Sky Blue
          </button>
          <button
            onClick={() => {
              setIsEraser(false);
              setColor('#f8fafc');
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              !isEraser && color === '#f8fafc'
                ? 'bg-neutral-700 text-white border border-neutral-600'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            White Chalk
          </button>
          <button
            onClick={() => {
              setIsEraser(false);
              setColor('#34d399');
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              !isEraser && color === '#34d399'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Emerald
          </button>
          <button
            onClick={() => setIsEraser(!isEraser)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              isEraser
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            Eraser
          </button>
          <button
            onClick={clearCanvas}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-400 hover:text-red-400 rounded-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-neutral-800 bg-[#090d16] touch-none">
        <canvas
          ref={canvasRef}
          width={800}
          height={380}
          className="w-full h-72 cursor-crosshair block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-neutral-600 gap-1.5">
            <Sparkles className="w-6 h-6 opacity-40 text-emerald-400" />
            <span className="text-xs font-mono">Draw or handwrite any math formula with mouse or stylus</span>
            <span className="text-[11px] text-neutral-600">e.g. ∫ (3x² + 2x - 5) dx, or Ax = b</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCapture}
          disabled={!hasDrawn}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:hover:bg-emerald-400 rounded-lg transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          Capture & Submit to GenLayer Contract
        </button>
      </div>
    </div>
  );
};
