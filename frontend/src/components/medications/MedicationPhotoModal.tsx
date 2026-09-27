import { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Upload, Sparkles, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import type { MedicationScheduleItem } from '../../lib/api';

interface MedicationPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: MedicationScheduleItem | null;
  onConfirmPhoto: (medicationId: string, formData: FormData) => Promise<any>;
}

export function MedicationPhotoModal({
  isOpen,
  onClose,
  medication,
  onConfirmPhoto,
}: MedicationPhotoModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyStep, setVerifyStep] = useState<string>('');
  const [result, setResult] = useState<{
    isMatch: boolean;
    isTaken: boolean;
    confidence: number;
    notes: string;
    detectedDetails?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    setResult(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser environment.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Medication camera start failed:', err.message);
      setIsCameraActive(false);
      setCameraError('Camera unavailable. You can upload a photo of your medication.');
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
    setIsVerifying(false);
    setVerifyStep('');
    setResult(null);
  };

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

  const handleVerify = async () => {
    if (!capturedBlob || !medication) return;
    try {
      setIsVerifying(true);
      setVerifyStep('Uploading medication photo...');

      const formData = new FormData();
      formData.append('file', capturedBlob, 'med_confirmation.jpg');
      formData.append('timeSlot', medication.timeSlot);

      setTimeout(() => {
        setVerifyStep('Verifying medication packaging & dosage details...');
      }, 700);

      setTimeout(() => {
        setVerifyStep('Verifying dose ingestion & adherence evidence...');
      }, 1600);

      const res = await onConfirmPhoto(medication.medicationId, formData);
      if (res?.analysis) {
        setResult(res.analysis);
      }
      setIsVerifying(false);
    } catch (err: any) {
      console.error('Photo confirmation error:', err);
      alert('Verification failed: ' + (err.message || 'Please try again.'));
      setIsVerifying(false);
    }
  };

  const handleRetake = () => {
    setCapturedBlob(null);
    setCapturedPreview(null);
    setResult(null);
    startCamera();
  };

  if (!isOpen || !medication) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="relative w-full max-w-lg bg-slate-900 border-slate-800 text-white shadow-2xl overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-slate-100">{medication.name}</h3>
                <Badge variant="outline" className="text-[11px] py-0 border-teal-500/50 text-teal-300">
                  {medication.dosage}
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Scheduled at {medication.timeSlot} • Photo Dose Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isVerifying}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Instructions banner */}
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-center justify-between">
            <span>Prescription instructions:</span>
            <span className="font-semibold text-teal-300">{medication.instructions || 'Take with food and water'}</span>
          </div>

          {/* Camera Viewfinder */}
          <div className="relative aspect-4/3 w-full rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
            {!capturedPreview && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
              />
            )}

            {capturedPreview && (
              <img
                src={capturedPreview}
                alt="Medication Captured"
                className="w-full h-full object-cover"
              />
            )}

            {/* Target Reticle Overlay (Only during active camera) */}
            {isCameraActive && !capturedPreview && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
                <div className="w-56 h-40 border-2 border-dashed border-teal-400/80 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/10">
                  <div className="w-48 h-32 border border-teal-300/30 rounded-xl flex items-center justify-center">
                    <span className="text-[11px] font-medium text-teal-300 bg-slate-900/80 px-2.5 py-1 rounded-full border border-teal-500/30">
                      Align bottle label, blister, or pill
                    </span>
                  </div>
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
                    {cameraError || 'You can select or take a photo of your medication to upload.'}
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

            {/* Verification Loading Overlay */}
            {isVerifying && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-3 border-teal-500/20 border-t-teal-400 animate-spin" />
                  <Sparkles className="w-5 h-5 text-teal-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-slate-100">CareCircle AI Vision</h4>
                  <p className="text-xs text-teal-300 animate-pulse">{verifyStep}</p>
                </div>
              </div>
            )}
          </div>

          {/* Verification Result Display */}
          {result && (
            <div
              className={`p-3.5 rounded-xl border space-y-2 text-xs animate-in fade-in duration-200 ${
                result.isTaken
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  {result.isTaken ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                  )}
                  {result.isTaken ? 'Dose Confirmed Taken' : 'Adherence Attention Needed'}
                </span>
                <Badge
                  variant="outline"
                  className={
                    result.isTaken
                      ? 'border-emerald-600 bg-emerald-900/60 text-emerald-300'
                      : 'border-amber-600 bg-amber-900/60 text-amber-300'
                  }
                >
                  AI Confidence: {Math.round(result.confidence * 100)}%
                </Badge>
              </div>
              <p className="text-slate-300 leading-relaxed">{result.notes}</p>
              {result.detectedDetails && (
                <p className="text-[11px] text-slate-400 italic">
                  Detected details: {result.detectedDetails}
                </p>
              )}
            </div>
          )}

          {/* Hidden Canvas and File Input */}
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
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

            {capturedPreview && !isVerifying && (
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

            <div className="w-full sm:w-auto flex items-center gap-2 justify-end">
              {isCameraActive && !capturedPreview && (
                <Button
                  type="button"
                  variant="teal"
                  onClick={handleCapture}
                  className="w-full sm:w-auto font-semibold shadow-md gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </Button>
              )}

              {capturedPreview && !result && (
                <Button
                  type="button"
                  variant="teal"
                  disabled={isVerifying}
                  onClick={handleVerify}
                  className="w-full sm:w-auto font-semibold shadow-md gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  {isVerifying ? 'Verifying...' : 'Verify Medication Photo'}
                </Button>
              )}

              {result && (
                <Button
                  type="button"
                  variant="teal"
                  onClick={onClose}
                  className="w-full sm:w-auto font-semibold shadow-md cursor-pointer"
                >
                  Done
                </Button>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 pt-1">
            <AlertCircle className="w-3 h-3 text-slate-400" />
            Verified securely through intelligent medication photo analysis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
