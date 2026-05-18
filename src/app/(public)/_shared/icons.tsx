import styles from "../landing.module.css";

export const ChevronRight = () => (
  <span className={styles.ico}>
    <svg viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

export const DotsGrid = () => (
  <span className={styles.ico}>
    <svg viewBox="0 0 16 16" fill="none">
      {[3.5, 8, 12.5].flatMap((y) =>
        [3.5, 8, 12.5].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill="currentColor" />),
      )}
    </svg>
  </span>
);

export const Check = () => (
  <span className={styles.check}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="check-grad" x1="10" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2FB8FF" />
          <stop offset="1" stopColor="#9EECD9" />
        </linearGradient>
      </defs>
      <circle cx="10" cy="10" r="9" stroke="url(#check-grad)" strokeWidth="1.5" />
      <path d="M6 10l3 3 5-6" stroke="url(#check-grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

export const Star = () => <span className={styles.star}>✦</span>;

export const Logo = () => (
  <a className={styles.logo} href="#" aria-label="Ponte Tech">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className={styles.logoImg} src="/assets/landing/logo-negative.svg" alt="Ponte Tech" width={74} height={32} />
  </a>
);
