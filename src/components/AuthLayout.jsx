import { Link } from "react-router-dom";
import { Cloud, FolderOpen, Share2, ShieldCheck } from "lucide-react";
import Logo from "./Logo";

const points = [
  { icon: FolderOpen, text: "Folders that stay organized on their own" },
  { icon: Share2, text: "Share a link or invite someone directly" },
  { icon: ShieldCheck, text: "Your files, visible only to who you choose" },
];

function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="min-h-screen flex font-body">
      {/* LEFT — branding panel (hidden on small screens) */}
      <div className="hidden lg:flex lg:w-[44%] relative bg-[#F8F9FA] flex-col justify-between p-10 xl:p-14 border-r border-slate-200">
        <Link to="/" className="relative flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-xl font-semibold tracking-tight text-slate-900">
            Cirro
          </span>
        </Link>

        <div className="relative max-w-sm">
          <p className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-[#1a73e8] bg-blue-50 rounded-full px-3 py-1 mb-6">
            <Cloud className="w-3.5 h-3.5" />
            Cloud storage, simplified
          </p>
          <h2 className="font-display text-3xl font-semibold text-slate-900 leading-tight tracking-tight">
            A calmer home for your files.
          </h2>
          <ul className="mt-8 space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#1a73e8]" />
                </div>
                <span className="text-sm text-slate-600 leading-relaxed pt-1.5">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          © {new Date().getFullYear()} Cirro. All rights reserved.
        </p>
      </div>

      {/* RIGHT — form panel */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="lg:hidden flex items-center gap-2.5 px-5 sm:px-8 py-6">
          <Logo />
          <span className="font-display text-xl font-semibold tracking-tight text-slate-900">
            Cirro
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 pb-12">
          <div className="w-full max-w-sm">
            {eyebrow && (
              <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase mb-2">
                {eyebrow}
              </p>
            )}
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
            )}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
