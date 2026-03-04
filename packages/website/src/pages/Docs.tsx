import { useNavigate } from "react-router-dom";
import "./Docs.css";

export function Docs() {
  const navigate = useNavigate();

  return (
    <div className="docs-page">
      <nav>
        <div className="container nav-inner">
          <button className="nav-logo" onClick={() => navigate("/")}>
            Block66
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
        </div>
      </nav>

      <main className="container docs-main">
        <h1 className="docs-title">How Block66 Works</h1>
        <p className="docs-lead">
          Block66 uses your browser extension to block distracting websites for exactly 66 days —
          the scientifically backed duration for forming a lasting habit.
        </p>

        <div className="docs-toc">
          <a href="#installation">Installation</a>
          <a href="#blocking">Blocking a site</a>
          <a href="#focus-screen">The Focus Screen</a>
          <a href="#emergency">Emergency Access</a>
          <a href="#wrong-answer">Wrong answers</a>
          <a href="#faq">FAQ</a>
        </div>

        <section id="installation" className="docs-section">
          <h2>Installation</h2>
          <ol className="docs-steps">
            <li>Install the Block66 extension from the Chrome Web Store.</li>
            <li>
              Pin it to your toolbar so the popup is easy to reach — click the puzzle icon in
              Chrome and pin Block66.
            </li>
            <li>
              Visit <strong>this dashboard</strong> to manage your blocked sites. The extension
              popup also has a shortcut button to open it.
            </li>
          </ol>
        </section>

        <section id="blocking" className="docs-section">
          <h2>Blocking a site</h2>
          <p>
            In the dashboard, type a domain (e.g. <code>reddit.com</code>) into the input field and
            click <strong>Block for 66 Days</strong>. The block takes effect immediately.
          </p>
          <div className="docs-callout">
            <strong>The block is intentionally immutable.</strong> You cannot remove a site once the
            66-day period is running — that commitment is the point. A dev-mode remove button is
            visible during testing but will be hidden before public release.
          </div>
          <p>
            The extension uses Chrome's <code>declarativeNetRequest</code> API to intercept
            navigation to the blocked domain and redirect it to the Focus Screen. This works at the
            browser level — no page content is loaded from the blocked site at all.
          </p>
        </section>

        <section id="focus-screen" className="docs-focus-screen docs-section">
          <h2>The Focus Screen</h2>
          <p>
            When you visit a blocked site, you'll see the Focus Screen instead. It shows:
          </p>
          <ul>
            <li>The domain you tried to visit</li>
            <li>How many days remain in your 66-day commitment</li>
            <li>A progress bar showing how far through the 66 days you are</li>
            <li>A daily motivational message</li>
            <li>The Lally et al. study quote and a link to read it</li>
            <li>An <strong>Emergency 1-Hour Access</strong> button</li>
          </ul>
        </section>

        <section id="emergency" className="docs-section">
          <h2>Emergency Access</h2>
          <p>
            If you genuinely need to visit a blocked site, you can request a 1-hour emergency
            access window. This is not a free pass — it requires passing a <strong>Cognitive
            Gate</strong> of 5 trivia questions in a row.
          </p>
          <p>
            The questions are fetched from{" "}
            <a href="https://opentdb.com" target="_blank" rel="noopener noreferrer">
              Open Trivia Database
            </a>{" "}
            at medium difficulty. Answer all 5 correctly and the block lifts for exactly 60 minutes.
            A floating countdown timer appears on the page during this window.
          </p>
          <p>
            Each emergency use is counted and shown on your dashboard, so you can track how many
            times you've bypassed the block.
          </p>
          <div className="docs-callout docs-callout--warn">
            The trivia gate requires an internet connection to fetch questions. If the question
            service is rate-limited or unavailable, you'll see an error and a retry option — access
            is never silently granted.
          </div>
        </section>

        <section id="wrong-answer" className="docs-section">
          <h2>Wrong answers</h2>
          <p>
            Answer any trivia question incorrectly and you'll see the Wrong Answer Screen. It shows
            the question, the correct answer, and your current streak (how many days you've gone
            without using emergency access).
          </p>
          <p>You then choose one of two paths:</p>
          <ul>
            <li>
              <strong>Retry now</strong> — get a new set of 5 questions immediately. No penalty,
              but you start the question set from scratch.
            </li>
            <li>
              <strong>Wait 5 minutes</strong> — a 5-minute cooldown timer starts. Once it expires
              you can try again. Use this if you want to step away from the screen first.
            </li>
          </ul>
        </section>

        <section id="faq" className="docs-section">
          <h2>FAQ</h2>

          <div className="faq-item">
            <h3>Will it still block sites if I close my laptop?</h3>
            <p>
              Yes. The blocking rules and your 66-day timer are stored locally in your browser and
              persist across restarts. The dashboard website does not need to be running.
            </p>
          </div>

          <div className="faq-item">
            <h3>Can other people see my block list?</h3>
            <p>
              No. All data is stored in <code>chrome.storage.local</code> on your machine only.
              Nothing is sent to any server. Each user who installs the extension sees only their
              own data.
            </p>
          </div>

          <div className="faq-item">
            <h3>What happens after 66 days?</h3>
            <p>
              The block is automatically removed. The site disappears from your dashboard and you
              can visit it freely again. Whether you choose to re-block it is up to you — hopefully
              you won't need to.
            </p>
          </div>

          <div className="faq-item">
            <h3>Does it work on mobile?</h3>
            <p>
              Not yet. Block66 is a browser extension and currently only supports Chrome on desktop.
              Firefox support is built in but not yet published to the Firefox Add-ons store.
            </p>
          </div>

          <div className="faq-item">
            <h3>What if I uninstall the extension?</h3>
            <p>
              The blocks will stop working immediately if the extension is removed. Block66 relies
              on the extension being installed to enforce the rules — it cannot block sites without
              it.
            </p>
          </div>

          <div className="faq-item">
            <h3>Why 66 days?</h3>
            <p>
              A 2010 study by Lally et al. published in the{" "}
              <em>European Journal of Social Psychology</em> found that on average it takes 66 days
              for a new behaviour to become automatic. This is the most rigorous scientific estimate
              available — earlier claims of "21 days" were based on anecdote, not data.{" "}
              <a
                href="https://onlinelibrary.wiley.com/doi/abs/10.1002/ejsp.674"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the study.
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
