import { Download, Edit2, Eye, Info, MoreVertical, Move, RotateCcw, Share2, Trash2 } from "lucide-react";
import { useDirectoryContext } from "../context/DirectoryContext";
import { formatDate, formatFileSize, getExtension, getFileIcon } from "../utils/helpers";

function DropdownMenu({ item, isUploadingItem, mode, onAction }) {
  if (isUploadingItem) {
    return (
      <>
        <div className="fixed inset-0 z-40" onClick={(e) => onAction(e, "close")} />
        <div className="modal-panel absolute right-0 bottom-8 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 min-w-[160px]">
          <button
            onClick={(e) => onAction(e, "cancel")}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Cancel Upload</span>
          </button>
        </div>
      </>
    );
  }

  if (mode === "trash") {
    return (
      <>
        <div className="fixed inset-0 z-40" onClick={(e) => onAction(e, "close")} />
        <div className="modal-panel absolute right-0 bottom-8 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 min-w-[180px]">
          <button
            onClick={(e) => onAction(e, "restore")}
            className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Restore</span>
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            onClick={(e) => onAction(e, "permanent-delete")}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete forever</span>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={(e) => onAction(e, "close")} />
      <div className="modal-panel absolute right-0 bottom-8 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 min-w-[180px]">
        {!item.isDirectory && (
          <button
            onClick={(e) => onAction(e, "preview")}
            className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-slate-400" />
            <span>Preview</span>
          </button>
        )}
        <button
          onClick={(e) => onAction(e, "details")}
          className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
        >
          <Info className="w-4 h-4 text-slate-400" />
          <span>Details</span>
        </button>
        {!item.isDirectory && (
          <button
            onClick={(e) => onAction(e, "download")}
            className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Download</span>
          </button>
        )}
        <button
          onClick={(e) => onAction(e, "rename")}
          className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
        >
          <Edit2 className="w-4 h-4 text-slate-400" />
          <span>Rename</span>
        </button>
        <button
          onClick={(e) => onAction(e, "move")}
          className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
        >
          <Move className="w-4 h-4 text-slate-400" />
          <span>Move to</span>
        </button>
        <button
          onClick={(e) => onAction(e, "share")}
          className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
        >
          <Share2 className="w-4 h-4 text-slate-400" />
          <span>Share</span>
        </button>
        <div className="my-1 border-t border-slate-100" />
        <button
          onClick={(e) => onAction(e, "delete")}
          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </>
  );
}

function DirectoryItem({ item, uploadProgress, viewMode = "list" }) {
  const {
    mode = "normal",
    handleRowClick,
    activeContextMenu,
    handleContextMenu,
    isUploading,
    handleCancelUpload,
    setDeleteItem,
    openRenameModal,
    openMoveModal,
    openDetailsPopup,
    openPreview,
    openShareModal,
    onRestore,
    onPermanentDelete,
    BASE_URL,
  } = useDirectoryContext();

  const isUploadingItem = item.id?.startsWith("temp-") ?? false;
  const isMenuOpen = activeContextMenu === item.id;

  const handleOpen = () => {
    if (isMenuOpen || isUploading || mode === "trash") return;
    handleRowClick(item);
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    handleContextMenu(e, item.id);
  };

  const handleAction = (e, action) => {
    e.stopPropagation();
    handleContextMenu(e, null); // close menu
    switch (action) {
      case "preview":
        openPreview(item);
        break;
      case "details":
        openDetailsPopup(item);
        break;
      case "download":
        window.location.href = `${BASE_URL}/file/${item.id}?action=download`;
        break;
      case "rename":
        openRenameModal(item.isDirectory ? "directory" : "file", item.id, item.name);
        break;
      case "move":
        openMoveModal?.(item);
        break;
      case "share":
        openShareModal?.(item);
        break;
      case "delete":
        setDeleteItem(item);
        break;
      case "restore":
        onRestore?.(item);
        break;
      case "permanent-delete":
        onPermanentDelete?.(item);
        break;
      case "cancel":
        handleCancelUpload(item.id);
        break;
      default:
        break;
    }
  };

  const typeLabel = item.isDirectory
    ? "Folder"
    : getExtension(item.name).toUpperCase() || "File";

  if (viewMode === "grid") {
    return (
      <div
        className="group relative bg-white border border-slate-200 rounded-xl hover:shadow-sm hover:border-slate-300 transition-all duration-200"
        onClick={handleOpen}
      >
        <div className="p-3 sm:p-4 cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg sm:rounded-xl group-hover:from-slate-100 group-hover:to-slate-200 transition-all duration-200">
              {getFileIcon(item, "grid")}
            </div>
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </button>
              {isMenuOpen && (
                <DropdownMenu
                  item={item}
                  isUploadingItem={isUploadingItem}
                  mode={mode}
                  onAction={handleAction}
                />
              )}
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 truncate mb-1" title={item.name}>
                {item.name}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                {typeLabel}
              </span>
              {item.location && (
                <p className="mt-1 truncate text-xs text-slate-400">in {item.location}</p>
              )}
            </div>

            <div className="space-y-1 sm:space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Size</span>
                <span className="font-medium text-slate-600">
                  {formatFileSize(item.size)}
                </span>
              </div>
              <div className="hidden sm:flex items-center justify-between">
                <span className="text-slate-400">Modified</span>
                <span className="font-medium text-slate-600">
                  {formatDate(item.updatedAt || item.createdAt)}
                </span>
              </div>
            </div>

            {isUploadingItem && (
              <div className="relative mt-1 w-full">
                <span
                  className={`absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 text-[10px] font-medium ${uploadProgress > 50 ? "text-white" : "text-slate-600"
                    }`}
                >
                  {Math.floor(uploadProgress)}%
                </span>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-3 rounded-full transition-all duration-150"
                    style={{
                      width: `${uploadProgress}%`,
                      backgroundColor: uploadProgress === 100 ? "#16a34a" : "#4f46e5",
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group bg-white border border-slate-200 rounded-lg hover:shadow-md hover:border-slate-300 transition-all duration-200"
      onClick={handleOpen}
    >
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1 cursor-pointer">
          <div className="flex-shrink-0 p-2 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors">
            {getFileIcon(item, "list")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-sm font-medium text-slate-900 truncate" title={item.name}>
                {item.name}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                {typeLabel}
              </span>
              {item.location && (
                <span className="truncate text-xs text-slate-400">in {item.location}</span>
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <span className="hidden sm:inline">Size:</span>
                <span className="font-medium">{formatFileSize(item.size)}</span>
              </span>
              <span className="hidden sm:flex items-center space-x-1">
                <span>Modified:</span>
                <span className="font-medium">
                  {formatDate(item.updatedAt || item.createdAt)}
                </span>
              </span>
            </div>

            {isUploadingItem && (
              <div className="relative mt-2 max-w-xs">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-2.5 rounded-full transition-all duration-150"
                    style={{
                      width: `${uploadProgress}%`,
                      backgroundColor: uploadProgress === 100 ? "#16a34a" : "#4f46e5",
                    }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-500">
                  {Math.floor(uploadProgress)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          {!item.isDirectory && !isUploadingItem && mode !== "trash" && (
            <button
              onClick={(e) => handleAction(e, "download")}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors sm:opacity-0 sm:group-hover:opacity-100 hidden sm:flex"
              title="Download"
            >
              <Download className="w-4 h-4 text-slate-500" />
            </button>
          )}

          {!isUploadingItem && (
            <button
              onClick={(e) => handleAction(e, "details")}
              className="hidden sm:flex p-2 rounded-lg hover:bg-slate-100 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
              title="Details"
            >
              <Info className="w-4 h-4 text-slate-500" />
            </button>
          )}

          <div className="relative">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </button>
            {isMenuOpen && (
              <DropdownMenu
                item={item}
                isUploadingItem={isUploadingItem}
                mode={mode}
                onAction={handleAction}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DirectoryItem;