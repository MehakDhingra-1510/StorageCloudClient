import {
  FileArchive,
  FileCode,
  FileJson,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  FileType,
  Folder,
  ImageIcon,
  Music,
  Presentation,
  Video,
} from "lucide-react";

export const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const getExtension = (name = "") => name.split(".").pop()?.toLowerCase() || "";

// item: { name, isDirectory }. viewMode controls icon size ("grid" | "list").
export const getFileIcon = (item, viewMode = "list") => {
  const iconSize = viewMode === "grid" ? "w-8 h-8" : "w-5 h-5";

  if (item.isDirectory) {
    return <Folder className={`${iconSize} text-blue-500`} />;
  }

  const extension = getExtension(item.name);

  if (["ppt", "pptx"].includes(extension)) {
    return <Presentation className={`${iconSize} text-orange-600`} />;
  }
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
    return <ImageIcon className={`${iconSize} text-green-500`} />;
  }
  if (["mp4", "avi", "mov", "wmv", "flv", "mkv", "webm"].includes(extension)) {
    return <Video className={`${iconSize} text-purple-500`} />;
  }
  if (["mp3", "wav", "flac", "aac", "ogg"].includes(extension)) {
    return <Music className={`${iconSize} text-pink-500`} />;
  }
  if (["txt", "md"].includes(extension)) {
    return <FileText className={`${iconSize} text-orange-500`} />;
  }
  if (extension === "pdf") {
    return <FileType className={`${iconSize} text-red-500`} />;
  }
  if (["doc", "docx"].includes(extension)) {
    return <FileText className={`${iconSize} text-blue-600`} />;
  }
  if (["xls", "xlsx", "csv"].includes(extension)) {
    return <FileSpreadsheet className={`${iconSize} text-green-600`} />;
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
    return <FileArchive className={`${iconSize} text-yellow-600`} />;
  }
  if (
    ["js", "jsx", "ts", "tsx", "py", "java", "c", "cpp", "html", "css"].includes(
      extension
    )
  ) {
    return <FileCode className={`${iconSize} text-cyan-500`} />;
  }
  if (extension === "json") {
    return <FileJson className={`${iconSize} text-emerald-500`} />;
  }

  return <FileQuestion className={`${iconSize} text-gray-400`} />;
};
