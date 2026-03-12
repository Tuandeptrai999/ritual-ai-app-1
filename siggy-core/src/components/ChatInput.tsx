import React, { useState } from "react";
import { Send, Github, Database } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const DiscordIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495a18.2739 18.2739 0 00-5.487 0 11.723 11.723 0 00-.6173-1.2495.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="w-full px-6 md:px-16 pb-12 pt-4 shrink-0 relative z-20">
      <form onSubmit={handleSubmit} className="relative w-full max-w-5xl mx-auto">
        {/* Glow border effect */}
        <div className="relative group p-[1px] rounded-[32px] bg-gradient-to-r from-brand-violet/20 via-[var(--border-color)] to-brand-cyan/20 hover:from-brand-violet/40 hover:to-brand-cyan/40 transition-all duration-500 shadow-xl hover:shadow-brand-violet/5">
            <div className="relative bg-[var(--bg-primary)] backdrop-blur-3xl rounded-[31px] flex items-center border border-[var(--border-color)]">
                <div className="absolute left-6 text-[var(--text-secondary)] group-focus-within:text-brand-cyan transition-colors">
                    <Database className="w-5 h-5 animate-pulse" />
                </div>
                
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Transmit signal to protocol..."
                  disabled={disabled}
                  className="w-full pl-16 pr-36 py-7 bg-transparent focus:outline-none text-[var(--text-primary)] font-bold text-xl placeholder-slate-400 dark:placeholder-slate-600 tracking-tight"
                />
                
                <div className="absolute right-4 flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={disabled || !inputValue.trim()}
                      className="group relative px-8 h-14 bg-brand-violet text-white hover:bg-brand-violet/90 rounded-2xl flex items-center justify-center transition-all duration-500 active:scale-90 shadow-lg disabled:opacity-30"
                    >
                      <span className="font-black tracking-widest text-[11px] mr-2">SEND</span>
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
        
        {/* Social and Info */}
        <div className="mt-8 flex items-center justify-between px-6">
            <div className="flex items-center gap-6 opacity-30 hover:opacity-100 transition-opacity">
                <a href="https://discord.com/invite/ritual-net" target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] hover:text-brand-violet transition-colors"><DiscordIcon /></a>
                <a href="https://x.com/ritualfnd" target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] hover:text-brand-cyan transition-colors"><XIcon /></a>
                <a href="https://github.com/ritual-foundation" target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] hover:text-brand-pink transition-colors"><Github className="w-[18px] h-[18px]" /></a>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-[var(--text-secondary)] uppercase opacity-60">
                <span className="w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_#00F5FF]"></span>
                Transmission Secure
            </div>
        </div>
      </form>
    </div>
  );
};
