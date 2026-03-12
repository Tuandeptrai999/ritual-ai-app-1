import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, ArrowRightCircle, Moon, Sun, Shield } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { login, logout, authenticated } = usePrivy();
  
  return (
    <header className="h-24 flex items-center justify-between px-16 shrink-0 transition-all duration-500 z-50 relative pointer-events-none">
      <div className="pointer-events-auto">
        <h2 className="text-[14px] font-black text-gray-500 dark:text-white/40 tracking-[0.4em] uppercase flex items-center gap-3">
            <span className="w-8 h-[1px] bg-gray-200 dark:bg-white/10"></span>
            LET THE RITUAL BEGIN 🕯️🕯️🕯️
        </h2>
      </div>

      <div className="flex items-center gap-8 pointer-events-auto">
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-white group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-white" />
          )}
        </button>

        {!authenticated ? (
          <button 
            onClick={login}
            className="flex items-center gap-3 px-8 h-12 rounded-xl bg-white text-black font-black tracking-widest text-[11px] group hover:bg-[#00F5FF] transition-all shadow-xl active:scale-95"
          >
            ESTABLISH SESSION
            <ArrowRightCircle className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-8 h-12 rounded-xl bg-white/5 border border-white/5 text-white font-black tracking-widest text-[11px] group hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all opacity-40 hover:opacity-100"
          >
            TERMINATE
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </header>
  );
};
