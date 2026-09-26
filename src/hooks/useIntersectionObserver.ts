import { useState, useEffect, useRef } from 'react';

export interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Custom hook implementing the browser Intersection Observer API.
 * Automatically handles root viewport detection for full-screen window
 * as well as inside scrollable containers (e.g. PhoneSimulator).
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>({
  threshold = 0.05,
  rootMargin = '0px 0px -15px 0px',
  triggerOnce = true,
}: UseIntersectionObserverOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Graceful fallback if IntersectionObserver is not supported
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsIntersecting(true);
      return;
    }

    // Auto-detect closest scrollable ancestor container (e.g. #phone-screen-scroll-container in PhoneSimulator)
    let rootContainer: Element | null = null;
    const phoneContainer = document.getElementById('phone-screen-scroll-container');
    if (phoneContainer && phoneContainer.contains(el)) {
      rootContainer = phoneContainer;
    } else {
      let parent = el.parentElement;
      while (parent && parent !== document.body && parent !== document.documentElement) {
        const style = window.getComputedStyle(parent);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          rootContainer = parent;
          break;
        }
        parent = parent.parentElement;
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            setIsIntersecting(false);
          }
        });
      },
      {
        root: rootContainer, // null targets browser viewport, or custom scroll container
        threshold,
        rootMargin,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { elementRef, isIntersecting };
}
