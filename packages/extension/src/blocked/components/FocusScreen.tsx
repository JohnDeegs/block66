interface Props {
  domain: string;
  daysRemaining: number;
  onEmergencyAccess: () => void;
}

export function FocusScreen({ domain, daysRemaining, onEmergencyAccess }: Props) {
  const messages = [
    "The urge to scroll will pass. It always does.",
    "Every day you resist builds a stronger habit.",
    "Your future self is rooting for you.",
    "Deep work > doom scrolling.",
    "This discomfort is the habit breaking.",
  ];
  const message = messages[Math.floor(Date.now() / 86400000) % messages.length];

  return (
    <div className="focus-screen">
      <div className="logo">Block66</div>
      <div className="domain">{domain}</div>

      <div className="days-card">
        <div className="days-number">{daysRemaining}</div>
        <div className="days-label">days remaining in your crucible</div>
      </div>

      <p className="message">{message}</p>

      <blockquote className="study-quote">
        <p>"On average, it takes <strong>66 days</strong> before a new behaviour becomes automatic."</p>
        <footer>
          — Lally et al., 2010 ·{" "}
          <a
            href="https://onlinelibrary.wiley.com/doi/abs/10.1002/ejsp.674"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the study
          </a>
        </footer>
      </blockquote>

      <button className="emergency-btn" onClick={onEmergencyAccess}>
        Emergency 1-Hour Access
      </button>
    </div>
  );
}
