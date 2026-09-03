import { useEffect } from 'react';

/**
 * Custom hook to observe elements with class '.reveal' and add '.in-view' when visible.
 */
export function useRevealOnScroll(threshold = 0.05, rootMargin = '0px 0px 0px 0px') {
  useEffect(() => {
    const handleObserver = () => {
      const reveals = document.querySelectorAll('.reveal:not(.in-view)');
      if (!reveals || reveals.length === 0) return;

      reveals.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= (window.innerHeight || document.documentElement.clientHeight) + 100 && rect.bottom >= 0) {
          el.classList.add('in-view');
        }
      });
    };

    // Instant execution on next animation frame
    requestAnimationFrame(handleObserver);
    handleObserver();

    window.addEventListener('scroll', handleObserver, { passive: true });
    window.addEventListener('resize', handleObserver, { passive: true });
    window.addEventListener('pageshow', handleObserver);
    window.addEventListener('popstate', handleObserver);
    const timer = setInterval(handleObserver, 150);

    return () => {
      window.removeEventListener('scroll', handleObserver);
      window.removeEventListener('resize', handleObserver);
      window.removeEventListener('pageshow', handleObserver);
      window.removeEventListener('popstate', handleObserver);
      clearInterval(timer);
    };
  }, [threshold, rootMargin]);
}

export default useRevealOnScroll;
