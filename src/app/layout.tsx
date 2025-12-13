import type { Metadata } from "next";
import { Nunito, Comfortaa } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SkazkaAI — Сказки голосом мамы и папы",
  description:
    "Персонализированные аудиосказки для вашего ребёнка, озвученные клонированным голосом родителя. Создайте волшебную историю за 5 минут.",
  keywords: ["сказки", "аудиосказки", "дети", "родители", "ИИ", "голос", "клонирование голоса"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${nunito.variable} ${comfortaa.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
