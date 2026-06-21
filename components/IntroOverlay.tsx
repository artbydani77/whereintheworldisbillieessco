"use client";
import { motion, AnimatePresence } from "framer-motion";

interface IntroOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function IntroOverlay({ visible, onDismiss }: IntroOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.82)" }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-md w-full mx-6 text-center"
            style={{
              background: "linear-gradient(145deg, #fff9f0 0%, #fff3e0 100%)",
              border: "3px solid #1a0a00",
              borderRadius: "4px",
              padding: "48px 40px 40px",
              boxShadow: "8px 8px 0 #1a0a00, -2px -2px 0 #e63c00",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Paper texture splotches */}
            <div style={{
              position: "absolute", top: -10, left: -10,
              width: 80, height: 80,
              background: "radial-gradient(circle, rgba(230,60,0,0.15) 0%, transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none"
            }} />
            <div style={{
              position: "absolute", bottom: -15, right: -15,
              width: 100, height: 100,
              background: "radial-gradient(circle, rgba(26,100,26,0.12) 0%, transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none"
            }} />

            {/* Eyebrow */}
            <p style={{
              fontFamily: "'Georgia', serif",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.35em",
              color: "#e63c00",
              textTransform: "uppercase",
              marginBottom: "20px",
              position: "relative",
              zIndex: 1,
            }}>
              ✦ Hidden Experience ✦
            </p>

            {/* Title */}
            <h1 style={{
              fontFamily: "'Georgia', serif",
              fontSize: "clamp(22px, 5vw, 30px)",
              fontWeight: 900,
              color: "#1a0a00",
              lineHeight: 1.15,
              marginBottom: "24px",
              position: "relative",
              zIndex: 1,
              letterSpacing: "-0.01em",
            }}>
              WHERE IN THE WORLD IS{" "}
              <span style={{ color: "#e63c00", display: "inline-block" }}>
                BILLIE ESSCO?
              </span>
            </h1>

            {/* Divider */}
            <div style={{
              width: "60px",
              height: "3px",
              background: "#1a0a00",
              margin: "0 auto 24px",
              position: "relative",
              zIndex: 1,
            }} />

            {/* Body */}
            <p style={{
              fontFamily: "'Georgia', serif",
              fontSize: "15px",
              lineHeight: 1.7,
              color: "#3d1f00",
              marginBottom: "32px",
              position: "relative",
              zIndex: 1,
            }}>
              Search the scene and click where you think he&apos;s hiding.
              <br />
              <span style={{ fontStyle: "italic", color: "#6b3a00" }}>
                Find him to unlock an unreleased listening experience.
              </span>
            </p>

            {/* CTA Button */}
            <motion.button
              onClick={onDismiss}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              style={{
                fontFamily: "'Georgia', serif",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#fff9f0",
                background: "#1a0a00",
                border: "2px solid #1a0a00",
                borderRadius: "2px",
                padding: "14px 36px",
                cursor: "pointer",
                position: "relative",
                zIndex: 1,
                boxShadow: "3px 3px 0 #e63c00",
              }}
            >
              START SEARCHING
            </motion.button>

            {/* Decorative corner marks */}
            <div style={{ position: "absolute", top: 10, left: 10, fontSize: "18px", color: "#e63c00", opacity: 0.4 }}>✦</div>
            <div style={{ position: "absolute", top: 10, right: 10, fontSize: "18px", color: "#1a6418", opacity: 0.4 }}>✦</div>
            <div style={{ position: "absolute", bottom: 10, left: 10, fontSize: "18px", color: "#1a6418", opacity: 0.4 }}>✦</div>
            <div style={{ position: "absolute", bottom: 10, right: 10, fontSize: "18px", color: "#e63c00", opacity: 0.4 }}>✦</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
