// DirectoryList.js
import { useDirectoryContext } from "../context/DirectoryContext";
import DirectoryItem from "./DirectoryItem";

function DirectoryList({ items, viewMode = "list" }) {
  const { progressMap } = useDirectoryContext();

  const containerClass =
    viewMode === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4"
      : "space-y-2";

  return (
    <div className={containerClass}>
      {items.map((item) => {
        const uploadProgress = progressMap[item.id] || 0;
        return (
          <DirectoryItem
            key={item.id}
            item={item}
            uploadProgress={uploadProgress}
            viewMode={viewMode}
          />
        );
      })}
    </div>
  );
}

export default DirectoryList;
