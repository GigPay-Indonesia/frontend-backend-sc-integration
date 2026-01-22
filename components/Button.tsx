import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glow';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050505] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-white text-black hover:bg-slate-200 focus:ring-white",
    // React Bits style: Dark surface with distinct border, maybe a subtle gradient on hover
    secondary: "bg-[#1A1A1A] text-white border border-[#333] hover:border-[#555] hover:bg-[#222] focus:ring-[#333]",
    outline: "border border-white/20 text-white hover:bg-white/5 hover:border-white/40 focus:ring-white/50",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5 focus:ring-white/20",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 focus:ring-red-500",
    // Special Glow Variant
    glow: "bg-blue-600 text-white shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_-5px_rgba(37,99,235,0.7)] hover:bg-blue-500 border border-blue-400/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};