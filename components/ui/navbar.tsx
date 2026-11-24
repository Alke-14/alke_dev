'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, Sliders, X } from 'lucide-react';

const navLinks = [
  { name: 'Projects', href: '/projects' },
  { name: 'Writing & Hobbies', href: '/writing' },
  { name: 'Log', href: '/updates' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const isOpen = openForPath === pathname;
  const showAdminLinks = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenForPath(null);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  // Do not render site navbar inside the Keystatic admin interface
  if (pathname?.startsWith('/keystatic')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <Link
            href="/"
            onClick={() => setOpenForPath(null)}
            className="group font-mono text-sm tracking-tight font-medium inline-flex items-center gap-2 text-foreground whitespace-nowrap shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-primary ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all shadow-sm shrink-0" />
            <span>alke.dev</span>
            <span className="text-[10px] hidden sm:inline-block font-mono px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300 font-medium whitespace-nowrap">
              RX-105 // Ξ
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden sm:flex items-center gap-5 text-xs font-mono">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`whitespace-nowrap transition-colors py-1 ${
                    isActive
                      ? 'text-primary font-semibold border-b-2 border-primary -mb-[1px]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {showAdminLinks && (
            <Link
              href="/keystatic"
              title="Keystatic Admin CMS"
              aria-label="Keystatic Admin CMS"
              className="hidden sm:inline-flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary/60"
            >
              <Sliders className="w-4 h-4" />
            </Link>
          )}
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpenForPath((prev) => (prev === pathname ? null : pathname))}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="sm:hidden inline-flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors rounded-md"
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden border-t border-border/60 bg-background/95 backdrop-blur-md">
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="max-w-3xl mx-auto px-4 py-3 flex flex-col gap-1 font-mono text-xs"
          >
            {[
              { name: 'Home', href: '/' },
              ...navLinks,
            ].map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpenForPath(null)}
                  className={`flex items-center justify-between px-3 min-h-[44px] rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </Link>
              );
            })}

            {showAdminLinks && (
              <>
                <div className="border-t border-border/50 my-1.5" />

                <Link
                  href="/keystatic"
                  onClick={() => setOpenForPath(null)}
                  className="flex items-center justify-between px-3 min-h-[44px] rounded-md text-muted-foreground hover:text-primary hover:bg-secondary/60 transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>CMS Admin</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300">
                    RX-105 // Ξ
                  </span>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
