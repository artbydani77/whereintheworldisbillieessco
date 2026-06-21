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
const MIN_SCALE  = 1;
const MAX_SCALE  = 6;

type Phase = "search" | "revealing" | "revealed";

export default function BillieEsscoExperience() {
  const [showIntro, setShowIntro] = useState(true);
  const [phase, setPhase]         = useState<Phase>("search");
  const [shaking, setShaking]     = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const imgRef     = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const naturalW   = useRef(0);
  const naturalH   = useRef(0);

  // All zoom/pan state in refs — mutated directly for 60fps, no re-renders
  const zoomScale = useRef(1);
  const panX      = useRef(0); // pan offset in screen px, centred around viewport centre
  const panY      = useRef(0);

  // Touch tracking
  const lastPinchDist  = useRef<number | null>(null);
  const touchStartX    = useRef(0);
  const touchStartY    = useRef(0);
  const isTap          = useRef(false);
  const touchStartTime = useRef(0);

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

  // ── Clamp pan so you can reach every edge but never go past it ──────────────
  // When scaled by s, content is (vw*s) wide. The overflow beyond the viewport
  // is (vw*s - vw) = vw*(s-1). We can translate ±half that in each direction.
  const clampPan = useCallback((s: number) => {
    const maxX = Math.max(0, (window.innerWidth  * (s - 1)) / 2);
    const maxY = Math.max(0, (window.innerHeight * (s - 1)) / 2);
    panX.current = Math.min(maxX, Math.max(-maxX, panX.current));
    panY.current = Math.min(maxY, Math.max(-maxY, panY.current));
  }, []);

  // ── Apply CSS transform ──────────────────────────────────────────────────────
  // transformOrigin: "50% 50%" (default) — scale from viewport centre.
  // Then translate by panX/panY to pan around.
  const applyTransform = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const s = zoomScale.current;
    el.style.transform = `scale(${s}) translate(${panX.current / s}px, ${panY.current / s}px)`;
  }, []);

  // ── Hit detection ────────────────────────────────────────────────────────────
  // getBoundingClientRect() returns the true rendered rect after all CSS transforms,
  // so it accounts for our scale+translate automatically.
  const checkHit = useCallback((clientX: number, clientY: number): boolean => {
    const img = imgRef.current;
    if (!img || !naturalW.current || !naturalH.current) return false;

    const rect = img.getBoundingClientRect();
    const natW = naturalW.current;
    const natH = naturalH.current;

    // object-fit: contain letterbox offset within the element
    const fitScale = Math.min(rect.width / natW, rect.height / natH);
    const imgRendW = natW * fitScale;
    const imgRendH = natH * fitScale;
    const imgLeft  = rect.left + (rect.width  - imgRendW) / 2;
    const imgTop   = rect.top  + (rect.height - imgRendH) / 2;

    const imgX = (clientX - imgLeft) / fitScale;
    const imgY = (clientY - imgTop)  / fitScale;

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

  // ── Touch handlers ───────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current    = e.touches[0].clientX;
      touchStartY.current    = e.touches[0].clientY;
      touchStartTime.current = Date.now();
      isTap.current          = true;
      lastPinchDist.current  = null;
    } else if (e.touches.length === 2) {
      isTap.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDist.current !== null) {
      // ── Pinch zoom ──────────────────────────────────────────────────────────
      isTap.current = false;
      const dx      = e.touches[0].clientX - e.touches[1].clientX;
      const dy      = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      const ratio   = newDist / lastPinchDist.current;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, zoomScale.current * ratio));

      if (newScale !== zoomScale.current) {
        // Keep the pinch midpoint visually fixed.
        // transform is scale(s) with origin at viewport centre, then translate(panX/s, panY/s).
        // To keep midpoint fixed: panX_new = panX_old*(s_new/s_old) + (mid - vw/2)*(1 - s_new/s_old)
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const scaleDelta = newScale / zoomScale.current;

        panX.current = panX.current * scaleDelta + (midX - vw / 2) * (1 - scaleDelta);
        panY.current = panY.current * scaleDelta + (midY - vh / 2) * (1 - scaleDelta);

        zoomScale.current = newScale;
        clampPan(newScale);
        applyTransform();
      }
      lastPinchDist.current = newDist;

    } else if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;

      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) isTap.current = false;

      if (zoomScale.current > 1 && !isTap.current) {
        // ── Pan when zoomed in ───────────────────────────────────────────────
        panX.current += dx;
        panY.current += dy;
        clampPan(zoomScale.current);
        applyTransform();
      }

      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  }, [applyTransform, clampPan]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const elapsed = Date.now() - touchStartTime.current;
    if (isTap.current && elapsed < 300 && e.changedTouches.length === 1) {
      fireHit(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }
    if (e.touches.length < 2) lastPinchDist.current = null;
  }, [fireHit]);

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
        touchAction: "none",
      }}
      className={phase === "search" && !showIntro ? "search-cursor-active" : ""}
      onClick={onMouseClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="application"
      aria-label="Search scene — find Billie Essco"
    >
      <div
        ref={wrapperRef}
        style={{
          position: "absolute",
          inset: 0,
          willChange: "transform",
          // Default: no transform (scale 1, pan 0)
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
              {isTouchDevice ? "Pinch to zoom · Tap to search" : "Click to search for Billie Essco"}
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
