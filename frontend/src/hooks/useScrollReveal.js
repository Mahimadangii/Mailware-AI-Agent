// src/hooks/useScrollReveal.js
import { useEffect, useRef } from "react";

/**
 * useScrollReveal — attaches an IntersectionObserver to a ref.
 * Adds the "visible" class when the element enters the viewport.
 * Use with the .reveal CSS class defined in global styles.
 *
 * @param {number} threshold - 0–1, fraction of element visible before triggering
 * @returns React ref to attach to your element
 */
export function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el); // fire once only
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}

/**
 * useCountUp — animates a number from 0 to `target` when `trigger` is true.
 * @param {number} target
 * @param {boolean} trigger
 * @param {number} duration - ms
 * @returns current display value (string)
 */
export function useCountUp(target, trigger, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let startTime = null;
    const isFloat = String(target).includes(".");
    const decimals = isFloat ? 1 : 0;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((target * eased).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [target, trigger, duration]);

  return value;
}


