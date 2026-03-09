import "./globals.css";
import Providers from "./providers";
import { ReactNode } from "react";
import FaviconSwitcher from "@/app/utils/FaviconSwitcher";
import Script from 'next/script'
export const metadata = {
  title: "Ponte Tech",
  description:
    "Oferecemos outsourcing de profissionais de TI para transformar desafios complexos em soluções eficientes, produtivas e de alta qualidade.",
  icons: {
    icon: "/favicon/1.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WNDZZKQL"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* AVISO: Se houver erro "Duplicate Pixel ID" no console, verifique a configuração
            do Google Tag Manager (GTM-WNDZZKQL) para garantir que o Meta Pixel
            (ID: 1039157967847630) não esteja sendo inicializado mais de uma vez */}
        <Script id="gtm-script" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WNDZZKQL');
          `}
        </Script>
        <FaviconSwitcher />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
