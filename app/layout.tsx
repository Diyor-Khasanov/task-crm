import type { Metadata } from "next";
import { AuthProvider } from "./context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "CorpCRM - Role-Based CRM Portal",
  description: "Secure, ultra-minimalistic CRM application with role-based access control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased bg-black text-neutral-100"
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-neutral-800 selection:text-white bg-black">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
