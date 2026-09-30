import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment', // prefer back camera on phones/tablets
          },
        });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsReady(true);
          };
        }
      } catch (err: any) {
        if (!active) return;
        console.error('Camera access error:', err);
        setError(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please grant permission in your browser or upload an image file instead.'
            : 'No accessible camera found or camera is in use by another application.'
        );
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    onCapture(dataUrl);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-neutral-200">Live Camera Scanner</span>
          <span className="text-xs text-neutral-500">· Point camera at handwritten or printed math</span>
        </div>
        <button
          onClick={onCancel}
          className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error ? (
        <div className="p-6 rounded-lg bg-red-950/30 border border-red-900/50 flex flex-col items-center justify-center text-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-300 max-w-md">{error}</p>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Close and Use File Upload
          </button>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-h-80 flex items-center justify-center border border-neutral-800">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Scanner Overlay Sight Guide */}
          {isReady && (
            <div className="absolute inset-8 border border-dashed border-emerald-400/60 rounded-lg pointer-events-none flex flex-col justify-between p-3">
              <div className="flex justify-between text-[11px] font-mono text-emerald-400/80 bg-neutral-950/60 px-2 py-0.5 rounded self-start">
                <span>FRAME MATH PROBLEM HERE</span>
              </div>
              <div className="text-center text-xs text-neutral-300 bg-neutral-950/70 py-1 px-3 rounded-full self-center">
                Ensure equation symbols and numbers are clearly illuminated
              </div>
            </div>
          )}

          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-400">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
              <span className="text-xs font-mono">Initializing camera feed...</span>
            </div>
          )}
        </div>
      )}

      {!error && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={takeSnapshot}
            disabled={!isReady}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:hover:bg-emerald-400 rounded-lg transition-colors"
          >
            <Camera className="w-4 h-4" />
            Capture Snapshot & Solve
          </button>
        </div>
      )}
    </div>
  );
};
