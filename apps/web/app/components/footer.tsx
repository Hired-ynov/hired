'use client';

import React from 'react';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t mt-auto"
      style={{
        backgroundColor: 'var(--background-secondary)',
        borderColor: 'var(--background-tertiary)',
      }}
    >
      <div className="max-w-[1200px] mx-auto py-8 px-6">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="Hired Logo"
              width={100}
              height={33}
              className="opacity-80"
            />
          </div>

          <nav className="flex gap-8 flex-wrap justify-center">
            <FooterLink href="/politique-confidentialite">
              Politique de confidentialité
            </FooterLink>
            <FooterLink href="/conditions-utilisation">
              Conditions d&apos;utilisation
            </FooterLink>
          </nav>

          <div
            className="w-full h-px my-2"
            style={{ backgroundColor: 'var(--background-tertiary)' }}
          />

          <div
            className="flex items-center justify-center gap-2 text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span>© {currentYear} Hired. Tous droits réservés.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className="text-sm no-underline transition-colors duration-200 cursor-pointer hover:text-[var(--primary)]"
    style={{ color: 'var(--text-secondary)' }}
  >
    {children}
  </a>
);
