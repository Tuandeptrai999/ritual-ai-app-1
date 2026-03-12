import React, { useState, useEffect } from "react";
import type { ChatMessageType } from "../types/chat";
import { User, Terminal, CheckCircle2 } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message: msgObj }) => {
  const isUser = msgObj.sender === "user";
  const [displayedText, setDisplayedText] = useState(isUser || !msgObj.isNew ? (msgObj.message || "") : "");
  const [isTyping, setIsTyping] = useState(!isUser && !!msgObj.isNew && !!msgObj.message);

  useEffect(() => {
    if (!isUser && msgObj.isNew && msgObj.message) {
      setDisplayedText("");
      setIsTyping(true);
      let index = 0;
      const text = msgObj.message;
      const speed = 10; 
      
      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          setIsTyping(false);
        }
      }, speed);
      
      return () => clearInterval(timer);
    } else if (!isUser && !msgObj.isNew) {
      setDisplayedText(msgObj.message || "");
      setIsTyping(false);
    }
  }, [msgObj.message, isUser, msgObj.isNew]);

  return (
    <div className={`flex w-full mb-10 animate-slide-right ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"} items-start gap-6`}>
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden group transition-all duration-500 ${
            isUser 
              ? "bg-brand-violet/10 text-brand-violet border border-brand-violet/20" 
              : "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20"
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {isUser ? <User className="w-5 h-5" /> : <Terminal className="w-5 h-5 animate-pulse" />}
          </div>
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          <div className="flex items-center gap-3 mb-2 px-1 opacity-60">
            <span className="text-[10px] font-black tracking-widest text-[var(--text-secondary)] uppercase">
                {isUser ? "SIGNAL SENT" : "SIGGY_CORE_EXECUTION"}
            </span>
            <div className={`w-1 h-1 rounded-full ${isUser ? "bg-brand-violet" : "bg-brand-cyan"}`}></div>
          </div>
          
          <div className={`px-8 py-5 rounded-[28px] text-[16px] font-medium leading-[1.8] tracking-tight border shadow-xl transition-all relative group
            ${isUser 
              ? "bg-brand-violet text-white border-brand-violet shadow-brand-violet/10 rounded-tr-none" 
              : "bg-[var(--card-bg)] text-[var(--text-primary)] border-[var(--border-color)] shadow-black/5 rounded-tl-none backdrop-blur-xl dark:shadow-black/20"}
          `}>
             <div className="relative z-10 whitespace-pre-wrap font-mono text-[14px]">
                {msgObj.imageBase64 && (
                    <img 
                        src={msgObj.imageBase64} 
                        alt="User uploaded" 
                        className="max-w-xs md:max-w-sm rounded-xl mb-3 object-cover shadow-md"
                    />
                )}
                {displayedText || (isTyping ? "" : msgObj.message)}
                {!isUser && isTyping && (
                    <span className="inline-block w-2 h-4 bg-brand-cyan ml-1 animate-pulse"></span>
                )}
             </div>
             
             {!isUser && (
               <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-brand-cyan/40 to-transparent"></div>
             )}
          </div>
          
          <div className="mt-3 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all">
            <CheckCircle2 className="w-3 h-3 text-brand-cyan" />
            <span className="text-[9px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">Verified Protocol Execution</span>
          </div>
        </div>
      </div>
    </div>
  );
};
