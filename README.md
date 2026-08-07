# Product storefront — Next.js 14 + Tailwind + TypeScript

A product-led landing page for a solo AI builder. Visitors run a workflow on
their own data in the browser (no signup), then buy it on whichever regional
rail suits them — Revolut, GCash (PayMongo) or PayNow/MariBank (HitPay). Every
purchase issues a **dynamic, per-transaction QR** and confirms itself over a
signed webhook.

```bash
npm install
cp .env.local.example .env.local   # then fill in whatever keys you have
npm run dev                        # http://localhost:3000
```

It runs with **zero keys configured** — every rail falls back to the manual path
described below, so you can develop and demo before any gateway approves you.

---

## 1. Replace these before launch

Everything wrapped in `[brackets]` is a placeholder. In rough order of urgency:

| Where | What to replace |
| --- | --- |
| `lib/site.ts` | Business name, tagline, your name, email, booking URL |
| `lib/products.ts` | All four product names, outcomes, blurbs, **prices**, includes, setup times |
| `components/trust-bar.tsx` | Six client names + their outcome stats |
| `components/proof.tsx` | Three testimonials, names, roles, headline numbers |
| `components/faq.tsx` | Refund window, support window, licence terms |
| `components/footer.tsx` | Legal links (currently all pointing at the FAQ), copyright year |
| `app/orders/[id]/page.tsx` | The `[workflow.json]` download — currently a disabled button |

Prices live in `lib/products.ts` as **minor units** (cents/centavos) per currency:

```ts
priceMinor: { EUR: 49000, PHP: 3200000, SGD: 72000 }  // €490 · ₱32,000 · S$720
```

Three separate numbers on purpose — each rail settles in its own currency, and a
runtime FX lookup would leave you selling at yesterday's rate. Set each one
deliberately.

---

## 2. How payments are wired

```
Buy Now
  → POST /api/checkout           creates an order, picks the provider
  → provider.createPaymentRequest(order)   dynamic QR + checkout URL
  → buyer pays
  → POST /api/webhooks/<rail>    verify signature → normalise → order.paid
  → handlePaymentEvent()         one fulfillment path for all three rails
  → /orders/<id>                 confirmation page, polls until it flips to Paid
```

Every provider implements the same interface (`lib/payments/types.ts`):

```ts
interface PaymentProvider {
  isConfigured(): boolean;
  createPaymentRequest(order: OrderDraft): Promise<PaymentRequest>;
  verifyWebhook(payload: RawWebhook, signature: string | null): Promise<NormalizedEvent>;
}
```

| Rail | File | Gateway | Currency | Webhook signature |
| --- | --- | --- | --- | --- |
| Revolut | `lib/payments/revolut.ts` | Merchant API orders | EUR | `revolut-signature`, HMAC over `v1.{ts}.{body}` |
| GCash | `lib/payments/paymongo.ts` | Checkout Sessions | PHP | `paymongo-signature`, HMAC over `{t}.{body}` |
| PayNow · MariBank | `lib/payments/hitpay.ts` | Payment requests | SGD | `hmac` field (v1) or `hitpay-signature` header (v2) |

All three normalise into one internal event — `order.paid` — so fulfillment is
written once in `lib/fulfillment.ts`. Adding a fourth gateway means adding a
provider file and a three-line route, nothing else.

**Why gateways instead of a personal wallet QR:** a static QR carries no order
reference. Nothing can confirm it automatically, so someone reads a bank feed and
matches payments by hand. Each provider here is asked for a *dynamic* payment
request per order — amount locked, reference attached, webhook on completion.
MariBank is a PayNow participant like any SG bank, so the HitPay-issued dynamic
PayNow QR works in the MariBank app without MariBank needing an API of its own.

### Verified locally

All three webhook routes were exercised against the running dev server with real
HMACs: a tampered signature returns `401`, a valid one returns `200` and flips
the order to `paid`, and a replayed delivery is a logged no-op rather than a
double fulfillment. Reproduce it by setting the three webhook secrets in
`.env.local` and posting signed payloads at `/api/webhooks/*`.

---

## 3. Flipping a rail to automatic

Each rail is independent — as accounts get approved, flip them one at a time.
A rail is "live" the moment its API key is present in the environment; there is
no other switch, and `providerSummaries()` re-reads it on every request.

**Revolut**
1. Revolut Business → Merchant API → generate a **secret** API key.
2. Add a webhook for `ORDER_COMPLETED` (plus `ORDER_CANCELLED`, `ORDER_FAILED`)
   pointing at `https://your-domain.com/api/webhooks/revolut`. Copy the signing
   secret (`wsk_…`).
3. Set `REVOLUT_API_KEY`, `REVOLUT_WEBHOOK_SECRET`, and switch
   `REVOLUT_API_BASE` from the sandbox host to `https://merchant.revolut.com/api`.

