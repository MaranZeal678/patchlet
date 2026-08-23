import Link from "next/link";
import { EmbedSnippet } from "@/components/EmbedSnippet";

const STEPS = [
  {
    title: "It reads your product",
    body: "Upload your documentation and connect the repository. Mistral OCR parses every page, and the answers are grounded in what you actually shipped.",
  },
  {
    title: "It shows people where to click",
    body: "The agent reads the page the user is on and points at the real control, step by step, instead of reciting directions they have to translate.",
  },
  {
    title: "It builds what is missing",
    body: "When a feature genuinely does not exist, it says so, files the request, and Codestral drafts the change. A developer approves, and the product ships.",
  },
];

const PROOF = [
  { label: "Checks before it answers", value: "Three" },
  { label: "From question to guidance", value: "Under 4s" },
  { label: "Built entirely on", value: "Mistral" },
];

export default function Home() {
  return (
    <main className="landing">
      <header className="landing__bar">
        <span className="landing__mark">Patchlet</span>
        <nav className="landing__nav">
          <a href="#how">How it works</a>
          <a href="#embed">Install</a>
          <Link className="landing__cta" href="/console">
            Open console
          </Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero__rings" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="hero__eyebrow">
          <span className="hero__dot" aria-hidden="true" />
          Support that closes the loop
        </p>
        <h1 className="hero__title">
          Support that <em>sees</em> your product and <em>fixes</em> what it is missing.
        </h1>
        <p className="hero__lead">
          Patchlet answers from your own documentation, guides people to the right control on the
          page they are looking at, and turns the requests you cannot answer into real changes.
        </p>
        <div className="hero__actions">
          <Link className="btn btn--primary" href="/console">
            Open the console
          </Link>
          <a className="btn btn--ghost" href="#how">
            See how it works <span aria-hidden="true">→</span>
          </a>
        </div>
        <dl className="proof">
          {PROOF.map((item) => (
            <div key={item.label} className="proof__item">
              <dt>{item.value}</dt>
              <dd>{item.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="how" className="section">
        <h2 className="section__title">Three things, in order</h2>
        <div className="cards">
          {STEPS.map((step, index) => (
            <article key={step.title} className="card">
              <span className="card__index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="embed" className="section section--alt">
        <h2 className="section__title">One script tag</h2>
        <p className="section__lead">
          Drop this into the page you want supported. Nothing else changes, and the widget never
          touches your styles.
        </p>
        <EmbedSnippet />
      </section>

      <footer className="landing__foot">
        <span>Patchlet</span>
        <Link href="/console">Console</Link>
      </footer>
    </main>
  );
}
