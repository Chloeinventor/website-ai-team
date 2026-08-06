"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";

import { Modal } from "@/components/modal";
import type { ProviderSummary } from "@/lib/payments";
import type { PaymentRequest } from "@/lib/payments/types";
import { formatPrice, type Product } from "@/lib/products";

type Stage = "pick" | "creating" | "pay" | "claimed" | "error";

interface CheckoutResponse {
  order: { id: string; reference: string };
  payment: PaymentRequest;
}

export function BuySheet({
  product,
  providers,
  onClose,
}: {
  product: Product;
  providers: ProviderSummary[];
  onClose: () => void;
}) {
  const router = useRouter();
  const titleId = useId();

  const [stage, setStage] = useState<Stage>("pick");
  const [picked, setPicked] = useState<ProviderSummary | null>(null);
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrBroken, setQrBroken] = useState(false);

  // Once a payment is open, ask the server whether the webhook has landed.
  useEffect(() => {
    if (stage !== "pay" || !checkout || checkout.payment.mode !== "live") return;

    const id = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${checkout.order.id}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const order = (await res.json()) as { status: string };
        if (order.status === "paid") {
          window.clearInterval(id);
          router.push(`/orders/${checkout.order.id}`);
        }
      } catch {
        // Offline for a beat is fine; the next tick will catch up.
      }
    }, 3000);

    return () => window.clearInterval(id);
  }, [stage, checkout, router]);

  async function choose(provider: ProviderSummary) {
    setPicked(provider);
    setStage("creating");
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: product.slug, provider: provider.id }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Checkout failed");
      setCheckout(body as CheckoutResponse);
      setStage("pay");
    } catch (err) {
      setError((err as Error).message);
      setStage("error");
    }
  }

  return (
    <Modal labelledBy={titleId} onClose={onClose} wide={stage === "pay"}>
      <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <p className="eyebrow">Buy · one-time</p>
          <h2 id={titleId} className="mt-1 text-lg font-semibold tracking-tight">
            {product.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-line px-2.5 py-1.5 font-mono text-xs text-ink-muted hover:border-ink-muted hover:text-ink"
          aria-label="Close"
        >
          ESC
        </button>
      </header>

      {stage === "pick" || stage === "creating" ? (
        <RailPicker
          product={product}
          providers={providers}
          busyId={stage === "creating" ? picked?.id : undefined}
          onChoose={choose}
        />
      ) : null}

      {stage === "pay" && checkout && picked ? (
        <PayPanel
          product={product}
          provider={picked}
          checkout={checkout}
          qrBroken={qrBroken}
          onQrError={() => setQrBroken(true)}
          onClaimed={() => setStage("claimed")}
          onBack={() => {
            setCheckout(null);
            setQrBroken(false);
            setStage("pick");
          }}
        />
      ) : null}

      {stage === "claimed" && checkout ? (
        <div className="px-6 py-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-node-action">
            Logged
          </p>
          <h3 className="mt-2 text-lg font-semibold">
            Got it — reference {checkout.order.reference}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
            I match payments by hand while this rail waits on gateway approval.
            You&apos;ll have access by email within [one business day].
          </p>
          <a href={`/orders/${checkout.order.id}`} className="btn-solid mt-5">
            View your order
          </a>
        </div>
      ) : null}

      {stage === "error" ? (
        <div className="px-6 py-8">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-node-output">
            That didn&apos;t work
          </p>
          <p className="mt-2 text-sm text-ink-soft">{error}</p>
          <button
            type="button"
            className="btn-ghost mt-5"
            onClick={() => setStage("pick")}
          >
            Try another rail
          </button>
        </div>
      ) : null}
    </Modal>
  );
}

