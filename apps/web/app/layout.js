import "./globals.css";
import { Providers } from "@/providers/Providers";

export const metadata = {
  title: {
    default: "AspAIre — Career workspace",
    template: "%s — AspAIre",
  },
  description: "A focused AI workspace for career planning and job search.",
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
