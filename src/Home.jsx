import { Link } from "react-router-dom";
import {
  FolderOpen,
  Share2,
  MonitorSmartphone,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Folder,
} from "lucide-react";
import Logo from "./components/Logo";

const features = [
  {
    icon: FolderOpen,
    title: "Upload and organize",
    text: "Drag files in, sort them into folders, and find anything again in seconds — no clutter, no guesswork.",
    chip: "bg-blue-50 text-[#1a73e8]",
  },
  {
    icon: Share2,
    title: "Share with control",
    text: "Send a link, invite a person, or keep it private. You decide who can view, edit, or download.",
    chip: "bg-green-50 text-[#34a853]",
  },
  {
    icon: MonitorSmartphone,
    title: "Access anywhere",
    text: "Your files pick up right where you left them, whether you're on your laptop, phone, or a borrowed browser.",
    chip: "bg-amber-50 text-[#e37400]",
  },
];

function Nav() {
  return (
    <header className="relative z-20 bg-white border-b border-slate-200">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 sm:px-8 py-4">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-xl font-semibold tracking-tight text-slate-900">
            Cirro
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="px-3.5 sm:px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-full bg-[#1a73e8] text-white text-sm font-semibold hover:bg-[#1765cc] transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}

// A small illustrative mock of the drive itself — gives the hero personality
// without leaning on gradients/glows, and hints at the product underneath.
function DriveMock() {
  const rows = [
    { icon: Folder, name: "Team designs", color: "text-[#1a73e8]", meta: "12 items" },
    { icon: FileSpreadsheet, name: "Q3-budget.xlsx", color: "text-[#34a853]", meta: "2.1 MB" },
    { icon: ImageIcon, name: "cover-photo.png", color: "text-[#e37400]", meta: "840 KB" },
    { icon: FileText, name: "proposal-draft.docx", color: "text-[#1a73e8]", meta: "128 KB" },
  ];
  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
        <span className="ml-2 text-xs text-slate-400">My Cirro</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {rows.map(({ icon: Icon, name, color, meta }) => (
          <li key={name} className="flex items-center gap-3 px-4 py-3">
            <Icon className={`w-5 h-5 shrink-0 ${color}`} strokeWidth={1.75} />
            <span className="flex-1 text-sm text-slate-700 truncate">{name}</span>
            <span className="text-xs text-slate-400">{meta}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Home() {
  return (
    <div className="font-body bg-white">
      {/* ---------- HERO ---------- */}
      <div className="bg-white">
        <Nav />

        <main className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-20 sm:pb-28 grid lg:grid-cols-2 gap-14 items-center">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-[#1a73e8] bg-blue-50 rounded-full px-3 py-1 mb-6">
              10 GB free on signup
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-slate-900 leading-[1.12] tracking-tight">
              A simple, organized
              <br />
              home for your files.
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-lg">
              Cirro is a calmer home for your files — upload, organize, and
              share without the app getting in the way of the work.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#1a73e8] text-white text-sm font-semibold hover:bg-[#1765cc] transition-colors"
              >
                Get started free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/login"
                className="px-5 py-3 rounded-full border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Log in
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-slate-50 hidden sm:block" />
            <DriveMock />
          </div>
        </main>
      </div>

      {/* ---------- FEATURES ---------- */}
      <section className="bg-[#F8F9FA] border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="max-w-xl mb-14">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              Everything you need, nothing you don't
            </h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Cirro keeps to three jobs, and does each one well.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, text, chip }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 hover:shadow-sm transition-shadow"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-5 ${chip}`}>
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-display font-semibold text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA BAND ---------- */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20 flex flex-col sm:flex-row items-center justify-between gap-8 border-t border-slate-100">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              Ready to lighten your load?
            </h2>
            <p className="mt-2 text-slate-600">
              Create a free account — no card required.
            </p>
          </div>
          <Link
            to="/register"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1a73e8] text-white text-sm font-semibold hover:bg-[#1765cc] transition-colors"
          >
            Create your account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="bg-[#F8F9FA] border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo className="w-7 h-7" />
            <span className="font-display text-sm font-semibold text-slate-900">
              Cirro
            </span>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Cirro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
