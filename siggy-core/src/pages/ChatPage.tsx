import React, { useState } from "react";
import { Header } from "../components/Header";
import { ChatContainer } from "../components/ChatContainer";
import { ChatInput } from "../components/ChatInput";
import { Sidebar } from "../components/Sidebar";
import { ThemeProvider } from "../contexts/ThemeContext";
import type { ChatMessageType } from "../types/chat";
import { Menu } from "lucide-react";

import { usePrivy } from '@privy-io/react-auth';

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { login, authenticated, getAccessToken, ready } = usePrivy();

  const fetchConversations = async () => {
      try {
          const token = await getAccessToken();
          if (!token) return;
          const res = await fetch(`${import.meta.env.VITE_API_WORKER}/api/conversations`, {
              headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setConversations(data);
          }
      } catch(e) {}
  };

  React.useEffect(() => {
    if (ready && authenticated) {
        fetchConversations();
    }
  }, [ready, authenticated]);

  const handleSelectConversation = async (id: string) => {
      setConversationId(id);
      setIsLoading(true);
      try {
          const token = await getAccessToken();
          const res = await fetch(`${import.meta.env.VITE_API_WORKER}/api/conversations/${id}`, {
              headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              const mapped = data.messages.map((m: any) => {
                  let text = m.content;
                  let img = undefined;
                  if (m.role === 'user' && text.startsWith('{')) {
                      try {
                          const parsed = JSON.parse(text);
                          text = parsed.text || text;
                          img = parsed.image;
                      } catch(e) {}
                  }
                  return {
                      id: m.id,
                      message: text,
                      sender: m.role,
                      imageBase64: img,
                      isNew: false
                  };
              });
              setMessages(mapped);
          }
      } catch (e) {}
      setIsLoading(false);
  };

  const handleNewChat = () => {
      setConversationId(null);
      setMessages([]);
  };

  const handleSendMessage = async (text: string, imageBase64?: string) => {
    if (!ready) return;
    
    if (!authenticated) {
        login();
        return;
    }
    const newUserMsg: ChatMessageType = {
      id: Date.now().toString(),
      message: text,
      sender: "user",
      imageBase64: imageBase64,
      isNew: true
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const token = await getAccessToken();
      const response = await fetch(`${import.meta.env.VITE_API_WORKER}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: text, image: imageBase64, conversationId })
      });

      if (!response.ok) {
        let errText = await response.text();
        try {
            const parsed = JSON.parse(errText);
            if (parsed.error) errText = parsed.error;
        } catch(e) {}
        throw new Error(errText);
      }

      const data = await response.json();
      
      if (data.conversationId && conversationId !== data.conversationId) {
          setConversationId(data.conversationId);
          fetchConversations(); // refresh the list
      }
      
      const newBotMsg: ChatMessageType = {
        id: Date.now().toString(),
        message: data.message || "Sorry, I couldn't understand that.",
        sender: "bot",
        isNew: true
      };
      
      setMessages((prev) => [...prev, newBotMsg]);
    } catch (error: any) {
       const errorMsg: ChatMessageType = {
        id: Date.now().toString(),
        message: `Error: ${error.message || "Could not connect to the API."}`,
        sender: "bot"
      };
      setMessages((prev) => [...prev, errorMsg]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="flex h-dvh bg-[var(--bg-primary)] transition-colors duration-700 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                onClick={() => setIsSidebarOpen(false)}
            />
        )}
        <Sidebar 
            conversations={conversations}
            activeConversationId={conversationId}
            onSelectConversation={(id) => {
                handleSelectConversation(id);
                setIsSidebarOpen(false);
            }}
            onNewChat={() => {
                handleNewChat();
                setIsSidebarOpen(false);
            }}
            isMobileOpen={isSidebarOpen}
        />
        <div className="flex-1 flex flex-col min-w-0 bg-transparent relative overflow-hidden">
          {/* Alchemist Background Effects */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#8B5CF6]/5 blur-3xl md:blur-[160px] rounded-full -mr-96 -mt-96 animate-pulse-violet pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#00F5FF]/5 blur-3xl md:blur-[140px] rounded-full animate-pulse-glow pointer-events-none delay-1000"></div>
          
          <div className="flex items-center w-full z-50 pl-4 md:pl-0 shrink-0 pointer-events-none">
            <button 
                className="md:hidden pointer-events-auto p-2 bg-white/5 border border-white/5 backdrop-blur-md rounded-xl text-(--text-primary) hover:bg-white/10 z-50 mr-4"
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1 w-full flex"><Header /></div>
          </div>
          
          <main className="flex-1 flex flex-col relative overflow-hidden z-10 w-full bg-ritual-grad">
            <ChatContainer messages={messages} onSendMessage={isLoading ? undefined : handleSendMessage} isLoading={isLoading} />
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};
