import { useState } from "react";

const questions = [
  {
    question: "What is RISE?",
    answer:
      "RISE is a fan-made token inspired by Rise, the zero-gravity indicator selected for Artemis II. The token is separate from the spacecraft and mission.",
  },
  {
    question: "Where can I find the official links?",
    answer:
      "The Telegram and X links on this site are the project’s community channels. Check the contract address in the buy section before any swap.",
  },
  {
    question: "Is RISE affiliated with NASA?",
    answer:
      "No. NASA selected the Rise character as Artemis II’s zero-gravity indicator. The token is independently fan-made and has no affiliation with NASA.",
  },
  {
    question: "Is this financial advice?",
    answer:
      "No. Nothing on this site is financial advice. Do your own research before making financial decisions.",
  },
];

export default function FAQ() {
  const [openQuestion, setOpenQuestion] = useState(0);

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-title">
      <div className="faq-heading">
        <h2 id="faq-title">Questions</h2>
      </div>
      <div className="faq-list">
        {questions.map(({ question, answer }, index) => {
          const isOpen = openQuestion === index;
          const answerId = `faq-answer-${index}`;

          return (
            <article className="faq-item" key={question}>
              <button
                aria-controls={answerId}
                aria-expanded={isOpen}
                className="faq-trigger"
                onClick={() => setOpenQuestion(isOpen ? -1 : index)}
                type="button"
              >
                <span>{question}</span>
                <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
              </button>
              <div className="faq-answer" hidden={!isOpen} id={answerId}>
                <p>{answer}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
