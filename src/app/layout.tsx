import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paw Pinxel",
  description: "Registros veterinarios digitales con perfiles públicos para mascotas."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
