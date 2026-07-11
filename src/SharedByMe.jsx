import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Copy, File as FileIcon, Folder, Link2, Trash2, Users } from "lucide-react";
import Header from "./components/Header";
import { listSharedByMe, revokeShare, updateShareRole } from "./api/shareApi";

const CLIENT_URL = window.location.origin;

function RoleSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
    >
      <option value="viewer">Viewer</option>
      <option value="editor">Editor</option>
    </select>
  );
}

function SharedByMe() {
  const navigate = useNavigate();
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await listSharedByMe();
      setShares(data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else console.error("Failed to load shares:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(id) {
    try {
      await revokeShare(id);
      setShares((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Revoke failed:", err);
    }
  }

  async function handleRoleChange(id, role) {
    setShares((prev) => prev.map((s) => (s._id === id ? { ...s, role } : s)));
    try {
      await updateShareRole(id, role);
    } catch (err) {
      console.error("Role update failed:", err);
      load();
    }
  }

  function handleCopy(share) {
    navigator.clipboard.writeText(`${CLIENT_URL}/share/${share.token}`);
    setCopiedId(share._id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-slate-900 tracking-tight">
            Shared by me
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Everything you've shared, across every folder and file.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 mb-3" />
              <p className="text-sm text-slate-500">Loading…</p>
            </div>
          ) : shares.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="font-display font-semibold text-slate-900 mb-1">Nothing shared yet</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Use the "Share" option on any file or folder in your drive to invite someone
                or generate a public link.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {shares.map((share) => {
                const Icon = share.resourceType === "directory" ? Folder : FileIcon;
                const isLink = !share.sharedWithEmail;
                return (
                  <li key={share._id} className="flex items-center gap-3 px-5 py-3.5">
                    <Icon
                      className={`h-5 w-5 shrink-0 ${
                        share.resourceType === "directory" ? "text-blue-500" : "text-slate-400"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {share.resourceName}
                      </p>
                      <p className="truncate text-xs text-slate-500 flex items-center gap-1">
                        {isLink ? (
                          <>
                            <Link2 className="h-3 w-3" /> Anyone with the link
                          </>
                        ) : (
                          <>Shared with {share.sharedWithEmail}</>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {isLink && (
                        <button
                          onClick={() => handleCopy(share)}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          {copiedId === share._id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copiedId === share._id ? "Copied" : "Copy link"}
                        </button>
                      )}
                      <RoleSelect
                        value={share.role}
                        onChange={(role) => handleRoleChange(share._id, role)}
                      />
                      <button
                        onClick={() => handleRevoke(share._id)}
                        title="Revoke access"
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default SharedByMe;
