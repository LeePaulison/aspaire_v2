import "./globals.css";
import { Providers } from "@/providers/Providers";

export const metadata = {
  title: {
    default: "sAIgely — AI chat",
    template: "%s — sAIgely",
  },
  description: "A focused workspace for thoughtful AI conversations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col h-screen w-screen bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
