import React, { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import type { ChatMessageType } from "../types/chat";
import { Database, Cpu, Search, Wrench, Sparkles, Orbit, Terminal } from "lucide-react";

interface ChatContainerProps {
  messages: ChatMessageType[];
  onSendMessage?: (msg: string) => void;
  isLoading?: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ messages, onSendMessage, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 md:px-12 py-10 custom-scrollbar relative">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-brand-violet/5 blur-3xl md:blur-[120px] pointer-events-none rounded-full animate-pulse-violet opacity-60 dark:opacity-100 hidden md:block"></div>
      <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-brand-cyan/5 blur-3xl md:blur-[120px] pointer-events-none rounded-full animate-pulse-glow opacity-60 dark:opacity-100 hidden md:block"></div>
      
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-4xl mx-auto relative z-10 animate-slide-up">
            {/* Main Visual */}
            <div className="relative mb-8 md:mb-16 group mx-auto flex justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-violet to-brand-cyan blur-2xl md:blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000 scale-150"></div>
                <div className="relative p-2 rounded-[32px] md:rounded-[48px] bg-white dark:bg-[#0C0C14] shadow-2xl transition-transform duration-700 group-hover:scale-105 group-hover:rotate-2 border border-gray-100 dark:border-white/5">
                    <video 
                      src="/VIDEO.MOV" 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="w-48 h-48 object-cover rounded-[40px] shadow-inner dark:invert" 
                    />
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-6 -left-6 bg-[var(--card-bg)] backdrop-blur-xl p-4 rounded-3xl border border-[var(--border-color)] animate-float shadow-xl">
                    <Orbit className="w-8 h-8 text-brand-cyan" />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-[var(--card-bg)] backdrop-blur-xl p-4 rounded-3xl border border-[var(--border-color)] animate-float delay-500 shadow-xl">
                    <Sparkles className="w-8 h-8 text-brand-violet" />
                </div>
            </div>

            {/* Typography */}
            <div className="text-center mb-16">
                <h2 className="text-6xl md:text-7xl font-black mb-8 tracking-tighter flex flex-col items-center">
                    <span className="text-[14px] font-black tracking-[0.5em] uppercase text-[var(--text-secondary)] mb-4 animate-pulse opacity-60">Synchronizing Session</span>
                    <span className="text-mystic drop-shadow-[0_0_30px_rgba(139,92,246,0.15)]">SIGGY CORE</span>
                </h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-brand-violet to-brand-cyan rounded-full mx-auto mb-10 opacity-80"></div>
                <p className="text-center text-[var(--text-secondary)] max-w-xl mx-auto font-bold text-lg leading-relaxed tracking-tight px-4 opacity-90">
                    Interact with the premier decentralized intelligence protocol. <br/>
                    <span className="text-[var(--text-primary)] opacity-40">Permissionless AI infrastructure at your fingertips.</span>
                </p>
            </div>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4">
                <OptionCard 
                  title="Logic" 
                  icon={<Database className="w-6 h-6" />} 
                  onClick={() => onSendMessage?.("What is Ritual?")}
                  color="#8B5CF6"
                />
                <OptionCard 
                  title="Testnet" 
                  icon={<Cpu className="w-6 h-6" />} 
                  onClick={() => onSendMessage?.(`What is the current timeline for the Ritual testnet?

Please explain:
- expected launch date
- current development stage
- how the community can participate once the testnet is available.`)}
                  color="#00F5FF"
                />
                <OptionCard 
                  title="Insight" 
                  icon={<Search className="w-6 h-6" />} 
                  onClick={() => onSendMessage?.("Explain the recent updates from the Ritual ecosystem and how it fits into the broader Crypto x AI landscape")}
                  color="#EC4899"
                />
                <OptionCard 
                  title="Forge" 
                  icon={<Wrench className="w-6 h-6" />} 
                  onClick={() => onSendMessage?.(`Explain "How to Build in Ritual" in a very simple, engaging storytelling style so that both developers and non-technical crypto community members can understand it.

Structure the explanation like a story where a builder enters the Ritual ecosystem and learns step-by-step how to build something there.

Requirements:

1. Start with a short hook explaining what Ritual is and why it exists.
2. Tell the story of a developer (or builder) who wants to build an AI-powered Web3 application using Ritual.
3. Explain the key concepts naturally through the story:
   - Ritual ecosystem
   - Infernet
   - Off-chain compute
   - AI + blockchain integration
   - Smart contract interaction
4. Describe the building flow step-by-step:
   - Setting up the environment
   - Deploying compute containers
   - Connecting to Infernet
   - Writing smart contracts
   - Making AI inference requests
   - Returning results on-chain
5. Use simple analogies (like factories, messengers, or magical systems) to make the technical ideas easier to understand.
6. Avoid heavy technical jargon unless necessary, and explain it when it appears.
7. Make it exciting and inspiring for builders who want to build on Ritual.
8. End with a short section called: “Why builders are excited about Ritual”.

Tone:
- Educational
- Story-driven
- Clear and beginner-friendly
- Web3 native vibes

Length: around 700–1000 words.`)}
                  color="#64748B"
                />
            </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full pb-10 relative z-10">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-10 animate-fade-in">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 flex items-center justify-center shrink-0">
                  <Terminal className="w-5 h-5 animate-pulse" />
                </div>
                <div className="bg-[var(--card-bg)] px-8 py-5 rounded-[28px] rounded-tl-none border border-[var(--border-color)] shadow-xl flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-4" />
        </div>
      )}
    </div>
  );
};

const OptionCard = ({ title, icon, onClick, color }: { title: string, icon: React.ReactNode, onClick: () => void, color: string }) => (
    <button 
      onClick={onClick}
      className="bg-[var(--card-bg)] backdrop-blur-2xl group flex flex-col items-center p-8 rounded-[32px] border border-[var(--border-color)] hover:border-brand-violet/30 transition-all duration-500 relative overflow-hidden active:scale-95 shadow-lg hover:shadow-brand-violet/5"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-brand-violet/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 shadow-sm"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        {icon}
      </div>
      <h4 className="text-[12px] font-black tracking-widest uppercase text-[var(--text-primary)] group-hover:text-brand-violet transition-colors">{title}</h4>
    </button>
);
