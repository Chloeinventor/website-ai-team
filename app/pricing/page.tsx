import type { Metadata } from "next";

import { Faq } from "@/components/faq";
import { FinalCta } from "@/components/final-cta";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Pricing } from "@/components/pricing";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Pricing — ${SITE.name}`,
  description:
    "One-time prices for every workflow, in EUR, PHP and SGD. Plus the custom-build option for the workflow that doesn't exist yet.",
};

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <div className="shell pt-10">
          <p className="eyebrow">Pricing</p>
          <h1 className="mt-3 max-w-3xl text-balance text-display font-semibold">
            Every price, every rail, on one screen.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            Buy once and keep it. The only thing that recurs is the custom-build
            retainer, and only if you want me on call.
          </p>
        </div>
        <Pricing heading={false} />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
