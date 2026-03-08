import { useNavigate } from "react-router-dom";

export function ExtensionGate() {
  const navigate = useNavigate();
  return (
    <div className="gate-wrap">
      <div className="gate-card">
        <div className="gate-icon">🔒</div>
        <h2>Sign in to continue</h2>
        <p>
          Block66 uses your account to keep your block list in sync across
          devices. Sign in or create a free account to access your dashboard.
        </p>
        <div className="gate-btns">
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/login")}>
            Sign in
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate("/signup")}>
            Create account
          </button>
        </div>
        <p className="gate-note">
          Your block list is private and stored securely. No one else can see it.
        </p>
      </div>
    </div>
  );
}
