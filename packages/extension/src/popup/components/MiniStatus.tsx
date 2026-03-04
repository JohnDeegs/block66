import { useEffect, useState } from "react";
import { getStorage, daysRemaining } from "@block66/shared";
import type { BlockedSite } from "@block66/shared";

const DASHBOARD_URL = "http://localhost:5173/dashboard";

export function MiniStatus() {
  const [sites, setSites] = useState<BlockedSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStorage().then((data) => {
      setSites(Object.values(data.blockedSites));
      setLoading(false);
    });
  }, []);

  const openDashboard = () => {
    chrome.tabs.create({ url: DASHBOARD_URL });
    window.close();
  };

  return (
    <div className="mini-status">
      <div className="header">
        <span className="logo">Block66</span>
        <button className="dashboard-btn" onClick={openDashboard}>
          Open Dashboard →
        </button>
      </div>

      {loading ? (
        <p className="empty">Loading...</p>
      ) : sites.length === 0 ? (
        <p className="empty">No sites blocked yet.</p>
      ) : (
        <ul className="site-list">
          {sites.map((site) => {
            const days = daysRemaining(site.startTimestamp);
            return (
              <li key={site.domain} className="site-item">
                <span className="site-domain">{site.domain}</span>
                <span className="site-days">{days}d left</span>
              </li>
            );
          })}
        </ul>
      )}

      <button className="add-btn" onClick={openDashboard}>
        + Block a site
      </button>
    </div>
  );
}
