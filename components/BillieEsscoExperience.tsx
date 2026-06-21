"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IntroOverlay from "./IntroOverlay";
import SearchCursor from "./SearchCursor";
import CurtainReveal from "./CurtainReveal";
import MusicExperience from "./MusicExperience";

const WALDO_IMAGE_URL =
  "https://www.dropbox.com/scl/fi/z4cs5m6bhxa1v5l45cskx/witwibe.png?rlkey=pzxld8k0eeaah6w055u3ca3ki&st=f5bu3oa0&dl=1";

const AUDIO_URL = "/track.mp3";

const CHAR_X     = 1140;
const CHAR_Y     = 359;
const HIT_RADIUS = 45;

type Phase = "search" | "revealing" | "revealed";

// Pinch-zoom state
interface ZoomState {
  scale: number;
  originX: number; // transform-origin x (viewport px)
  originY: number; // transform-origin y (viewport px)
}

const MIN_SCALE = 1;
const MAX_SCALE = 6;

export default function BillieEsscoExperience() {
  const [showIntro, setShowIntro] = useState(true);
  const [phase, setPhase]         = useState<Phase>("search");
  const [shaking, setShaking]     = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const imgRef       = useRef<HTMLImageElement>(null);
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const naturalW     = useRef(0);
  const naturalH     = useRef(0);

  // Zoom state stored in refs to avoid re-renders on every pinch frame
  const zoomScale    = useRef(1);
  const zoomOriginX  = useRef(0);
  const zoomOriginY  = useRef(0);
  // Pan offset (pixels, at current scale)
  const panX         = useRef(0);
  const panY         = useRef(0);

  // Touch tracking refs
  const lastPinchDist    = useRef<number | null>(null);
  const lastPinchMidX    = useRef(0);
  const lastPinchMidY    = useRef(0);
  const touchStartX      = useRef(0);
  const touchStartY      = useRef(0);
  const isTap            = useRef(false);
  const touchStartTime   = useRef(0);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (img) {
      naturalW.current = img.naturalWidth;
      naturalH.current = img.naturalHeight;
    }
  }, []);

  const applyTransform = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.style.transform =
      `translate(${panX.current}px, ${panY.current}px) scale(${zoomScale.current})`;
    el.style.transformOrigin = `${zoomOriginX.current}px ${zoomOriginY.current}px`;
  }, []);

  // ─── Hit detection ──────────────────────────────────────────────────────────
  // getBoundingClientRect() on the img already accounts for any CSS transform
  // (scale + translate) applied to a parent, so zoom is handled automatically.
  const checkHit = useCallback((clientX: number, clientY: number): boolean => {
    const img = imgRef.current;
    if (!img || !naturalW.current || !naturalH.current) return false;

    const rect  = img.getBoundingClientRect();
    const natW  = naturalW.current;
    const natH  = naturalH.current;

    // object-fit: contain letterbox offset within the element
    const scale    = Math.min(rect.width / natW, rect.height / natH);
    const imgRendW = natW * scale;
    const imgRendH = natH * scale;
    const imgLeft  = rect.left + (rect.width  - imgRendW) / 2;
    const imgTop   = rect.top  + (rect.height - imgRendH) / 2;

    const imgX = (clientX - imgLeft) / scale;
    const imgY = (clientY - imgTop)  / scale;

    if (imgX < 0 || imgY < 0 || imgX > natW || imgY > natH) return false;

    return Math.sqrt((imgX - CHAR_X) ** 2 + (imgY - CHAR_Y) ** 2) <= HIT_RADIUS;
  }, []);

  const fireHit = useCallback((clientX: number, clientY: number) => {
    if (phase !== "search" || showIntro) return;
    if (checkHit(clientX, clientY)) {
      setPhase("revealing");
      setTimeout(() => setPhase("revealed"), 2200);
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }, [phase, showIntro, checkHit]);

  // ─── Touch handlers (touchAction: none → we own all gestures) ───────────────
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single finger — could be a tap or pan
      touchStartX.current   = e.touches[0].clientX;
      touchStartY.current   = e.touches[0].clientY;
      touchStartTime.current = Date.now();
      isTap.current         = true;
      lastPinchDist.current = null;
    } else if (e.touches.length === 2) {
      // Two fingers — pinch, not a tap
      isTap.current = false;
      const dx   = e.touches[0].clientX - e.touches[1].clientX;
      const dy   = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
      lastPinchMidX.current = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      lastPinchMidY.current = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDist.current !== null) {
      // ── Pinch zoom ──
      isTap.current = false;
      const dx      = e.touches[0].clientX - e.touches[1].clientX;
      const dy      = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      const ratio   = newDist / lastPinchDist.current;

      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, zoomScale.current * ratio));

      // Keep the pinch midpoint visually fixed
      // Adjust pan so the point under the midpoint stays there
      if (newScale !== zoomScale.current) {
        const scaleDelta = newScale / zoomScale.current;
        panX.current = midX - scaleDelta * (midX - panX.current);
        panY.current = midY - scaleDelta * (midY - panY.current);
        // Clamp pan so we can't pan off-screen
        const el = wrapperRef.current;
        if (el) {
          const maxPanX = (newScale - 1) * (window.innerWidth  / 2);
          const maxPanY = (newScale - 1) * (window.innerHeight / 2);
          panX.current = Math.min(maxPanX, Math.max(-maxPanX, panX.current));
          panY.current = Math.min(maxPanY, Math.max(-maxPanY, panY.current));
        }
        zoomScale.current  = newScale;
        zoomOriginX.current = 0;
        zoomOriginY.current = 0;
        applyTransform();
      }

      lastPinchDist.current = newDist;
      lastPinchMidX.current = midX;
      lastPinchMidY.current = midY;

    } else if (e.touches.length === 1 && zoomScale.current > 1) {
      // ── Pan when zoomed in ──
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;

      // If moved significantly, it's a pan not a tap
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isTap.current = false;

      // Update start for delta-based panning
      panX.current += e.touches[0].clientX - touchStartX.current;
      panY.current += e.touches[0].clientY - touchStartY.current;
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;

      // Clamp
      const maxPanX = (zoomScale.current - 1) * (window.innerWidth  / 2);
      const maxPanY = (zoomScale.current - 1) * (window.innerHeight / 2);
      panX.current = Math.min(maxPanX, Math.max(-maxPanX, panX.current));
      panY.current = Math.min(maxPanY, Math.max(-maxPanY, panY.current));

      applyTransform();
    } else {
      // Single finger, not zoomed — mark as not-tap if moved much
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) isTap.current = false;
    }
  }, [applyTransform]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // prevent synthetic click
    const elapsed = Date.now() - touchStartTime.current;

    if (isTap.current && elapsed < 300 && e.changedTouches.length === 1) {
      // Clean short tap — fire hit detection
      const touch = e.changedTouches[0];
      fireHit(touch.clientX, touch.clientY);
    }

    if (e.touches.length < 2) {
      lastPinchDist.current = null;
    }
  }, [fireHit]);

  // Desktop click
  const onMouseClick = useCallback((e: React.MouseEvent) => {
    fireHit(e.clientX, e.clientY);
  }, [fireHit]);

  const searchScene = (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#0f0500",
        overflow: "hidden",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "none", // we handle all touch ourselves
      }}
      className={phase === "search" && !showIntro ? "search-cursor-active" : ""}
      onClick={onMouseClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="application"
      aria-label="Search scene — find Billie Essco"
    >
      {/* Zoom/pan wrapper */}
      <div
        ref={wrapperRef}
        style={{
          position: "absolute",
          inset: 0,
          willChange: "transform",
        }}
      >
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
      </div>

      {/* Instruction bar */}
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
      <CurtainReveal phase={phase} searchContent={searchScene}>
        <MusicExperience audioSrc={AUDIO_URL} />
      </CurtainReveal>
    </>
  );
}
