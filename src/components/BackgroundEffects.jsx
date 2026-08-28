import React, { useEffect, useRef } from 'react';

const BackgroundEffects = () => {
  const cursorRef = useRef(null);

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

  return (
    <>
      <div className="circuit-layer"></div>
      
      {/* Background Logo Watermark */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.07]">
        <img 
          src="/logo.jpg" 
          alt="" 
          className="w-[90vw] max-w-[800px] h-[90vw] max-h-[800px] object-cover rounded-full mix-blend-screen"
          style={{ filter: 'blur(3px)' }}
        />
      </div>

      <div className="cursor-glow" id="cursor-glow" ref={cursorRef}></div>
      <div className="grain-layer"></div>
      
      <div className="circuit-node" style={{ top: '18%', left: '8%', animationDelay: '0s' }}></div>
      <div className="circuit-node" style={{ top: '32%', left: '92%', animationDelay: '0.8s' }}></div>
      <div className="circuit-node" style={{ top: '68%', left: '6%', animationDelay: '1.6s' }}></div>
      <div className="circuit-node" style={{ top: '82%', left: '88%', animationDelay: '2.4s' }}></div>
      <div className="circuit-node" style={{ top: '48%', left: '50%', animationDelay: '3.2s' }}></div>
    </>
  );
};

export default BackgroundEffects;
