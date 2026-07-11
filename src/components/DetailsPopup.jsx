import { Info } from "lucide-react";
import Modal from "./Modal";
import { formatDate, formatFileSize } from "../utils/helpers";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="truncate text-sm font-medium text-slate-900" title={typeof value === "string" ? value : undefined}>
        {value}
      </span>
    </div>
  );
}

function DetailsPopup({ item, onClose }) {
  if (!item) return null;

  const { name, isDirectory, size, createdAt, updatedAt } = item;

  return (
    <Modal
      icon={Info}
      title={isDirectory ? "Folder details" : "File details"}
      onClose={onClose}
      footer={
        <button
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          onClick={onClose}
        >
          Close
        </button>
      }
    >
      <div className="divide-y divide-slate-100">
        <Row label="Name" value={name} />
        <Row label="Type" value={isDirectory ? "Folder" : "File"} />
        {!isDirectory && <Row label="Size" value={formatFileSize(size)} />}
        <Row label="Created" value={formatDate(createdAt)} />
        <Row label="Modified" value={formatDate(updatedAt)} />
      </div>
    </Modal>
  );
}

export default DetailsPopup;
