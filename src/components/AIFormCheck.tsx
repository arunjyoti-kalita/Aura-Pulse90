import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Camera, Volume2, VolumeX, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playClick } from "@/lib/audio";

// --- Safety check for pose detection library ---
const getDetector = async () => {
  const pd = (window as any).poseDetection;
  if (!pd) throw new Error("AI Library not loaded");
  
  const modelType = pd.movenet?.modelType?.SINGLEPOSE_LIGHTNING || 'SinglePose.Lightning';
  
  return await pd.createDetector(pd.SupportedModels.MoveNet, {
    modelType: modelType
  });
};

function getAngle(a: any, b: any, c: any) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const cross = ab.x * cb.y - ab.y * cb.x;
  return Math.abs(Math.atan2(cross, dot) * (180 / Math.PI));
}

const CONFIGS: Record<string, any> = {
  'push': {
    detect: (kps: any[], prev: any) => {
      const s = kps[5]?.score > 0.3 ? kps[5] : kps[6];
      const e = kps[7]?.score > 0.3 ? kps[7] : kps[8];
      const w = kps[9]?.score > 0.3 ? kps[9] : kps[10];
      if (!s || !e || !w) return { rep: false, msg: 'Step Back' };
      const angle = getAngle(s, e, w);
      const isDown = angle < 110;
      const isUp = angle > 150;
      return { rep: (prev?.wasDown && isUp), msg: isDown ? 'Deep!' : 'Push!', state: { wasDown: isDown || (prev?.wasDown && !isUp) } };
    }
  },
  'squat': {
    detect: (kps: any[], prev: any) => {
      // Prioritize higher score hip/knee/ankle
      const h = kps[11].score > kps[12].score ? kps[11] : kps[12];
      const k = kps[13].score > kps[14].score ? kps[13] : kps[14];
      const a = kps[15].score > kps[16].score ? kps[15] : kps[16];
      
      if (h.score < 0.2 || k.score < 0.2 || a.score < 0.2) return { rep: false, msg: 'Legs Not Visible' };
      
      const angle = getAngle(h, k, a);
      // Relaxed thresholds for mobile camera angles
      const isDown = angle < 135; 
      const isUp = angle > 155;
      
      return { 
        rep: (prev?.wasDown && isUp), 
        msg: isDown ? 'Great Depth!' : 'Squat!', 
        state: { wasDown: isDown || (prev?.wasDown && !isUp) } 
      };
    }
  }
};

const speak = (text: string) => {
  if (!window.speechSynthesis) return;
  // Cancel previous speech to avoid overlapping
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.2;
  utterance.pitch = 0.9; // Lower pitch for a more "technical/AI" feel
  window.speechSynthesis.speak(utterance);
};

