import useMemecoin from "./useMemecoin";

export default function PriceEngine() {
  const { data, loading, error } = useMemecoin(
    "CpFJrfYq32Wae2Bt36hEAUwzdyT29WwVLpZmYDF7pump",
  );

  if (loading && !data) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return null;

  return (
    <div>
      <h1>
        {data.name} ({data.symbol})
      </h1>
      <p>Price: ${data.priceUsd.toFixed(6)}</p>
      <p>
        Market Cap: ${" "}
        {(data.marketCap ?? data.fdv)?.toLocaleString()}
      </p>
    </div>
  );
}
