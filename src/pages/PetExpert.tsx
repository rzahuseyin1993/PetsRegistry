import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "My dog has been scratching a lot, what could it be?",
  "What's the best diet for an indoor cat?",
  "How do I train my puppy to stop biting?",
  "My parrot is losing feathers, should I be worried?",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pet-expert`;

async function streamChat({
  messages, onDelta, onDone, onError,
}: {
  messages: Message[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const { data: { session } } = await supabase.auth.getSession();  
  console.log('session here~~~~~~~~~~~~~~~~', session, CHAT_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

  if (!session?.access_token) {
    onError("Please log in to use the AI Expert feature.");
    return;
  }

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ messages }),
  });

  console.log('resp here~~~~~~~~~~~~~~~~', resp);
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || "Something went wrong.");
    return;
  }
  if (!resp.body) { onError("No response received."); return; }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let streamDone = false;
  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { streamDone = true; break; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  onDone();
}

export default function PetExpert() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);
    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };
    try {
      await streamChat({
        messages: updated,
        onDelta: upsert,
        onDone: () => setIsLoading(false),
        onError: (msg) => { toast.error(msg); setIsLoading(false); },
      });
    } catch {
      toast.error("Failed to connect.");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-8 flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">
            <Sparkles className="h-7 w-7 text-purple-600" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">AI Pet Expert 🐾</h1>
          <p className="text-muted-foreground mt-2">Get instant advice on pet health, nutrition, training & more</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 border border-border rounded-2xl bg-card shadow-sm flex flex-col min-h-[400px] max-h-[60vh]">
          <ScrollArea className="flex-1 p-4 overflow-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 gap-4">
                <Bot className="h-16 w-16 text-primary/20" />
                <p className="text-muted-foreground text-center">Ask me anything about your pet!</p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)}
                      className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground rounded-full px-3 py-1.5 transition-colors border border-border">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    {m.role === "assistant" && (
                      <div className="shrink-0 w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm whitespace-pre-wrap ${
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}>
                      <p>{m.content}</p>
                    </div>
                    {m.role === "user" && (
                      <div className="shrink-0 w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <span className="animate-pulse text-muted-foreground text-sm">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>

          <div className="border-t border-border p-3 flex gap-2 items-end">
            {messages.length > 0 && (
              <Button variant="ghost" size="icon" onClick={() => setMessages([])} className="shrink-0 text-muted-foreground" title="Clear chat">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Textarea placeholder="Ask about your pet..." value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown} rows={1} className="resize-none min-h-[40px] max-h-[120px] rounded-xl" disabled={isLoading} />
            <Button onClick={() => send(input)} disabled={!input.trim() || isLoading} size="icon" className="shrink-0 rounded-xl">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
