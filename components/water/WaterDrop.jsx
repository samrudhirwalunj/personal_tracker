"use client";

import { useId } from "react";

const DROP_PATH = "M12 2c4 5 7 8.5 7 12.5A7 7 0 0 1 5 14.5C5 10.5 8 7 12 2Z";

export default function WaterDrop({ percent = 0, size = 26 }) {
  const clipId = useId();
  const clamped = Math.max(0, Math.min(1, percent));
  const fillY = 24 - 24 * clamped;
  const fillHeight = 24 * clamped;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d={DROP_PATH} fill="var(--surface-1)" stroke="var(--border-strong)" strokeWidth="1.2" />
      <clipPath id={clipId}>
        <rect x="0" y={fillY} width="24" height={fillHeight} />
      </clipPath>
      <path d={DROP_PATH} fill="var(--fill-accent)" clipPath={`url(#${clipId})`} />
    </svg>
  );
}
