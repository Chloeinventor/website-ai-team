import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { StoreProvider } from "@/components/store-provider";
import { providerSummaries } from "@/lib/payments";
import { SITE } from "@/lib/site";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/** Mono isn't decoration here — it's the workflow-editor voice: labels, refs, prices. */
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description:
    "Ready-made AI workflows for lead qualification, inbox triage, proposals and ops monitoring. Try one in your browser with no signup, buy it with Revolut, GCash or PayNow.",
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description:
      "Try an AI workflow in your browser. No card, no call. Buy the one that earns it.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read once on the server: which rails have live keys today.
  const providers = providerSummaries();

  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[10px] focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <StoreProvider providers={providers}>{children}</StoreProvider>
      </body>
    </html>
  );
}
