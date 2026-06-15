import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "./context/UserContext";

export const metadata: Metadata = {
  title: ".merge — find your next team",
  description: "For your next genius masterplan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Questrial&display=swap" rel="stylesheet" />
        {/* Satoshi is served via Fontshare */}
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
