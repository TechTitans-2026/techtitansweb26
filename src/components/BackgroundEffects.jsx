import React, { useEffect, useRef, useState } from 'react';

const FLOATING_ELEMENT_LOOPS = [
  // LOOP 0: CODE & COMPUTING
  {
    name: '01 // CODE & COMPUTATION',
    items: [
      { type: 'icon', icon: 'fas fa-code', color: 'blue', depth: 18, top: '10%', left: '44%', size: '44px', anim: 'floatDrift 17s cubic-bezier(0.45,0,0.55,1) infinite', blurClass: 'depth-near' },
      { type: 'reticle-icon', icon: 'fas fa-microchip', color: 'glyph', depth: 55, top: '6%', left: '80%', size: '42px', reticleSize: '130px', anim: 'floatBob 12s ease-in-out infinite -4s', blurClass: 'depth-near' },
      { type: 'icon', icon: 'fas fa-keyboard', color: 'glyph', depth: 22, top: '68%', left: '6%', size: '46px', anim: 'floatKeyboard 14s ease-in-out infinite', blurClass: 'depth-near', className: 'keyboard-element', hideMobile: true },
      { type: 'icon', icon: 'fas fa-atom', color: 'blue', depth: 60, top: '34%', left: '88%', size: '48px', anim: 'floatBob 9s ease-in-out infinite -2s', blurClass: 'depth-near' },
      { type: 'icon', icon: 'fas fa-folder', color: 'warm', depth: 26, top: '76%', left: '78%', size: '46px', anim: 'floatDrift 15s ease-in-out infinite -6s', blurClass: 'depth-near', hideMobile: true },
      { type: 'text', text: '{ }', color: 'braces', depth: 16, top: '48%', left: '9%', size: '42px', anim: 'floatOrbit 24s cubic-bezier(0.45,0,0.55,1) infinite -12s', blurClass: 'depth-near', hideMobile: true }
    ]
  },
  // LOOP 1: AI & DATA SCIENCE
  {
    name: '02 // AI & DATA SCIENCE',
    items: [
      { type: 'icon', icon: 'fas fa-brain', color: 'cyan', depth: 20, top: '16%', left: '42%', size: '54px', anim: 'floatDrift 18s cubic-bezier(0.45,0,0.55,1) infinite', blurClass: 'depth-near' },
      { type: 'reticle-icon', icon: 'fas fa-network-wired', color: 'cyan', depth: 55, top: '6%', left: '78%', size: '42px', reticleSize: '130px', anim: 'floatBob 13s ease-in-out infinite -3s', blurClass: 'depth-near' },
      { type: 'icon', icon: 'fas fa-chart-line', color: 'green', depth: 32, top: '64%', left: '6%', size: '48px', anim: 'floatOrbit 20s cubic-bezier(0.37,0,0.63,1) infinite -8s', blurClass: 'depth-near', hideMobile: true },
      { type: 'icon', icon: 'fas fa-robot', color: 'blue', depth: 58, top: '36%', left: '88%', size: '46px', anim: 'floatBob 10s ease-in-out infinite -2s', blurClass: 'depth-near' },
      { type: 'icon', icon: 'fas fa-cubes', color: 'warm', depth: 28, top: '76%', left: '79%', size: '44px', anim: 'floatDrift 16s ease-in-out infinite -5s', blurClass: 'depth-near', hideMobile: true },
      { type: 'text', text: '[∑]', color: 'braces', depth: 15, top: '38%', left: '8%', size: '32px', anim: 'floatOrbit 25s cubic-bezier(0.45,0,0.55,1) infinite -10s', blurClass: 'depth-near', hideMobile: true }
    ]
  },
  // LOOP 2: CYBERSECURITY & SYSTEMS
  {
    name: '03 // CYBERSECURITY & SYSTEMS',
    items: [
      { type: 'icon', icon: 'fas fa-shield-alt', color: 'cyan', depth: 18, top: '10%', left: '46%', size: '48px', anim: 'floatDrift 16s cubic-bezier(0.45,0,0.55,1) infinite', blurClass: 'depth-near' },
      { type: 'reticle-icon', icon: 'fas fa-lock', color: 'pink', depth: 55, top: '5%', left: '80%', size: '40px', reticleSize: '130px', anim: 'floatBob 11s ease-in-out infinite -4s', blurClass: 'depth-near' },
      { type: 'icon', icon: 'fas fa-terminal', color: 'green', depth: 30, top: '60%', left: '7%', size: '40px', anim: 'floatOrbit 22s cubic-bezier(0.37,0,0.63,1) infinite -7s', blurClass: 'depth-near', hideMobile: true },
      { type: 'icon', icon: 'fas fa-server', color: 'blue', depth: 60, top: '34%', left: '88%', size: '44px', anim: 'floatBob 9s ease-in-out infinite -1s', blurClass: 'depth-near' },
      { type: 'icon', icon: 'fas fa-fingerprint', color: 'warm', depth: 25, top: '78%', left: '78%', size: '48px', anim: 'floatDrift 14s ease-in-out infinite -6s', blurClass: 'depth-near', hideMobile: true },
      { type: 'text', text: '< / >', color: 'braces', depth: 16, top: '50%', left: '9%', size: '34px', anim: 'floatOrbit 23s cubic-bezier(0.45,0,0.55,1) infinite -11s', blurClass: 'depth-near', hideMobile: true }
    ]
  },
  // LOOP 3: CLOUD & DATA STRUCTURES
  {
    name: '04 // CLOUD & DATA STRUCTURES',
    items: [
      { type: 'icon', icon: 'fas fa-cloud', color: 'blue', depth: 18, top: '10%', left: '44%', size: '50px', anim: 'floatDrift 17s cubic-bezier(0.45,0,0.55,1) infinite', blurClass: 'depth-near' },
      { type: 'reticle-icon', icon: 'fas fa-database', color: 'cyan', depth: 55, top: '6%', left: '80%', size: '42px', reticleSize: '130px', anim: 'floatBob 12s ease-in-out infinite -3s', blurClass: 'depth-near' },
      { type: 'icon', icon: 'fas fa-sitemap', color: 'glyph', depth: 30, top: '62%', left: '6%', size: '46px', anim: 'floatOrbit 21s cubic-bezier(0.37,0,0.63,1) infinite -9s', blurClass: 'depth-near', hideMobile: true },
      { type: 'icon', icon: 'fas fa-layer-group', color: 'cyan', depth: 58, top: '35%', left: '88%', size: '44px', anim: 'floatBob 10s ease-in-out infinite -2s', blurClass: 'depth-near' },
      { type: 'icon', icon: 'fas fa-hdd', color: 'warm', depth: 26, top: '77%', left: '78%', size: '44px', anim: 'floatDrift 15s ease-in-out infinite -5s', blurClass: 'depth-near', hideMobile: true },
      { type: 'text', text: '0101', color: 'braces', depth: 16, top: '46%', left: '9%', size: '34px', anim: 'floatOrbit 24s cubic-bezier(0.45,0,0.55,1) infinite -12s', blurClass: 'depth-near', hideMobile: true }
    ]
  }
];

