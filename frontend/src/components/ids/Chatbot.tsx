import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Shield } from "lucide-react";
import { getBotResponse, type ChatMessage } from "@/lib/chatbot";

/**
 * Chatbot – A floating chat window for the Sentinel IDS dashboard.
 *
 * Design notes:
 *  - Uses the same dark-mode cyber-green palette as the rest of the app.
 *  - Fixed to the bottom-right so it never shifts the main dashboard.
 *  - Conversation state is kept entirely in React; no backend required.
 */

// Helper: generate a unique ID for each message
const uid = () => crypto.randomUUID();

// The initial greeting the bot shows when the chat is first opened
const WELCOME_MESSAGE: ChatMessage = {
  id: uid(),
  sender: "bot",
  text: "Welcome to **Sentinel IDS Assistant**.\n\nI can help you with:\n• Attack info (DDoS, PortScan, SQLi …)\n• Prevention techniques\n• How the prediction model works\n• General project questions\n\nType your question below to get started.",
  timestamp: new Date(),
};

const Chatbot = () => {
  // ----- state -----
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");

  // ref for auto-scrolling the message container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // auto-scroll whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ----- handlers -----
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // 1. Add the user message
    const userMsg: ChatMessage = {
      id: uid(),
      sender: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    // 2. Generate the bot response
    const botReply: ChatMessage = {
      id: uid(),
      sender: "bot",
      text: getBotResponse(trimmed),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, botReply]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // ----- render helpers -----

  /** Render markdown-style **bold** inside a message */
  const renderText = (text: string) => {
    // Split on **bold** markers
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <span key={i} className="font-semibold text-primary">
            {part.slice(2, -2)}
          </span>
        );
      }
      // Preserve newlines
      return part.split("\n").map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    });
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ----- JSX -----
  return (
    <>
      {/* ========== Floating toggle button ========== */}
      <button
        id="chatbot-toggle"
        onClick={() => setIsOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full
          bg-primary text-primary-foreground shadow-lg
          hover:scale-105 active:scale-95 transition-all duration-200
          glow-green ${isOpen ? "rotate-90 opacity-0 pointer-events-none" : "rotate-0 opacity-100"}`}
        aria-label="Open chatbot"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* ========== Chat window ========== */}
      <div
        id="chatbot-window"
        className={`fixed bottom-6 right-6 z-50 flex flex-col
          w-[370px] h-[520px] rounded-lg overflow-hidden
          border border-border bg-card shadow-2xl
          transition-all duration-300 origin-bottom-right
          ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"}`}
      >
        {/* ---- Header ---- */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/70 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Shield className="h-5 w-5 text-primary" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-safe animate-pulse" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold tracking-wider text-foreground glow-green-text">
                SENTINEL ASSISTANT
              </h2>
              <p className="text-[10px] font-mono text-muted-foreground">Online • Rule-based engine</p>
            </div>
          </div>
          <button
            id="chatbot-close"
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-border/50 transition-colors"
            aria-label="Close chatbot"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* ---- Messages ---- */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* Bot avatar */}
              {msg.sender === "bot" && (
                <div className="flex-shrink-0 mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg text-xs font-mono leading-relaxed
                  ${msg.sender === "user"
                    ? "bg-primary/20 border border-primary/30 text-foreground"
                    : "bg-secondary border border-border text-foreground"
                  }`}
              >
                {renderText(msg.text)}
                <div
                  className={`mt-1 text-[9px] ${
                    msg.sender === "user" ? "text-primary/50 text-right" : "text-muted-foreground"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </div>
              </div>

              {/* User avatar */}
              {msg.sender === "user" && (
                <div className="flex-shrink-0 mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
            </div>
          ))}
          {/* Invisible anchor for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* ---- Input bar ---- */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border bg-secondary/50">
          <input
            id="chatbot-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about attacks, prevention…"
            className="flex-1 bg-background border border-border rounded-md px-3 py-1.5
              text-xs font-mono text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-1 focus:ring-primary/60 transition-shadow"
          />
          <button
            id="chatbot-send"
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex items-center justify-center w-8 h-8 rounded-md
              bg-primary text-primary-foreground
              hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors"
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
