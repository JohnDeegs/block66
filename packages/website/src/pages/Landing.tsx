import { useNavigate } from "react-router-dom";
import "./Landing.css";

const CHROME_STORE_URL = "#"; // Replace with actual store URL after publishing
const FIREFOX_STORE_URL = "#";

const features = [
  {
    icon: "🔒",
    title: "66-Day Lock",
    desc: "Backed by Lally et al. (2010) — the real science behind habit formation. Not 21 days. 66.",
  },
  {
    icon: "🧠",
    title: "Cognitive Gate",
    desc: "Emergency access requires answering 5 trivia questions. If you really need it, you'll earn it.",
  },
  {
    icon: "⏱️",
    title: "1-Hour Windows",
    desc: "Pass the challenge and get 60 minutes of access. A floating timer keeps you honest.",
  },
  {
    icon: "📊",
    title: "Streak Tracking",
    desc: "See how many days you've gone without bypassing your blocks. The streak is the motivation.",
  },
  {
    icon: "🛡️",
    title: "Immutable Blocks",
    desc: "You can't undo a block until the 66 days are up. That's the point.",
  },
  {
    icon: "🔐",
    title: "100% Private",
    desc: "Everything lives on your device. No accounts, no cloud, no tracking.",
  },
];

const faqs = [
  {
    q: "Why 66 days?",
    a: "A 2010 UCL study by Phillippa Lally found that on average it takes 66 days — not the often-quoted 21 — for a new behaviour to become automatic. Block66 enforces this timeline so you don't bail when it gets hard.",
  },
  {
    q: "What if I genuinely need access?",
    a: "The Emergency Access gate exists for real needs. Answer 5 trivia questions correctly and you'll get 60 minutes of access. The friction is intentional — it forces a moment of reflection before you give in.",
  },
  {
    q: "Can I remove a site before 66 days?",
    a: "No. That's not a bug, it's the whole product. If you could remove sites whenever willpower ran out, it would be like every other blocker.",
  },
  {
    q: "Does it work on mobile?",
    a: "V1 is a desktop browser extension for Chrome and Firefox. Mobile support is planned for V2.",
  },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <nav>
        <div className="container nav-inner">
          <span className="nav-logo">Block66</span>
          <div className="nav-actions">
            <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
            <a className="btn btn-primary" href={CHROME_STORE_URL}>
              Install for Chrome
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-badge">Science-backed habit breaking</div>
          <h1 className="hero-title">
            Block it for <span className="accent">66 days.</span>
            <br />
            Break it forever.
          </h1>
          <p className="hero-sub">
            Block66 locks distracting websites for the scientifically proven
            habit-breaking window. No easy opt-outs. No "just this once."
          </p>
          <div className="hero-ctas">
            <a className="btn btn-primary btn-lg" href={CHROME_STORE_URL}>
              Add to Chrome — Free
            </a>
            <a className="btn btn-ghost btn-lg" href={FIREFOX_STORE_URL}>
              Firefox Add-on
            </a>
          </div>
          <p className="hero-note">No account required · All data stays on your device</p>
        </div>

        {/* Demo card */}
        <div className="container">
          <div className="demo-card">
            <div className="demo-logo">Block66</div>
            <div className="demo-domain">reddit.com</div>
            <div className="demo-days-card">
              <div className="demo-days-number">48</div>
              <div className="demo-days-label">days remaining in your crucible</div>
            </div>
            <p className="demo-message">The urge to scroll will pass. It always does.</p>
            <button className="demo-emergency-btn">Emergency 1-Hour Access</button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Everything you need to actually quit</h2>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <div className="steps">
            {[
              { n: "1", title: "Add a site", desc: "Enter a domain. Click \u201cBlock for 66 Days.\u201d That\u2019s it." },
              { n: "2", title: "The block begins", desc: "Every visit redirects to a Focus Screen showing your days remaining." },
              { n: "3", title: "Emergency? Prove it.", desc: "Answer 5 trivia questions to get 60 minutes of access. Wrong answer? Retry now, or face a 5-minute cooldown." },
              { n: "4", title: "66 days later", desc: "The block auto-lifts. By then, the habit is broken." },
            ].map((step) => (
              <div key={step.n} className="step">
                <div className="step-number">{step.n}</div>
                <div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="container">
          <h2 className="section-title">Common questions</h2>
          <div className="faq-list">
            {faqs.map((faq) => (
              <div key={faq.q} className="faq-item">
                <h3 className="faq-q">{faq.q}</h3>
                <p className="faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Ready to actually change?</h2>
          <p>
            Free. Private. No account. Just 66 days between you and a new habit.
          </p>
          <a className="btn btn-primary btn-lg" href={CHROME_STORE_URL}>
            Install Block66 for Chrome
          </a>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <span className="nav-logo">Block66</span>
          <span className="footer-note">
            Built on science. Lally et al. (2010). All data stored locally.
          </span>
        </div>
      </footer>
    </div>
  );
}
