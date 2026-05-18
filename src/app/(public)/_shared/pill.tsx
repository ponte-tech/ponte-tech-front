import styles from "../landing.module.css";

type PillProps = {
  children: React.ReactNode;
  muted?: boolean;
  accent?: boolean;
};

export const Pill = ({ children, muted = false, accent = false }: PillProps) => (
  <span
    className={`${styles.pill} ${muted ? styles.pillMuted : ""} ${accent ? styles.pillAccent : ""}`}
  >
    {children}
  </span>
);
