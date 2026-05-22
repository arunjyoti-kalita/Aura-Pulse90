import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Play, Square, History, TrendingUp, Footprints, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadState, saveState, genId } from "@/lib/store";
import { toast } from "sonner";

export default function OutdoorPage() {
  const [state, setState] = useState(() => loadState());
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [lastPos, setLastPos] = useState<GeolocationPosition | null>(null);

  const startTracking = () => {
    if (!navigator.geolocation) return toast.error("GPS not supported");
    setIsTracking(true);
    setStartTime(Date.now());
    setDistance(0);
    setDuration(0);
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        if (lastPos) {
          const d = calcDist(lastPos.coords.latitude, lastPos.coords.longitude, pos.coords.latitude, pos.coords.longitude);
          if (d > 0.005) setDistance(prev => prev + d);
        }
        setLastPos(pos);
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    if (distance > 0.1) {
      const s = loadState();
      s.outdoorLogs.push({ id: genId(), date: new Date().toISOString(), distance, duration, type: 'walk' });
      s.xp = (s.xp || 0) + Math.floor(distance * 10);
      saveState(s);
      setState(s);
      toast.success(`Logged ${distance.toFixed(2)}km`);
    }
    setIsTracking(false);
    setWatchId(null);
    setStartTime(null);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && startTime) {
      interval = setInterval(() => setDuration(Math.floor((Date.now() - startTime) / 1000)), 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const calcDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto relative z-10">
      {/* Technical Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black italic text-white tracking-tight leading-none uppercase">Telemetry</h1>
          <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em] mt-1">Spatial & Kinetic Tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-primary animate-pulse' : 'bg-white/10'}`} />
          <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">{isTracking ? 'Active' : 'Standby'}</p>
        </div>
      </div>

      {/* Main Tracking Block - Side by Side */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {/* GPS Tracker */}
        <div className="glass-card-premium p-3 border-white/5 flex flex-col justify-between h-32">
          <div className="flex items-center gap-1.5 mb-2">
            <Navigation className="w-3 h-3 text-primary" />
            <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">GPS Distance</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-3xl font-black text-white leading-none tabular-nums">{distance.toFixed(2)}</p>
            <p className="text-[12px] font-black text-primary">KM</p>
          </div>
          {!isTracking ? (
            <Button onClick={startTracking} className="h-7 w-full text-[11px] font-black uppercase tracking-widest bg-primary/10 border-primary/20 hover:bg-primary/20">START</Button>
          ) : (
            <Button onClick={stopTracking} variant="destructive" className="h-7 w-full text-[11px] font-black uppercase tracking-widest">STOP</Button>
          )}
        </div>

        {/* Step Counter */}
        <div className="glass-card-premium p-3 border-white/5 flex flex-col justify-between h-32">
          <div className="flex items-center gap-1.5 mb-2">
            <Footprints className="w-3 h-3 text-cyan-400" />
            <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Pedometry</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-3xl font-black text-white leading-none tabular-nums">{(state.steps || 0).toLocaleString()}</p>
            <p className="text-[12px] font-black text-cyan-400">STEPS</p>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, (state.steps || 0) / state.settings.dailyStepGoal * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { label: 'Time', value: `${Math.floor(duration/60)}:${(duration%60).toString().padStart(2,'0')}`, unit: 'MIN', color: 'white/40' },
          { label: 'Pace', value: distance > 0 ? (duration / 60 / distance).toFixed(1) : '0.0', unit: 'M/K', color: 'white/40' },
          { label: 'XP', value: Math.floor(distance * 10), unit: 'Earned', color: 'primary' },
        ].map((s, i) => (
          <div key={i} className="glass-card-premium p-2 border-white/5 text-center">
            <p className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-[14px] font-black text-${s.color}`}>{s.value}</p>
            <p className="text-[11px] font-bold text-white/20 uppercase">{s.unit}</p>
          </div>
        ))}
      </div>

      {/* History - 2 Column Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History className="w-3 h-3 text-white/30" />
          <p className="text-[11px] font-black text-white/45 uppercase tracking-[0.2em]">Log History</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(state.outdoorLogs || []).slice().reverse().slice(0, 4).map(log => (
            <div key={log.id} className="glass-card-premium p-2 border-white/5 bg-white/5 flex flex-col justify-between h-16">
              <p className="text-[11px] font-black text-white/30 uppercase">{new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-sm font-black text-white">{log.distance.toFixed(1)}</p>
                <p className="text-[11px] font-bold text-primary">KM</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-start gap-2 glass-card-premium p-3 border-white/5 bg-white/5">
        <Info className="w-3 h-3 text-white/20 mt-0.5" />
        <p className="text-[11px] font-medium text-white/40 leading-relaxed italic">
          GPS precision varies by hardware. Maintain clear line-of-sight to the sky for optimal telemetry accuracy.
        </p>
      </div>
    </div>
  );
}
