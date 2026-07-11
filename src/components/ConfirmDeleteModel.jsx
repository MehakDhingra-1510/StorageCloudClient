import { Trash2 } from "lucide-react";
import Modal from "./Modal";

function ConfirmDeleteModal({ item, onConfirm, onCancel }) {
  if (!item) return null;

  const kind = item.isDirectory ? "folder" : "file";

  return (
    <Modal
      icon={Trash2}
      tone="danger"
      title={`Move ${kind} to trash?`}
      onClose={onCancel}
      footer={
        <>
          <button
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            onClick={() => onConfirm(item)}
          >
            Move to trash
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-slate-600">
        <span className="font-medium text-slate-900">"{item.name}"</span>{" "}
        will move to Trash{item.isDirectory ? ", along with everything inside it," : ""}{" "}
        and stay there until you restore or permanently delete it.
      </p>
    </Modal>
  );
}

export default ConfirmDeleteModal;
