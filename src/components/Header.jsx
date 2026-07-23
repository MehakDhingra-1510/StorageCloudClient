import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Menu, Share2, Trash2, Users, X } from "lucide-react";
import { FaSignOutAlt, FaSignInAlt, FaCloud } from "react-icons/fa";
import { fetchUser, logoutUser, logoutAllSessions } from "../api/userApi";
import { onStorageChanged } from "../utils/storageEvents";
import Logo from "./Logo";

function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("guest@example.com");
  const [userRole, setUserRole] = useState("User");
  const [userPicture, setUserPicture] = useState("");
  const [maxStorageInBytes, setMaxStorageInBytes] = useState(1073741824);
  const [usedStorageInBytes, setUsedStorageInBytes] = useState(0);

  const usedGB = usedStorageInBytes / 1024 ** 3;
  const totalGB = maxStorageInBytes / 1024 ** 3;
  const storagePercent = totalGB > 0 ? Math.min((usedGB / totalGB) * 100, 100) : 0;

  const userMenuRef = useRef(null);
  const shareMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await fetchUser();
        setUserName(user.name);
        setUserEmail(user.email);
        setUserRole(user.role || "User");
        setUserPicture(user.picture || "");
        setMaxStorageInBytes(user.maxStorageInBytes);
        setUsedStorageInBytes(user.usedStorageInBytes);
        setLoggedIn(true);
      } catch (err) {
        setLoggedIn(false);
        setUserName("Guest User");
        setUserEmail("guest@example.com");
      }
    }
    loadUser();

    // Re-fetch whenever another part of the app (upload complete, permanent
    // delete) signals that storage usage may have changed, so the bar below
    // doesn't stay stale until a full page reload.
    return onStorageChanged(loadUser);
  }, []);

  useEffect(() => {
    function handleDocumentClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        setShowShareMenu(false);
      }
    }
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setLoggedIn(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setShowUserMenu(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllSessions();
      setLoggedIn(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout all error:", err);
    } finally {
      setShowUserMenu(false);
    }
  };

  return (
    <div className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <header className="px-3 sm:px-5 py-2.5 sm:py-3 max-w-7xl mx-auto relative">
        <div className="flex items-center justify-between">
          {/* LEFT — Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/drive")}
          >
            <Logo />
            <span className="font-display text-lg font-bold tracking-tight text-slate-900">
              Cirro
            </span>
          </div>

          {/* DESKTOP — Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {loggedIn && (
              <div
                className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600"
                title={`${usedGB.toFixed(2)} GB of ${totalGB.toFixed(0)} GB used`}
              >
                <FaCloud className="text-blue-500" />
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-300">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
              </div>
            )}

            {loggedIn && (
              <button
                onClick={() => navigate("/drive/trash")}
                title="Trash"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden lg:inline">Trash</span>
              </button>
            )}

            {loggedIn && (
              <div className="relative" ref={shareMenuRef}>
                <button
                  onClick={() => setShowShareMenu((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden lg:inline">Shared</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showShareMenu ? "rotate-180" : ""}`} />
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 top-11 z-10 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg py-1">
                    <button
                      onClick={() => {
                        navigate("/drive/shared-with-me");
                        setShowShareMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Shared with me
                    </button>
                    <button
                      onClick={() => {
                        navigate("/drive/shared-by-me");
                        setShowShareMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Shared by me
                    </button>
                  </div>
                )}
              </div>
            )}

            {loggedIn && userRole !== "User" && (
              <button
                onClick={() => navigate("/drive/users")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
              >
                <Users className="w-4 h-4" />
                <span>Users</span>
              </button>
            )}

            <div className="relative" ref={userMenuRef}>
              <button
                className="flex items-center gap-2 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors ml-2"
                onClick={() => setShowUserMenu((prev) => !prev)}
              >
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900 truncate max-w-[120px]">
                    {userName}
                  </div>
                  <div className="text-xs text-slate-500 truncate max-w-[120px]">
                    {userEmail}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shadow-md">
                  {userPicture ? (
                    <img
                      src={userPicture}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userName?.charAt(0)?.toUpperCase()
                  )}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-11 z-10 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  {loggedIn ? (
                    <>
                      <div className="px-4 py-3 text-sm text-slate-800">
                        <div className="font-semibold">{userName}</div>
                        <div className="text-xs text-slate-500">{userEmail}</div>
                        <div className="mt-3 flex flex-col text-xs">
                          <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${storagePercent}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-slate-500">
                            {usedGB.toFixed(2)} GB of {totalGB.toFixed(0)} GB used
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-slate-100" />
                      <div
                        className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="text-blue-600" /> Logout
                      </div>
                      <div
                        className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                        onClick={handleLogoutAll}
                      >
                        <FaSignOutAlt className="text-blue-600" /> Logout All
                      </div>
                    </>
                  ) : (
                    <div
                      className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                      onClick={() => {
                        navigate("/login");
                        setShowUserMenu(false);
                      }}
                    >
                      <FaSignInAlt className="text-blue-600" /> Login
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* MOBILE — Menu Toggle & Avatar */}
          <div className="flex md:hidden items-center gap-2">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shadow-md">
              {userPicture ? (
                <img
                  src={userPicture}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                userName?.charAt(0)?.toUpperCase()
              )}
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-700" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-50">
            <nav className="px-3 py-2 space-y-1">
              {loggedIn && (
                <button
                  onClick={() => {
                    navigate("/drive/trash");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
                >
                  <Trash2 className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-900">Trash</span>
                </button>
              )}

              {loggedIn && (
                <button
                  onClick={() => {
                    navigate("/drive/shared-with-me");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
                >
                  <Share2 className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-900">Shared with me</span>
                </button>
              )}

              {loggedIn && (
                <button
                  onClick={() => {
                    navigate("/drive/shared-by-me");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
                >
                  <Share2 className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-900">Shared by me</span>
                </button>
              )}

              {loggedIn && userRole !== "User" && (
                <button
                  onClick={() => {
                    navigate("/drive/users");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
                >
                  <Users className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-900">Users</span>
                </button>
              )}

              <div className="pt-2 border-t border-slate-200 mt-2">
                <div className="px-4 py-2">
                  <div className="text-sm font-medium text-slate-900">{userName}</div>
                  <div className="text-xs text-slate-500">{userEmail}</div>
                </div>
                {loggedIn ? (
                  <>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
                    >
                      <FaSignOutAlt className="text-blue-600" />
                      <span className="text-sm font-medium text-slate-900">Logout</span>
                    </button>
                    <button
                      onClick={() => {
                        handleLogoutAll();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
                    >
                      <FaSignOutAlt className="text-blue-600" />
                      <span className="text-sm font-medium text-slate-900">Logout All</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
                  >
                    <FaSignInAlt className="text-blue-600" />
                    <span className="text-sm font-medium text-slate-900">Login</span>
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}

export default Header;