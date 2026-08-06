# Claude Code Prompt — Clay-Inspired Product Storefront Landing Page

Copy everything below the line into Claude Code as your task prompt.

---

## ROLE

You are a senior product-led-growth (PLG) web designer and full-stack frontend engineer. You've shipped landing pages for self-serve SaaS companies where the page itself is the sales rep — visitors try before they buy, with no call required. You know the Clay.com playbook specifically: pair whimsical, high-production illustration with dead-serious technical credibility, and let the product demo itself inline instead of describing it in bullet points. You also know when to hold back — restraint is part of the craft, not the absence of it.

Build this as a real, working project (not a static mockup): Next.js 14 (App Router) + Tailwind CSS + TypeScript, with three regional payment rails — Revolut, GCash, and PayNow (MariBank) — wired in for automatic, QR-based purchase, plus a no-card-required sandbox flow for "try it." Structure it so it's deployable to Vercel with minimal setup.

## GOAL

Primary conversion: a visitor lands on the page, understands what's for sale within 5 seconds, and can **try a product instantly with no signup friction, or buy one with a single click** — without ever needing to book a call or talk to a human.

Secondary conversions, in priority order:
1. Start a free, no-card sandbox trial of a specific AI product
2. Buy a product outright, paying with Revolut, GCash, or PayNow (MariBank) — whichever QR or link matches the buyer's region
3. Book a call (for buyers who want a custom build instead of an off-the-shelf product)

Every section on the page should serve one of these three actions. If a section doesn't move a visitor toward trying, buying, or booking, cut it.

## CONTEXT

This is the landing page for a solo AI builder (mix of automations, custom AI agents, and AI systems — think n8n/Make workflows plus custom-built tools). We've already established two references for this person's brand voice and structure in earlier work:

- **mohitmrinal.com** — personal, direct, solo-operator tone. "A developer who speaks business." No corporate distance.
- **The Tribu Digital "Anatomy of a High-Converting Webpage" framework** — clear benefit-driven headlines (not vague slogans), proof shown early and often, one consistent CTA style repeated throughout (never "Learn More"), conversational copy over corporate-speak, and objection-handling built into an FAQ right before the final CTA.

**What's changing now:** the site is evolving from a pure "book a call" consulting model into a **product-led storefront**, modeled on clay.com's actual homepage:

