import { useEffect } from "react";
import {
    FaDownload,
    FaExternalLinkAlt,
    FaTimes,
    FaFileAlt,
    FaMusic,
    FaImage,
} from "react-icons/fa";

function getExtension(name = "") {
    return name.split(".").pop()?.toLowerCase() || "";
}

/**
 * Renders the right preview widget for a file based on its extension.
 * Falls back to a "no preview available" card with a download button.
 */
function renderPreviewBody(file, fileUrl) {
    const ext = getExtension(file.name);

    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
        return (
            <div className="flex min-h-[24rem] items-center justify-center rounded-lg bg-slate-50">
                <img
                    src={fileUrl}
                    alt={file.name}
                    className="max-h-[70vh] max-w-full rounded-lg object-contain"
                />
            </div>
        );
    }

    if (ext === "pdf") {
        return (
            <iframe
                src={fileUrl}
                title={file.name}
                className="h-[75vh] w-full rounded-lg border border-slate-200"
            />
        );
    }

    if (ext === "txt") {
        return (
            <iframe
                src={fileUrl}
                title={file.name}
                className="h-[70vh] w-full rounded-lg border border-slate-200 bg-white"
            />
        );
    }

    if (["mp4", "webm", "ogg", "mov"].includes(ext)) {
        return (
            <div className="flex justify-center rounded-lg bg-slate-50 p-4">
                <video
                    controls
                    autoPlay={false}
                    className="max-h-[70vh] max-w-full rounded-lg"
                    src={fileUrl}
                />
            </div>
        );
    }

    if (["mp3", "wav", "ogg", "m4a"].includes(ext)) {
        return (
            <div className="rounded-lg bg-slate-50 p-10 text-center">
                <FaMusic className="mx-auto mb-4 text-4xl text-purple-400" />
                <audio controls className="mx-auto w-full max-w-md" src={fileUrl} />
            </div>
        );
    }

    return (
        <div className="rounded-lg bg-slate-50 py-16 text-center">
            <FaFileAlt className="mx-auto mb-4 text-4xl text-slate-300" />
            <p className="text-slate-600">Preview not available for this file type.</p>
            <a
                href={`${fileUrl}?action=download`}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
                <FaDownload className="text-xs" />
                Download {file.name}
            </a>
        </div>
    );
}

function FilePreviewModal({ file, baseUrl, onClose }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    if (!file) return null;

    const fileUrl = `${baseUrl}/file/${file.id}`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                        <FaImage className="hidden shrink-0 text-slate-400 sm:block" />
                        <h3 className="truncate text-sm font-semibold text-slate-800 sm:text-base">
                            {file.name}
                        </h3>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <a
                            href={`${fileUrl}?action=download`}
                            title="Download"
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700"
                        >
                            <FaDownload className="text-sm" />
                        </a>
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in new tab"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                        >
                            <FaExternalLinkAlt className="text-xs" />
                        </a>
                        <button
                            onClick={onClose}
                            title="Close"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                        >
                            <FaTimes className="text-sm" />
                        </button>
                    </div>
                </div>

                <div className="overflow-auto p-4">{renderPreviewBody(file, fileUrl)}</div>
            </div>
        </div>
    );
}

export default FilePreviewModal;
