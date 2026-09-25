import useMemecoin from "./useMemecoin";

const CONTRACT_ADDRESS = "CpFJrfYq32Wae2Bt36hEAUwzdyT29WwVLpZmYDF7pump";

const formatUsd = (amount, loading) => {
  if (typeof amount === "number" && Number.isFinite(amount)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: amount < 0.01 ? 6 : 2,
    }).format(amount);
  }
  return loading ? "Loading…" : "Unavailable";
};

export default function Hero({ mobileScene }) {
  const { data, loading } = useMemecoin(CONTRACT_ADDRESS);

  return (
    <section className="hero-section" id="hero" aria-labelledby="hero-title">
      <h1 className="hero-wordmark" id="hero-title">RISE</h1>
      <div className="hero-copy">
        <p className="hero-description">
          NASA selected Rise, designed by a third grader in California, as Artemis II’s zero-gravity indicator. The character began with the Earthrise photograph. This token is a separate fan-made project.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#vision">Read the story</a>
        </div>
      </div>
      {mobileScene}
      <dl className="hero-data" aria-label="Live token information">
        <div><dt>Price</dt><dd>{formatUsd(data?.priceUsd, loading)}</dd></div>
        <div><dt>Market cap</dt><dd>{formatUsd(data?.marketCap, loading)}</dd></div>
      </dl>
      <p className="hero-scroll">Scroll for the story</p>
    </section>
  );
}
