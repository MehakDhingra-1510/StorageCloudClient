// Lightweight pub/sub for "the user's storage usage may have changed".
//
// Header is mounted independently on several pages and only fetches the
// user's storage numbers once, on mount. Actions that change storage usage
// (finishing an upload, permanently deleting something) happen in other
// components (DirectoryView, TrashView) that have no shared state with
// Header. Rather than introducing a global store for one number, we use a
// plain browser CustomEvent as a small decoupled signal: components that
// change storage usage call notifyStorageChanged(), and Header listens for
// it and re-fetches.

const STORAGE_CHANGED_EVENT = "cirro:storage-changed";

export function notifyStorageChanged() {
    window.dispatchEvent(new Event(STORAGE_CHANGED_EVENT));
}

export function onStorageChanged(handler) {
    window.addEventListener(STORAGE_CHANGED_EVENT, handler);
    return () => window.removeEventListener(STORAGE_CHANGED_EVENT, handler);
}