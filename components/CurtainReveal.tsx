"use client";
import { motion, AnimatePresence } from "framer-motion";

interface CurtainRevealProps {
  phase: "search" | "revealing" | "revealed";
  children: React.ReactNode;      // music experience
  searchContent: React.ReactNode; // waldo scene
}

export default function CurtainReveal({ phase, children, searchContent }: CurtainRevealProps) {
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>

      {/* ── 1. Search scene — visible during search + briefly during revealing ── */}
      <AnimatePresence>
        {(phase === "search" || phase === "revealing") && (
          <motion.div
            key="search-scene"
            style={{ position: "absolute", inset: 0, zIndex: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2, delay: 1.6 } }}
          >
            {searchContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2. Music experience — mounts when revealed ── */}
      <AnimatePresence>
        {phase === "revealed" && (
          <motion.div
            key="music"
            style={{ position: "absolute", inset: 0, zIndex: 1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeIn" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. White flash on find ── */}
      <AnimatePresence>
        {phase === "revealing" && (
          <motion.div
            key="flash"
            style={{
              position: "absolute", inset: 0,
              background: "white",
              zIndex: 5,
              pointerEvents: "none",
            }}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* ── 4. Curtain panels — only present during "revealing" ── */}
      {/*    They slide IN from off-screen, pause closed, then EXIT outward */}
      <AnimatePresence>
        {phase === "revealing" && (
          <>
            {/* Left curtain */}
            <motion.div
              key="curtain-left"
              style={{
                position: "absolute",
                top: 0, left: 0,
                width: "50%", height: "100%",
                zIndex: 10,
                background: "linear-gradient(180deg, #8B0000 0%, #5a0000 45%, #3d0000 100%)",
                boxShadow: "inset -20px 0 40px rgba(0,0,0,0.6)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                enter: { duration: 0.75, ease: [0.76, 0, 0.24, 1] },
                exit:  { duration: 1.0,  ease: [0.76, 0, 0.24, 1] },
                duration: 0.75,
                ease: [0.76, 0, 0.24, 1],
              }}
            >
              <CurtainFabricTexture side="left" />
            </motion.div>

            {/* Right curtain */}
            <motion.div
              key="curtain-right"
              style={{
                position: "absolute",
                top: 0, right: 0,
                width: "50%", height: "100%",
                zIndex: 10,
                background: "linear-gradient(180deg, #8B0000 0%, #5a0000 45%, #3d0000 100%)",
                boxShadow: "inset 20px 0 40px rgba(0,0,0,0.6)",
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                duration: 0.75,
                ease: [0.76, 0, 0.24, 1],
              }}
            >
              <CurtainFabricTexture side="right" />
            </motion.div>

            {/* Gold seam where curtains meet */}
            <motion.div
              key="curtain-seam"
              style={{
                position: "absolute",
                top: 0, left: "50%",
                width: "3px", height: "100%",
                background: "linear-gradient(180deg, #D4AF37 0%, #8B6914 50%, #D4AF37 100%)",
                zIndex: 11,
                transform: "translateX(-50%)",
                pointerEvents: "none",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function CurtainFabricTexture({ side }: { side: "left" | "right" }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Vertical fabric folds */}
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            width: "2px",
            left: `${(i + 1) * (100 / 8)}%`,
            background: `linear-gradient(180deg,
              transparent 0%,
              rgba(0,0,0,0.25) 25%,
              rgba(255,255,255,0.06) 50%,
              rgba(0,0,0,0.35) 75%,
              transparent 100%
            )`,
            opacity: 0.8,
          }}
        />
      ))}
      {/* Edge sheen */}
      <div style={{
        position: "absolute", inset: 0,
        background: side === "left"
          ? "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 50%)"
          : "linear-gradient(-90deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
      }} />
      {/* Top shadow */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "100px",
        background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%)",
      }} />
      {/* Bottom puddle */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "70px",
        background: "linear-gradient(0deg, rgba(0,0,0,0.45) 0%, transparent 100%)",
      }} />
      {/* Gold top trim */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "7px",
        background: "linear-gradient(90deg, #8B6914 0%, #D4AF37 40%, #F5D060 60%, #8B6914 100%)",
      }} />
    </div>
  );
}
