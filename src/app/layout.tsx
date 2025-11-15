import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "플로우 과제 | 파일 확장자 차단"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`antialiased`}
      >
        <ToastProvider>
        {children}
        </ToastProvider>
      </body>
    </html>
  );
}