function RailPicker({
  product,
  providers,
  busyId,
  onChoose,
}: {
  product: Product;
  providers: ProviderSummary[];
  busyId?: string;
  onChoose: (provider: ProviderSummary) => void;
}) {
  return (
    <div className="px-6 py-5">
      <p className="text-sm text-ink-soft">
        Pick whichever is normal where you are. Same product, same price — the
        rail just changes the currency.
      </p>

      <ul className="mt-4 space-y-2.5">
        {providers.map((provider) => (
          <li key={provider.id}>
            <button
              type="button"
              disabled={Boolean(busyId)}
              onClick={() => onChoose(provider)}
              className="group flex w-full items-center justify-between gap-4 rounded-node border border-line bg-canvas/60 px-4 py-3.5 text-left transition-colors hover:border-node-agent hover:bg-paper disabled:opacity-60"
            >
              <span>
                <span className="flex items-center gap-2">
                  <span className="font-medium">{provider.label}</span>
                  {!provider.live ? (
                    <span className="rounded-full bg-node-trigger/12 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-node-trigger">
                      manual for now
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-sm text-ink-muted">
                  {provider.sublabel}
                </span>
              </span>
              <span className="text-right">
                <span className="block font-mono text-sm font-medium">
                  {formatPrice(product.priceMinor[provider.currency], provider.currency)}
                </span>
                <span className="block font-mono text-[11px] text-ink-muted">
                  {busyId === provider.id ? "opening…" : provider.region}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 font-mono text-[11px] leading-relaxed text-ink-muted">
        Each rail issues a fresh QR for this order only — nothing static, nothing
        reconciled by hand where the gateway is live.
      </p>
    </div>
  );
}

function PayPanel({
  product,
  provider,
  checkout,
  qrBroken,
  onQrError,
  onClaimed,
  onBack,
}: {
  product: Product;
  provider: ProviderSummary;
  checkout: CheckoutResponse;
  qrBroken: boolean;
  onQrError: () => void;
  onClaimed: () => void;
  onBack: () => void;
}) {
  const { payment, order } = checkout;
  const fallback = payment.mode === "fallback";

  return (
    <div className="grid gap-6 px-6 py-5 sm:grid-cols-[220px_1fr]">
      <div>
        <div className="rounded-node border border-line bg-white p-3">
          {qrBroken ? (
            <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong p-4 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                No QR uploaded
              </p>
              <p className="text-xs text-ink-muted">
                Drop the exported image at{" "}
                <code className="font-mono">public/qr/{provider.id}.png</code>
              </p>
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={payment.qrDataUrl}
              alt={`${provider.label} payment QR for order ${order.reference}`}
              className="aspect-square w-full rounded-lg"
              onError={onQrError}
            />
          )}
        </div>
        <p className="mt-2 text-center font-mono text-[11px] text-ink-muted">
          ref {order.reference}
        </p>
      </div>

      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-xl font-medium">
            {formatPrice(product.priceMinor[provider.currency], provider.currency)}
          </span>
          <span className="text-sm text-ink-muted">via {provider.label}</span>
        </div>

        <ol className="mt-3 space-y-1.5 text-sm text-ink-soft">
          {payment.instructions.map((line) => (
            <li key={line} className="flex gap-2">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-node-agent" />
              {line}
            </li>
          ))}
        </ol>

        {payment.checkoutUrl ? (
          <a
            href={payment.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-solid btn-sm mt-4"
          >
            Or open in app ↗
          </a>
        ) : null}

        {!fallback ? (
          <p className="mt-4 flex items-center gap-2 font-mono text-[11px] text-ink-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulseNode rounded-full bg-node-action" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-node-action/70" />
            </span>
            waiting for {provider.label} to confirm…
          </p>
        ) : (
          <ClaimForm orderId={order.id} onClaimed={onClaimed} />
        )}

        <button
          type="button"
          onClick={onBack}
          className="mt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted underline underline-offset-4 hover:text-ink"
        >
          ← pick a different rail
        </button>
      </div>
    </div>
  );
}

/** TEMPORARY — the "I've paid" path. Deleted once every rail has live keys. */
function ClaimForm({
  orderId,
  onClaimed,
}: {
  orderId: string;
  onClaimed: () => void;
}) {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, email }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Couldn't log that");
      onClaimed();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 rounded-node border border-node-trigger/35 bg-node-trigger/[0.06] p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-node-trigger">
        Temporary · manual confirmation
      </p>
      <p className="mt-1.5 text-sm text-ink-soft">
        This rail is still waiting on gateway approval, so it can&apos;t confirm
        itself yet. Paid already? Tell me where to send it.
      </p>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">Payment reference</span>
          <input
            required
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Payment reference"
            className="w-full rounded-[10px] border border-line bg-paper px-3 py-2 text-sm placeholder:text-ink-muted"
          />
        </label>
        <label className="block">
          <span className="sr-only">Your email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-[10px] border border-line bg-paper px-3 py-2 text-sm placeholder:text-ink-muted"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-2 text-sm text-node-output">{error}</p>
      ) : null}

      <button type="submit" disabled={busy} className="btn-solid btn-sm mt-3">
        {busy ? "Logging…" : "I've paid"}
      </button>
    </form>
  );
}
