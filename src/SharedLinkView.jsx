import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, ExternalLink, File as FileIcon, Folder, ShieldAlert } from "lucide-react";
import Logo from "./components/Logo";
import { accessSharedLink } from "./api/shareApi";
import { formatFileSize, getExtension } from "./utils/helpers";

function PreviewBody({ name, url }) {
  const ext = getExtension(name);

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
    return (
      <div className="flex min-h-[20rem] items-center justify-center rounded-lg bg-slate-50">
        <img src={url} alt={name} className="max-h-[60vh] max-w-full rounded-lg object-contain" />
      </div>
    );
  }
  if (ext === "pdf") {
    return <iframe src={url} title={name} className="h-[65vh] w-full rounded-lg border border-slate-200" />;
  }
  if (["mp4", "webm", "ogg", "mov"].includes(ext)) {
    return (
      <div className="flex justify-center rounded-lg bg-slate-50 p-4">
        <video controls className="max-h-[60vh] max-w-full rounded-lg" src={url} />
      </div>
    );
  }
  if (["mp3", "wav", "m4a"].includes(ext)) {
    return (
      <div className="rounded-lg bg-slate-50 p-10 text-center">
        <audio controls className="mx-auto w-full max-w-md" src={url} />
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-slate-50 py-16 text-center">
      <FileIcon className="mx-auto mb-4 h-10 w-10 text-slate-300" />
      <p className="text-slate-600">Preview isn't available for this file type.</p>
    </div>
  );
}

function SharedLinkView() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [token]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await accessSharedLink(token);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.error || "This share link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    try {
      const fresh = await accessSharedLink(token, { download: true });
      window.location.href = fresh.url;
    } catch {
      // fall back to whatever URL we already have
      if (data?.url) window.location.href = data.url;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3.5 sm:px-6">
        <Link to="/" className="inline-flex">
          <Logo />
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 mb-4" />
            <p className="text-sm text-slate-500">Loading shared content…</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <ShieldAlert className="h-7 w-7 text-red-400" />
            </div>
            <h1 className="font-display text-lg font-semibold text-slate-900 mb-1.5">
              Can't open this link
            </h1>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">{error}</p>
          </div>
        ) : data.resourceType === "file" ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <FileIcon className="h-5 w-5 shrink-0 text-slate-400" />
                <h1 className="truncate font-display text-lg font-semibold text-slate-900">
                  {data.name}
                </h1>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <a
                  href={data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition-colors hover:bg-slate-50"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            <PreviewBody name={data.name} url={data.url} />
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
              <Folder className="h-5 w-5 text-blue-500" />
              <h1 className="font-display text-lg font-semibold text-slate-900">{data.name}</h1>
            </div>

            {data.directories.length === 0 && data.files.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">This folder is empty.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.directories.map((dir) => (
                  <li key={dir.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                    <Folder className="h-4 w-4 shrink-0 text-blue-400" />
                    <span className="truncate text-slate-700">{dir.name}</span>
                  </li>
                ))}
                {data.files.map((file) => (
                  <li key={file.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                    <FileIcon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate text-slate-700">{file.name}</span>
                    <span className="ml-auto shrink-0 text-xs text-slate-400">
                      {formatFileSize(file.size)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
              Opening individual files or nested folders from a public folder link isn't
              supported yet — ask the owner to share this account's email directly for full access.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default SharedLinkView;
