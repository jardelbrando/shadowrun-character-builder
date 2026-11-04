import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const BURST_EVENT = 'crt-burst';
const NOISE_FRAMES = 6;
const NOISE_WIDTH = 320;
const NOISE_HEIGHT = 180;
const FRAME_MS = 70;
const IDLE_OPACITY = 0.015;
const BURST_OPACITY = 0.32;
const MIN_BURST_GAP_MS = 20000;
const MAX_BURST_GAP_MS = 45000;

/** Dispara uma interferência; usada em trocas de etapa e importações. */
export const crtBurst = (durationMs = 220) => window.dispatchEvent(new CustomEvent(BURST_EVENT, { detail: durationMs }));

const random = (min: number, max: number) => min + Math.random() * (max - min);

function createNoiseFrames(ctx: CanvasRenderingContext2D) {
  return Array.from({ length: NOISE_FRAMES }, () => {
    const frame = ctx.createImageData(NOISE_WIDTH, NOISE_HEIGHT);
    for (let i = 0; i < frame.data.length; i += 4) {
      const value = Math.random() * 255;
      frame.data[i] = value;
      frame.data[i + 1] = value;
      frame.data[i + 2] = value;
      frame.data[i + 3] = 255;
    }
    return frame;
  });
}

function setTearing(active: boolean) {
  const root = document.documentElement;
  root.classList.toggle('crt-tearing', active);
  if (!active) return;
  root.style.setProperty('--tear-x', `${random(-14, 14).toFixed(1)}px`);
  root.style.setProperty('--tear-skew', `${random(-1.6, 1.6).toFixed(2)}deg`);
  root.style.setProperty('--tear-top', `${random(4, 86).toFixed(1)}%`);
  root.style.setProperty('--tear-height', `${random(3, 16).toFixed(1)}%`);
  root.style.setProperty('--tear-top-2', `${random(4, 90).toFixed(1)}%`);
}

export function CrtOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const frames = createNoiseFrames(ctx);
    ctx.putImageData(frames[0], 0, 0);
    canvas.style.opacity = `${IDLE_OPACITY}`;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let lastFrame = 0;
    let frameIndex = 0;
    let burstUntil = 0;
    let nextBurst = performance.now() + random(MIN_BURST_GAP_MS, MAX_BURST_GAP_MS);

    const onBurst = (event: Event) => {
      burstUntil = Math.max(burstUntil, performance.now() + (event as CustomEvent<number>).detail);
    };
    window.addEventListener(BURST_EVENT, onBurst);

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now >= nextBurst) {
        burstUntil = now + random(120, 340);
        nextBurst = now + random(MIN_BURST_GAP_MS, MAX_BURST_GAP_MS);
      }
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;
      frameIndex = (frameIndex + 1) % NOISE_FRAMES;
      ctx.putImageData(frames[frameIndex], 0, 0);
      const bursting = now < burstUntil;
      canvas.style.opacity = `${bursting ? BURST_OPACITY : IDLE_OPACITY}`;
      setTearing(bursting);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(BURST_EVENT, onBurst);
      setTearing(false);
    };
  }, []);

  // Fora do #root: a interferência desloca o app, mas não o próprio overlay.
  return createPortal(
    <div className="crt no-print" aria-hidden="true">
      <canvas ref={canvasRef} className="crt-noise" width={NOISE_WIDTH} height={NOISE_HEIGHT} />
      <div className="crt-scanlines" />
      <div className="crt-roll" />
      <div className="crt-tear" />
      <div className="crt-tear crt-tear-2" />
      <div className="crt-vignette" />
    </div>,
    document.body,
  );
}
