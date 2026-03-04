import { useNavigate } from "react-router-dom";
import { useExtension } from "../hooks/useExtension";
import { ExtensionGate } from "../components/ExtensionGate";
import { AddSiteForm } from "../components/AddSiteForm";
import { SiteRow } from "../components/SiteRow";
import { StatsPanel } from "../components/StatsPanel";
import "./Dashboard.css";

export function Dashboard() {
  const navigate = useNavigate();
  const { status, data, refresh, sendMessage } = useExtension();

  return (
    <div className="dashboard-page">
      <nav>
        <div className="container nav-inner">
          <button className="nav-logo" onClick={() => navigate("/")}>
            Block66
          </button>
          <button className="btn btn-ghost" onClick={refresh} title="Refresh data">
            ↻ Refresh
          </button>
        </div>
      </nav>

      <main className="container dashboard-main">
        {status === "detecting" && (
          <div className="detecting">
            <p>Connecting to extension...</p>
          </div>
        )}

        {(status === "not-installed" || status === "error") && (
          <ExtensionGate />
        )}

        {status === "connected" && data && (
          <>
            <div className="dashboard-header">
              <div>
                <h1 className="dashboard-title">Your Crucible</h1>
                <p className="dashboard-sub">
                  {Object.keys(data.blockedSites).length === 0
                    ? "No sites blocked yet. Add your first one below."
                    : `${Object.keys(data.blockedSites).length} site${Object.keys(data.blockedSites).length !== 1 ? "s" : ""} in the crucible.`}
                </p>
              </div>
            </div>

            <StatsPanel data={data} />

            <section className="add-section">
              <h2 className="section-heading">Block a new site</h2>
              <AddSiteForm onAdd={sendMessage} />
            </section>

            {Object.keys(data.blockedSites).length > 0 && (
              <section className="sites-section">
                <h2 className="section-heading">Active blocks</h2>
                <div className="sites-list">
                  {Object.values(data.blockedSites).map((site) => (
                    <SiteRow
                      key={site.domain}
                      site={site}
                      hasEmergencyAccess={
                        !!data.emergencyAccess[site.domain] &&
                        data.emergencyAccess[site.domain].expiresAt >
                          Date.now()
                      }
                      onRemove={(domain) =>
                        sendMessage({ type: "REMOVE_SITE", domain })
                      }
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
