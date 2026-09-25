import { useState } from "react";
import useMemecoin from "./useMemecoin";

const CONTRACT_ADDRESS = "CpFJrfYq32Wae2Bt36hEAUwzdyT29WwVLpZmYDF7pump";
const SWAP_URL = `https://jup.ag/swap?buy=${encodeURIComponent(CONTRACT_ADDRESS)}&sell=So11111111111111111111111111111111111111112`;

const formatUsd = (amount, isLoading) =>
  typeof amount === "number" && Number.isFinite(amount)
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount)
    : isLoading ? "Loading…" : "Unavailable";

const formatSupply = (amount, isLoading) => {
  const numericAmount = Number(amount);
  return amount !== null && amount !== undefined && Number.isFinite(numericAmount)
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(numericAmount)
    : isLoading ? "Loading…" : "Unavailable";
};

export default function Docs() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const { data, loading, error } = useMemecoin(CONTRACT_ADDRESS);

  const tokenomics = [
    ["Chain", "Solana"],
    ["Total supply", formatSupply(data?.totalSupply, loading)],
    ["Market cap", formatUsd(data?.marketCap, loading)],
    ["FDV", formatUsd(data?.fdv, loading)],
    ["Liquidity", formatUsd(data?.liquidity, loading)],
  ];

  const copyContractAddress = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
    window.setTimeout(() => {
      setCopied(false);
      setCopyError(false);
    }, 2_000);
  };

  return (
    <section className="docs" aria-labelledby="docs-title">
      <p className="section-eyebrow">How to buy</p>
      <h2 id="docs-title">Three steps.</h2>
      <p className="docs__intro">Use the address on this page and verify it in your wallet before swapping.</p>
      <ol className="docs__steps">
        <li><span className="docs__step-number">01</span><div><strong>Open a Solana wallet</strong><p>Make sure it holds SOL for the swap and network fees.</p></div></li>
        <li><span className="docs__step-number">02</span><div><strong>Use the contract address</strong><p>Copy the address below and paste it into a swap service you trust.</p></div></li>
        <li><span className="docs__step-number">03</span><div><strong>Review before confirming</strong><p>Check the token, amount, and transaction in your wallet before approval.</p></div></li>
      </ol>
      <div className="docs__contract">
        <div className="docs__address-copy">
          <p className="docs__label">Contract address</p>
          <code>{CONTRACT_ADDRESS}</code>
        </div>
        <button type="button" onClick={copyContractAddress} aria-live="polite">{copied ? "Copied" : "Copy address"}</button>
      </div>
      {copyError && <p className="docs__status" role="status">Copy was blocked. Select and copy the address above.</p>}
      {error && <p className="docs__status" role="status">Live token data is unavailable right now.</p>}
      <a className="docs__swap-link" href={SWAP_URL} target="_blank" rel="noreferrer">Open swap</a>
      <div className="docs__tokenomics">
        <div><p className="section-eyebrow">Live figures</p><h3>Token details</h3></div>
        <dl>{tokenomics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </div>
    </section>
  );
}
