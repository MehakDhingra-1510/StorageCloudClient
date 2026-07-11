export function Logo({ className = "" }) {
  return (
    <div
      className={`relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-sm">
        <path d="M8 12a8 8 0 0 1 8-8h4a8 8 0 0 1 8 8v2H8v-2Z" fill="#1a73e8" />
        <path d="M4 18a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v2H4v-2Z" fill="#34a853" />
        <path d="M6 24h28l-3.2 7.4a5 5 0 0 1-4.6 3H13.8a5 5 0 0 1-4.6-3L6 24Z" fill="#fbbc04" />
      </svg>
    </div>
  );
}

export default Logo;
