import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import ToastProvider from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Noon Attendance — Management Dashboard",
  description:
    "Modern attendance management system powered by Google Sheets. Track student attendance across multiple campuses with real-time sync.",
  keywords: ["attendance", "management", "google sheets", "dashboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gradient-main">
        <AuthProvider>
          <AppProvider>
            <ToastProvider />
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