**PayMongo (GCash)**
1. Dashboard → Developers → API keys → copy the secret key.
2. Create a webhook for `checkout_session.payment.paid` and `payment.failed` at
   `https://your-domain.com/api/webhooks/paymongo`. The secret is shown **once**.
3. Set `PAYMONGO_SECRET_KEY` and `PAYMONGO_WEBHOOK_SECRET`. Test keys
   (`sk_test_…`) verify against the `te=` signature; live keys against `li=` —
   the provider picks the right one from the key prefix, so nothing else changes
   when you go live.

**HitPay (PayNow · MariBank)**
1. Dashboard → Payment Gateway → API keys → copy the API key and the salt.
2. Enable PayNow as a payment method. The webhook URL is sent per-request by
   `hitpay.ts`, so there's nothing to register manually.
3. Set `HITPAY_API_KEY`, `HITPAY_WEBHOOK_SALT`, and move `HITPAY_API_BASE` from
   `api.sandbox.hit-pay.com` to `api.hit-pay.com`.

Then, per rail: delete `public/qr/<provider>.png`, run one real transaction of
the smallest amount you sell, and confirm the order page flips to Paid without
anyone touching it.

When **all three** are live, delete the temporary path: `fallbackPaymentRequest`
in `lib/payments/index.ts`, `ClaimForm` in `components/buy-sheet.tsx`, and
`app/api/orders/[id]/claim/route.ts`.

> Gateway APIs move. Endpoints, field names and signature schemes here were
> written against each provider's documented behaviour — re-check them against
> current docs when you wire up real keys, and run one live transaction per rail
> before trusting any of it.

---

## 4. The launch-day fallback (temporary)

Approval takes anywhere from same-day to a few business days. Until a rail has
keys, its Buy Now still works, but honestly:

- The buyer sees a QR image **you** exported from that gateway's dashboard
  (`public/qr/revolut.png`, `paymongo.png`, `hitpay.png` — see
  `public/qr/README.md`). If the file isn't there, the sheet says so plainly
  instead of showing a broken image.
- Under it, an **"I've paid"** form takes a payment reference and an email and
  stores a `pending` order. It never marks anything paid.
- The UI labels this rail "manual for now" in the picker and repeats the caveat
  on the payment panel. Nothing claims to be automatic when it isn't.
- You match it against the gateway dashboard and call
  `approvePendingOrder(orderId)` (`lib/fulfillment.ts`) to release it.

The same path catches a gateway *outage* on a live rail: if
`createPaymentRequest` throws, `/api/checkout` logs the error and serves the
fallback rather than dead-ending the sale.

---

## 5. What "try it free" actually is

Two different things, and the difference is deliberate.

**Three of the four products** run `lib/demo/simulate.ts` — entirely in the
browser, reading what the visitor typed and producing a specific verdict, four
streamed steps, and a drafted reply. No API key, no request, no signup. It is a
*simulation of the product*, not the product, and the page says so under the
widget.

**[Proposal Builder] is real** (`lib/demo/proposal/`). Its Run button executes
the actual four-node pipeline and renders the actual output — extracted scope,
a priced proposal, and three follow-up emails:

| Node | Function | How it runs |
| --- | --- | --- |
| 02 · Extract scope | `extractScope` | `claude-sonnet-5` if the visitor supplied a key, regex heuristics otherwise |
| 02b · Fit verdict | `classifyFit` | always deterministic |
| 03 · Fill the template | `fillTemplate` | always deterministic |
| 04 · Draft + reminders | `generateFollowUps` | model or heuristic |

**Pricing and the fit verdict never go to a model**, by design — same rule as
the n8n build in §"How the workflow works". A rate card is a lookup and a
verdict must be reproducible; a model that can invent a number will eventually
invent the wrong one in front of a client.

**The API key** is optional, entered on the page, and held in `sessionStorage`
only — it dies with the tab and never reaches this server. Requests go from the
browser straight to `api.anthropic.com` (the `anthropic-dangerous-direct-browser-access`
header is what makes that legal in CORS terms). With no key, the heuristic path
is the default rather than a degraded mode. Any model failure falls back to the
heuristic path and says so on screen.

**TODO (v2):** give the other three products the same treatment —
`components/demo-surface.tsx` is the dispatch point, and `DemoRunner`'s
`execute` / `renderResult` props are the seam.

### Taking the draft with you

Two exits from the proposal panel, both built without new dependencies.

**Download PDF** renders the proposal as a standalone HTML document in a hidden
iframe and opens the browser's print dialog, where "Save as PDF" is a
destination. Chosen over jsPDF/pdf-lib deliberately: no ~350KB added to a
landing-page bundle, and the output is real selectable text with proper page
breaks rather than a canvas raster. The tradeoff is a print dialog instead of a
one-click download — if that matters more, replace `printProposal()` in
`lib/demo/proposal/print.ts`; the UI calls one function.

