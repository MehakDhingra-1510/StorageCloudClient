import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Circle, LogOut, ShieldAlert, Trash2, Users as UsersIcon } from "lucide-react";
import Header from "./components/Header";
import {
  fetchAllUsers,
  fetchUser,
  deleteUserById,
  logoutUserById,
} from "./api/userApi";

function RoleBadge({ role }) {
  const styles = {
    Admin: "bg-blue-50 text-blue-600 border-blue-200",
    Manager: "bg-blue-50 text-blue-700 border-blue-200",
    User: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        styles[role] || styles.User
      }`}
    >
      {role}
    </span>
  );
}

function StatusPill({ isLoggedIn }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
        isLoggedIn ? "text-emerald-600" : "text-slate-400"
      }`}
    >
      <Circle
        className={`h-2 w-2 ${isLoggedIn ? "fill-emerald-500 text-emerald-500" : "fill-slate-300 text-slate-300"}`}
      />
      {isLoggedIn ? "Online" : "Offline"}
    </span>
  );
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState({ name: "", email: "", role: "User" });
  const [pendingAction, setPendingAction] = useState(null); // { type: "logout" | "delete", user }
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
    loadCurrentUser();
  }, []);

  async function loadUsers() {
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      if (err.response?.status === 403) navigate("/drive");
      else if (err.response?.status === 401) navigate("/login");
      else console.error("Fetching users failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCurrentUser() {
    try {
      const data = await fetchUser();
      setCurrentUser(data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else console.error("Fetching user failed:", err);
    }
  }

  async function handleLogoutUser(user) {
    try {
      await logoutUserById(user.id);
      loadUsers();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDeleteUser(user) {
    try {
      await deleteUserById(user.id);
      loadUsers();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setPendingAction(null);
    }
  }

  const onlineCount = users.filter((u) => u.isLoggedIn).length;
  const isAdmin = currentUser.role === "Admin";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase mb-1.5">
              Admin
            </p>
            <h1 className="font-display text-2xl font-semibold text-slate-900 tracking-tight">
              Users
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Signed in as <span className="font-medium text-slate-700">{currentUser.name}</span>{" "}
              <RoleBadge role={currentUser.role} />
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5">
              <p className="text-xs text-slate-500">Total users</p>
              <p className="font-display text-lg font-semibold text-slate-900">{users.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5">
              <p className="text-xs text-slate-500">Online now</p>
              <p className="font-display text-lg font-semibold text-emerald-600">{onlineCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 mb-3" />
              <p className="text-sm text-slate-500">Loading users…</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <UsersIcon className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="font-display font-semibold text-slate-900 mb-1">No users yet</h3>
              <p className="text-sm text-slate-500">New accounts will show up here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60">
                    <th className="px-5 py-3 font-medium text-slate-500">User</th>
                    <th className="px-5 py-3 font-medium text-slate-500">Role</th>
                    <th className="px-5 py-3 font-medium text-slate-500">Status</th>
                    <th className="px-5 py-3 font-medium text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => {
                    const isSelf = user.email === currentUser.email;
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                              {initials(user.name) || "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900">
                                {user.name}
                                {isSelf && <span className="ml-1.5 text-xs font-normal text-slate-400">(you)</span>}
                              </p>
                              <p className="truncate text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusPill isLoggedIn={user.isLoggedIn} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPendingAction({ type: "logout", user })}
                              disabled={!user.isLoggedIn}
                              title="Log out this user"
                              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                            >
                              <LogOut className="h-3.5 w-3.5" />
                              Log out
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => setPendingAction({ type: "delete", user })}
                                disabled={isSelf}
                                title="Delete this user"
                                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {pendingAction && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={() => setPendingAction(null)}
        >
          <div
            className="modal-panel w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  pendingAction.type === "delete" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                }`}
              >
                {pendingAction.type === "delete" ? (
                  <ShieldAlert className="h-5 w-5" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )}
              </div>
              <div className="pt-1.5">
                <h2 className="font-display text-base font-semibold text-slate-900">
                  {pendingAction.type === "delete" ? "Delete this account?" : "Log out this user?"}
                </h2>
              </div>
            </div>
            <p className="mb-6 text-sm text-slate-600">
              {pendingAction.type === "delete"
                ? `${pendingAction.user.email} will lose access permanently. This can't be undone.`
                : `${pendingAction.user.email} will be signed out of all active sessions.`}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingAction(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  pendingAction.type === "delete"
                    ? handleDeleteUser(pendingAction.user)
                    : handleLogoutUser(pendingAction.user)
                }
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                  pendingAction.type === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:opacity-90"
                }`}
              >
                {pendingAction.type === "delete" ? "Delete account" : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
