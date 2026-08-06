import Link from "next/link";

import { PRODUCTS } from "@/lib/products";
import { SITE } from "@/lib/site";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Products",
    links: PRODUCTS.map((product) => ({
      label: product.name,
      href: `/products/${product.slug}`,
    })),
  },
  {
    title: "Resources",
    links: [
      { label: "Try the sandbox", href: "/#try" },
      { label: "How it works", href: "/#how" },
      { label: "Setup notes", href: "/#faq" },
      { label: "Payment rails", href: "/#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Who builds this", href: "/#proof" },
      { label: "Custom builds", href: "/pricing" },
      { label: "Book 30 minutes", href: SITE.bookingUrl },
      { label: SITE.email, href: `mailto:${SITE.email}` },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "[Terms]", href: "/#faq" },
      { label: "[Privacy]", href: "/#faq" },
      { label: "[Refund policy]", href: "/#faq" },
      { label: "[Licence]", href: "/#faq" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper/70">
      <div className="shell grid gap-10 py-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2.6fr)]">
        <div>
          <p className="text-lg font-semibold tracking-tight">{SITE.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
            Automations and AI agents, built and sold by one person —{" "}
            {SITE.builder}. A developer who speaks business, and a business that
            answers its own email.
          </p>
          <p className="mt-4 flex flex-wrap gap-2">
            <span className="chip">revolut</span>
            <span className="chip">gcash</span>
            <span className="chip">paynow</span>
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                {column.title}
              </p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-soft transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-2 py-5 font-mono text-[11px] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© [2026] {SITE.name}. Built solo, sold direct.</p>
          <p>Placeholder content in [brackets] — replace before launch.</p>
        </div>
      </div>
    </footer>
  );
}
