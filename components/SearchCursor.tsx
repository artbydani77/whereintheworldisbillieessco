"use client";
import { useMotionValue, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface SearchCursorProps {
  active: boolean;
  shaking: boolean;
}

export default function SearchCursor({ active, shaking }: SearchCursorProps) {
  // Direct motion values — no spring, perfectly 1:1 with mouse
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const [clicking, setClicking] = useState(false);
  // Track shake offset separately so it never touches x/y
  const [shakeOffset, setShakeOffset] = useState(0);
  const shakeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onDown = () => setClicking(true);
    const onUp   = () => setClicking(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup",   onUp,   { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
    };
  }, [x, y]);

  // Shake: animate a CSS translate offset on the inner div, not the position
  useEffect(() => {
    if (!shaking) { setShakeOffset(0); return; }
    const frames = [0, -8, 8, -6, 6, -3, 3, 0];
    let i = 0;
    const tick = () => {
      setShakeOffset(frames[i] ?? 0);
      i++;
      if (i < frames.length) {
        shakeRef.current = setTimeout(tick, 45);
      } else {
        setShakeOffset(0);
      }
    };
    tick();
    return () => { if (shakeRef.current) clearTimeout(shakeRef.current); };
  }, [shaking]);

  if (!active) return null;

  return (
    <motion.div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        x,
        y,
        translateX: "-50%",
        translateY: "-50%",
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      {/* Shake wrapper — offset only, never moves the tracked position */}
      <div style={{ transform: `translateX(${shakeOffset}px)` }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "2.5px solid #FF3A00",
            background: clicking ? "rgba(255,58,0,0.18)" : "rgba(255,58,0,0.06)",
            boxShadow: "0 0 0 1px rgba(255,58,0,0.25)",
            transform: clicking ? "scale(0.78)" : "scale(1)",
            transition: "transform 0.08s ease, background 0.08s ease",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Centre dot */}
          <div style={{
            width: 4, height: 4, borderRadius: "50%",
            background: "#FF3A00", opacity: 0.9,
          }} />
          {/* Crosshair arms */}
          {[
            { left: -9, top: "50%", width: 7, height: 1, transform: "translateY(-50%)" },
            { right: -9, top: "50%", width: 7, height: 1, transform: "translateY(-50%)" },
            { top: -9, left: "50%", width: 1, height: 7, transform: "translateX(-50%)" },
            { bottom: -9, left: "50%", width: 1, height: 7, transform: "translateX(-50%)" },
          ].map((s, i) => (
            <div key={i} style={{
              position: "absolute",
              background: "#FF3A00",
              opacity: 0.55,
              ...s,
            } as React.CSSProperties} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
