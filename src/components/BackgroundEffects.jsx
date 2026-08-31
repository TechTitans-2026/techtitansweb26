import React, { useEffect, useRef, useState } from 'react';

const FLOATING_ELEMENT_LOOPS = [
  // LOOP 0: CODE & COMPUTING (Exact match to HTML reference)
  {
    name: '01 // CODE & COMPUTATION',
    items: [
      { type: 'icon', icon: 'fas fa-code', color: 'blue', depth: 18, top: '6%', left: '46%', size: '76px', anim: 'floatDrift 17s cubic-bezier(0.45,0,0.55,1) infinite', blurClass: 'depth-far' },
      { type: 'reticle-icon', icon: 'fas fa-microchip', color: 'glyph', depth: 55, top: '4%', left: '82%', size: '46px', reticleSize: '150px', anim: 'floatBob 12s ease-in-out infinite -4s', blurClass: 'depth-near' },
      { type: 'icon', icon: 'fas fa-keyboard', color: 'glyph', depth: 22, top: '70%', left: '5%', size: '48px', anim: 'floatKeyboard 14s ease-in-out infinite', blurClass: 'depth-near', className: 'keyboard-element', hideMobile: true },
      { type: 'icon', icon: 'fas fa-atom', color: 'blue', depth: 60, top: '36%', left: '92%', size: '54px', anim: 'floatBob 9s ease-in-out infinite -2s', blurClass: 'depth-near' },
      { type: 'icon', icon: 'fas fa-folder', color: 'warm', depth: 26, top: '80%', left: '81%', size: '58px', anim: 'floatDrift 15s ease-in-out infinite -6s', blurClass: 'depth-mid', hideMobile: true },
      { type: 'text', text: '{ }', color: 'braces', depth: 16, top: '50%', left: '10%', size: '100px', anim: 'floatOrbit 24s cubic-bezier(0.45,0,0.55,1) infinite -12s', blurClass: 'depth-far', hideMobile: true }
    ]
  },
  // LOOP 1: AI & DATA SCIENCE
  {
    name: '02 // AI & DATA SCIENCE',
    items: [
      { type: 'icon', icon: 'fas fa-brain', color: 'cyan', depth: 20, top: '8%', left: '48%', size: '80px', anim: 'floatDrift 18s cubic-bezier(0.45,0,0.55,1) infinite', blurClass: 'depth-far' },
      { type: 'reticle-icon', icon: 'fas fa-network-wired', color: 'cyan', depth: 55, top: '5%', left: '80%', size: '48px', reticleSize: '150px', anim: 'floatBob 13s ease-in-out infinite -3s', blurClass: 'depth-near' },
      { type: 'icon', icon: 'fas fa-chart-line', color: 'green', depth: 32, top: '66%', left: '5%', size: '82px', anim: 'floatOrbit 20s cubic-bezier(0.37,0,0.63,1) infinite -8s', blurClass: 'depth-mid', hideMobile: true },
      { type: 'icon', icon: 'fas fa-robot', color: 'blue', depth: 58, top: '38%', left: '90%', size: '56px', anim: 'floatBob 10s ease-in-out infinite -2s', blurClass: 'depth-near' },
      { type: 'icon', icon: 'fas fa-cubes', color: 'warm', depth: 28, top: '78%', left: '82%', size: '60px', anim: 'floatDrift 16s ease-in-out infinite -5s', blurClass: 'depth-mid', hideMobile: true },
      { type: 'text', text: '[ ∑ ]', color: 'braces', depth: 15, top: '48%', left: '8%', size: '90px', anim: 'floatOrbit 25s cubic-bezier(0.45,0,0.55,1) infinite -10s', blurClass: 'depth-far', hideMobile: true }
    ]
  },
  // LOOP 2: CYBERSECURITY & SYSTEMS
  {
    name: '03 // CYBERSECURITY & SYSTEMS',
    items: [
      { type: 'icon', icon: 'fas fa-shield-alt', color: 'cyan', depth: 18, top: '7%', left: '50%', size: '78px', anim: 'floatDrift 16s cubic-bezier(0.45,0,0.55,1) infinite', blurClass: 'depth-far' },
      { type: 'reticle-icon', icon: 'fas fa-lock', color: 'pink', depth: 55, top: '4%', left: '82%', size: '44px', reticleSize: '150px', anim: 'floatBob 11s ease-in-out infinite -4s', blurClass: 'depth-near' },
      { type: 'icon', icon: 'fas fa-terminal', color: 'green', depth: 30, top: '62%', left: '6%', size: '84px', anim: 'floatOrbit 22s cubic-bezier(0.37,0,0.63,1) infinite -7s', blurClass: 'depth-mid', hideMobile: true },
      { type: 'icon', icon: 'fas fa-server', color: 'blue', depth: 60, top: '35%', left: '91%', size: '52px', anim: 'floatBob 9s ease-in-out infinite -1s', blurClass: 'depth-near' },
      { type: 'icon', icon: 'fas fa-fingerprint', color: 'warm', depth: 25, top: '82%', left: '79%', size: '64px', anim: 'floatDrift 14s ease-in-out infinite -6s', blurClass: 'depth-mid', hideMobile: true },
      { type: 'text', text: '< / >', color: 'braces', depth: 16, top: '52%', left: '10%', size: '85px', anim: 'floatOrbit 23s cubic-bezier(0.45,0,0.55,1) infinite -11s', blurClass: 'depth-far', hideMobile: true }
    ]
  },
  // LOOP 3: CLOUD & DATA STRUCTURES
  {
    name: '04 // CLOUD & DATA STRUCTURES',
    items: [
      { type: 'icon', icon: 'fas fa-cloud', color: 'blue', depth: 18, top: '8%', left: '46%', size: '82px', anim: 'floatDrift 17s cubic-bezier(0.45,0,0.55,1) infinite', blurClass: 'depth-far' },
      { type: 'reticle-icon', icon: 'fas fa-database', color: 'cyan', depth: 55, top: '5%', left: '83%', size: '46px', reticleSize: '150px', anim: 'floatBob 12s ease-in-out infinite -3s', blurClass: 'depth-near' },
      { type: 'icon', icon: 'fas fa-sitemap', color: 'glyph', depth: 30, top: '65%', left: '5%', size: '80px', anim: 'floatOrbit 21s cubic-bezier(0.37,0,0.63,1) infinite -9s', blurClass: 'depth-mid', hideMobile: true },
      { type: 'icon', icon: 'fas fa-layer-group', color: 'cyan', depth: 58, top: '36%', left: '89%', size: '54px', anim: 'floatBob 10s ease-in-out infinite -2s', blurClass: 'depth-near' },
      { type: 'icon', icon: 'fas fa-hdd', color: 'warm', depth: 26, top: '79%', left: '82%', size: '58px', anim: 'floatDrift 15s ease-in-out infinite -5s', blurClass: 'depth-mid', hideMobile: true },
      { type: 'text', text: '0101', color: 'braces', depth: 16, top: '48%', left: '9%', size: '80px', anim: 'floatOrbit 24s cubic-bezier(0.45,0,0.55,1) infinite -12s', blurClass: 'depth-far', hideMobile: true }
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
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      elements.forEach((item) => {
        item.targetX = nx * item.depth;
        item.targetY = ny * item.depth * 0.7;
      });
    };

    window.addEventListener('mousemove', handleMouse);

    const tick = () => {
      elements.forEach((item) => {
        item.curX += (item.targetX - item.curX) * 0.06;
        item.curY += (item.targetY - item.curY) * 0.06;
        item.el.style.transform = `translate3d(${item.curX.toFixed(2)}px, ${item.curY.toFixed(2)}px, 0)`;
      });
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, [activeLoop]);

  const currentSet = FLOATING_ELEMENT_LOOPS[activeLoop];

  return (
    <>
      {/* Ambient Background System */}
      <div className="circuit-layer"></div>
      <div className="cursor-glow" id="cursor-glow" ref={cursorRef}></div>
      <div className="grain-layer"></div>

      {/* Circuit Nodes */}
      <div className="circuit-node" style={{ top: '18%', left: '8%', animationDelay: '0s' }}></div>
      <div className="circuit-node" style={{ top: '32%', left: '92%', animationDelay: '0.8s' }}></div>
      <div className="circuit-node" style={{ top: '68%', left: '6%', animationDelay: '1.6s' }}></div>
      <div className="circuit-node" style={{ top: '82%', left: '88%', animationDelay: '2.4s' }}></div>
      <div className="circuit-node" style={{ top: '48%', left: '50%', animationDelay: '3.2s' }}></div>

      {/* Parallax Floating Tech Elements Container */}
      <div ref={containerRef} key={activeLoop}>
        {currentSet.items.map((item, idx) => {
          if (item.type === 'reticle-icon') {
            return (
              <div
                key={idx}
                className={`parallax-item ${item.blurClass} ${item.className || ''} ${item.hideMobile ? 'hide-mobile' : ''}`}
                data-depth={item.depth}
                style={{ top: item.top, left: item.left, width: item.reticleSize, height: item.reticleSize }}
              >
                <div className="reticle depth-far" style={{ position: 'absolute', inset: 0 }}>
                  <div className="reticle-dashed"></div>
                  <div className="reticle-solid"></div>
                </div>
                <i
                  className={`${item.icon} float-icon icon-glyph ${item.color}`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: item.size,
                    animation: item.anim,
                  }}
                ></i>
              </div>
            );
          }

          if (item.type === 'text') {
            return (
              <div
                key={idx}
                className={`parallax-item ${item.blurClass} ${item.hideMobile ? 'hide-mobile' : ''}`}
                data-depth={item.depth}
                style={{ top: item.top, left: item.left }}
              >
                <span
                  className="float-icon icon-braces"
                  style={{
                    fontSize: item.size,
                    display: 'block',
                    animation: item.anim,
                  }}
                >
                  {item.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className={`parallax-item ${item.blurClass} ${item.hideMobile ? 'hide-mobile' : ''}`}
              data-depth={item.depth}
              style={{ top: item.top, left: item.left }}
            >
              <i
                className={`${item.icon} float-icon icon-glyph ${item.color}`}
                style={{
                  fontSize: item.size,
                  animation: item.anim,
                }}
              ></i>
            </div>
          );
        })}
      </div>

      {/* Discrete Technical Loop Telemetry Badge */}
      <div className="fixed bottom-4 left-6 z-20 hidden lg:flex items-center gap-3 bg-black/40 border border-white/5 backdrop-blur-md px-3.5 py-1.5 rounded-full pointer-events-auto select-none opacity-50 hover:opacity-100 transition-opacity">
        <span className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse"></span>
        <span className="text-[10px] font-mono text-gray-300 font-semibold tracking-wider">
          {currentSet.name}
        </span>
        <button
          onClick={() => setActiveLoop((prev) => (prev + 1) % 4)}
          className="text-[9px] font-mono uppercase bg-white/10 hover:bg-[#ae97d6]/30 text-white px-2 py-0.5 rounded cursor-pointer transition-colors"
          title="Cycle through background tech element loops"
        >
          CYCLE LOOP
        </button>
      </div>
    </>
  );
};

export default BackgroundEffects;
