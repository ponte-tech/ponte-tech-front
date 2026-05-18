import type { Trilha } from "./data";

const ASSET: Record<Trilha["iconKind"], string> = {
  react: "/assets/landing/react-avancado.svg",
  devops: "/assets/landing/devops.svg",
  python: "/assets/landing/python-ai.svg",
  arch: "/assets/landing/arquitetura.svg",
};

const ALT: Record<Trilha["iconKind"], string> = {
  react: "React Avançado",
  devops: "DevOps com AWS",
  python: "Python para IA",
  arch: "Arquitetura de Software",
};

export const TrilhaIcon = ({ kind }: { kind: Trilha["iconKind"] }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={ASSET[kind]} alt={ALT[kind]} width={32} height={32} />
);
