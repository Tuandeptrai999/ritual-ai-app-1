import React from 'react';
import { Database, Cpu, Search, ShieldCheck, Zap, MessageSquare, Plus } from 'lucide-react';

interface SidebarProps {
    conversations?: any[];
    onSelectConversation?: (id: string) => void;
    activeConversationId?: string | null;
    onNewChat?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    conversations = [], 
    onSelectConversation = () => {}, 
    activeConversationId = null, 
    onNewChat = () => {} 
}) => {
    return (
        <div className="hidden md:flex w-[260px] h-full flex-col py-10 px-6 shrink-0 transition-all duration-500 relative overflow-hidden bg-[var(--bg-secondary)] border-r border-[var(--border-color)] shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-violet/10 blur-[60px] pointer-events-none opacity-50 dark:opacity-100"></div>
            
            {/* Logo area */}
            <div 
                className="flex items-center gap-4 mb-16 cursor-pointer group shrink-0 relative z-10 animate-slide-right"
                onClick={() => window.location.href = '/'}
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-brand-violet blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-lg"></div>
                    <div className="h-12 w-12 bg-white dark:bg-white rounded-xl flex items-center justify-center p-2 shadow-xl group-hover:rotate-6 transition-transform border border-gray-100 dark:border-white/10">
                        <img src="/LOGO.JPG" alt="Ritual" className="w-full h-full object-contain dark:invert" />
                    </div>
                </div>
                <div>
                    <h1 className="text-xl font-black text-[var(--text-primary)] tracking-[0.2em] group-hover:text-brand-cyan transition-colors">RITUAL</h1>
                    <div className="text-[9px] font-bold text-[var(--text-secondary)] tracking-widest uppercase opacity-60">Foundation</div>
                </div>
            </div>

            {/* Profile Card */}
            <div className="relative z-10 mb-12 animate-slide-right delay-100">
                <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-3xl p-6 border border-[var(--border-color)] relative group overflow-hidden shadow-premium hover:shadow-brand-violet/10 transition-shadow">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-violet to-transparent opacity-50"></div>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative w-14 h-14">
                            <div className="absolute inset-0 bg-brand-cyan rounded-2xl blur-lg opacity-20"></div>
                            <img src="/chat.png" alt="Siggy" className="relative w-full h-full object-cover rounded-2xl border border-[var(--border-color)]" />
                        </div>
                        <div>
                            <div className="text-[14px] font-extrabold text-[var(--text-primary)]">Siggy Core</div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse"></div>
                                <span className="text-[9px] font-bold text-brand-cyan tracking-widest uppercase">STABLE</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="h-[px] w-full bg-[var(--border-color)]"></div>
                        <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed opacity-80">
                            Status: <span className="text-brand-violet font-bold">Operational</span> <br/>
                            Liveness: 99.9%
                        </p>
                    </div>
                </div>
            </div>

            {/* Modules List & History */}
            <div className="flex-1 space-y-8 relative z-10 overflow-y-auto custom-scrollbar pr-2">
                <div>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-[9px] text-[var(--text-secondary)] font-black tracking-[0.3em] uppercase opacity-60">History</h3>
                        <button 
                            onClick={onNewChat}
                            className="bg-brand-violet/10 text-brand-violet hover:bg-brand-violet hover:text-white rounded-lg p-1.5 transition-all"
                            title="New Conversation"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    
                    <div className="space-y-1 mb-8">
                        {conversations.length === 0 ? (
                            <div className="text-[11px] text-[var(--text-secondary)] italic px-3 py-2 opacity-50">No recent rituals.</div>
                        ) : (
                            conversations.map(c => (
                                <div 
                                    key={c.id}
                                    onClick={() => onSelectConversation(c.id)}
                                    className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5 ${activeConversationId === c.id ? 'bg-black/5 dark:bg-white/5 border border-[var(--border-color)] shadow-md' : ''}`}
                                >
                                    <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center transition-all ${activeConversationId === c.id ? 'bg-brand-violet text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] group-hover:text-brand-cyan'}`}>
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <span className={`text-[12px] font-bold tracking-tight truncate transition-colors ${activeConversationId === c.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                                        {c.title || "New Conversation"}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-[9px] text-[var(--text-secondary)] font-black tracking-[0.3em] uppercase mb-4 px-2 opacity-60">Core Modules</h3>
                    <div className="space-y-1">
                        <ModuleButton icon={<Zap className="w-4 h-4" />} text="Rapid Inference" active />
                        <ModuleButton icon={<Database className="w-4 h-4" />} text="Structured Oracle" />
                        <ModuleButton icon={<Cpu className="w-4 h-4" />} text="Compute Fabric" />
                        <ModuleButton icon={<Search className="w-4 h-4" />} text="Insight Engine" />
                    </div>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="mt-8 pt-6 border-t border-[var(--border-color)] relative z-10">
                <div className="flex items-center justify-between text-[9px] font-black tracking-widest text-brand-violet transition-opacity hover:opacity-100 opacity-60 cursor-default">
                    <span>V.2.0.4-BETA</span>
                    <ShieldCheck className="w-3 h-3" />
                </div>
            </div>
        </div>
    );
};

const ModuleButton = ({ icon, text, active = false }: { icon: React.ReactNode, text: string, active?: boolean }) => (
    <div className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5 ${active ? 'bg-black/5 dark:bg-white/5 border border-[var(--border-color)] shadow-md' : ''}`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${active ? 'bg-brand-violet text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] group-hover:text-brand-cyan'}`}>
            {icon}
        </div>
        <span className={`text-[12px] font-bold tracking-tight transition-colors ${active ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>{text}</span>
    </div>
);
