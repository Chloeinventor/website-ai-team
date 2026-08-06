const NODES = [
  {
    x: 12,
    y: 18,
    accent: "#E08A17",
    kind: "trigger",
    title: "Form submitted",
    detail: "webhook · instant",
  },
  {
    x: 136,
    y: 116,
    accent: "#0E9D93",
    kind: "action",
    title: "Enrich company",
    detail: "domain → firmographics",
  },
  {
    x: 260,
    y: 214,
    accent: "#6D4AFF",
    kind: "agent",
    title: "Score against ICP",
    detail: "your rules, in English",
  },
  {
    x: 384,
    y: 312,
    accent: "#EC5A38",
    kind: "output",
    title: "Book · nurture · decline",
    detail: "always writes back",
  },
] as const;

const NODE_W = 164;
const NODE_H = 60;

/**
 * The hero illustration is the product's own vernacular: a workflow canvas with
 * four real nodes from [Inbound Lead Qualifier]. Drawn as one SVG so it scales
 * to any width without reflowing, and animated only on the wires — the quiet
 * half of the page's motion budget. The loud half is the try-it widget.
 */
export function WorkflowCanvas({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 400"
      className={`h-auto w-full ${className}`}
      role="img"
      aria-label="A four-node automation workflow: a form submission triggers company enrichment, an agent scores the lead against your ideal customer profile, and the last node books, nurtures, or declines."
    >
      <defs>
        <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(21,27,38,0.10)" />
        </pattern>
        <filter id="nodeShadow" x="-20%" y="-40%" width="140%" height="200%">
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="8"
            floodColor="#151B26"
            floodOpacity="0.10"
          />
        </filter>
      </defs>

      <rect width="560" height="400" fill="url(#dots)" />

      {/* Wires first, so nodes sit on top of them. */}
      <g fill="none" strokeWidth="1.75">
        {NODES.slice(0, -1).map((node, index) => {
          const next = NODES[index + 1];
          const x1 = node.x + NODE_W;
          const y1 = node.y + NODE_H / 2;
          const x2 = next.x;
          const y2 = next.y + NODE_H / 2;
          const d = `M${x1},${y1} C${x1 + 46},${y1} ${x2 - 46},${y2} ${x2},${y2}`;

          return (
            <g key={node.title}>
              <path d={d} stroke="#C6CFDF" />
              <path
                d={d}
                stroke={next.accent}
                strokeDasharray="5 7"
                strokeLinecap="round"
                className="animate-dash"
                style={{ animationDelay: `${index * 0.18}s` }}
                opacity="0.9"
              />
            </g>
          );
        })}
      </g>

      {NODES.map((node) => (
        <g key={node.title} filter="url(#nodeShadow)">
          <rect
            x={node.x}
            y={node.y}
            width={NODE_W}
            height={NODE_H}
            rx="13"
            fill="#FFFFFF"
            stroke="#DDE3EE"
          />
          <rect
            x={node.x + 12}
            y={node.y + 18}
            width="24"
            height="24"
            rx="7"
            fill={node.accent}
            opacity="0.14"
          />
          <circle cx={node.x + 24} cy={node.y + 30} r="4.5" fill={node.accent} />
          <text
            x={node.x + 46}
            y={node.y + 26}
            className="fill-ink font-sans"
            fontSize="12.5"
            fontWeight="600"
          >
            {node.title}
          </text>
          <text
            x={node.x + 46}
            y={node.y + 42}
            className="fill-ink-muted font-mono"
            fontSize="9.5"
          >
            {node.detail}
          </text>

          {/* Ports — the giveaway that this is a canvas, not a diagram. */}
          <circle cx={node.x} cy={node.y + NODE_H / 2} r="3.5" fill="#FFFFFF" stroke="#C6CFDF" />
          <circle
            cx={node.x + NODE_W}
            cy={node.y + NODE_H / 2}
            r="3.5"
            fill="#FFFFFF"
            stroke="#C6CFDF"
          />
        </g>
      ))}

      {/* Run ticker, bottom-left: proof that the canvas is a running thing. */}
      <g>
        <rect
          x="12"
          y="330"
          width="196"
          height="42"
          rx="11"
          fill="#FFFFFF"
          stroke="#DDE3EE"
        />
        <circle cx="30" cy="351" r="4" fill="#0E9D93" className="animate-pulseNode" />
        <text x="44" y="347" className="fill-ink font-mono" fontSize="10">
          [214] runs this week
        </text>
        <text x="44" y="361" className="fill-ink-muted font-mono" fontSize="9">
          last one 38s ago · 0 errors
        </text>
      </g>
    </svg>
  );
}
