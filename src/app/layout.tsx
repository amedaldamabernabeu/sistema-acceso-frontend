// src/app/layout.tsx
import "./globals.css";
import { Metadata } from "next";
import { ReactNode } from "react";
import { AuthProvider } from "../components/auth/AuthProvider";
import Footer from "@/components/Footer";
import NavbarWrapper from "../components/NavbarWrapper";

export const metadata: Metadata = {
  title: "Sistema de Gestión de Acceso",
  description: "Panel administrativo",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="app-bg">
          <div className="app-shell">

            <AuthProvider>
              <NavbarWrapper />

              {/* Contenido principal */}
              <div style={{ width: "100%", flex: 1 }}>
                {children}
              </div>

              {/* Footer */}
              <Footer />
            </AuthProvider>

          </div>
        </div>
      </body>
    </html>
  );
}
