import type { ProductStep } from "@/lib/products";

/**
 * Node-type → accent. Kept out of any "use client" file so server components
 * can read it too (React refuses to let a server component dot into a client
 * module's exports).
 */
export const NODE_COLOR: Record<
  ProductStep["kind"],
  { dot: string; text: string; ring: string }
> = {
  trigger: { dot: "bg-node-trigger", text: "text-node-trigger", ring: "ring-node-trigger/25" },
  agent: { dot: "bg-node-agent", text: "text-node-agent", ring: "ring-node-agent/25" },
  action: { dot: "bg-node-action", text: "text-node-action", ring: "ring-node-action/25" },
  output: { dot: "bg-node-output", text: "text-node-output", ring: "ring-node-output/25" },
};
