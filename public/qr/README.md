# Fallback QR images — temporary

Drop the QR images you export from each gateway dashboard here, named exactly:

- `revolut.png`
- `paymongo.png`
- `hitpay.png`

These are only used by the **launch-day fallback path**, which runs when a rail
has no API keys in `.env.local` yet. In that mode the buyer scans this image,
pays, and types their payment reference into the "I've paid" form — a human
matches it afterwards.

If a file is missing, the Buy sheet says so plainly rather than showing a broken
image. Nothing here is generated automatically, and nothing here should ever be
a personal wallet QR: export a *merchant* QR from the gateway you actually
signed up for.

The moment a rail's keys are live, that rail stops using this image entirely and
issues a fresh, per-order QR instead. Delete the file then.
