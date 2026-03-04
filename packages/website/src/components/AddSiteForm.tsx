import { useState } from "react";
import { normalizeDomain, isValidDomain } from "@block66/shared";
import type { ExtensionMessage, ExtensionResponse } from "@block66/shared";

interface Props {
  onAdd: (msg: ExtensionMessage) => Promise<ExtensionResponse>;
}

export function AddSiteForm({ onAdd }: Props) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const domain = normalizeDomain(input);
    if (!domain || !isValidDomain(domain)) {
      setError("Enter a valid domain, e.g. reddit.com");
      return;
    }

    setLoading(true);
    const res = await onAdd({ type: "ADD_SITE", domain });
    setLoading(false);

    if (res.ok) {
      setSuccess(`${domain} blocked for 66 days.`);
      setInput("");
    } else {
      setError("error" in res ? res.error : "Something went wrong.");
    }
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="add-form-row">
        <input
          className="add-input"
          type="text"
          placeholder="reddit.com"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          aria-label="Domain to block"
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Blocking..." : "Block for 66 Days"}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}
    </form>
  );
}
