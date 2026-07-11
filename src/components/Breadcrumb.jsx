import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

function Breadcrumb({ breadCrumb = [], dirId }) {
  const navigate = useNavigate();

  if (!breadCrumb.length) return null;

  return (
    <nav className="flex items-center text-sm text-slate-600 mb-4 p-3 sm:p-4 bg-white rounded-lg border border-slate-200 overflow-x-auto">
      <div className="flex items-center gap-2 min-w-0 flex-1 whitespace-nowrap">
        <button
          onClick={() => navigate("/drive")}
          disabled={!dirId}
          className={`flex items-center p-1.5 rounded transition-colors flex-shrink-0 ${
            !dirId
              ? "text-slate-900 font-semibold cursor-default"
              : "hover:text-blue-600 hover:bg-blue-50"
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="ml-1.5 font-medium truncate max-w-32">
            {breadCrumb[0]?.name}
          </span>
        </button>

        {breadCrumb.slice(1).map((item) => (
          <React.Fragment key={item._id}>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <button
              onClick={() => dirId !== item._id && navigate(`/drive/directory/${item._id}`)}
              disabled={dirId === item._id}
              title={item.name}
              className={`px-2 py-1.5 rounded transition-colors min-w-0 truncate max-w-32 ${
                dirId === item._id
                  ? "text-slate-900 font-semibold cursor-default"
                  : "hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <span className="font-medium truncate">{item.name}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}

export default Breadcrumb;
