import { useEffect, useState } from "react";
import { ChevronRight, Folder, MoveRight } from "lucide-react";
import Modal from "./Modal";
import { getDirectoryItems, moveDirectory } from "../api/directoryApi";
import { moveFile } from "../api/fileApi";

function MoveModal({ item, onClose, onMoved }) {
    // currentDirId is always the real backend id of the folder currently being
    // browsed (resolved from the API response, not a "root" placeholder), so
    // it can be sent straight to the move endpoint with no extra mapping.
    const [currentDirId, setCurrentDirId] = useState(null);
    const [currentDirName, setCurrentDirName] = useState("My Drive");
    const [path, setPath] = useState([]); // breadcrumb trail above the current folder
    const [subDirectories, setSubDirectories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [moving, setMoving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadFolder("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadFolder(dirId) {
        setLoading(true);
        setError("");
        try {
            const data = await getDirectoryItems(dirId || "");
            setCurrentDirId(data._id);
            setCurrentDirName(dirId ? data.name : "My Drive");
            // Hide the item being moved from the listing — you can't navigate
            // into (or select) the very folder you're trying to relocate.
            setSubDirectories((data.directories || []).filter((d) => d.id !== item.id));
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    }

    function openFolder(dir) {
        setPath((prev) => [...prev, { id: currentDirId, name: currentDirName }]);
        loadFolder(dir.id);
    }

    function goToBreadcrumb(index) {
        if (index === -1) {
            setPath([]);
            loadFolder("");
            return;
        }
        const target = path[index];
        setPath(path.slice(0, index));
        loadFolder(target.id);
    }

    const alreadyHere =
        !loading && item.parentDirId && currentDirId
            ? item.parentDirId.toString() === currentDirId.toString()
            : false;

    async function handleMoveHere() {
        setMoving(true);
        setError("");
        try {
            if (item.isDirectory) {
                await moveDirectory(item.id, currentDirId);
            } else {
                await moveFile(item.id, currentDirId);
            }
            onMoved?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setMoving(false);
        }
    }

    return (
        <Modal
            icon={MoveRight}
            title={`Move "${item.name}"`}
            onClose={onClose}
            maxWidth="max-w-lg"
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleMoveHere}
                        disabled={moving || loading || alreadyHere}
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {moving ? "Moving…" : alreadyHere ? "Already here" : `Move here`}
                    </button>
                </>
            }
        >
            <div className="mb-3 flex flex-wrap items-center gap-1 text-sm text-slate-500">
                <button onClick={() => goToBreadcrumb(-1)} className="hover:text-blue-600 hover:underline">
                    My Drive
                </button>
                {path.map((p, i) => (
                    <span key={p.id} className="flex items-center gap-1">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <button onClick={() => goToBreadcrumb(i)} className="hover:text-blue-600 hover:underline">
                            {p.name}
                        </button>
                    </span>
                ))}
                <span className="flex items-center gap-1 font-medium text-slate-700">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    {currentDirName}
                </span>
            </div>

            {error && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {error}
                </div>
            )}

            <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-blue-600"></div>
                    </div>
                ) : subDirectories.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">No subfolders here</p>
                ) : (
                    subDirectories.map((dir) => (
                        <button
                            key={dir.id}
                            onClick={() => openFolder(dir)}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                        >
                            <Folder className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{dir.name}</span>
                        </button>
                    ))
                )}
            </div>
        </Modal>
    );
}

export default MoveModal;