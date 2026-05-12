import { useState, useRef, useCallback, useEffect } from "react";
import { Music, Square, ExternalLink, X, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PlaylistLink {
  name: string;
  url: string;
}

interface WorkoutMusicProps {
  builtInBeatsEnabled?: boolean;
  customPlaylists?: PlaylistLink[];
}

// Simple 128 BPM beat generator using Web Audio API
class BeatEngine {
  private ctx: AudioContext | null = null;
  private intervalId: number | null = null;
  private gainNode: GainNode | null = null;
  private _playing = false;
  private beatIndex = 0;

  get playing() { return this._playing; }

  private createCtx() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
      this.gainNode.gain.value = 0.5;
    }
  }

  setVolume(v: number) {
    if (this.gainNode) this.gainNode.gain.value = v;
  }

  private playSound(freq: number, duration: number, type: OscillatorType = "sine") {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(env);
    env.connect(this.gainNode);
    env.gain.setValueAtTime(0.6, this.ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private playKick() {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);
    osc.connect(env);
    env.connect(this.gainNode);
    env.gain.setValueAtTime(0.8, this.ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  private playSnare() {
    if (!this.ctx || !this.gainNode) return;
    // Noise burst for snare
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const env = this.ctx.createGain();
    noise.connect(env);
    env.connect(this.gainNode);
    env.gain.setValueAtTime(0.5, this.ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    noise.start();
    noise.stop(this.ctx.currentTime + 0.1);
  }

  private playHihat() {
    this.playSound(8000, 0.05, "square");
  }

  private tick() {
    // 128 BPM = beat every ~469ms, 8th notes at ~234ms
    // Pattern per beat (4 steps per beat, 16 steps per bar):
    // Kick on 0, 4, 8, 12 (every beat)
    // Snare on 4, 12 (beat 2 and 4)
    // Hihat on every step
    const step = this.beatIndex % 16;
    
    // Hihat on every other step
    if (step % 2 === 0) this.playHihat();
    
    // Kick on beat 1 and 3
    if (step === 0 || step === 8) this.playKick();
    
    // Snare on beat 2 and 4
    if (step === 4 || step === 12) this.playSnare();
    
    this.beatIndex++;
  }

  start() {
    this.createCtx();
    if (this.ctx?.state === "suspended") this.ctx.resume();
    this._playing = true;
    this.beatIndex = 0;
    // 128 BPM, 16th notes: 60/128/4 * 1000 ≈ 117ms
    this.intervalId = window.setInterval(() => this.tick(), 117);
  }

  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this._playing = false;
    this.beatIndex = 0;
  }

  destroy() {
    this.stop();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Animated equalizer bars
function EqBars() {
  return (
    <div className="flex items-end gap-[2px] h-3">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-[3px] bg-primary rounded-full"
          animate={{ height: ["4px", "12px", "6px", "12px", "4px"] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

const defaultPlaylists: PlaylistLink[] = [
  { name: "YouTube Workout Mix", url: "https://www.youtube.com/results?search_query=best+workout+music+mix+no+copyright+hindi+english+2025" },
  { name: "Spotify Beast Mode", url: "https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP" },
  { name: "YouTube Music Mix", url: "https://music.youtube.com/search?q=workout+music+mix+hindi+english" },
];

export default function WorkoutMusic({
  builtInBeatsEnabled = true,
  customPlaylists = [],
}: WorkoutMusicProps) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // 0-1
  const beatRef = useRef<BeatEngine | null>(null);

  useEffect(() => {
    return () => {
      beatRef.current?.destroy();
    };
  }, []);

  const toggleBeats = useCallback(() => {
    if (!beatRef.current) beatRef.current = new BeatEngine();
    if (playing) {
      beatRef.current.stop();
      setPlaying(false);
    } else {
      beatRef.current.setVolume(volume);
      beatRef.current.start();
      setPlaying(true);
    }
    setOpen(false);
  }, [playing, volume]);

  const stopBeats = useCallback(() => {
    beatRef.current?.stop();
    setPlaying(false);
    setOpen(false);
  }, []);

  const handleVolume = useCallback((v: number) => {
    setVolume(v);
    beatRef.current?.setVolume(v);
  }, []);

  const allPlaylists = [...defaultPlaylists, ...customPlaylists];

  return (
    <div className="relative">
      {/* Music Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className={`glass-card rounded-2xl p-3 flex items-center justify-center transition-colors duration-300 ${
          playing ? "ring-2 ring-primary" : ""
        }`}
        animate={playing ? { scale: [1, 1.05, 1] } : {}}
        transition={playing ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
        style={{ width: 48, height: 48 }}
      >
        {playing ? <EqBars /> : <Music className="w-5 h-5 text-primary" />}
      </motion.button>

      {/* Popup Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            className="absolute right-0 top-14 z-50 w-64 glass-card rounded-xl p-3 space-y-1 shadow-xl"
          >
            {/* Stop option when playing */}
            {playing && (
              <button
                onClick={stopBeats}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <Square className="w-4 h-4" />
                Stop Music
              </button>
            )}

            {/* Built-in beats */}
            {builtInBeatsEnabled && !playing && (
              <button
                onClick={toggleBeats}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary/60 transition-colors"
              >
                <Music className="w-4 h-4 text-primary" />
                <div className="text-left">
                  <p>Workout Beats</p>
                  <p className="text-[10px] text-muted-foreground">Built-in · No internet needed</p>
                </div>
              </button>
            )}

            {/* Volume when playing */}
            {playing && (
              <div className="flex items-center gap-2 px-3 py-2">
                <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={e => handleVolume(Number(e.target.value))}
                  className="flex-1 h-1 accent-primary bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border/50 my-1" />

            {/* External playlists */}
            {allPlaylists.map((pl, i) => (
              <a
                key={i}
                href={pl.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-secondary/60 transition-colors"
                onClick={() => setOpen(false)}
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                {pl.name}
              </a>
            ))}

            {/* Close */}
            <div className="border-t border-border/50 my-1" />
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/60 transition-colors"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
