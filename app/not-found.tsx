import Link from "next/link";

import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main" className="shell py-24">
        <p className="eyebrow">404 · no node here</p>
        <h1 className="mt-3 text-section font-semibold">
          That page isn&apos;t wired up.
        </h1>
        <p className="mt-4 max-w-lg text-ink-soft">
          The shelf is where everything lives — four workflows, all of them
          runnable before you pay.
        </p>
        <Link href="/#products" className="btn-solid mt-8">
          See the workflows
        </Link>
      </main>
      <Footer />
    </>
  );
}
