const CHROME_STORE_URL = "#"; // Replace after publishing
const FIREFOX_STORE_URL = "#";

export function ExtensionGate() {
  return (
    <div className="gate-wrap">
      <div className="gate-card">
        <div className="gate-icon">🔌</div>
        <h2>Extension not detected</h2>
        <p>
          Block66 needs the browser extension to manage your blocklist. Install
          it once, then come back here for the full dashboard.
        </p>
        <div className="gate-btns">
          <a className="btn btn-primary btn-lg" href={CHROME_STORE_URL}>
            Add to Chrome
          </a>
          <a className="btn btn-ghost btn-lg" href={FIREFOX_STORE_URL}>
            Firefox Add-on
          </a>
        </div>
        <p className="gate-note">
          Already installed?{" "}
          <button
            className="link-btn"
            onClick={() => window.location.reload()}
          >
            Refresh the page
          </button>{" "}
          or check that the extension is enabled.
        </p>
        <p className="gate-dev-note">
          <strong>Dev mode:</strong> Set{" "}
          <code>VITE_EXTENSION_ID</code> in{" "}
          <code>packages/website/.env.local</code> to your unpacked extension
          ID from <code>chrome://extensions</code>.
        </p>
      </div>
    </div>
  );
}
