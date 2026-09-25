import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_REFRESH_INTERVAL = 60_000;
const REQUEST_TIMEOUT = 8_000;

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
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT);

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

      // DexScreener does not expose supply; do not call the blocked public RPC.
      const totalSupply = null;

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
      if (requestError.name !== "AbortError" || timedOut) {
        setError(timedOut ? "Token data request timed out." : requestError.message || "Unable to load token data.");
        setData(null);
      }
    } finally {
      window.clearTimeout(timeout);
      if (!controller.signal.aborted || timedOut) {
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
