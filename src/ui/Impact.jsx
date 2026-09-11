const nextSteps = [
  ["01", "Show up", "Join the conversation and help the $RISE community find its voice."],
  ["02", "Create", "Share a meme, an idea, or a moment that keeps the mascot moving."],
  ["03", "Rise together", "Turn small community actions into a bigger shared story."],
];

export default function Impact() {
  return (
    <section className="impact" aria-labelledby="impact-title">
      <div className="impact__heading">
        <p className="section-eyebrow">Community impact</p>
        <h2 id="impact-title">Momentum starts with us.</h2>
        <p>
          The impact of $RISE is not a dashboard number. It is the people who
          bring the story to life, one post, meme, and conversation at a time.
        </p>
      </div>

      <ol className="impact__steps">
        {nextSteps.map(([number, title, description]) => (
          <li key={number}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
