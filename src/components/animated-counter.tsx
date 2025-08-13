
"use client";

import { useEffect, useState, useRef } from 'react';

type AnimatedCounterProps = {
  value: number;
  className?: string;
};

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const [count, setCount] = useState(value); // Start with final value for SSR/no-JS
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Animate only once
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isInView) {
      setCount(0); // Reset to start animation from 0
      const animationDuration = 1500; // 1.5 seconds
      const frameDuration = 1000 / 60; // 60 fps
      const totalFrames = Math.round(animationDuration / frameDuration);
      let frame = 0;

      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const currentCount = Math.round(value * progress);
        setCount(currentCount);

        if (frame === totalFrames) {
          clearInterval(counter);
          setCount(value); // Ensure it ends on the exact value
        }
      }, frameDuration);

      return () => clearInterval(counter);
    }
  }, [isInView, value]);

  return <span ref={ref} className={className}>{count.toLocaleString()}</span>;
}
