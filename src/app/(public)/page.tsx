import { Inter, Roboto_Mono } from "next/font/google";
import styles from "./landing.module.css";
import { Nav } from "./sections/nav";
import { Hero } from "./sections/hero";
import { Produtos } from "./sections/produtos";
import { OFazemos } from "./sections/o-fazemos";
import { Academy } from "./sections/academy";
import { Numbers } from "./sections/numbers";
import { Prova } from "./sections/prova";
import { Cta } from "./sections/cta";
import { Footer } from "./sections/footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export default function HomePage() {
  return (
    <div className={`${inter.variable} ${robotoMono.variable} ${styles.shell}`}>
      <div className={styles.page}>
        <Nav />
        <Hero />
        <div className={styles.midbgGlow} />
        <Produtos />
        <OFazemos />
        <Academy />
        <Numbers />
        <Prova />
        <Cta />
        <Footer />
      </div>
    </div>
  );
}
