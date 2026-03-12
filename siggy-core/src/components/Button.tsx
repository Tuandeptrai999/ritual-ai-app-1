import React, { ButtonHTMLAttributes } from "react";

export const Button: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`px-6 py-3 border-2 border-brand-black font-bold bg-[#FFD84D] hover:bg-yellow-400 shadow-[4px_4px_0px_#111111] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0px_#111111] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
