import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppProvider";
import DashboardLayout from "@/components/DashboardLayout";
import { ToastProvider } from "../context/ToastContext";
import Toast from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Library Management System",
  description: "Modern library management system with a beautiful dark theme",
};

// Keep the root layout as a server component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ToastProvider>
          <AppProvider>
            <DashboardLayout>{children}</DashboardLayout>
            <Toast />
          </AppProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