**Email this to me** posts to `/api/send-draft`, which sends one message via
Resend. Set `RESEND_API_KEY` to enable it; without it the route returns 503 and
the button says so rather than failing silently.

That route is a public endpoint that puts mail in a stranger's inbox, so it is
deliberately narrow:

- the body is **rebuilt server-side** from structured fields — the client never
  supplies markup, and every value is escaped and length-capped
- subject and from-address are **fixed**, never visitor-controlled
- rate limited per IP **and** per recipient (3/hour each), so neither a sender
  nor a victim can be hammered
- 32KB request cap, one recipient per request
- every email carries a footer naming the origin and stating it's a demo draft

The real backstop is Resend's own domain verification: until you verify a
domain, `onboarding@resend.dev` only delivers to your own account address. Leave
`RESEND_FROM` unset until you've thought about who can mail whom.

**TODO before heavy traffic:** the limiter is an in-process Map, so it's
per-instance on serverless — same caveat as the order store. Move the counter to
Redis/KV; `checkRateLimit()` is the whole surface that changes.

Tests: `npm test` (Vitest, 44 cases — the four pipeline functions and the
orchestrator including the model path, a network failure and a refusal; the
print document; and the email sanitiser, escaping and rate limiter).

---

## 6. Fulfillment

On the normalised `order.paid` event (`lib/fulfillment.ts`):

1. Duplicate deliveries are ignored (webhooks retry; fulfillment must not).
2. An amount mismatch is logged loudly rather than silently accepted.
3. The order flips to `paid`, and `deliver()` logs the delivery line.
4. `/orders/<id>` shows what happens next, plus a per-order event log.

**TODO before launch:** `deliver()` currently only logs. Add the actual send —
receipt + workflow JSON — with Resend or your SMTP of choice. The order object
already carries the product, amount, reference and email.

---

## 7. Known v1 tradeoffs

- **Orders live in memory** (`lib/orders/store.ts`), mirrored to `.data/orders.json`
  in dev. On Vercel, instances are ephemeral and independent: a webhook can land
  on a different instance than the one that created the order. **Swap this for
  Postgres/KV before taking real money** — the module is deliberately narrow
  (`createOrder`, `getOrder`, `findOrder`, `updateOrder`), so it's a one-file
  change. The order page already handles "I can't find that order" gracefully.
- No admin view for `pending` orders — they're in the log and the store.
- No rate limiting on `/api/checkout`; add some before you're public.

## 8. Deploying to Vercel

1. Push the repo, import it in Vercel, framework auto-detects as Next.js.
2. Add every variable from `.env.local.example` as a project env var. Set
   `NEXT_PUBLIC_SITE_URL` to the production origin — the gateways' return URLs
   and HitPay's webhook URL are built from it.
3. Point each gateway's webhook at `https://your-domain.com/api/webhooks/<rail>`.
4. Do the order-store swap from §7 first if real money is involved.

## 9. Project map

```
app/
  page.tsx                     landing page — 11 sections, in order
  pricing/page.tsx             all prices, all rails
  products/[slug]/page.tsx     product detail + its own inline sandbox
  orders/[id]/page.tsx         confirmation, polls until paid
  api/checkout/route.ts        create order → dynamic payment request
  api/orders/[id]/route.ts     status polling
  api/orders/[id]/claim/route.ts   TEMPORARY "I've paid"
  api/send-draft/route.ts      emails one proposal draft via Resend
  api/webhooks/{revolut,paymongo,hitpay}/route.ts
components/                    sections + the Buy/Try modals
  demo-surface.tsx             picks a product's demo; the seam for new ones
  proposal/                    [Proposal Builder]'s live demo + key settings
lib/
  payments/                    provider interface + three implementations
  orders/store.ts              order persistence (swap me)
  demo/simulate.ts             the client-side try-it engine (3 products)
  demo/proposal/               the real four-node pipeline + its tests
  fulfillment.ts               one path for order.paid
  products.ts                  the placeholder catalog
```

## 10. Design notes

- **Palette is the product's vernacular:** a cool "canvas" surface with dot grid,
  and four accents that map to node types — trigger (amber), agent (violet),
  action (teal), output (coral). Deliberately not a single-accent scheme.
- **Type:** Inter for prose, JetBrains Mono for labels, references and prices —
  the workflow-editor voice.
- **One signature moment:** the try-it widget. The hero canvas is animated only
  on its wires; everything else stays quiet so the widget can be loud.
- **Motion and focus:** `prefers-reduced-motion` is honoured globally *and* in
  the demo runner (steps appear at once instead of streaming). Focus is visible
  everywhere, both modals trap focus and close on Escape, and the How-it-works
  tabs are arrow-key navigable.
