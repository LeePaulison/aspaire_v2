import "./globals.css";
import "./styles/base.css";
import "./styles/markdown.css";
import "./styles/dialogs.css";
import "./styles/scroll-area.css";
import "./styles/dropdown-menu.css";
import "./styles/icon-button.css";
import "./styles/resume.css";
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
