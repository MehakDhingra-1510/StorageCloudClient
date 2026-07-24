import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { File as FileIcon, FolderOpen, Folder, Users } from "lucide-react";
import Header from "./components/Header";
import { listSharedWithMe } from "./api/shareApi";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

function SharedWithMe() {
  const navigate = useNavigate();
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await listSharedWithMe();
      setShares(data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setErrorMessage(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  // Directories are browsable in place (getEffectiveRole already grants
  // access via the share), so send those straight into the normal drive
  // view. Files don't have a dedicated viewer route here, so open/download
  // them directly the same way a file row in your own drive does.
  function openShare(share) {
    if (share.resourceType === "directory") {
      navigate(`/drive/directory/${share.resourceId}`);
    } else {
      window.location.href = `${BASE_URL}/file/${share.resourceId}?action=download`;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-slate-900 tracking-tight">
            Shared with me
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Files and folders other people have shared with you.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
            {errorMessage}
          </div>
        )}

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
              <h3 className="font-display font-semibold text-slate-900 mb-1">
                Nothing shared with you yet
              </h3>
              <p className="text-sm text-slate-500 max-w-sm">
                When someone shares a file or folder with your email address, it'll show up
                here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {shares.map((share) => {
                const Icon = share.resourceType === "directory" ? Folder : FileIcon;
                return (
                  <li key={share._id} className="flex items-center gap-3 px-5 py-3.5">
                    <Icon
                      className={`h-5 w-5 shrink-0 ${share.resourceType === "directory" ? "text-blue-500" : "text-slate-400"
                        }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {share.resourceName}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        Shared by {share.ownerName || share.ownerEmail || "someone"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                      {share.role}
                    </span>
                    <button
                      onClick={() => openShare(share)}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                      Open
                    </button>
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

export default SharedWithMe;