export default function AIFormCheck({ exerciseName, targetSets, targetReps, onClose, onComplete, voiceEnabled = true }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<any>(null);
  const stateRef = useRef<any>({});
  const initStarted = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [reps, setReps] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [feedback, setFeedback] = useState('Ready');
  const [privacy, setPrivacy] = useState(() => localStorage.getItem('formcheck_privacy') === 'true');

  const tSets = parseInt(targetSets) || 3;
  const tReps = parseInt(targetReps) || 12;

  const handleClose = useCallback(() => {
    playClick();
    onClose();
  }, [onClose]);

  // Handle global UI state for sidebars/tubes
  useEffect(() => {
    document.documentElement.setAttribute('data-ai-form-check', 'active');
    return () => {
      document.documentElement.removeAttribute('data-ai-form-check');
    };
  }, []);

  useEffect(() => {
    if (!privacy || initStarted.current) return;
    initStarted.current = true;
    let active = true;
    let stream: MediaStream | null = null;

    const start = async () => {
      try {
        setStatus('Waking AI...');
        if (!(window as any).tf) {
          const s1 = document.createElement('script'); s1.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js';
          document.head.appendChild(s1);
          await new Promise(r => s1.onload = r);
          const s2 = document.createElement('script'); s2.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js';
          document.head.appendChild(s2);
          await new Promise(r => s2.onload = r);
        }

        if (!active) return;
        setStatus('Camera On...');
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        
        if (videoRef.current && active) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if (!active) return;
        setStatus('Readying AI...');
        detectorRef.current = await getDetector();
        
        if (active) setIsLoading(false);
        
        const loop = async () => {
          if (!active || !detectorRef.current || !videoRef.current || !canvasRef.current) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx && video.readyState >= 2) {
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            ctx.save(); ctx.scale(-1, 1); ctx.translate(-canvas.width, 0);
            ctx.drawImage(video, 0, 0);
            
            const poses = await detectorRef.current.estimatePoses(video);
            if (poses.length > 0 && poses[0].keypoints) {
              const kps = poses[0].keypoints;
              
              // Draw skeleton points
              ctx.fillStyle = '#00ff88';
              kps.forEach((k: any) => { 
                if (k.score > 0.4) {
                  ctx.beginPath();
                  ctx.arc(k.x, k.y, 4, 0, 2 * Math.PI);
                  ctx.fill();
                } 
              });
              
              const lowerEx = exerciseName.toLowerCase();
              const isPush = lowerEx.includes('push') || lowerEx.includes('press') || lowerEx.includes('chest');
              const isSquat = lowerEx.includes('squat') || lowerEx.includes('leg') || lowerEx.includes('lung');
              
              const type = isPush ? 'push' : isSquat ? 'squat' : null;
              const cfg = type ? CONFIGS[type] : null;
              
              if (cfg) {
                const res = cfg.detect(kps, stateRef.current);
                stateRef.current = res.state || stateRef.current;
                
                if (res.msg && res.msg !== feedback) {
                  setFeedback(res.msg);
                  if (voiceEnabled && res.rep) speak(res.msg);
                }

                if (res.rep) {
                  playClick();
                  setReps(r => {
                    const next = r + 1;
                    if (voiceEnabled) speak(next.toString());
                    if (next >= tReps) {
                      if (currentSet >= tSets) {
                        onComplete({ totalReps: 100, goodFormReps: 100, formScore: 100, commonIssue: 'None' }, tSets);
                      } else {
                        setCurrentSet(s => s + 1);
                        if (voiceEnabled) speak(`Set ${currentSet} complete. Prepare for set ${currentSet + 1}`);
                      }
                      return 0;
                    }
                    return next;
                  });
                }
              }
            }
            ctx.restore();
          }
          if (active) requestAnimationFrame(loop);
        };
        loop();
      } catch (e: any) {
        console.error(e);
        if (active) setError(e.message || 'Error');
      }
    };
    start();
    return () => {
      active = false; 
      if (stream) stream.getTracks().forEach(t => t.stop()); 
    };
  }, [privacy, exerciseName, currentSet, onComplete, tReps, tSets]);

  if (!privacy) return (
    <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center p-8 text-white text-center">
      <div className="space-y-6">
        <Camera className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-2xl font-black italic">AI COACH</h2>
        <p className="text-sm opacity-60">Ready to level up? Start training now.</p>
        <Button onClick={() => { setPrivacy(true); localStorage.setItem('formcheck_privacy', 'true'); }} className="w-full h-14 text-lg font-black uppercase tracking-widest">START SESSION</Button>
        <p onClick={handleClose} className="opacity-40 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:opacity-100 transition-opacity">CANCEL</p>
      </div>
    </div>
  );

  const content = (
    <div className="fixed inset-0 z-[99999] bg-black text-white flex flex-col font-sans overflow-hidden">
      {/* Absolute Header to avoid stacking issues */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-black/40 border-b border-white/5 z-[100000] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="font-black uppercase tracking-[0.2em] text-[10px] text-white/60">{exerciseName}</p>
        </div>
        <button 
          onClick={handleClose}
          className="p-3 bg-white/10 rounded-full hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center"
        >
          <X className="w-6 h-6 text-white" strokeWidth={3} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-zinc-950">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-60" playsInline muted autoPlay style={{ transform: 'scaleX(-1)' }} />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-10" style={{ transform: 'scaleX(-1)' }} />

        {isLoading && !error && (
          <div className="absolute inset-0 bg-black z-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">{status}</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-red-950/20 backdrop-blur-xl z-30 flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="font-black mb-2 tracking-widest uppercase">Telemetry Error</p>
            <p className="text-[10px] opacity-60 mb-8 max-w-xs">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full bg-white text-black font-black h-14 uppercase tracking-widest">REBOOT SYSTEM</Button>
            <p onClick={handleClose} className="mt-6 opacity-40 text-[10px] font-black uppercase tracking-widest cursor-pointer">Back to Workout</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none z-20">
            <div className="text-center mt-24">
              <h1 className="text-[12rem] font-black leading-none text-primary drop-shadow-[0_0_30px_rgba(34,255,136,0.3)] tabular-nums">{reps}</h1>
              <p className="text-[10px] font-black opacity-40 tracking-[0.3em] uppercase mt-2">Set {currentSet} OF {tSets}</p>
            </div>
            
            <div className="space-y-3 pointer-events-auto max-w-xs mx-auto w-full pb-8">
              <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl text-center font-black border border-white/10 italic text-xl uppercase tracking-tight text-primary">
                {feedback}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setReps(r => r + 1)} 
                  className="py-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-xl font-black text-[9px] active:scale-95 transition-all uppercase border border-white/5"
                >
                  Manual +1
                </button>
                <button 
                  onClick={() => {
                    if (currentSet >= tSets) onComplete({ totalReps: 100, goodFormReps: 100, formScore: 100, commonIssue: 'None' }, tSets);
                    else {
                      setCurrentSet(s => s + 1);
                      setReps(0);
                    }
                  }} 
                  className="py-4 bg-primary text-black rounded-xl font-black text-[9px] active:scale-95 transition-all uppercase shadow-lg shadow-primary/20"
                >
                  {currentSet >= tSets ? 'Finish' : 'Next Set'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
