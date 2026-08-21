import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import { AuthProvider } from "@/features/auth";
import { ConditionalHeader } from "@/shared/components/layout/ConditionalHeader";
import { ConditionalFooter } from "@/shared/components/layout/ConditionalFooter";
import "./globals.css";

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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable} h-full`}>
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
