import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DevBanner from "@/components/DevBanner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AdvisorTeamProvider } from "@/contexts/AdvisorTeamContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portfolio Doctor",
  description: "Cryptocurrency Portfolio Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const showDevBanner = process.env.NODE_ENV !== "production";
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com";
  const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin";
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Admin@12345";
  return (
    <html lang="en" dir="ltr">
      <body className={inter.className}>
            <LanguageProvider>
              <ThemeProvider>
        <AuthProvider>
          <AdvisorTeamProvider>
                  <ToastProvider>
          {children}
          {showDevBanner ? (
            <DevBanner
              email={adminEmail}
              username={adminUsername}
              password={adminPassword}
            />
          ) : null}
                  </ToastProvider>
          </AdvisorTeamProvider>
        </AuthProvider>
              </ThemeProvider>
            </LanguageProvider>
      </body>
    </html>
  );
}