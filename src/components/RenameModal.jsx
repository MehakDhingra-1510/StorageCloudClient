import { useEffect, useRef } from "react";
import { Edit2 } from "lucide-react";
import Modal from "./Modal";

function RenameModal({ renameType, renameValue, setRenameValue, onClose, onRenameSubmit }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      const dotIndex = renameValue.lastIndexOf(".");
      if (dotIndex > 0) {
        inputRef.current.setSelectionRange(0, dotIndex);
      } else {
        inputRef.current.select();
      }
    }
  }, []);

  return (
    <Modal
      icon={Edit2}
      title={`Rename ${renameType === "file" ? "file" : "folder"}`}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="rename-form"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save
          </button>
        </>
      }
    >
      <form id="rename-form" onSubmit={onRenameSubmit}>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          New name
        </label>
        <input
          ref={inputRef}
          type="text"
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          placeholder="Enter new name"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
        />
      </form>
    </Modal>
  );
}

export default RenameModal;
