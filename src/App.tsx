/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  MessageCircle, 
  Search, 
  Heart, 
  Shield, 
  Menu, 
  X, 
  Send,
  User,
  Bot,
  ChevronRight,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';

// --- Types ---
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// --- Components ---

const TormeAvatar = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-32 h-32"
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizes[size])}>
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-gold/30 blur-xl rounded-full"
      />
      <motion.div
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10 w-full h-full bg-dark rounded-full shadow-2xl border border-gold/40 flex items-center justify-center overflow-hidden"
      >
        <div className="flex gap-2">
          <motion.div 
            animate={{ opacity: [1, 0.3, 1] }} 
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1] }}
            className="w-1.5 h-1.5 bg-gold rounded-full" 
          />
          <motion.div 
            animate={{ opacity: [1, 0.3, 1] }} 
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1], delay: 0.1 }}
            className="w-1.5 h-1.5 bg-gold rounded-full" 
          />
        </div>
      </motion.div>
    </div>
  );
};

const ChatSection = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Hello! I'm Torme, your EveryHelp Companion. How can I brighten your day or assist you today?", 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, userMessage].map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "You are Torme, a friendly, empathetic, and highly capable AI companion called 'EveryHelp'. Your personality is warm, non-judgmental, and proactive. You aim to be like a mix of a helpful assistant and a wise friend. Keep responses reasonably concise but thorough where needed. You speak with a gentle and supportive tone.",
        }
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.text || "I'm sorry, I couldn't process that. Could you try again?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Oh dear, I seem to have run into a small technical hiccup. Could we try talking again in a moment?", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <TormeAvatar size="sm" />
          <div>
            <h3 className="font-serif text-lg tracking-wide text-white">Interface Active</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold flex items-center gap-2">
              <span className="w-1 h-1 bg-gold rounded-full animate-pulse" />
              Cognitive link stable
            </p>
          </div>
        </div>
        <div className="text-[9px] uppercase tracking-[0.3em] opacity-40 font-mono">
          Node_07 / Encrypted
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-6 max-w-[90%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
              msg.role === 'user' ? "bg-white/5 border-white/10" : "bg-gold border-gold"
            )}>
              {msg.role === 'user' ? <User size={18} className="text-white/60" /> : <Bot size={18} className="text-dark" />}
            </div>
            <div className={cn(
              "p-5 rounded-sm text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-white/10 text-white border-l-2 border-white/20" 
                : "bg-white/5 text-white/90 border-l-2 border-gold/40"
            )}>
              <div className="markdown-body prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-6">
            <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center shrink-0">
              <Bot size={18} className="text-dark" />
            </div>
            <div className="bg-white/5 p-5 rounded-sm border-l-2 border-gold/40 flex gap-2">
              <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1 h-1 bg-gold rounded-full" />
              <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} className="w-1 h-1 bg-gold rounded-full" />
              <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} className="w-1 h-1 bg-gold rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-white/5 border-t border-white/10">
        <div className="relative flex items-center gap-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Command input..."
            className="w-full pl-6 pr-14 py-4 bg-white/5 border border-white/10 rounded-full focus:outline-hidden focus:ring-1 focus:ring-gold/30 focus:border-gold/50 transition-all text-sm tracking-wide text-white placeholder:text-white/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-3 text-gold hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark font-sans text-[#e0e0e0] overflow-x-hidden selection:bg-gold/20 selection:text-gold">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-white/2 blur-[100px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-16 py-10 flex items-center justify-between max-w-7xl mx-auto border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-gold rotate-45 flex items-center justify-center">
            <div className="w-4 h-4 bg-gold rotate-45"></div>
          </div>
          <span className="text-2xl font-serif tracking-[0.3em] uppercase text-white">Torme</span>
        </div>

        <div className="hidden md:flex items-center gap-12 text-[10px] uppercase tracking-[0.2em] font-medium opacity-60">
          <a href="#" className="hover:opacity-100 transition-opacity">Capabilities</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Architecture</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Ethical Core</a>
          <button className="px-8 py-2.5 border border-white/20 rounded-full text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-dark transition-all active:scale-95">
            Initialize
          </button>
        </div>

        <button className="md:hidden p-2 text-white/60" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 inset-x-6 z-40 bg-dark/95 backdrop-blur-xl shadow-2xl rounded-sm p-8 md:hidden border border-white/10"
          >
            <div className="flex flex-col gap-6 text-[10px] uppercase tracking-[0.2em]">
              <a href="#" className="text-white/60">Capabilities</a>
              <a href="#" className="text-white/60">Architecture</a>
              <a href="#" className="text-white/60">Ethical Core</a>
              <button className="w-full py-4 border border-gold text-gold uppercase tracking-[0.3em]">Initialize</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 px-16">
        {/* Hero Section */}
        <section className="pt-24 pb-32 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="text-[11px] uppercase tracking-[0.4em] text-gold mb-6 font-semibold">
              The Infinite Assistant
            </div>
            <h1 className="text-7xl md:text-8xl font-serif font-light leading-[1.05] mb-10 tracking-tight text-white">
              Everyhelp for <br/> 
              <span className="italic">Modern Living.</span>
            </h1>
            <p className="text-xl font-light leading-relaxed text-white/50 mb-12 max-w-xl">
              Torme doesn't just process tasks; it understands the nuance of your workflow, anticipating needs before they manifest into complexity.
            </p>
            <div className="flex flex-wrap gap-6">
              <button className="bg-white text-dark px-10 py-4 rounded-full font-bold text-sm uppercase tracking-[0.2em] hover:bg-gold transition-all active:scale-95">
                Get Started
              </button>
              <button className="px-10 py-4 border border-white/10 rounded-full font-bold text-sm uppercase tracking-[0.2em] hover:bg-white/5 transition-all flex items-center gap-3 active:scale-95">
                The Narrative <ChevronRight size={18} className="text-gold" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gold/10 blur-[100px] rounded-full animate-pulse" />
              <TormeAvatar size="lg" />
              
              {/* Floating indicators */}
              <div className="absolute -top-16 -left-16 bg-white/5 p-6 rounded-sm border border-white/10 backdrop-blur-md">
                <div className="flex justify-between items-center mb-4 gap-12">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gold">Status: Active</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-gold" />
                    <div className="w-1 h-1 rounded-full bg-gold/40" />
                    <div className="w-1 h-1 rounded-full bg-gold/20" />
                  </div>
                </div>
                <p className="text-xs font-mono opacity-40">System frequency: Stable<br/>Uptime: 99.999%</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Chat Experience Section */}
        <section className="py-32 border-y border-white/5 bg-white/[0.02] -mx-16 px-16">
          <div className="max-w-7xl mx-auto mb-20">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 text-center">Interface v4.0</p>
            <h2 className="text-5xl font-serif text-center text-white mb-6">Cognitive Interface</h2>
            <div className="w-12 h-[1px] bg-gold mx-auto" />
          </div>
          <ChatSection />
        </section>

        {/* Features Grid */}
        <section className="py-40 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-16">
            <FeatureCard 
              number="01"
              title="Cognitive Depth"
              description="Deep neural understanding of your unique behavioral patterns, allowing for effortless task automation."
            />
            <FeatureCard 
              number="02"
              title="Seamless Link"
              description="A cohesive digital narrative that bridges your environments, physical devices, and data archives."
            />
            <FeatureCard 
              number="03"
              title="Ethical Core"
              description="Privacy isn't a feature, it's the architecture. Zero-knowledge protocols ensure absolute cognitive sovereignty."
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 max-w-5xl mx-auto text-center border-t border-white/5">
          <div className="relative inline-block mb-12">
            <div className="w-16 h-16 border border-gold rotate-45 flex items-center justify-center mx-auto mb-8">
              <div className="w-8 h-8 bg-gold rotate-45" />
            </div>
          </div>
          <h2 className="text-6xl md:text-7xl font-serif font-light text-white mb-10 leading-tight">
            Elevate your <br/> <span className="italic">existence.</span>
          </h2>
          <p className="text-white/40 mb-16 text-xl font-light tracking-wide max-w-xl mx-auto">
            Experience the pinnacle of collaborative intelligence. Stable, encrypted, and designed for you.
          </p>
          <button className="px-16 py-6 border border-white/20 rounded-full uppercase tracking-[0.4em] text-xs font-bold hover:bg-white hover:text-dark transition-all shadow-2xl hover:shadow-gold/10 active:scale-95">
            Begin Integration
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-16 py-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[9px] uppercase tracking-[0.3em] opacity-40 font-medium">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <span className="text-white">&copy; 2026 TORME COGNITIVE SYSTEMS</span>
        </div>
        <div className="flex gap-12">
          <span>V 4.0.2 / STABLE ENCRYPTED</span>
          <span>PRODUCED BY EVERYHELP LABS</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="space-y-8"
    >
      <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">{number} — {title}</span>
      <p className="text-lg font-light leading-relaxed text-white/70">
        {description}
      </p>
      <div className="w-12 h-[1px] bg-gold" />
    </motion.div>
  );
}
