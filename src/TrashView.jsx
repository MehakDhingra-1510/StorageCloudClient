import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import Header from "./components/Header";
import DirectoryList from "./components/DirectoryList";
import Modal from "./components/Modal";
import { DirectoryContext } from "./context/DirectoryContext";
import {
  getTrashItems,
  restoreDirectory,
  permanentlyDeleteDirectory,
  emptyTrash,
} from "./api/directoryApi";
import { restoreFile, permanentlyDeleteFile } from "./api/fileApi";

function TrashView() {
  const navigate = useNavigate();
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [permanentDeleteItem, setPermanentDeleteItem] = useState(null);
  const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);
  const [emptyingTrash, setEmptyingTrash] = useState(false);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [viewMode] = useState("list");

  async function loadTrash() {
    setLoading(true);
    try {
      const data = await getTrashItems();
      setDirectoriesList(data.directories || []);
      setFilesList(data.files || []);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setErrorMessage(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrash();
  }, []);

  useEffect(() => {
    const handleDocumentClick = () => setActiveContextMenu(null);
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  async function handleRestore(item) {
    try {
      if (item.isDirectory) await restoreDirectory(item.id);
      else await restoreFile(item.id);
      loadTrash();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  async function handlePermanentDeleteConfirm() {
    const item = permanentDeleteItem;
    if (!item) return;
    try {
      if (item.isDirectory) await permanentlyDeleteDirectory(item.id);
      else await permanentlyDeleteFile(item.id);
      setPermanentDeleteItem(null);
      loadTrash();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
      setPermanentDeleteItem(null);
    }
  }

  async function handleEmptyTrash() {
    setEmptyingTrash(true);
    try {
      await emptyTrash();
      setConfirmEmptyTrash(false);
      loadTrash();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
      setConfirmEmptyTrash(false);
    } finally {
      setEmptyingTrash(false);
    }
  }

  const items = [
    ...directoriesList.map((d) => ({ ...d, isDirectory: true })),
    ...filesList.map((f) => ({ ...f, isDirectory: false })),
  ];

  return (
    <DirectoryContext.Provider
      value={{
        mode: "trash",
        handleRowClick: () => { }, // items in trash aren't openable
        activeContextMenu,
        handleContextMenu: (e, id) => {
          e.stopPropagation();
          e.preventDefault();
          setActiveContextMenu((prev) => (prev === id ? null : id));
        },
        isUploading: false,
        progressMap: {},
        handleCancelUpload: () => { },
        onRestore: handleRestore,
        onPermanentDelete: (item) => setPermanentDeleteItem(item),
      }}
    >
      <div className="min-h-screen bg-slate-50">
        <Header />

        <main className="max-w-7xl mx-auto p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold text-slate-900 tracking-tight">
                Trash
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Items stay here until you restore or permanently delete them.
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={() => setConfirmEmptyTrash(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 px-3.5 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Empty trash
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-blue-600 mb-4"></div>
              <p className="text-sm text-slate-500">Loading…</p>
            </div>
          ) : items.length > 0 ? (
            <DirectoryList items={items} viewMode={viewMode} />
          ) : (
            <div className="text-center py-16 sm:py-20">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Trash2 className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-1.5">
                Trash is empty
              </h3>
              <p className="text-slate-500 text-sm">
                Anything you delete from your drive shows up here first.
              </p>
            </div>
          )}
        </main>
      </div>

      {permanentDeleteItem && (
        <Modal
          icon={Trash2}
          tone="danger"
          title={`Delete forever?`}
          onClose={() => setPermanentDeleteItem(null)}
          footer={
            <>
              <button
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                onClick={() => setPermanentDeleteItem(null)}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                onClick={handlePermanentDeleteConfirm}
              >
                Delete forever
              </button>
            </>
          }
        >
          <p className="text-sm leading-relaxed text-slate-600">
            <span className="font-medium text-slate-900">"{permanentDeleteItem.name}"</span>{" "}
            will be permanently deleted{permanentDeleteItem.isDirectory ? ", along with everything inside it," : ""}{" "}
            and can't be recovered.
          </p>
        </Modal>
      )}

      {confirmEmptyTrash && (
        <Modal
          icon={Trash2}
          tone="danger"
          title="Empty trash?"
          onClose={() => setConfirmEmptyTrash(false)}
          footer={
            <>
              <button
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                onClick={() => setConfirmEmptyTrash(false)}
                disabled={emptyingTrash}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                onClick={handleEmptyTrash}
                disabled={emptyingTrash}
              >
                {emptyingTrash ? "Emptying…" : "Empty trash"}
              </button>
            </>
          }
        >
          <p className="text-sm leading-relaxed text-slate-600">
            All {items.length} item{items.length === 1 ? "" : "s"} in your trash will be
            permanently deleted and can't be recovered.
          </p>
        </Modal>
      )}
    </DirectoryContext.Provider>
  );
}

export default TrashView;