import { useEffect, useRef, useState } from "react";
import { Head } from "@inertiajs/react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { useTheme } from "@/components/theme-provider";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Dashboard() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const newMessages: Message[] = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/deepseek/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const botReply = data.choices?.[0]?.message?.content || "❌ Tidak ada jawaban.";

      setMessages((prev) => [...prev, { role: "assistant", content: botReply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Gagal mengambil jawaban dari DeepSeek." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticatedLayout header="DeepSeek ChatBot">
      <Head title="Dashboard" />

      <div className="container mx-auto p-4 h-[90vh] flex flex-col">
        {/* Chat Window */}
        <Card className="flex-1 flex flex-col bg-background border-none shadow-lg">
          <ScrollArea className="flex-1 p-6">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Mulai percakapan dengan DeepSeek!
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-4`}
              >
                <div className="flex items-start space-x-2 max-w-[80%]">
                  {msg.role === "assistant" && (
                    <Avatar>
                      <AvatarImage src="#" alt="DeepSeek" />
                      <AvatarFallback>DS</AvatarFallback>
                    </Avatar>
                  )}
                  <Card
                    className={`p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <CardContent className="p-0 text-sm whitespace-pre-wrap">
                      {msg.content}
                    </CardContent>
                  </Card>
                  {msg.role === "user" && (
                    <Avatar>
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-start space-x-2">
                  <Avatar>
                    <AvatarFallback>DS</AvatarFallback>
                  </Avatar>
                  <Card className="p-3 bg-secondary rounded-lg">
                    <CardContent className="p-0 text-sm animate-pulse">
                      Mengetik...
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Tanyakan sesuatu kepada DeepSeek..."
                className="flex-1 resize-none rounded-lg border-none bg-muted/50 focus:ring-2 focus:ring-primary pr-12 pb-12"
                rows={3}
              />
              <Button
                type="submit"
                disabled={loading}
                className="absolute bottom-2 right-2 rounded-full h-8 w-8 p-0 bg-primary hover:bg-primary/90"
                aria-label={loading ? "Mengirim pesan" : "Kirim pesan"}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
