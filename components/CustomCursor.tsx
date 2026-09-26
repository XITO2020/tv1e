'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`;
      }
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX - 18}px, ${ringY - 18}px, 0)`;
      }
      requestAnimationFrame(tick);
    };

    const setHover = (state: boolean, kind: 'card' | 'link' = 'card') => {
      if (!ringRef.current) return;
      ringRef.current.dataset.state = state ? kind : '';
    };

    document.querySelectorAll('a, button, [data-cursor="card"]').forEach((el) => {
      const isCard = el.getAttribute('data-cursor') === 'card';
      el.addEventListener('mouseenter', () => setHover(true, isCard ? 'card' : 'link'));
      el.addEventListener('mouseleave', () => setHover(false));
    });

    window.addEventListener('mousemove', handleMove);
    tick();

    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-[6px] h-[6px] bg-volt rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{ willChange: 'transform' }}
        aria-hidden
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-9 h-9 border border-volt/50 rounded-full pointer-events-none z-[9998] transition-[width,height,border-color,background] duration-300 ease-out"
        style={{ willChange: 'transform' }}
        data-state=""
        aria-hidden
      />
      <style jsx global>{`
        [data-state="card"] {
          width: 80px !important;
          height: 80px !important;
          margin-left: -22px !important;
          margin-top: -22px !important;
          background: rgba(212, 255, 0, 0.08);
          border-color: rgba(212, 255, 0, 0.6);
          backdrop-filter: blur(2px);
        }
        [data-state="link"] {
          width: 48px !important;
          height: 48px !important;
          margin-left: -6px !important;
          margin-top: -6px !important;
          border-color: rgba(212, 255, 0, 0.9);
        }
      `}</style>
    </>
  );
}
