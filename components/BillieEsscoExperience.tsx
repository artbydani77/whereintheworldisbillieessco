"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IntroOverlay from "./IntroOverlay";
import SearchCursor from "./SearchCursor";
import CurtainReveal from "./CurtainReveal";
import MusicExperience from "./MusicExperience";

// ─── ASSET CONFIGURATION ──────────────────────────────────────────────────────
const WALDO_IMAGE_URL =
  "https://www.dropbox.com/scl/fi/z4cs5m6bhxa1v5l45cskx/witwibe.png?rlkey=pzxld8k0eeaah6w055u3ca3ki&st=f5bu3oa0&dl=1";

const AUDIO_URL = "/track.mp3";

// ─── CHARACTER LOCATION (original image coordinates) ──────────────────────────
const CHAR_X      = 1140; // x in original image pixels
const CHAR_Y      = 359;  // y in original image pixels
const HIT_RADIUS  = 45;   // radius in original image pixels

type Phase = "search" | "revealing" | "revealed";

export default function BillieEsscoExperience() {
  const [showIntro, setShowIntro] = useState(true);
  const [phase, setPhase]         = useState<Phase>("search");
  const [shaking, setShaking]     = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const imgRef    = useRef<HTMLImageElement>(null);
  const naturalW  = useRef(0);
  const naturalH  = useRef(0);

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

  // ─── Hit detection ────────────────────────────────────────────────────────
  // Uses getBoundingClientRect() on the img element — the only reliable method
  // across mobile zoom levels, browser chrome (address bar / safe areas),
  // device pixel ratios, and any scroll offset.
  // clientX/clientY from MouseEvent and TouchEvent are already in the same
  // viewport coordinate space as getBoundingClientRect(), so no DPR scaling needed.
  const checkHit = useCallback((clientX: number, clientY: number): boolean => {
    const img = imgRef.current;
    if (!img || !naturalW.current || !naturalH.current) return false;

    // True rendered position/size of the <img> element in viewport coords
    const rect     = img.getBoundingClientRect();
    const elemW    = rect.width;
    const elemH    = rect.height;
    const natW     = naturalW.current;
    const natH     = naturalH.current;

    // object-fit: contain — image is letterboxed inside the element.
    // Compute the scale and the offset of actual image pixels within the element.
    const scale    = Math.min(elemW / natW, elemH / natH);
    const imgRendW = natW * scale;
    const imgRendH = natH * scale;
    const imgLeft  = rect.left + (elemW - imgRendW) / 2;
    const imgTop   = rect.top  + (elemH - imgRendH) / 2;

    // Map viewport tap coords → original image pixel coords
    const imgX = (clientX - imgLeft) / scale;
    const imgY = (clientY - imgTop)  / scale;

    // Reject taps in the letterbox bars (outside image content)
    if (imgX < 0 || imgY < 0 || imgX > natW || imgY > natH) return false;

    const dist = Math.sqrt((imgX - CHAR_X) ** 2 + (imgY - CHAR_Y) ** 2);
    return dist <= HIT_RADIUS;
  }, []);

  const handleClick = useCallback((clientX: number, clientY: number) => {
    if (phase !== "search" || showIntro) return;

    if (checkHit(clientX, clientY)) {
      setPhase("revealing");
      setTimeout(() => setPhase("revealed"), 2200);
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }, [phase, showIntro, checkHit]);

  const handleMouseClick = useCallback((e: React.MouseEvent) => {
    // Ignore if this is also a touch device firing a synthetic mouse event
    handleClick(e.clientX, e.clientY);
  }, [handleClick]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Prevent the browser from also firing a synthetic click after touchend
    e.preventDefault();
    const touch = e.changedTouches[0];
    if (touch) handleClick(touch.clientX, touch.clientY);
  }, [handleClick]);

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
        // Allow scroll/pinch-zoom gestures but still receive tap events cleanly
        touchAction: "pan-x pan-y",
      }}
      className={phase === "search" && !showIntro ? "search-cursor-active" : ""}
      onClick={handleMouseClick}
      onTouchEnd={handleTouchEnd}
      role="application"
      aria-label="Search scene — find Billie Essco"
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

      {/* Custom cursor — desktop only */}
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
