export default function Logo({ size = 'md', mono = false }) {
  const sizes = {
    sm: { wrap: 'gap-2',    icon: 'w-7 h-7',  text: 'text-base' },
    md: { wrap: 'gap-2.5',  icon: 'w-9 h-9',  text: 'text-lg' },
    lg: { wrap: 'gap-3',    icon: 'w-12 h-12', text: 'text-2xl' },
  }[size];

  return (
    <div className={`inline-flex items-center ${sizes.wrap}`}>
      <div className={`${sizes.icon} rounded-lg bg-ink-900 flex items-center justify-center flex-shrink-0`}>
        <svg viewBox="0 0 32 32" className="w-2/3 h-2/3" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinejoin="round">
          <path d="M8 22V12l8-5 8 5v10" />
          <path d="M8 22h16" strokeLinecap="round" />
          <rect x="13" y="15" width="6" height="7" fill="#fbbf24" stroke="none" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-display font-extrabold tracking-tight ${sizes.text} ${mono ? 'text-white' : 'text-ink-900'}`}>
          Stavira
        </span>
        {size !== 'sm' && (
          <span className={`text-[10px] uppercase tracking-[0.18em] font-semibold mt-0.5 ${mono ? 'text-accent-400' : 'text-ink-500'}`}>
            Stavební management
          </span>
        )}
      </div>
    </div>
  );
}
