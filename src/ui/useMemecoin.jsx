import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_REFRESH_INTERVAL = 15_000;
const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";

/**
 * Fetches the most-liquid DexScreener pair for a token.
 * The default chain is Solana because this app currently tracks a Pump.fun token.
 */
export default function useMemecoin(
  tokenAddress,
  { chainId = "solana", refreshInterval = DEFAULT_REFRESH_INTERVAL } = {},
) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenAddress));
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  const fetchTokenomics = useCallback(async () => {
    if (!tokenAddress) {
      controllerRef.current?.abort();
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.dexscreener.com/token-pairs/v1/${encodeURIComponent(chainId)}/${encodeURIComponent(tokenAddress)}`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        throw new Error(`Could not load token data (${response.status}).`);
      }

      const pairs = await response.json();

      if (!Array.isArray(pairs) || pairs.length === 0) {
        throw new Error("Token not found or it has no active liquidity pools.");
      }

      const mainPair = pairs.reduce((bestPair, pair) =>
        (pair.liquidity?.usd ?? 0) > (bestPair.liquidity?.usd ?? 0)
          ? pair
          : bestPair,
      );

      let totalSupply = null;

      if (chainId === "solana") {
        const supplyResponse = await fetch(SOLANA_RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getTokenSupply",
            params: [tokenAddress],
          }),
          signal: controller.signal,
        });

        if (supplyResponse.ok) {
          const supplyResult = await supplyResponse.json();
          totalSupply = supplyResult.result?.value?.uiAmountString ?? null;
        }
      }

      setData({
        name: mainPair.baseToken.name,
        symbol: mainPair.baseToken.symbol,
        priceUsd: Number(mainPair.priceUsd),
        marketCap: mainPair.marketCap,
        fdv: mainPair.fdv,
        totalSupply,
        liquidity: mainPair.liquidity?.usd,
        volume24h: mainPair.volume?.h24,
        priceChange24h: mainPair.priceChange?.h24,
        dexUrl: mainPair.url,
      });
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setError(requestError.message || "Unable to load token data.");
        setData(null);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [chainId, tokenAddress]);

  useEffect(() => {
    // Deferring the initial request avoids a synchronous state update from the effect.
    const initialRequest = window.setTimeout(fetchTokenomics, 0);
    const interval = window.setInterval(fetchTokenomics, refreshInterval);

    return () => {
      window.clearTimeout(initialRequest);
      window.clearInterval(interval);
      controllerRef.current?.abort();
    };
  }, [fetchTokenomics, refreshInterval]);

  return { data, loading, error, refetch: fetchTokenomics };
}
