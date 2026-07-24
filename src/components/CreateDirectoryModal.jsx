import { useEffect, useRef } from "react";
import { FolderPlus } from "lucide-react";
import Modal from "./Modal";

function CreateDirectoryModal({ newDirname, setNewDirname, isSubmitting = false, onClose, onCreateDirectory }) {
  const inputRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  return (
    <Modal
      icon={FolderPlus}
      title="New folder"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-directory-form"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating…" : "Create"}
          </button>
        </>
      }
    >
      <form id="create-directory-form" ref={formRef} onSubmit={onCreateDirectory}>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Folder name
        </label>
        <input
          ref={inputRef}
          type="text"
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          placeholder="Enter folder name"
          value={newDirname}
          onChange={(e) => setNewDirname(e.target.value)}
        />
      </form>
    </Modal>
  );
}

export default CreateDirectoryModal;