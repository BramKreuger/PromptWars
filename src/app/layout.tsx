import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptWars",
  description:
    "A multiplayer AI game where you write prompts to control your character",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <div className="crt-overlay" />
        {children}
      </body>
    </html>
  );
}
