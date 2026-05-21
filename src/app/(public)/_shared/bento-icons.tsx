import type { ReactNode } from "react";

type IconProps = { size?: number };

const wrap = (path: ReactNode, size = 22) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {path}
  </svg>
);

export const IconLaptop = ({ size }: IconProps) => wrap(
  <>
    <rect x="3" y="5" width="18" height="11" rx="1.5" />
    <path d="M2 19h20" />
  </>, size,
);

export const IconSync = ({ size }: IconProps) => wrap(
  <>
    <path d="M4 12a8 8 0 0 1 14-5.3" />
    <path d="M18 3v4h-4" />
    <path d="M20 12a8 8 0 0 1-14 5.3" />
    <path d="M6 21v-4h4" />
  </>, size,
);

export const IconChart = ({ size }: IconProps) => wrap(
  <>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
  </>, size,
);

export const IconShieldLock = ({ size }: IconProps) => wrap(
  <>
    <path d="M12 3l8 3v6c0 4.5-3.4 7.8-8 9-4.6-1.2-8-4.5-8-9V6l8-3z" />
    <rect x="9" y="11" width="6" height="5" rx="1" />
    <path d="M10.5 11V9a1.5 1.5 0 0 1 3 0v2" />
  </>, size,
);

export const IconWrench = ({ size }: IconProps) => wrap(
  <>
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5z" />
  </>, size,
);

export const IconClock = ({ size }: IconProps) => wrap(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>, size,
);

export const IconDollar = ({ size }: IconProps) => wrap(
  <>
    <path d="M12 3v18" />
    <path d="M16 7H10a2.5 2.5 0 0 0 0 5h4a2.5 2.5 0 0 1 0 5H7" />
  </>, size,
);

export const IconTarget = ({ size }: IconProps) => wrap(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
  </>, size,
);

export const IconUsers = ({ size }: IconProps) => wrap(
  <>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M21 19c0-2.5-1.8-4.5-4-5" />
  </>, size,
);

export const IconCap = ({ size }: IconProps) => wrap(
  <>
    <path d="M2 9l10-4 10 4-10 4-10-4z" />
    <path d="M6 11v4c0 1.6 2.7 3 6 3s6-1.4 6-3v-4" />
    <path d="M22 9v6" />
  </>, size,
);

export const IconUser = ({ size }: IconProps) => wrap(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </>, size,
);

export const IconChartUp = ({ size }: IconProps) => wrap(
  <>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </>, size,
);

export const IconShieldCheck = ({ size }: IconProps) => wrap(
  <>
    <path d="M12 3l8 3v6c0 4.5-3.4 7.8-8 9-4.6-1.2-8-4.5-8-9V6l8-3z" />
    <path d="M9 12l2 2 4-4" />
  </>, size,
);

export const IconRocket = ({ size }: IconProps) => wrap(
  <>
    <path d="M14 14L5 21l1-5 8-8" />
    <path d="M19 5l-9 9 5 5c4-1 5-5 5-9V5h-1z" />
    <circle cx="15" cy="9" r="1.2" />
  </>, size,
);

export const IconHeadset = ({ size }: IconProps) => wrap(
  <>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="3" y="14" width="4" height="6" rx="1" />
    <rect x="17" y="14" width="4" height="6" rx="1" />
    <path d="M20 20v1a3 3 0 0 1-3 3h-2" />
  </>, size,
);
