import { daysRemaining } from "@block66/shared";
import type { BlockedSite } from "@block66/shared";

interface Props {
  site: BlockedSite;
  hasEmergencyAccess: boolean;
  onRemove: (domain: string) => void;
}

export function SiteRow({ site, hasEmergencyAccess, onRemove }: Props) {
  const days = daysRemaining(site.startTimestamp);
  const totalDays = Math.floor(
    (Date.now() - site.startTimestamp) / (24 * 60 * 60 * 1000)
  );
  const progress = Math.min(100, (totalDays / 66) * 100);

  return (
    <div className={`site-row ${hasEmergencyAccess ? "emergency-active" : ""}`}>
      <div className="site-row-header">
        <div className="site-info">
          <span className="site-domain">{site.domain}</span>
          {hasEmergencyAccess && (
            <span className="emergency-badge">1h access active</span>
          )}
        </div>
        <div className="site-stats">
          <span className="days-remaining">{days}d left</span>
          {site.emergencyUseCount > 0 && (
            <span className="emergency-count">
              {site.emergencyUseCount} bypass{site.emergencyUseCount !== 1 ? "es" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="progress-bar-wrap">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="site-row-footer">
        <span className="days-label">Day {totalDays} of 66</span>
        {site.emergencyUseCount === 0 && (
          <span className="streak-label">✓ No bypasses</span>
        )}
        <button
          className="dev-remove-btn"
          onClick={() => onRemove(site.domain)}
          title="Dev mode: remove block"
        >
          🛠 Remove
        </button>
      </div>
    </div>
  );
}
