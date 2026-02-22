import React from 'react';

export const Button = ({ 
  children, onClick, variant = 'primary', type = 'button', className = '', disabled = false, icon: Icon 
}: any) => {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black";
  
  const variants: any = {
    // Pure White bg, Black text
    primary: "bg-white text-black hover:bg-zinc-200 border border-transparent shadow-[0_0_20px_rgba(255,255,255,0.15)]",
    // Glass bg, White text, White border
    secondary: "bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-white/10 hover:border-white/20",
    // Danger: Outlined white with hover effect (keeping it B&W but maybe bold)
    danger: "bg-transparent text-zinc-400 border border-zinc-700 hover:border-zinc-200 hover:text-white hover:bg-white/5",
    // Ghost: No border
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5",
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

export const Input = ({ label, error, type = "text", ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-2">{label}</label>}
    <input
      type={type}
      {...props}
      className={`appearance-none block w-full px-4 py-3 bg-zinc-900/40 backdrop-blur-sm border rounded-lg placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-white focus:border-white text-white transition-colors ${error ? 'border-white/40 ring-1 ring-white/20' : 'border-white/10'}`}
    />
    {error && <p className="mt-2 text-xs text-zinc-400 bg-white/5 p-1 px-2 rounded inline-block">! {error}</p>}
  </div>
);

export const Select = ({ label, options, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-2">{label}</label>}
    <div className="relative">
        <select
        {...props}
        className="appearance-none block w-full pl-4 pr-10 py-3 bg-zinc-900/40 backdrop-blur-sm border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white rounded-lg"
        >
        {options.map((opt: any) => (
            <option key={opt.value} value={opt.value} className="bg-black text-white">{opt.label}</option>
        ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
    </div>
  </div>
);

export const Card = ({ children, className = '' }: any) => (
  <div className={`bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-xl ${className}`}>
    {children}
  </div>
);

export const Badge = ({ status }: { status: string }) => {
  // Monochrome status badges
  const styles: any = {
    DRAFT: "bg-white/5 text-zinc-500 border-zinc-800",
    PUBLISHED: "bg-white/10 text-white border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]",
    CLOSED: "bg-black/40 text-zinc-600 border-zinc-800 line-through decoration-zinc-600",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.DRAFT}`}>
      {status}
    </span>
  );
};