import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Folder, FolderPlus, Search, Upload } from "lucide-react";
import Header from "./components/Header";
import ToolBar from "./components/ToolBar";
import Breadcrumb from "./components/Breadcrumb";
import CreateDirectoryModal from "./components/CreateDirectoryModal";
import RenameModal from "./components/RenameModal";
import DirectoryList from "./components/DirectoryList";
import FilePreviewModal from "./components/FilePreviewModal";
import ShareModal from "./components/ShareModal";
import { DirectoryContext } from "./context/DirectoryContext";
import { FaExclamationTriangle } from "react-icons/fa";

import {
  getDirectoryItems,
  createDirectory,
  deleteDirectory,
  renameDirectory,
  searchDirectory,
} from "./api/directoryApi";

import { deleteFile, renameFile, uploadInitiate, uploadComplete } from "./api/fileApi";
import DetailsPopup from "./components/DetailsPopup";
import ConfirmDeleteModal from "./components/ConfirmDeleteModel";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

function DirectoryView() {
  const { dirId } = useParams();
  const navigate = useNavigate();

  const [directoryName, setDirectoryName] = useState("My Drive");
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [breadCrumb, setBreadCrumb] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreateDirModal, setShowCreateDirModal] = useState(false);
  const [newDirname, setNewDirname] = useState("New Folder");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameType, setRenameType] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // ToolBar state — view/sort are local to the open folder; search now queries
  // the backend across the whole drive (see the debounced effect below).
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [searchResults, setSearchResults] = useState(null); // null = not searching
  const [searchLoading, setSearchLoading] = useState(false);
  const isSearching = searchTerm.trim().length > 0;

  const [shareItem, setShareItem] = useState(null);
  const openShareModal = (item) => setShareItem(item);
  const closeShareModal = () => setShareItem(null);

  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("directoryViewMode") || "grid"
  );
  useEffect(() => {
    localStorage.setItem("directoryViewMode", viewMode);
  }, [viewMode]);

  // File preview modal
  const [previewFile, setPreviewFile] = useState(null);
  const openPreview = (item) => setPreviewFile(item);
  const closePreview = () => setPreviewFile(null);

  // Single-file upload state
  const [uploadItem, setUploadItem] = useState(null); // { id, file, name, size, progress, isUploading }
  const xhrRef = useRef(null);

  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const openDetailsPopup = (item) => setDetailsItem(item);
  const closeDetailsPopup = () => setDetailsItem(null);

  const loadDirectory = async () => {
    setLoading(true);
    try {
      const data = await getDirectoryItems(dirId);
      setDirectoryName(dirId ? data.name : "My Drive");
      setDirectoriesList([...data.directories].reverse());
      setFilesList([...data.files].reverse());
      setBreadCrumb(data.breadCrumb || []);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setErrorMessage(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory();
    setActiveContextMenu(null);
    setSearchTerm("");
  }, [dirId]);

  async function performSearch(query) {
    setSearchLoading(true);
    try {
      const data = await searchDirectory(query);
      setSearchResults({
        directories: data.directories || [],
        files: data.files || [],
      });
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setErrorMessage(err.response?.data?.error || err.message);
    } finally {
      setSearchLoading(false);
    }
  }

  // Debounced, whole-drive search — hits the backend instead of filtering
  // only the items already loaded for the current folder.
  useEffect(() => {
    const query = searchTerm.trim();
    if (!query) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timeoutId = setTimeout(() => performSearch(query), 350);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Reloads whatever's currently on screen — the open folder, and the
  // search results too if a search is active — after a mutating action.
  async function refreshCurrent() {
    await loadDirectory();
    const query = searchTerm.trim();
    if (query) await performSearch(query);
  }

  function handleSortChange(field) {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  function handleRowClick(item) {
    if (item.isDirectory) {
      navigate(`/drive/directory/${item.id}`);
      return;
    }
    if (!item.isUploading) openPreview(item);
  }

  async function uploadFile(file) {
    if (uploadItem?.isUploading) {
      setErrorMessage("An upload is already in progress. Please wait.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    const tempItem = {
      file,
      name: file.name,
      size: file.size,
      id: `temp-${Date.now()}`,
      isUploading: true,
      progress: 0,
    };

    const data = await uploadInitiate({
      name: file.name,
      size: file.size,
      contentType: file.type,
      parentDirId: dirId,
    });

    const { uploadSignedUrl, fileId } = data;

    setFilesList((prev) => [tempItem, ...prev]);
    setUploadItem(tempItem);

    startUpload({ item: tempItem, uploadUrl: uploadSignedUrl, fileId });
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await uploadFile(file);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file).catch((err) => setErrorMessage(err.message));
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragOver(false);
  }

  function startUpload({ item, uploadUrl, fileId }) {
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", item.file.type);

    xhr.upload.addEventListener("progress", (evt) => {
      if (evt.lengthComputable) {
        const progress = (evt.loaded / evt.total) * 100;
        setUploadItem((prev) => (prev ? { ...prev, progress } : prev));
      }
    });

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          await uploadComplete(fileId);
          setUploadItem(null);
          await refreshCurrent();
        } catch (err) {
          console.error(err);
          setErrorMessage("Failed to finalize upload");
        }
      } else {
        setErrorMessage("Upload failed");
      }
    };

    xhr.onerror = () => {
      setErrorMessage("Something went wrong!");
      setFilesList((prev) => prev.filter((f) => f.id !== item.id));
      setUploadItem(null);
      setTimeout(() => setErrorMessage(""), 3000);
    };

    xhr.send(item.file);
  }

  function handleCancelUpload(tempId) {
    if (uploadItem && uploadItem.id === tempId && xhrRef.current) {
      xhrRef.current.abort();
    }
    setFilesList((prev) => prev.filter((f) => f.id !== tempId));
    setUploadItem(null);
  }

  async function confirmDelete(item) {
    try {
      if (item.isDirectory) await deleteDirectory(item.id);
      else await deleteFile(item.id);
      setDeleteItem(null);
      refreshCurrent();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  async function handleCreateDirectory(e) {
    e.preventDefault();
    try {
      await createDirectory(dirId, newDirname);
      setNewDirname("New Folder");
      setShowCreateDirModal(false);
      refreshCurrent();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  function openRenameModal(type, id, currentName) {
    setRenameType(type);
    setRenameId(id);
    setRenameValue(currentName);
    setShowRenameModal(true);
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    try {
      if (renameType === "file") await renameFile(renameId, renameValue);
      else await renameDirectory(renameId, renameValue);

      setShowRenameModal(false);
      setRenameValue("");
      setRenameType(null);
      setRenameId(null);
      refreshCurrent();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  useEffect(() => {
    const handleDocumentClick = () => setActiveContextMenu(null);
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  const isUploading = !!uploadItem?.isUploading;
  const progressMap = uploadItem
    ? { [uploadItem.id]: uploadItem.progress || 0 }
    : {};

  const isAccessError =
    errorMessage === "Directory not found or you do not have access to it!";

  // Combine, filter, and sort. When searching, pulls from the whole-drive
  // search results instead of just the currently open folder's contents.
  const filteredAndSortedItems = useMemo(() => {
    const combined = isSearching
      ? [
          ...(searchResults?.directories || []).map((d) => ({ ...d, isDirectory: true })),
          ...(searchResults?.files || []).map((f) => ({ ...f, isDirectory: false })),
        ]
      : [
          ...directoriesList.map((d) => ({ ...d, isDirectory: true })),
          ...filesList.map((f) => ({ ...f, isDirectory: false })),
        ];

    const multiplier = sortOrder === "asc" ? 1 : -1;
    const getKey = (item) => {
      switch (sortBy) {
        case "size":
          return item.size ?? 0;
        case "modified":
          return new Date(item.updatedAt ?? item.createdAt ?? 0).getTime();
        default:
          return (item.name ?? "").toLowerCase();
      }
    };

    return [...combined].sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      const aKey = getKey(a);
      const bKey = getKey(b);
      if (aKey < bKey) return -1 * multiplier;
      if (aKey > bKey) return 1 * multiplier;
      return 0;
    });
  }, [directoriesList, filesList, isSearching, searchResults, sortBy, sortOrder]);

  return (
    <DirectoryContext.Provider
      value={{
        handleRowClick,
        activeContextMenu,
        handleContextMenu: (e, id) => {
          e.stopPropagation();
          e.preventDefault();
          setActiveContextMenu((prev) => (prev === id ? null : id));
        },
        isUploading,
        progressMap,
        handleCancelUpload,
        setDeleteItem,
        openRenameModal,
        openDetailsPopup,
        openPreview,
        openShareModal,
        mode: "normal",
        BASE_URL,
      }}
    >
      <div className="min-h-screen bg-slate-50">
        <Header />

        <main
          className="relative max-w-7xl mx-auto p-4"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {/* Full-canvas drop overlay — appears only while a file is dragged over the page */}
          {dragOver && !isAccessError && (
            <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-blue-600/5 backdrop-blur-[1px]">
              <div className="modal-panel rounded-2xl border-2 border-dashed border-blue-400 bg-white/90 px-12 py-10 text-center shadow-lg">
                <Upload className="mx-auto mb-3 h-10 w-10 text-blue-500" />
                <p className="font-display text-lg font-semibold text-slate-900">
                  Drop to upload
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Release the file anywhere on this page
                </p>
              </div>
            </div>
          )}

          {errorMessage && !isAccessError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
              <FaExclamationTriangle className="shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading || isAccessError}
          />

          <ToolBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            itemCount={filteredAndSortedItems.length}
            onCreateFolderClick={() => setShowCreateDirModal(true)}
            onUploadFilesClick={() => fileInputRef.current?.click()}
            disabled={isAccessError}
          />

          <Breadcrumb breadCrumb={breadCrumb} dirId={dirId} />

          {showCreateDirModal && (
            <CreateDirectoryModal
              newDirname={newDirname}
              setNewDirname={setNewDirname}
              onClose={() => setShowCreateDirModal(false)}
              onCreateDirectory={handleCreateDirectory}
            />
          )}

          {showRenameModal && (
            <RenameModal
              renameType={renameType}
              renameValue={renameValue}
              setRenameValue={setRenameValue}
              onClose={() => setShowRenameModal(false)}
              onRenameSubmit={handleRenameSubmit}
            />
          )}

          {detailsItem && (
            <DetailsPopup item={detailsItem} onClose={closeDetailsPopup} />
          )}

          {previewFile && (
            <FilePreviewModal
              file={previewFile}
              baseUrl={BASE_URL}
              onClose={closePreview}
            />
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-blue-600 mb-4"></div>
              <p className="text-sm text-slate-500">Loading…</p>
            </div>
          ) : isAccessError ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                <FaExclamationTriangle className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-1.5">Access denied</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                This folder doesn't exist, or you don't have access to it.
              </p>
            </div>
          ) : isSearching && searchLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-blue-600 mb-4"></div>
              <p className="text-sm text-slate-500">Searching…</p>
            </div>
          ) : filteredAndSortedItems.length > 0 ? (
            <DirectoryList items={filteredAndSortedItems} viewMode={viewMode} />
          ) : isSearching ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Search className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-1.5">
                No results found
              </h3>
              <p className="text-slate-500 text-sm">
                Nothing in your drive matches "{searchTerm.trim()}".
              </p>
            </div>
          ) : (
            <div className="text-center py-16 sm:py-20">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
                <Folder className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-1.5">
                This folder is empty
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Drag a file in, or use the buttons below to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isAccessError}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  Upload files
                </button>
                <button
                  onClick={() => setShowCreateDirModal(true)}
                  disabled={isAccessError}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FolderPlus className="w-4 h-4" />
                  New folder
                </button>
              </div>
            </div>
          )}

          {deleteItem && (
            <ConfirmDeleteModal
              item={deleteItem}
              onConfirm={confirmDelete}
              onCancel={() => setDeleteItem(null)}
            />
          )}

          {shareItem && <ShareModal item={shareItem} onClose={closeShareModal} />}
        </main>
      </div>
    </DirectoryContext.Provider>
  );
}

export default DirectoryView;
