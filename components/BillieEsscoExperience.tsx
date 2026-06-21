"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IntroOverlay from "./IntroOverlay";
import SearchCursor from "./SearchCursor";
import CurtainReveal from "./CurtainReveal";
import MusicExperience from "./MusicExperience";

// ─── ASSET CONFIGURATION ──────────────────────────────────────────────────────
// Replace these with your actual asset paths or URLs.
// Place files in /public and reference as "/filename.png" and "/filename.wav"
// OR use direct URLs as below.

const WALDO_IMAGE_URL =
  "https://www.dropbox.com/scl/fi/z4cs5m6bhxa1v5l45cskx/witwibe.png?rlkey=pzxld8k0eeaah6w055u3ca3ki&st=f5bu3oa0&dl=1";

const AUDIO_URL = "/track.mp3";

// ─── CHARACTER LOCATION (original image coordinates) ──────────────────────────
const CHAR_X = 1140;   // center x in original image
const CHAR_Y = 359;    // center y in original image
const HIT_RADIUS = 45; // hit radius in original image pixels

// ─── NATURAL IMAGE DIMENSIONS (set after load) ────────────────────────────────
// These will be filled by the onLoad handler; defaults are placeholders only.
const DEFAULT_NATURAL_W = 2000;
const DEFAULT_NATURAL_H = 1200;

type Phase = "search" | "revealing" | "revealed";

export default function BillieEsscoExperience() {
  const [showIntro, setShowIntro] = useState(true);
  const [phase, setPhase] = useState<Phase>("search");
  const [shaking, setShaking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const naturalW = useRef(DEFAULT_NATURAL_W);
  const naturalH = useRef(DEFAULT_NATURAL_H);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // ─── Coordinate scaling ─────────────────────────────────────────────────────
  // The image uses object-fit: contain inside the viewport.
  // We compute the rendered image rect to convert click coords correctly.
  const getRenderedImageRect = useCallback(() => {
    const img = imgRef.current;
    if (!img) return null;

    const vW = window.innerWidth;
    const vH = window.innerHeight;
    const iW = naturalW.current;
    const iH = naturalH.current;

    const scale = Math.min(vW / iW, vH / iH);
    const renderedW = iW * scale;
    const renderedH = iH * scale;
    const offsetX = (vW - renderedW) / 2;
    const offsetY = (vH - renderedH) / 2;

    return { offsetX, offsetY, renderedW, renderedH, scale };
  }, []);

  const checkHit = useCallback((clientX: number, clientY: number): boolean => {
    const rect = getRenderedImageRect();
    if (!rect) return false;

    // Convert click from viewport coords to original image coords
    const imgX = (clientX - rect.offsetX) / rect.scale;
    const imgY = (clientY - rect.offsetY) / rect.scale;

    const dx = imgX - CHAR_X;
    const dy = imgY - CHAR_Y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    return dist <= HIT_RADIUS;
  }, [getRenderedImageRect]);

  const handleClick = useCallback((clientX: number, clientY: number) => {
    if (phase !== "search" || showIntro) return;

    if (checkHit(clientX, clientY)) {
      setPhase("revealing");
      // curtains slide in (0.8s) then open (1.0s) = ~2.0s total; give a little buffer
      setTimeout(() => setPhase("revealed"), 2200);
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }, [phase, showIntro, checkHit]);

  const handleMouseClick = useCallback((e: React.MouseEvent) => {
    handleClick(e.clientX, e.clientY);
  }, [handleClick]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (touch) handleClick(touch.clientX, touch.clientY);
  }, [handleClick]);

  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (img) {
      naturalW.current = img.naturalWidth;
      naturalH.current = img.naturalHeight;
    }
  }, []);

  const searchScene = (
    <div
      ref={containerRef}
      className={phase === "search" && !showIntro ? "search-cursor-active" : ""}
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "#0f0500",
        overflow: "hidden",
        userSelect: "none",
      }}
      onClick={handleMouseClick}
      onTouchEnd={handleTouchEnd}
      role="application"
      aria-label="Search scene — find Billie Essco"
    >
      {/* The Where's Waldo scene */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={WALDO_IMAGE_URL}
        alt="Search scene — find Billie Essco"
        onLoad={handleImageLoad}
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center",
          display: "block",
          pointerEvents: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      />

      {/* Top instruction bar (fades after dismiss) */}
      <AnimatePresence>
        {!showIntro && phase === "search" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              background: "rgba(26,10,0,0.75)",
              border: "1.5px solid rgba(255,249,240,0.15)",
              borderRadius: "3px",
              padding: "8px 18px",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{
              fontFamily: "'Georgia', serif",
              fontSize: "11px",
              letterSpacing: "0.22em",
              color: "rgba(255,249,240,0.7)",
              textTransform: "uppercase",
            }}>
              {isTouchDevice ? "Tap" : "Click"} to search for Billie Essco
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom cursor (desktop only) */}
      {!isTouchDevice && (
        <SearchCursor
          active={!showIntro && phase === "search"}
          shaking={shaking}
        />
      )}
    </div>
  );

  return (
    <>
      <IntroOverlay visible={showIntro} onDismiss={() => setShowIntro(false)} />

      <CurtainReveal
        phase={phase}
        searchContent={searchScene}
      >
        <MusicExperience audioSrc={AUDIO_URL} />
      </CurtainReveal>
    </>
  );
}
