import { useState } from "react";
import useMemecoin from "./useMemecoin";

const CONTRACT_ADDRESS = "CpFJrfYq32Wae2Bt36hEAUwzdyT29WwVLpZmYDF7pump";

const formatUsd = (amount) =>
  typeof amount === "number"
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(amount)
    : "Loading…";

const formatSupply = (amount) =>
  amount
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
        Number(amount),
      )
    : "Loading…";

export default function Docs() {
  const [copied, setCopied] = useState(false);
  const { data } = useMemecoin(CONTRACT_ADDRESS);

  const tokenomics = [
    ["Chain", "Solana"],
    ["Total supply", formatSupply(data?.totalSupply)],
    ["Market cap", formatUsd(data?.marketCap)],
    ["FDV", formatUsd(data?.fdv)],
    ["Liquidity", formatUsd(data?.liquidity)],
  ];

  const copyContractAddress = async () => {
    await navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  };

  return (
    <section className="docs" aria-labelledby="docs-title">
      <h2 id="docs-title">Purchase Instructions</h2>
      <p className="docs__intro">Just Three Steps.</p>

      <ol className="docs__steps">
        <li>
          <strong>Load your wallet</strong>
          <span>
            Open a Solana wallet and make sure you have SOL for the swap and
            network fees.
          </span>
        </li>
        <li>
          <span>
            Copy the contract address below and paste it into your preferred
            Solana swap.
          </span>
        </li>
        <li>
          <span>
            Choose the amount of SOL to swap, review the transaction, then
            confirm in your wallet.
          </span>
        </li>
      </ol>

      <div className="docs__contract">
        <div>
          <p className="docs__label">contract address</p>
          <code>{CONTRACT_ADDRESS}</code>
        </div>
        <button type="button" onClick={copyContractAddress}>
          {copied ? "Copied" : "Copy address"}
        </button>
      </div>

      <div className="docs__tokenomics">
        <div>
          <p className="docs__eyebrow">The numbers</p>
          <h3>Tokenomics</h3>
        </div>
        <dl>
          {tokenomics.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
