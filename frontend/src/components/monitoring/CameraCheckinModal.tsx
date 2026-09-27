import { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Upload, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface CameraCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<any>;
}

export function CameraCheckinModal({ isOpen, onClose, onSubmit }: CameraCheckinModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [breathingPhase, setBreathingPhase] = useState<'in' | 'out'>('in');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Breathing guide animation toggle
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setBreathingPhase((prev) => (prev === 'in' ? 'out' : 'in'));
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Start webcam when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      resetState();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser environment.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Webcam start failed:', err.message);
      setIsCameraActive(false);
      setCameraError(
        'Camera is not available or access was blocked. You can upload a photo instead.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const resetState = () => {
    setCapturedBlob(null);
    setCapturedPreview(null);
    setCameraError(null);
    setIsAnalyzing(false);
    setAnalysisStep('');
  };

  // Capture frame from webcam
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedPreview(canvas.toDataURL('image/jpeg'));
          stopCamera();
        }
      },
      'image/jpeg',
      0.9
    );
  };

  // Handle manual photo upload fallback
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCapturedBlob(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      stopCamera();
    }
  };

  // Submit check-in to Express / FastAPI
  const handleAnalyzeAndSubmit = async () => {
    if (!capturedBlob) return;
    try {
      setIsAnalyzing(true);
      setAnalysisStep('Uploading check-in snapshot...');

      const formData = new FormData();
      formData.append('file', capturedBlob, 'checkin_face.jpg');

      setTimeout(() => {
        setAnalysisStep('Analyzing resting facial composure & wellness markers...');
      }, 800);

      setTimeout(() => {
        setAnalysisStep('Evaluating fatigue indicators & recovery advice...');
      }, 1800);

      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      console.error('Check-in failed:', err);
      alert('Check-in analysis failed: ' + (err.message || 'Please try again.'));
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedBlob(null);
    setCapturedPreview(null);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="relative w-full max-w-lg bg-slate-900 border-slate-800 text-white shadow-2xl overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-100">AI Wellness Check-in</h3>
              <p className="text-xs text-slate-400">Facial stress & fatigue assessment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isAnalyzing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Main Visual Frame */}
          <div className="relative aspect-4/3 w-full rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
            {/* Live Video */}
            {!capturedPreview && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover mirror ${!isCameraActive ? 'hidden' : ''}`}
                style={{ transform: 'scaleX(-1)' }}
              />
            )}

            {/* Frozen captured preview */}
            {capturedPreview && (
              <img
                src={capturedPreview}
                alt="Captured Check-in"
                className="w-full h-full object-cover"
              />
            )}

            {/* Breathing Guidance Overlay (only during live webcam) */}
            {isCameraActive && !capturedPreview && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 text-center">
                {/* Breathing Oval Ring */}
                <div
                  className={`w-44 h-56 rounded-[50%] border-2 border-teal-400/70 transition-all duration-3000 ease-in-out flex items-center justify-center shadow-lg shadow-teal-500/10 ${
                    breathingPhase === 'in' ? 'scale-105 border-teal-300 bg-teal-500/10' : 'scale-95 border-teal-500/40 bg-transparent'
                  }`}
                >
                  <div
                    className={`w-36 h-48 rounded-[50%] border border-dashed border-teal-300/40 transition-all duration-3000 ${
                      breathingPhase === 'in' ? 'scale-100 opacity-80' : 'scale-90 opacity-40'
                    }`}
                  />
                </div>
                <div className="mt-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 shadow-md">
                  <p className="text-xs font-medium text-teal-300">
                    Breathe {breathingPhase === 'in' ? 'in gently...' : 'out slowly...'}
                  </p>
                </div>
              </div>
            )}

            {/* Fallback Screen if camera failed */}
            {!isCameraActive && !capturedPreview && (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-300">Camera preview unavailable</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    {cameraError || 'You can upload a photo or selfie from your device to analyze.'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-teal-300 hover:text-teal-200 text-xs gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Select Photo to Upload
                </Button>
              </div>
            )}

            {/* Analyzing Loading Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-3 border-teal-500/20 border-t-teal-400 animate-spin" />
                  <Sparkles className="w-5 h-5 text-teal-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-slate-100">CareCircle AI Vision</h4>
                  <p className="text-xs text-teal-300 animate-pulse">{analysisStep}</p>
                </div>
              </div>
            )}
          </div>

          {/* Hidden Canvas for snapshot extraction */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Hidden File Input for fallback upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Action Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left toggle: upload vs camera */}
            {!capturedPreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-slate-400 hover:text-teal-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Or upload existing photo
              </button>
            )}

            {capturedPreview && !isAnalyzing && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRetake}
                className="w-full sm:w-auto bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 cursor-pointer gap-1.5 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retake
              </Button>
            )}

            {/* Primary Action Button */}
            <div className="w-full sm:w-auto flex items-center gap-2 justify-end">
              {isCameraActive && !capturedPreview && (
                <Button
                  type="button"
                  variant="teal"
                  onClick={handleCapture}
                  className="w-full sm:w-auto font-semibold shadow-md gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Capture Check-in
                </Button>
              )}

              {capturedPreview && (
                <Button
                  type="button"
                  variant="teal"
                  disabled={isAnalyzing}
                  onClick={handleAnalyzeAndSubmit}
                  className="w-full sm:w-auto font-semibold shadow-md gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze with AI Co-Pilot'}
                </Button>
              )}
            </div>
          </div>

          {/* Privacy Note */}
          <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 pt-1">
            <AlertCircle className="w-3 h-3 text-slate-400" />
            Check-ins are analyzed securely for wellness signals and shared only with your Care Circle.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
