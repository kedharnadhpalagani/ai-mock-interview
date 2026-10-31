import React, { useEffect, useRef, useState } from 'react';
import { Camera, AlertTriangle, ShieldAlert, CheckCircle, VideoOff } from 'lucide-react';

interface ProctoringMonitorProps {
  videoStream: MediaStream | null;
  onIntegrityViolation: (eventType: string, details: string) => void;
  warningsCount: number;
}

export const ProctoringMonitor: React.FC<ProctoringMonitorProps> = ({
  videoStream,
  onIntegrityViolation,
  warningsCount,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [faceStatus, setFaceStatus] = useState<'detected' | 'absent' | 'multiple'>('detected');
  const lastViolationTimeRef = useRef<number>(0);

  // Bind video stream to video element
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  // Periodic video frame analysis for face detection
  useEffect(() => {
    if (!videoStream) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 160;
      canvas.height = 120;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Lightweight client-side pixel brightness and motion analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let totalLuma = 0;
      let skinTonePixels = 0;

      for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuma += luma;

        // Basic human skin chroma thresholding heuristic
        if (r > 60 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
          skinTonePixels++;
        }
      }

      const sampleCount = data.length / 16;
      const avgLuma = totalLuma / sampleCount;
      const skinRatio = skinTonePixels / sampleCount;

      const now = Date.now();
      // Minimum 15 seconds cooldown between successive automated warnings to prevent flooding
      const cooldownElapsed = now - lastViolationTimeRef.current > 15000;

      if (avgLuma < 15 || skinRatio < 0.04) {
        // Face absent or frame blocked
        setFaceStatus('absent');
        if (cooldownElapsed) {
          lastViolationTimeRef.current = now;
          onIntegrityViolation('face_absent', 'Candidate face absent from camera frame or camera covered.');
        }
      } else {
        setFaceStatus('detected');
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [videoStream, onIntegrityViolation]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-[#0F0E26] shadow-xl group">
      {/* Video Element */}
      {videoStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-44 sm:h-52 object-cover mirror-mode"
          style={{ transform: 'scaleX(-1)' }}
        />
      ) : (
        <div className="w-full h-44 sm:h-52 flex flex-col items-center justify-center bg-slate-900/80 text-slate-400 gap-2">
          <VideoOff className="w-8 h-8 text-rose-400" />
          <span className="text-xs font-semibold">Camera Offline</span>
        </div>
      )}

      {/* Offscreen analysis canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Proctoring Status Pill */}
      <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-semibold">
        <span className={`w-2 h-2 rounded-full ${faceStatus === 'detected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
        <span className="text-white">
          {faceStatus === 'detected' ? 'Face Verified' : 'Face Not Detected'}
        </span>
      </div>

      {/* Warning Tracker Badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px]">
        <ShieldAlert className={`w-3.5 h-3.5 ${warningsCount > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
        <span className={warningsCount > 0 ? 'text-rose-300 font-bold' : 'text-slate-300'}>
          Warnings: {warningsCount}/4
        </span>
      </div>

      {/* Candidate Label */}
      <div className="absolute bottom-2.5 left-3 text-[11px] font-semibold text-slate-300 bg-black/50 px-2 py-0.5 rounded">
        Candidate Preview (Local Proctoring)
      </div>
    </div>
  );
};
