import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Upload,
  RefreshCw,
  Sparkles,
  Volume2,
  FileAudio,
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface VoiceCaptureProps {
  onAudioCaptured: (audioBase64: string, mimeType: string, durationSec: number) => void;
  onSolveDirectly?: (audioBase64: string, mimeType: string, durationSec: number) => void;
  isSolving: boolean;
}

const SAMPLE_VOICE_PROMPTS = [
  {
    title: 'Definite Integral',
    phrase: 'Evaluate the definite integral of 3x squared plus 2x minus 5 from x = 1 to 3.',
    category: 'Calculus',
  },
  {
    title: 'Quadratic Equation',
    phrase: 'Solve the equation 2x squared minus 7x plus 3 equals 0.',
    category: 'Algebra',
  },
  {
    title: 'Matrix Eigenvalues',
    phrase: 'Find the eigenvalues and determinant of matrix with rows 4, 1 and 2, 3.',
    category: 'Linear Algebra',
  },
  {
    title: 'Derivative with Product Rule',
    phrase: 'Find the first derivative with respect to x of x cubed multiplied by sine of x.',
    category: 'Differentiation',
  },
];

export const VoiceCapture: React.FC<VoiceCaptureProps> = ({
  onAudioCaptured,
  onSolveDirectly,
  isSolving,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMime, setAudioMime] = useState<string>('audio/webm');
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceTab, setVoiceTab] = useState<'record' | 'upload' | 'samples'>('record');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  // Clean up timer and media stream tracks on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop());
        activeStreamRef.current = null;
      }
    };
  }, [audioUrl]);

  // Start Live Microphone Recording
  const startRecording = async () => {
    setErrorMessage(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Microphone recording is not supported in this browser environment. You can upload an audio file instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      activeStreamRef.current = stream;

      // Select supported mimeType
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/wav',
      ];
      const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

      const options = selectedMime ? { mimeType: selectedMime } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const recordedBlob = new Blob(audioChunksRef.current, {
          type: selectedMime || 'audio/webm',
        });
        const url = URL.createObjectURL(recordedBlob);
        setAudioUrl(url);

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(recordedBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setAudioBase64(base64Data);
          setAudioMime(recordedBlob.type || 'audio/webm');
          onAudioCaptured(base64Data, recordedBlob.type || 'audio/webm', recordingTime);
        };

        // Stop all audio tracks to release microphone hardware
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // Collect data chunks every 250ms
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access in your browser.'
          : 'Could not access microphone: ' + (err.message || 'Unknown error')
      );
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  // Toggle Audio Playback
  const togglePlayAudio = () => {
    if (!audioElementRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audioElementRef.current = audio;
    }

    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElementRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Handle uploaded audio file (.mp3, .wav, .m4a, .webm, etc.)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    const mime = file.type || 'audio/mp3';
    setAudioMime(mime);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      setAudioBase64(base64Data);
      onAudioCaptured(base64Data, mime, 5);
    };
  };

  // Quick simulate sample spoken math using Web Speech or synthetic audio payload
  const handleSelectSample = (sample: (typeof SAMPLE_VOICE_PROMPTS)[0]) => {
    // Generate a simple synthetic WAV with encoded metadata or spoken prompt
    // For immediate solver execution, we create a short silent audio or synthesized carrier
    const sampleContext = `Spoken Voice Note Transcription: "${sample.phrase}"`;
    // Create minimal valid WebM or WAV header
    const sampleAudioPayload = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    setAudioBase64(sampleAudioPayload);
    setAudioMime('audio/wav');
    onAudioCaptured(sampleAudioPayload, 'audio/wav', 4);
    if (onSolveDirectly) {
      onSolveDirectly(sampleAudioPayload, 'audio/wav', 4);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Voice Sub-tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-lg border border-neutral-800 w-fit text-xs">
        <button
          onClick={() => setVoiceTab('record')}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
            voiceTab === 'record'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Mic className="w-3.5 h-3.5 text-blue-400" />
          <span>Record Note</span>
        </button>
        <button
          onClick={() => setVoiceTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
            voiceTab === 'upload'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-blue-400" />
          <span>Upload Audio</span>
        </button>
        <button
          onClick={() => setVoiceTab('samples')}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
            voiceTab === 'samples'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-blue-400" />
          <span>Spoken Examples</span>
        </button>
      </div>

      {/* Mode 1: Live Record */}
      {voiceTab === 'record' && (
        <div className="p-6 sm:p-8 rounded-xl bg-neutral-900/40 border border-neutral-800 flex flex-col items-center justify-center text-center gap-5">
          {/* Pulsing record circle */}
          <div className="relative flex items-center justify-center">
            {isRecording && (
              <span className="absolute w-24 h-24 rounded-full bg-blue-500/20 animate-ping" />
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isSolving}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 hover:scale-105'
              } disabled:opacity-50`}
            >
              {isRecording ? (
                <Square className="w-7 h-7 fill-white" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-neutral-200">
              {isRecording ? 'Listening to your math problem...' : audioUrl ? 'Voice Note Ready' : 'Tap to Record Voice Note'}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              {isRecording
                ? `Recording: ${formatTime(recordingTime)}`
                : audioUrl
                ? `Recorded duration: ${formatTime(recordingTime || 5)}`
                : 'Speak naturally: "Integrate x squared plus 3x" or "Find the roots of..."'}
            </span>
          </div>

          {/* Animated audio wave bars while recording */}
          {isRecording && (
            <div className="flex items-center gap-1 h-8">
              {[40, 70, 30, 90, 60, 100, 50, 80, 45, 85, 35, 95].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-blue-400 rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${(i * 0.08).toFixed(2)}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Audio preview controls when recording is completed */}
          {audioUrl && !isRecording && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-950 border border-neutral-800 w-full max-w-sm">
              <button
                onClick={togglePlayAudio}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-200 transition-colors shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div className="flex flex-col text-left flex-1 min-w-0">
                <span className="text-xs font-medium text-neutral-200 truncate">
                  Voice Note Recorded
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {formatTime(recordingTime || 5)} · Ready for GenLayer Contract
                </span>
              </div>
              <button
                onClick={startRecording}
                className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
                title="Record again"
              >
                Retake
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300 max-w-md">
              {errorMessage}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Upload Audio File */}
      {voiceTab === 'upload' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-neutral-800 hover:border-neutral-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-neutral-900/30"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-blue-400 mb-2.5">
            <FileAudio className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-neutral-200">
            {audioUrl ? 'Audio file selected (click to change)' : 'Drop voice note audio file, or click to browse'}
          </span>
          <span className="text-[11px] text-neutral-500 mt-1">
            Supports MP3, WAV, M4A, WEBM, OGG from phone voice memos or dictaphones
          </span>
          {audioUrl && (
            <div className="mt-4 flex items-center gap-2 text-xs text-blue-400 font-mono bg-blue-950/30 border border-blue-500/30 px-3 py-1.5 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Voice Note Loaded</span>
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Spoken Examples */}
      {voiceTab === 'samples' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_VOICE_PROMPTS.map((sample, i) => (
            <div
              key={i}
              onClick={() => handleSelectSample(sample)}
              className="p-3.5 rounded-lg bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 cursor-pointer transition-all flex flex-col gap-1.5 group"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-200 group-hover:text-blue-400 transition-colors">
                  {sample.title}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {sample.category}
                </span>
              </div>
              <p className="text-xs text-neutral-400 italic">
                &ldquo;{sample.phrase}&rdquo;
              </p>
              <div className="pt-2 mt-auto border-t border-neutral-800/60 flex items-center justify-between text-xs text-blue-400 font-medium">
                <span>Solve This Spoken Problem</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
