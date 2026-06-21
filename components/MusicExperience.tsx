"use client";
import { motion } from "framer-motion";
import AudioPlayer from "./AudioPlayer";
import PaintParticles from "./PaintParticles";

interface MusicExperienceProps {
  audioSrc: string;
}

// Static splatters painted onto background
const SPLATTERS = [
  { x: "8%", y: "12%", size: 120, color: "#FF3A00", opacity: 0.18, rotate: 23 },
  { x: "88%", y: "8%", size: 90, color: "#FFD700", opacity: 0.22, rotate: -15 },
  { x: "5%", y: "75%", size: 150, color: "#1a6418", opacity: 0.15, rotate: 45 },
  { x: "92%", y: "82%", size: 110, color: "#0047AB", opacity: 0.16, rotate: -30 },
  { x: "50%", y: "5%", size: 70, color: "#FF69B4", opacity: 0.2, rotate: 10 },
  { x: "15%", y: "45%", size: 60, color: "#FFD700", opacity: 0.15, rotate: 60 },
  { x: "80%", y: "50%", size: 80, color: "#FF3A00", opacity: 0.12, rotate: -45 },
];

const INK_DRIPS = [
  { x: "20%", height: 80, color: "#FF3A00", delay: 0.2 },
  { x: "45%", height: 60, color: "#FFD700", delay: 0.5 },
  { x: "70%", height: 100, color: "#1a6418", delay: 0.3 },
  { x: "85%", height: 50, color: "#0047AB", delay: 0.7 },
];

export default function MusicExperience({ audioSrc }: MusicExperienceProps) {
  return (
    <div style={{
      position: "relative",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      background: "linear-gradient(160deg, #fff9f0 0%, #ffefd0 35%, #fff3e0 65%, #ffe8c0 100%)",
    }}>
      {/* Paper grain base */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
        opacity: 0.8,
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Static paint splatters */}
      {SPLATTERS.map((s, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: s.opacity }}
          transition={{ delay: 0.3 + i * 0.12, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            transform: `rotate(${s.rotate}deg)`,
            transformOrigin: "center",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <SplatShape color={s.color} size={s.size} />
        </motion.div>
      ))}

      {/* Ink drips from top */}
      {INK_DRIPS.map((d, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 1.2 + d.delay, duration: 0.8, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: 0,
            left: d.x,
            width: "6px",
            height: `${d.height}px`,
            background: `linear-gradient(180deg, ${d.color} 0%, transparent 100%)`,
            transformOrigin: "top",
            borderRadius: "0 0 4px 4px",
            opacity: 0.4,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Floating particles */}
      <PaintParticles />

      {/* Main content */}
      <div style={{
        position: "relative",
        zIndex: 3,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}>
        {/* Cafe-inspired logo mark */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: "32px", textAlign: "center" }}
        >
          <div style={{
            display: "inline-flex",
            alignItems: "baseline",
            gap: "2px",
            padding: "6px 18px",
            border: "3px solid #1a0a00",
            background: "rgba(255,249,240,0.8)",
            boxShadow: "4px 4px 0 #1a0a00",
            borderRadius: "2px",
          }}>
            <span style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 900, color: "#e63c00", lineHeight: 1 }}>C</span>
            <span style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(22px, 5vw, 34px)", fontWeight: 900, color: "#c8a800", lineHeight: 1 }}>a</span>
            <span style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(24px, 5.5vw, 38px)", fontWeight: 900, color: "#1a6418", lineHeight: 1 }}>f</span>
            <span style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(22px, 5vw, 34px)", fontWeight: 900, color: "#0047AB", lineHeight: 1 }}>e</span>
            <span style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 900, color: "#1a0a00", lineHeight: 1 }}>.</span>
          </div>
        </motion.div>

        {/* Player card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: "linear-gradient(160deg, #1a0a00 0%, #0f0500 100%)",
            border: "3px solid #1a0a00",
            borderRadius: "4px",
            padding: "clamp(24px, 5vw, 40px)",
            width: "100%",
            maxWidth: "520px",
            boxShadow: "6px 6px 0 #FF3A00, -2px -2px 0 #FFD700, 0 20px 60px rgba(0,0,0,0.4)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Corner decorations */}
          <div style={{ position: "absolute", top: 8, left: 12, color: "#FF3A00", fontSize: "20px", opacity: 0.4 }}>◆</div>
          <div style={{ position: "absolute", top: 8, right: 12, color: "#FFD700", fontSize: "20px", opacity: 0.4 }}>◆</div>
          <div style={{ position: "absolute", bottom: 8, left: 12, color: "#1a6418", fontSize: "20px", opacity: 0.4 }}>◆</div>
          <div style={{ position: "absolute", bottom: 8, right: 12, color: "#0047AB", fontSize: "20px", opacity: 0.4 }}>◆</div>

          {/* Inner texture */}
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(ellipse at 30% 20%, rgba(255,58,0,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(255,215,0,0.04) 0%, transparent 50%)",
            pointerEvents: "none",
          }} />

          <AudioPlayer src={audioSrc} />
        </motion.div>

        {/* Bottom badge */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: "11px",
            letterSpacing: "0.25em",
            color: "rgba(26,10,0,0.35)",
            textTransform: "uppercase",
            marginTop: "24px",
          }}
        >
          PLACEHOLDER × PLACEHOLDER
        </motion.p>
      </div>
    </div>
  );
}

function SplatShape({ color, size }: { color: string; size: number }) {
  // SVG paint splatter shape
  const s = size;
  const arms = 8 + Math.floor(size / 30);
  const points = [];
  for (let i = 0; i < arms; i++) {
    const angle = (i / arms) * Math.PI * 2;
    const outer = (0.35 + Math.sin(i * 3.7) * 0.15 + Math.cos(i * 2.3) * 0.1) * s;
    const inner = outer * (0.3 + Math.cos(i * 5.1) * 0.15);
    const ox = s/2 + Math.cos(angle) * outer;
    const oy = s/2 + Math.sin(angle) * outer;
    const ia = angle + Math.PI / arms;
    const ix = s/2 + Math.cos(ia) * inner;
    const iy = s/2 + Math.sin(ia) * inner;
    points.push(`${ox},${oy}`);
    points.push(`${ix},${iy}`);
  }
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      <polygon points={points.join(" ")} fill={color} />
      {/* Satellite drops */}
      <circle cx={s * 0.2} cy={s * 0.15} r={s * 0.05} fill={color} />
      <circle cx={s * 0.82} cy={s * 0.75} r={s * 0.04} fill={color} />
      <circle cx={s * 0.7} cy={s * 0.1} r={s * 0.035} fill={color} />
    </svg>
  );
}
