const TESTIMONIALS = [
  {
    stat: "+140%",
    statLabel: "qualified leads / month",
    quote:
      "We were losing inbound in a spreadsheet nobody opened. Now the good ones are on my calendar before I've made coffee, and the vendor spam never reaches me.",
    name: "[Ana Reyes]",
    role: "[Head of Ops, Northwind Ops]",
  },
  {
    stat: "9 hrs",
    statLabel: "back, every week",
    quote:
      "I bought the triage one on a Thursday and it was running Friday morning. It writes replies that sound like me, which I did not expect.",
    name: "[Tom Whitcombe]",
    role: "[Founder, Kettle & Co]",
  },
  {
    stat: "3×",
    statLabel: "faster proposals out the door",
    quote:
      "The honest bit: I tried it on the site first with a real call transcript, saw it get the scope right, and bought it ten minutes later. No demo call needed.",
    name: "[Priya Nandakumar]",
    role: "[Partner, Baseline Legal]",
  },
];

export function Proof() {
  return (
    <section
      id="proof"
      aria-labelledby="proof-heading"
      className="scroll-mt-24 py-16 sm:py-20"
    >
      <div className="shell">
        <div className="max-w-2xl">
          <p className="eyebrow">Proof</p>
          <h2 id="proof-heading" className="mt-3 text-section font-semibold">
            Same pattern as the logos: a person, and the number they got.
          </h2>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <li key={item.name}>
              <figure className="card flex h-full flex-col p-5">
                <div className="flex items-baseline gap-2 border-b border-line pb-4">
                  <span className="font-mono text-3xl font-medium tracking-tight text-node-agent">
                    {item.stat}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                    {item.statLabel}
                  </span>
                </div>
                <blockquote className="mt-4 flex-1 leading-relaxed text-ink-soft">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-4 border-t border-line pt-4">
                  <span className="block text-sm font-medium">{item.name}</span>
                  <span className="block font-mono text-[11px] text-ink-muted">
                    {item.role}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