- A big, confident headline stating what the system does, with a dual CTA ("Start free trial" + "Get a demo") — never a single lonely button
- A scrolling "trusted by" logo bar where hovering a logo reveals a quantified outcome (Clay does this with "+140% pipeline," "3x reply rate," etc.)
- A **tabbed, screenshot-driven product demo section** — real UI, not stock illustrations, showing what the tool actually does step by step
- An **inline interactive widget** where a visitor can type what they want and get a taste of the product live on the page (Clay's "What do you want to build?" box) — this is the single most important element to replicate, because it's what makes "try" literal instead of a euphemism for "sign up and hope"
- Whimsical, colorful 3D-style illustration used sparingly against otherwise clean technical UI — the contrast is the brand, not either extreme alone
- A mega-footer, because a product storefront has more surface area than a single-service consulting page

Do not copy clay.com's actual illustrations, copy, or code — only the structural and tonal approach described above. Everything visual and written here should be original, grounded in this business's own subject matter (automation nodes, triggers, agents), the same way we grounded the earlier hero around an actual n8n-style workflow canvas.

**Payment reality:** there's no Stripe account for this business, and the buyers are spread across regions where Stripe either isn't the local default or isn't set up yet. Instead, purchases route through three regional rails, each picked because it can generate a QR code *and* confirm payment automatically via webhook — not because it's the only option, but because the alternative (a personal, static wallet QR) can't confirm itself, and "buy automatically" is the whole point:

- **Revolut** — via Revolut Business Payment Links, which generate a shareable QR code and confirm via the Merchant API's webhooks (`ORDER_COMPLETED`, etc.)
- **GCash** — via PayMongo, a Philippines-based gateway built specifically for GCash/Maya/cards, with no-code Payment Links or a full Checkout API, both webhook-confirmed
- **MariBank / PayNow** — via HitPay, a MAS-licensed Singapore gateway. MariBank is a PayNow participant like any SG bank, so a **dynamic** PayNow payment request through HitPay generates a per-transaction QR that reconciles automatically — unlike a **static** QR pulled straight from the MariBank app, which has no order data attached and can only be reconciled by hand

All three are free to sign up, approve fast (same-day to a few business days), and charge only per successful transaction — no monthly fee, closer in spirit to how this business already thinks about tools.

## FORMULA

Build the landing page in this section order. Each section's job is stated — don't pad beyond it.

1. **Nav** — logo, Products / How It Works / Pricing / Docs, persistent dual CTA: "Try Free" (ghost button) + "Buy Now" (solid button)
2. **Hero** — eyebrow tag, benefit-driven headline + one-line subhead, dual CTA (Start Free Trial / Get a Demo), signature illustration or animation. No stock gradient blobs — ground it in the actual product (see Constraint).
3. **Trust bar** — logo marquee, hover-to-reveal outcome stat per logo (use placeholder client names/stats)
4. **Product Shelf** *(the core ask — this is new)* — a grid of 3–4 purchasable AI products. Each card: name, one-line outcome ("Qualifies every inbound lead in under 60 seconds"), price, a tiny live preview or GIF-style demo, and two buttons: **Try It Free** (instant, no card) and **Buy Now**, which opens a lightweight payment-method picker (Revolut / GCash / PayNow · MariBank) — selecting one shows that rail's QR code plus a "or open in app" link, and the order confirms itself the moment the webhook fires
5. **Interactive Try-It Widget** — an embedded input box scoped to your flagship product where a visitor types a real scenario and sees a simulated result inline, live, before they commit to anything
6. **How It Works** — 3–4 step real sequence: Discover → Configure → Try → Buy/Deploy
7. **Proof** — testimonials paired with a hard number each, same pattern as the trust bar
8. **Pricing** — simple comparison of the products from the shelf, plus the retainer/custom-build option for people who want something bespoke
9. **FAQ** — kill objections specific to buying software from an individual: "What happens after I buy?", "Is there support?", "Can I get a refund?", "Do I need to talk to anyone first?"
10. **Final CTA band** — restate the core promise, dual CTA again
11. **Footer** — mega-footer: Products, Resources, Company, Legal columns

## TONE

Playful technical confidence, at solo-builder scale — not a $5B company's polish, but not amateur either. Write like someone who's good enough at the craft that they don't need to oversell it. Plain verbs, no filler, sentence case. Copy should sound like a person explaining what they built, not a marketing team explaining a category. Illustration and motion can be more playful than the copy — let the visuals carry the personality Clay's brand has, while the words stay grounded and specific (per the Tribu framework already established).

## CONSTRAINT

- **Automatic purchase must actually work**, not be a mockup — across all three rails:
  - Build a `PaymentProvider` interface (`createPaymentRequest(order)`, `verifyWebhook(payload, signature)`) with three implementations: `revolut.ts`, `paymongo.ts`, `hitpay.ts`. The Buy Now flow calls whichever provider the buyer picked and renders the returned QR image + checkout URL.
  - Each provider gets its own webhook route (`/api/webhooks/revolut`, `/api/webhooks/paymongo`, `/api/webhooks/hitpay`). All three normalize into one internal event — `order.paid` — so fulfillment logic is written once, not three times.
  - Always request the **dynamic, per-transaction** payment/QR from each gateway's API, never a static QR — static QRs carry no order reference and can't be confirmed automatically, which defeats the point.
  - Scaffold `.env.local.example` with placeholder keys for all three (`REVOLUT_API_KEY`, `PAYMONGO_SECRET_KEY`, `HITPAY_API_KEY` + each provider's webhook secret) — never invent or hardcode real keys.
- **Launch-day fallback, clearly labeled as temporary**: gateway approval can take a few business days. Until keys are live, let each "Buy Now" fall back to a manually-uploaded QR image (exported from the Revolut/PayMongo/HitPay dashboard once created) plus a simple "I've paid" form capturing a reference number and email, stored as a `pending` order. Flag this path in the `README.md` with the exact steps to flip it over to the automatic webhook flow once all three accounts are approved.
- **Automatic "try" must be real**: no credit card required, and access should be instant. For v1, this can be a fully client-side simulated demo (no backend needed) rather than a provisioned sandbox account — note this tradeoff in a `README.md` and leave a clear TODO for wiring real product access later.
- **Post-purchase fulfillment must be handled**, even minimally: on the normalized `order.paid` event (or a confirmed `pending` order in the fallback path), at minimum log it and show a confirmation page with next steps. Don't leave "Buy Now" as a dead end on any of the three rails.
- Avoid the three AI-generic design clichés: cream background + high-contrast serif + terracotta accent; near-black background + single neon accent; broadsheet hairline-rule newspaper layout. Pick a palette and type system grounded in this specific product (automation/workflow vernacular), not a generic SaaS default.
- One signature visual moment, spent deliberately (the try-it widget or the hero illustration — not both maximalist at once). Keep everything else disciplined and quiet around it.
- Fully responsive, visible keyboard focus states, `prefers-reduced-motion` respected.
- All product names, prices, testimonials, and logos are placeholders in `[brackets]` — flag them clearly in the README as the first things to replace before launch.
- Single landing page for v1, with pricing and a generic product-detail page/modal as the only additional routes. Don't scope-creep into a full docs site or dashboard.
