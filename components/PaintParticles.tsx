"use client";
import { useEffect, useRef } from "react";

interface Splatter {
  x: number;
  y: number;
  r: number;
  color: string;
  opacity: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  shape: number;
}

const COLORS = ["#FF3A00", "#FFD700", "#1a6418", "#0047AB", "#FF69B4", "#FF8C00"];

export default function PaintParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Splatter[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = () => {
      if (particles.length < 40 && Math.random() < 0.04) {
        const life = 120 + Math.random() * 180;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: 2 + Math.random() * 6,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          opacity: 0,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -0.3 - Math.random() * 0.5,
          life,
          maxLife: life,
          shape: Math.floor(Math.random() * 3),
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      spawn();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life--;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.008;

        const lifeRatio = p.life / p.maxLife;
        p.opacity = lifeRatio < 0.15
          ? (p.life / (p.maxLife * 0.15)) * 0.6
          : lifeRatio > 0.85
          ? ((1 - lifeRatio) / 0.15) * 0.6
          : 0.6;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === 0) {
          // Circle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 1) {
          // Splat - irregular blob
          ctx.beginPath();
          const pts = 6 + Math.floor(Math.random() * 4);
          for (let j = 0; j < pts; j++) {
            const angle = (j / pts) * Math.PI * 2;
            const r = p.r * (0.6 + Math.random() * 0.8);
            const px = p.x + Math.cos(angle) * r;
            const py = p.y + Math.sin(angle) * r;
            j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        } else {
          // Drip drop
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 0.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(p.x - p.r * 0.4, p.y);
          ctx.lineTo(p.x + p.r * 0.4, p.y);
          ctx.lineTo(p.x, p.y + p.r * 1.8);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();

        if (p.life <= 0) particles.splice(i, 1);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
}
