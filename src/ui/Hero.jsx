import useMemecoin from "./useMemecoin";

const CONTRACT_ADDRESS = "CpFJrfYq32Wae2Bt36hEAUwzdyT29WwVLpZmYDF7pump";

const formatUsd = (amount, loading) =>
  typeof amount === "number"
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: amount < 0.01 ? 6 : 2,
      }).format(amount)
    : loading
      ? "Loading…"
      : "Unavailable";

export default function Hero() {
  const { data, loading } = useMemecoin(CONTRACT_ADDRESS);

  return (
    <section className="hero-section" id="hero" aria-labelledby="hero-title">
      <h1 className="sr-only" id="hero-title">Rise</h1>
      <p className="hero-wordmark" aria-hidden="true">RISE</p>

      <div className="hero-copy">
        <p className="hero-description">
          A moon in an Earth cap flew around the real Moon in April. This is
          its fan-made community coin.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#docs">View token details</a>
        </div>
      </div>

      <dl className="hero-data" aria-label="Live token information">
        <div>
          <dt>Price</dt>
          <dd>{formatUsd(data?.priceUsd, loading)}</dd>
        </div>
        <div>
          <dt>Market cap</dt>
          <dd>{formatUsd(data?.marketCap, loading)}</dd>
        </div>
      </dl>

      <div className="hero-socials" aria-label="Rise social links">
        <a href="https://t.me/risecoincto" rel="noreferrer" target="_blank" aria-label="Rise on Telegram">T</a>
        <a href="https://x.com/risecoincto?s=21" rel="noreferrer" target="_blank" aria-label="Rise on X">X</a>
      </div>
      <p className="hero-scroll">Scroll for the story</p>
    </section>
  );
}
