const FAQS = [
  {
    q: "What actually happens after I buy?",
    a: "The confirmation page appears the second the payment clears, with the workflow JSON, a setup checklist, and the env vars you'll need. Import it into your own n8n or Make account and it's running. Nothing is hosted by me, so there's no account to be locked out of.",
  },
  {
    q: "Do I need to talk to anyone first?",
    a: "No — and that's the point of the try-it box above. Run it on your own data, decide, buy. The only thing on this page that needs a call is a custom build, because scoping that honestly can't be done through a form.",
  },
  {
    q: "Is there support, or am I on my own?",
    a: "[30 days] of fixes included: if it breaks or behaves differently than the demo, I fix it. After that, you can buy an hour when you need one. I answer my own email — there is no ticket queue, because there is no team.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes — [14 days], no argument, even if the reason is “I changed my mind.” You tried it before you bought it, so refunds are rare, which is exactly why I can offer that.",
  },
  {
    q: "Why three payment options and no Stripe?",
    a: "Because buyers are in three regions where the local default differs. Revolut covers Europe and the UK, GCash (via PayMongo) covers the Philippines, and PayNow via HitPay covers Singapore — including MariBank. Each generates a fresh QR per order that confirms itself, which a personal wallet QR can't do.",
  },
  {
    q: "I'm buying software from one person. What if you disappear?",
    a: "You get the workflow file itself, not access to my server. If I vanish tomorrow, everything you bought keeps running on your own accounts. That's a deliberate design choice, not a happy accident.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-line py-16 sm:py-20">
      <div className="shell grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div>
          <p className="eyebrow">Objections</p>
          <h2 className="mt-3 text-section font-semibold">
            The questions you&apos;d ask before wiring money to a stranger.
          </h2>
          <p className="mt-4 text-ink-soft">
            Fair questions. Here are the answers I&apos;d want if I were the one
            buying.
          </p>
        </div>

        <ul className="divide-y divide-line border-y border-line">
          {FAQS.map((faq) => (
            <li key={faq.q}>
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium marker:content-none">
                  {faq.q}
                  <span
                    aria-hidden
                    className="mt-1 shrink-0 font-mono text-ink-muted transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2.5 max-w-2xl leading-relaxed text-ink-soft">
                  {faq.a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
