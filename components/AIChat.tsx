import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi! I'm Jake.0, your productivity coach. Need help focusing or organizing your tasks today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await getChatResponse(userMsg.text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white pl-4 pr-2 py-2 rounded-full shadow-2xl shadow-blue-900/20 border border-slate-600 transition-all duration-300 ${isOpen ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
      >
        <span className="text-sm font-medium">Chat with Jake.0</span>
        <div className="bg-slate-700 p-2 rounded-full relative">
            <MessageCircle size={20} className="text-blue-400" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-700"></span>
        </div>
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed inset-x-0 bottom-0 md:inset-auto md:bottom-6 md:right-6 md:w-[400px] md:h-[600px] h-[85vh] z-50 bg-[#0f172a] md:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-700 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-y-0' : 'translate-y-[110%]'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50 md:rounded-t-3xl rounded-t-3xl backdrop-blur-md">
           <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                   <Bot size={20} className="text-blue-400" />
               </div>
               <div>
                   <h3 className="font-bold text-white text-sm">Jake.0</h3>
                   <p className="text-xs text-blue-400 flex items-center gap-1">
                       <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                       Online
                   </p>
               </div>
           </div>
           <button 
             onClick={() => setIsOpen(false)}
             className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
           >
             <X size={20} />
           </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/30">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                    }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <span className="text-[10px] opacity-50 mt-1 block text-right">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex justify-start">
                    <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-sm border border-slate-700 p-4 flex gap-1">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 md:rounded-b-3xl">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about productivity..."
                    className="flex-1 bg-slate-800 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-slate-700"
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputText.trim()}
                    className="bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white p-3 rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Send size={18} />
                </button>
            </div>
            <div className="text-center mt-2">
                <p className="text-[10px] text-slate-500">AI can make mistakes. Check important info.</p>
            </div>
        </div>
      </div>
    </>
  );
};

export default AIChat;