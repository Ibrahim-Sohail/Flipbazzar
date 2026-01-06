
import React, { useState, useEffect, useRef } from 'react';
import { Message, Sender, User } from './types';
import ChatMessage from './components/ChatMessage';
import LoginScreen from './components/LoginScreen';
import { sendMessageToGemini } from './services/gemini';
import { storage } from './services/storage';
import { Content } from '@google/genai';
import { LogoIcon, LogoText } from './components/Logo';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = storage.getUser();
    if (storedUser) {
        setUser(storedUser);
        const history = storage.getHistory();
        if (history.length > 0) {
            setMessages(history);
        } else {
            setMessages([{
                id: 'welcome',
                sender: Sender.BOT,
                text: `Hello again, **${storedUser.name}**! \n\nI'm ready to assist with your tech needs. Searching for a specific gadget or looking to compare hardware?`,
                timestamp: new Date(),
            }]);
        }
    }
  }, []);

  useEffect(() => {
    if (user && messages.length > 0) {
        storage.saveHistory(messages);
    }
  }, [messages, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    storage.saveUser(newUser);
    setMessages([{
        id: 'welcome-new',
        sender: Sender.BOT,
        text: `Hi **${newUser.name}**! Welcome to FlipBazzar. \n\nI'm your dedicated Tech AI. I can help you find smartphones, laptops, audio gear, and more. \n\nWhat technology are you interested in today?`,
        timestamp: new Date(),
    }]);
  };

  const handleLogout = () => {
    storage.clearSession();
    setUser(null);
    setMessages([]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsgText = inputText.trim();
    setInputText('');
    setIsLoading(true);

    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: Sender.USER,
      text: userMsgText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMsg]);

    try {
      const history: Content[] = messages.map(m => ({
        role: m.sender === Sender.USER ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await sendMessageToGemini(history, userMsgText, user || undefined);

      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: Sender.BOT,
        text: response.text,
        relatedProducts: response.foundProducts,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newBotMsg]);

    } catch (error) {
      console.error("Chat Loop Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: Sender.BOT,
        text: "I encountered a technical glitch. Please try your request again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
      return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <LogoIcon className="w-9 h-9" />
             <LogoText />
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tech Expert Online</span>
            </div>
            <button 
                onClick={handleLogout}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
            >
                Exit
            </button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-grow overflow-y-auto scroll-smooth">
        <div className="max-w-3xl mx-auto px-6 py-10">
           {messages.map(msg => (
             <ChatMessage key={msg.id} message={msg} />
           ))}
           
           {isLoading && (
             <div className="flex w-full mb-8 justify-start">
                <div className="flex flex-row">
                   <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-white border border-blue-100 mr-4 flex items-center justify-center shadow-sm">
                      <LogoIcon className="w-6 h-6" />
                   </div>
                   <div className="flex items-center space-x-2 px-6 bg-slate-50 border border-slate-100 rounded-3xl rounded-tl-none h-12">
                     <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                     <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                     <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                   </div>
                </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-100 p-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative group">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Search tech, compare gadgets..."
              className="w-full bg-slate-50 border-2 border-transparent group-focus-within:border-blue-100 group-focus-within:bg-white px-6 py-5 pr-16 rounded-3xl text-slate-800 placeholder-slate-400 outline-none transition-all shadow-inner"
              autoFocus
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`absolute right-3 top-3 bottom-3 px-5 rounded-2xl transition-all ${
                inputText.trim() && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-widest">
            FlipBazzar Tech AI • Vercel Optimized • Secured
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
