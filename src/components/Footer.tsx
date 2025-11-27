"use client";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-glass">
      Desarrollado por Universidad de Guadalajara — Centro Universitario de los Valles © {year}
    </footer>
  );
}
