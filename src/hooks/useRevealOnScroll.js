import { useEffect } from 'react';

/**
 * Custom hook to observe elements with class '.reveal' and add '.in-view' when visible.
 */
export function useRevealOnScroll(threshold = 0.1, rootMargin = '0px 0px -50px 0px') {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals || reveals.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold, rootMargin }
    );

    reveals.forEach((el) => observer.observe(el));

    return () => {
      reveals.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [threshold, rootMargin]);
}

export default useRevealOnScroll;
