"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface AudioPlayerProps {
  src: string;
}

function formatTime(s: number): string {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef    = useRef<HTMLAudioElement>(null);
  const draggingRef = useRef(false);
  const [playing, setPlaying]         = useState(false);
  const [duration, setDuration]       = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume]           = useState(0.85);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onMeta  = () => setDuration(audio.duration);
    const onTime  = () => { if (!draggingRef.current) setCurrentTime(audio.currentTime); };
    const onEnded = () => setPlaying(false);
    const onPause = () => setPlaying(false);
    const onPlay  = () => setPlaying(true);

    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("timeupdate",     onTime);
    audio.addEventListener("ended",          onEnded);
    audio.addEventListener("pause",          onPause);
    audio.addEventListener("play",           onPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("timeupdate",     onTime);
      audio.removeEventListener("ended",          onEnded);
      audio.removeEventListener("pause",          onPause);
      audio.removeEventListener("play",           onPlay);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); togglePlay(); }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) audioRef.current.currentTime = val;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{ width: "100%", maxWidth: "520px", margin: "0 auto" }}>
      <audio ref={audioRef} src={src} preload="auto" />

      {/* Track label */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <p style={{
          fontFamily: "'Georgia', serif",
          fontSize: "10px",
          letterSpacing: "0.4em",
          color: "rgba(255,249,240,0.5)",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}>
          ✦ PLACEHOLDER TEXT ✦
        </p>
        <h2 style={{
          fontFamily: "'Georgia', serif",
          fontSize: "clamp(18px, 4vw, 28px)",
          fontWeight: 900,
          color: "#fff9f0",
          letterSpacing: "-0.01em",
          lineHeight: 1.2,
          margin: 0,
        }}>
          PLACEHOLDER TITLE
        </h2>
        <div style={{ width: "40px", height: "2px", background: "#FF3A00", margin: "12px auto 0" }} />
      </div>

      {/* Vinyl disc */}
      <motion.div
        animate={{ rotate: playing ? 360 : 0 }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
        style={{
          width: "120px", height: "120px",
          margin: "0 auto 28px",
          borderRadius: "50%",
          background: "conic-gradient(from 0deg, #1a0a00 0%, #3d1f00 12.5%, #1a0a00 25%, #2a1200 37.5%, #1a0a00 50%, #3d1f00 62.5%, #1a0a00 75%, #2a1200 87.5%, #1a0a00 100%)",
          border: "3px solid rgba(255,249,240,0.1)",
          boxShadow: "0 0 0 8px rgba(26,10,0,0.5), 0 0 30px rgba(255,58,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}
      >
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          background: "linear-gradient(135deg, #FF3A00, #e63c00)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 12px rgba(255,58,0,0.5)",
        }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1a0a00" }} />
        </div>
        {[50, 60, 70, 80].map(r => (
          <div key={r} style={{
            position: "absolute", width: `${r}%`, height: `${r}%`,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)",
          }} />
        ))}
      </motion.div>

      {/* Play/pause */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
        <motion.button
          onClick={togglePlay}
          onKeyDown={handleKeyDown}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.93 }}
          aria-label={playing ? "Pause" : "Play"}
          style={{
            width: "64px", height: "64px", borderRadius: "50%",
            background: "#FF3A00", border: "3px solid #fff9f0",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 0 0 4px rgba(255,58,0,0.2), 4px 4px 0 rgba(0,0,0,0.4)",
          }}
        >
          {playing ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="2" width="5" height="16" rx="1" fill="#fff9f0" />
              <rect x="12" y="2" width="5" height="16" rx="1" fill="#fff9f0" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <polygon points="4,2 18,10 4,18" fill="#fff9f0" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: "8px" }}>
        <div style={{ position: "relative", height: "20px", display: "flex", alignItems: "center" }}>
          <div style={{
            position: "absolute", left: 0, right: 0, height: "4px",
            background: "rgba(255,249,240,0.12)", borderRadius: "2px",
          }} />
          <div style={{
            position: "absolute", left: 0, width: `${progress}%`, height: "4px",
            background: "linear-gradient(90deg, #FF3A00, #FF6B2B)", borderRadius: "2px",
          }} />
          <input
            type="range"
            min={0} max={duration || 100} step={0.1} value={currentTime}
            onChange={handleSeek}
            onMouseDown={() => { draggingRef.current = true; }}
            onMouseUp={() => { draggingRef.current = false; }}
            onTouchStart={() => { draggingRef.current = true; }}
            onTouchEnd={() => { draggingRef.current = false; }}
            aria-label="Seek"
            style={{ position: "absolute", left: 0, width: "100%", height: "20px", opacity: 0, cursor: "pointer" }}
          />
        </div>
      </div>

      {/* Times */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "rgba(255,249,240,0.5)" }}>
          {formatTime(currentTime)}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "rgba(255,249,240,0.35)" }}>
          {formatTime(duration)}
        </span>
      </div>

      {/* Volume */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
          <polygon points="1,5 5,5 9,2 9,14 5,11 1,11" fill="#fff9f0" />
          {volume > 0.3 && <path d="M11 5.5 C12.5 6.5 12.5 9.5 11 10.5" stroke="#fff9f0" strokeWidth="1.5" strokeLinecap="round" />}
          {volume > 0.6 && <path d="M12.5 3.5 C15 5 15 11 12.5 12.5" stroke="#fff9f0" strokeWidth="1.5" strokeLinecap="round" />}
        </svg>
        <div style={{ position: "relative", flex: 1, height: "20px", display: "flex", alignItems: "center" }}>
          <div style={{
            position: "absolute", left: 0, right: 0, height: "3px",
            background: "rgba(255,249,240,0.12)", borderRadius: "2px",
          }} />
          <div style={{
            position: "absolute", left: 0, width: `${volume * 100}%`, height: "3px",
            background: "rgba(255,249,240,0.4)", borderRadius: "2px",
          }} />
          <input
            type="range"
            min={0} max={1} step={0.01} value={volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            aria-label="Volume"
            style={{ position: "absolute", left: 0, width: "100%", opacity: 0, height: "20px", cursor: "pointer" }}
          />
        </div>
      </div>
    </div>
  );
}
