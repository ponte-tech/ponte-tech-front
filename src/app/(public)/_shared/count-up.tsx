"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CountUpProps = {
  value: string;
  duration?: number;
};

const parse = (raw: string) => {
  const match = raw.match(/^([^\d.,]*)([\d.,]+)(.*)$/);
  if (!match) return null;
  const [, prefix, num, suffix] = match;
  const target = parseFloat(num.replace(",", "."));
  if (Number.isNaN(target)) return null;
  const decimals = (num.split(".")[1] || "").length;
  return { prefix, target, suffix, decimals };
};

export const CountUp = ({ value, duration = 1500 }: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const parsed = useMemo(() => parse(value), [value]);
  const [display, setDisplay] = useState(() => {
    if (!parsed) return value;
    return `${parsed.prefix}${(0).toFixed(parsed.decimals)}${parsed.suffix}`;
  });

  useEffect(() => {
    if (!parsed) return;
    const node = ref.current;
    if (!node) return;
    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            observer.disconnect();
            const start = performance.now();
            const tick = (now: number) => {
              const elapsed = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - elapsed, 3);
              const current = parsed.target * eased;
              setDisplay(`${parsed.prefix}${current.toFixed(parsed.decimals)}${parsed.suffix}`);
              if (elapsed < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [parsed, duration]);

  return <span ref={ref}>{display}</span>;
};
