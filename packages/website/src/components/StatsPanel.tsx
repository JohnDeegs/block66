import type { StorageData } from "@block66/shared";

interface Props {
  data: StorageData;
}

export function StatsPanel({ data }: Props) {
  const sites = Object.values(data.blockedSites);
  const totalEmergencies = sites.reduce((s, x) => s + x.emergencyUseCount, 0);
  const cleanSites = sites.filter((s) => s.emergencyUseCount === 0).length;
  const activeEmergencies = Object.keys(data.emergencyAccess).length;

  return (
    <div className="stats-panel">
      <div className="stat-card">
        <div className="stat-number">{sites.length}</div>
        <div className="stat-label">Sites blocked</div>
      </div>
      <div className="stat-card">
        <div className="stat-number clean">{cleanSites}</div>
        <div className="stat-label">No-bypass streak</div>
      </div>
      <div className="stat-card">
        <div className="stat-number warn">{totalEmergencies}</div>
        <div className="stat-label">Total bypasses used</div>
      </div>
      {activeEmergencies > 0 && (
        <div className="stat-card active">
          <div className="stat-number accent">{activeEmergencies}</div>
          <div className="stat-label">Active access window{activeEmergencies !== 1 ? "s" : ""}</div>
        </div>
      )}
    </div>
  );
}
