import { Faq } from "@/components/faq";
import { FinalCta } from "@/components/final-cta";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Nav } from "@/components/nav";
import { Pricing } from "@/components/pricing";
import { ProductShelf } from "@/components/product-shelf";
import { Proof } from "@/components/proof";
import { TrustBar } from "@/components/trust-bar";
import { TryItWidget } from "@/components/try-it-widget";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <TrustBar />
        <ProductShelf />
        <TryItWidget />
        <HowItWorks />
        <Proof />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
