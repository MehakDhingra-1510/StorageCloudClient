import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { File as FileIcon, Folder, Users } from "lucide-react";
import Header from "./components/Header";
import FilePreviewModal from "./components/FilePreviewModal";
import { listSharedWithMe } from "./api/shareApi";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        role === "editor"
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      {role === "editor" ? "Can edit" : "Can view"}
    </span>
  );
}

function SharedWithMe() {
  const navigate = useNavigate();
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);

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
      else console.error("Failed to load shares:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpen(share) {
    if (share.resourceType === "directory") {
      navigate(`/drive/directory/${share.resourceId}`);
    } else {
      setPreviewFile({ id: share.resourceId, name: share.resourceName });
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
            Files and folders other people have shared with your account.
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
              <h3 className="font-display font-semibold text-slate-900 mb-1">
                Nothing shared with you yet
              </h3>
              <p className="text-sm text-slate-500 max-w-sm">
                When someone shares a file or folder with your email, it'll show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {shares.map((share) => {
                const Icon = share.resourceType === "directory" ? Folder : FileIcon;
                return (
                  <li
                    key={share._id}
                    onClick={() => handleOpen(share)}
                    className="flex cursor-pointer items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50"
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${
                        share.resourceType === "directory" ? "text-blue-500" : "text-slate-400"
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
                    <RoleBadge role={share.role} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      {previewFile && (
        <FilePreviewModal file={previewFile} baseUrl={BASE_URL} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
}

export default SharedWithMe;
