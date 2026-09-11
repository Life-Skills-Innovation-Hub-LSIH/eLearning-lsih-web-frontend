import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora, Geist } from "next/font/google";
import { AuthProvider } from "@/features/auth";
import { ConditionalHeader } from "@/shared/components/layout/ConditionalHeader";
import { ConditionalFooter } from "@/shared/components/layout/ConditionalFooter";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Life Skills Innovation Hub";

export const metadata: Metadata = {
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description: "E-Learning platform by Life Skills Innovation Hub",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-full", bodyFont.variable, displayFont.variable, "font-sans", geist.variable)}>
      <body className="flex min-h-full flex-col antialiased">
        <AuthProvider>
          <ConditionalHeader />
          <div className="flex-1">{children}</div>
          <ConditionalFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
