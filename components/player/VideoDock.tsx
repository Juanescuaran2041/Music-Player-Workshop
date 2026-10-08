"use client";

import { ReactNode, useEffect, useRef } from "react";

type Props = {
  slot: HTMLElement | null;
  children: ReactNode;
};

export default function VideoDock({ slot, children }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (!slot) {
      frame.style.visibility = "hidden";
      return;
    }

    const place = () => {
      const rect = slot.getBoundingClientRect();
      frame.style.visibility = rect.width > 0 ? "visible" : "hidden";
      frame.style.top = `${rect.top}px`;
      frame.style.left = `${rect.left}px`;
      frame.style.width = `${rect.width}px`;
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(slot);
    observer.observe(document.body);
    window.addEventListener("scroll", place, { capture: true, passive: true });
    window.addEventListener("resize", place);
    document.addEventListener("animationend", place, true);
    document.addEventListener("transitionend", place, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", place, { capture: true });
      window.removeEventListener("resize", place);
      document.removeEventListener("animationend", place, true);
      document.removeEventListener("transitionend", place, true);
    };
  }, [slot]);

  return (
    <div
      ref={frameRef}
      className="fixed z-40"
      style={{ visibility: "hidden", top: 0, left: 0, width: 0 }}
    >
      {children}
    </div>
  );
}
