import { useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  Clock,
  FolderPlus,
  Grid,
  HardDrive,
  List,
  Search,
  SortAsc,
  SortDesc,
  Type,
  Upload,
  X,
} from "lucide-react";

const SORT_OPTIONS = [
  { key: "name", label: "Name", icon: Type },
  { key: "size", label: "Size", icon: HardDrive },
  { key: "modified", label: "Modified", icon: Clock },
];

function ToolBar({
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  sortBy,
  sortOrder,
  onSortChange,
  itemCount,
  onCreateFolderClick,
  onUploadFilesClick,
  disabled = false,
}) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const handleSort = (field) => {
    onSortChange(field);
    setShowSortDropdown(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-4">
      <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-1 lg:flex-none">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-[1024px]:w-80 pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg transition-colors text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-wrap">
          {/* View mode */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
              }`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 text-sm font-medium bg-white"
            >
              <ArrowUpDown className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Sort by</span>
              <span className="text-slate-600 capitalize">{sortBy}</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                  showSortDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showSortDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 min-w-[180px]">
                  <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wide border-b border-slate-100">
                    Sort by
                  </div>
                  {SORT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.key}
                        onClick={() => handleSort(option.key)}
                        className="w-full px-3 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                          <span className="text-slate-700">{option.label}</span>
                        </div>
                        {sortBy === option.key && (
                          <div className="flex items-center gap-1">
                            {sortOrder === "asc" ? (
                              <SortAsc className="w-4 h-4 text-blue-500" />
                            ) : (
                              <SortDesc className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="mx-1 hidden h-9 w-px bg-slate-200 sm:block" />

          <button
            onClick={onCreateFolderClick}
            disabled={disabled}
            title="Create Folder"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-400 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">New Folder</span>
          </button>

          <button
            onClick={onUploadFilesClick}
            disabled={disabled}
            title="Upload Files"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </button>
        </div>
      </div>

      {searchTerm && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {itemCount} result{itemCount !== 1 ? "s" : ""} across your drive for{" "}
              <span className="font-medium text-slate-900">"{searchTerm}"</span>
            </p>
            {itemCount > 0 && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ToolBar;
