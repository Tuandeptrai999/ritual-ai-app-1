import React, { useState } from "react";
import { Header } from "../components/Header";
import { ChatContainer } from "../components/ChatContainer";
import { ChatInput } from "../components/ChatInput";
import { Sidebar } from "../components/Sidebar";
import { ThemeProvider } from "../contexts/ThemeContext";
import type { ChatMessageType } from "../types/chat";

import { usePrivy } from '@privy-io/react-auth';

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const { login, authenticated, getAccessToken, ready } = usePrivy();

  const handleSendMessage = async (text: string) => {
    if (!ready) return;
    
    if (!authenticated) {
        login();
        return;
    }
    const newUserMsg: ChatMessageType = {
      id: Date.now().toString(),
      message: text,
      sender: "user"
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
        body: JSON.stringify({ message: text, conversationId })
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
      
      if (data.conversationId) setConversationId(data.conversationId);
      
      const newBotMsg: ChatMessageType = {
        id: Date.now().toString(),
        message: data.message || "Sorry, I couldn't understand that.",
        sender: "bot"
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
      <div className="flex h-screen bg-[var(--bg-primary)] transition-colors duration-700 overflow-hidden">
        <Sidebar aria-label="Global System Control" />
        <div className="flex-1 flex flex-col min-w-0 bg-transparent relative overflow-hidden">
          {/* Alchemist Background Effects */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#8B5CF6]/5 blur-[160px] rounded-full -mr-96 -mt-96 animate-pulse-violet pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#00F5FF]/5 blur-[140px] rounded-full animate-pulse-glow pointer-events-none delay-1000"></div>
          
          <Header />
          <main className="flex-1 flex flex-col relative overflow-hidden z-10 w-full bg-ritual-grad">
            <ChatContainer messages={messages} onSendMessage={isLoading ? undefined : handleSendMessage} isLoading={isLoading} />
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};