const BackgroundEffects = () => {
  const cursorRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize loop mode: cycles on every page reload
  const [activeLoop, setActiveLoop] = useState(() => {
    try {
      const stored = parseInt(sessionStorage.getItem('tt_bg_loop_idx') || '-1', 10);
      const next = (stored + 1) % 4;
      sessionStorage.setItem('tt_bg_loop_idx', next.toString());
      return next;
    } catch {
      return Math.floor(Math.random() * 4);
    }
  });

  // Cursor spotlight tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorRef.current && window.matchMedia('(pointer: fine)').matches) {
        cursorRef.current.style.setProperty('--x', e.clientX + 'px');
        cursorRef.current.style.setProperty('--y', e.clientY + 'px');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Parallax Depth Animation Engine
  useEffect(() => {
    if (!containerRef.current) return;
    const elements = Array.from(containerRef.current.querySelectorAll('.parallax-item')).map((el) => ({
      el,
      depth: parseFloat(el.dataset.depth) || 20,
      curX: 0,
      curY: 0,
      targetX: 0,
      targetY: 0,
    }));

    if (!elements.length) return;

    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    let animId;

    const handleMouse = (e) => {
      if (!isFinePointer) return;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const mouseX = (e.clientX - centerX) / centerX;
      const mouseY = (e.clientY - centerY) / centerY;

      elements.forEach((item) => {
        const factor = (item.depth / 100) * 45;
        item.targetX = mouseX * factor;
        item.targetY = mouseY * factor;
      });
    };

    const updateParallax = () => {
      elements.forEach((item) => {
        item.curX += (item.targetX - item.curX) * 0.08;
        item.curY += (item.targetY - item.curY) * 0.08;
        item.el.style.transform = `translate3d(${item.curX}px, ${item.curY}px, 0)`;
      });
      animId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener('mousemove', handleMouse);
    animId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(animId);
    };
  }, [activeLoop]);

  const currentLoop = FLOATING_ELEMENT_LOOPS[activeLoop];

  return (
    <>
      {/* 1. Subtle Circuit Overlay */}
      <div className="circuit-layer"></div>

      {/* 2. Cursor Radial Glow */}
      <div ref={cursorRef} className="cursor-glow"></div>

      {/* 3. Film Grain Texture */}
      <div className="grain-layer"></div>

      {/* 4. Interactive Floating Tech Elements */}
      <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {currentLoop.items.map((item, index) => {
          const hideClass = item.hideMobile ? 'hidden md:block' : 'block';

          if (item.type === 'reticle-icon') {
            return (
              <div
                key={index}
                className={`parallax-item ${hideClass}`}
                data-depth={item.depth}
                style={{ top: item.top, left: item.left }}
              >
                <div
                  className="reticle flex items-center justify-center"
                  style={{ width: item.reticleSize, height: item.reticleSize }}
                >
                  <div className="reticle-dashed"></div>
                  <div className="reticle-solid"></div>
                  <i
                    className={`${item.icon} float-icon icon-glyph ${item.color} ${item.blurClass}`}
                    style={{ fontSize: item.size, animation: item.anim }}
                  ></i>
                </div>
              </div>
            );
          }

          if (item.type === 'text') {
            return (
              <div
                key={index}
                className={`parallax-item ${hideClass}`}
                data-depth={item.depth}
                style={{ top: item.top, left: item.left }}
              >
                <span
                  className={`float-icon icon-braces ${item.blurClass}`}
                  style={{ fontSize: item.size, animation: item.anim }}
                >
                  {item.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={index}
              className={`parallax-item ${hideClass}`}
              data-depth={item.depth}
              style={{ top: item.top, left: item.left }}
            >
              <i
                className={`${item.icon} float-icon icon-glyph ${item.color} ${item.blurClass} ${item.className || ''}`}
                style={{ fontSize: item.size, animation: item.anim }}
              ></i>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default BackgroundEffects;
