"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useStore } from "@/components/store-provider";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/#products", label: "Products" },
  { href: "/#how", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "Docs" },
];

export function Nav() {
  const { openBuy, openTry } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors ${
        scrolled
          ? "border-line bg-canvas/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="shell flex h-[68px] items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <Mark />
          <span>{SITE.name}</span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-ink-soft transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2.5 md:flex">
          <button type="button" className="btn-ghost btn-sm" onClick={() => openTry()}>
            Try free
          </button>
          <button type="button" className="btn-solid btn-sm" onClick={() => openBuy()}>
            Buy now
          </button>
        </div>

        <button
          type="button"
          className="rounded-lg border border-line-strong bg-paper px-3 py-2 font-mono text-xs md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "close" : "menu"}
        </button>
      </nav>

      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-canvas md:hidden">
          <ul className="shell flex flex-col py-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 text-ink-soft"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="shell flex gap-2.5 pb-4">
            <button
              type="button"
              className="btn-ghost btn-sm flex-1"
              onClick={() => {
                setOpen(false);
                openTry();
              }}
            >
              Try free
            </button>
            <button
              type="button"
              className="btn-solid btn-sm flex-1"
              onClick={() => {
                setOpen(false);
                openBuy();
              }}
            >
              Buy now
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

/** Three nodes and the wire between them. The whole brand in 20px. */
function Mark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden className="shrink-0">
      <rect x="0.5" y="0.5" width="25" height="25" rx="7" fill="#151B26" />
      <path
        d="M6 8.5h5M15 8.5h5M6 17.5h5M15 17.5h5"
        stroke="#5A6273"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="7" cy="8.5" r="2.4" fill="#E08A17" />
      <circle cx="13" cy="13" r="3" fill="#6D4AFF" />
      <circle cx="19" cy="17.5" r="2.4" fill="#0E9D93" />
      <path d="M9.4 9.6 11.2 11.4M14.8 14.6l1.8 1.8" stroke="#8891A3" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
