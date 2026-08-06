"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { BuySheet } from "@/components/buy-sheet";
import { TryModal } from "@/components/try-modal";
import type { ProviderSummary } from "@/lib/payments";
import { FLAGSHIP, getProduct, type Product } from "@/lib/products";

interface StoreContextValue {
  providers: ProviderSummary[];
  openBuy: (slug?: string) => void;
  openTry: (slug?: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

/**
 * Buy and Try are reachable from the nav, every product card, the pricing table
 * and the final band — so both live here, once, instead of once per section.
 */
export function StoreProvider({
  providers,
  children,
}: {
  providers: ProviderSummary[];
  children: ReactNode;
}) {
  const [buying, setBuying] = useState<Product | null>(null);
  const [trying, setTrying] = useState<Product | null>(null);

  const openBuy = useCallback((slug?: string) => {
    setBuying((slug ? getProduct(slug) : FLAGSHIP) ?? FLAGSHIP);
  }, []);

  const openTry = useCallback((slug?: string) => {
    setTrying((slug ? getProduct(slug) : FLAGSHIP) ?? FLAGSHIP);
  }, []);

  const value = useMemo(
    () => ({ providers, openBuy, openTry }),
    [providers, openBuy, openTry],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      {buying ? (
        <BuySheet
          product={buying}
          providers={providers}
          onClose={() => setBuying(null)}
        />
      ) : null}
      {trying ? (
        <TryModal
          product={trying}
          onClose={() => setTrying(null)}
          onBuy={() => {
            setTrying(null);
            openBuy(trying.slug);
          }}
        />
      ) : null}
    </StoreContext.Provider>
  );
}
