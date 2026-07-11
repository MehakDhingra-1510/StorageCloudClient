import { useEffect, useState } from "react";
import { Check, Copy, Link2, Share2, Trash2 } from "lucide-react";
import Modal from "./Modal";
import { createShare, listSharedByMe, revokeShare, updateShareRole } from "../api/shareApi";

const CLIENT_URL = window.location.origin;

function RoleSelect({ value, onChange, disabled }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50"
    >
      <option value="viewer">Viewer</option>
      <option value="editor">Editor</option>
    </select>
  );
}

function ShareModal({ item, onClose }) {
  const resourceType = item.isDirectory ? "directory" : "file";

  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [emailRole, setEmailRole] = useState("viewer");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  const emailShares = shares.filter((s) => s.sharedWithEmail);
  const linkShare = shares.find((s) => !s.sharedWithEmail);

  useEffect(() => {
    loadShares();
  }, []);

  async function loadShares() {
    setLoading(true);
    try {
      const all = await listSharedByMe();
      setShares(all.filter((s) => s.resourceId === item.id || s.resourceId === item.id?.toString()));
    } catch (err) {
      console.error("Failed to load shares:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await createShare({ resourceType, resourceId: item.id, role: emailRole, sharedWithEmail: email.trim() });
      setEmail("");
      setEmailRole("viewer");
      await loadShares();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't share — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGenerateLink() {
    setGeneratingLink(true);
    setError("");
    try {
      await createShare({ resourceType, resourceId: item.id, role: "viewer", sharedWithEmail: null });
      await loadShares();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't create a link — please try again.");
    } finally {
      setGeneratingLink(false);
    }
  }

  async function handleRevoke(shareId) {
    try {
      await revokeShare(shareId);
      setShares((prev) => prev.filter((s) => s._id !== shareId));
    } catch (err) {
      console.error("Revoke failed:", err);
    }
  }

  async function handleRoleChange(shareId, role) {
    setShares((prev) => prev.map((s) => (s._id === shareId ? { ...s, role } : s)));
    try {
      await updateShareRole(shareId, role);
    } catch (err) {
      console.error("Role update failed:", err);
      loadShares();
    }
  }

  function handleCopyLink() {
    if (!linkShare) return;
    navigator.clipboard.writeText(`${CLIENT_URL}/share/${linkShare.token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal icon={Share2} title={`Share "${item.name}"`} onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-5">
        {/* Invite by email */}
        <form onSubmit={handleInvite}>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Invite someone by email
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <RoleSelect value={emailRole} onChange={setEmailRole} />
            <button
              type="submit"
              disabled={submitting || !email.trim()}
              className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Sharing…" : "Share"}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            They'll need an existing account with this email to access it.
          </p>
        </form>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}

        {/* People with access */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">People with access</p>
          {loading ? (
            <div className="flex items-center gap-2 py-3 text-sm text-slate-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
              Loading…
            </div>
          ) : emailShares.length === 0 ? (
            <p className="py-2 text-sm text-slate-400">Not shared with anyone yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {emailShares.map((share) => (
                <li
                  key={share._id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2"
                >
                  <span className="min-w-0 truncate text-sm text-slate-700">
                    {share.sharedWithEmail}
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <RoleSelect
                      value={share.role}
                      onChange={(role) => handleRoleChange(share._id, role)}
                    />
                    <button
                      onClick={() => handleRevoke(share._id)}
                      title="Remove access"
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Public link */}
        <div className="border-t border-slate-100 pt-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Public link</p>
          {linkShare ? (
            <div className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <Link2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{CLIENT_URL}/share/{linkShare.token}</span>
              </div>
              <button
                onClick={handleCopyLink}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={() => handleRevoke(linkShare._id)}
                title="Turn off link"
                className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateLink}
              disabled={generatingLink}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <Link2 className="h-4 w-4" />
              {generatingLink ? "Creating link…" : "Create a shareable link"}
            </button>
          )}
          <p className="mt-1.5 text-xs text-slate-400">
            Anyone with this link can view it — no account needed.
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default ShareModal;
