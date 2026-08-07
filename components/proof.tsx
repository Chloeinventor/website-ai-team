const TESTIMONIALS = [
  {
    stat: "[£18.4k]",
    statLabel: "recovered in one quarter",
    quote:
      "We assumed our rates were being honoured because checking every invoice by hand was impossible. It paid for itself on the second invoice it read, and the demurrage line alone was worth four figures.",
    name: "[Ana Reyes]",
    role: "[Head of Ops, Northwind Freight]",
  },
  {
    stat: "[2 days]",
    statLabel: "to chase a POD, down from [11]",
    quote:
      "The cash was never missing, it was sitting behind PDFs nobody had time to ask for. Now the chases go out on their own and stop the moment the document lands.",
    name: "[Tom Whitcombe]",
    role: "[Finance Lead, Meridian Logistics]",
  },
  {
    stat: "[0 hrs]",
    statLabel: "spent building the carrier review",
    quote:
      "The honest bit: I pasted a real invoice into the box on the website, watched it find a surcharge overcharge I'd have paid, and bought it ten minutes later. No demo call needed.",
    name: "[Priya Nandakumar]",
    role: "[Director, Baseline 3PL]",
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
