const CLIENTS = [
  { name: "[Northwind Freight]", stat: "[£18.4k] recovered in [Q1]" },
  { name: "[Harbour Lines]", stat: "[92%] of invoices auto-cleared" },
  { name: "[Meridian Logistics]", stat: "POD chase [11 days → 2]" },
  { name: "[Kettle Distribution]", stat: "carrier review, [0] hours" },
  { name: "[Pilcrow Haulage]", stat: "[3.1%] of spend disputed" },
  { name: "[Baseline 3PL]", stat: "quotes out in [40 min]" },
];

/**
 * Hover (or tab to) a name and it flips to the number it earned. The stat is
 * the point; the logo is just the handle you grab it by.
 */
export function TrustBar() {
  return (
    <section aria-labelledby="trust-heading" className="border-y border-line bg-paper/60 py-8">
      <h2 id="trust-heading" className="sr-only">
        What these workflows did for other people
      </h2>

      <p className="shell mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
        running quietly at — hover for the number
      </p>

      <div className="group mask-fade-x overflow-hidden">
        <ul className="flex w-max animate-marquee items-center gap-3 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
          {[...CLIENTS, ...CLIENTS].map((client, index) => (
            <li key={`${client.name}-${index}`}>
              <button
                type="button"
                aria-label={`${client.name}: ${client.stat}`}
                className="group/item relative block cursor-default rounded-node border border-line bg-paper px-5 py-3 text-left transition-colors hover:border-node-agent focus-visible:border-node-agent"
              >
                <span className="block whitespace-nowrap font-medium text-ink-soft transition-opacity duration-200 group-hover/item:opacity-0 group-focus-visible/item:opacity-0">
                  {client.name}
                </span>
                <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap px-5 font-mono text-sm text-node-agent opacity-0 transition-opacity duration-200 group-hover/item:opacity-100 group-focus-visible/item:opacity-100">
                  {client.stat}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
