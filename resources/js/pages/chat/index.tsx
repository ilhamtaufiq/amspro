import { Head, useForm, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Clock } from "lucide-react";

// Interfaces for type safety
interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  databaseResults?: any; // Allow database results (e.g., count or array)
}

interface FlashData {
  data?: {
    userMessage?: string;
    aiMessage?: string;
    databaseResults?: any;
  };
  error?: string;
}

interface Props {
  initialMessages: Message[];
  flash?: FlashData;
}

interface FormData {
  message: string;
}

// Format timestamp (e.g., "10:38 PM WIB")
const formatTimestamp = () => {
  return new Date().toLocaleTimeString("en-ID", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "Asia/Jakarta",
  });
};

// Message component
const MessageItem = ({ message }: { message: Message }) => (
  <div
    className={`flex mb-4 animate-fade-in ${
      message.role === "user" ? "justify-end" : "justify-start"
    }`}
  >
    <div className="flex items-start space-x-3 max-w-[80%]">
      {message.role === "assistant" && (
        <Avatar>
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}
      <Card
        className={`p-3 ${
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        <CardContent className="p-0 text-sm whitespace-pre-wrap">
          <p>{message.content}</p>
          <div className="flex items-center gap-1 text-xs opacity-70 mt-1">
            <Clock className="h-3 w-3" />
            <span>{message.timestamp}</span>
          </div>
          {message.databaseResults && (
            <div className="mt-2">
              <p className="font-medium">Database Results:</p>
              {Array.isArray(message.databaseResults) ? (
                message.databaseResults.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {message.databaseResults.map((item: any, index: number) => (
                      <li key={index}>
                        {item.title || JSON.stringify(item)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No results found.</p>
                )
              ) : (
                <p>{JSON.stringify(message.databaseResults)}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {message.role === "user" && (
        <Avatar>
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  </div>
);

export default function Chat({ initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { flash } = usePage<{ flash?: FlashData }>().props;

  // Inertia.js form
  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    message: "",
  });

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle flash data
  useEffect(() => {
    if (flash?.data?.userMessage && flash?.data?.aiMessage) {
      const data = flash.data;
      const timestamp = formatTimestamp();
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "user",
          content: data.userMessage || "",
          timestamp,
        },
        {
          id: prev.length + 2,
          role: "assistant",
          content: data.aiMessage || "",
          timestamp,
          databaseResults: data.databaseResults,
        },
      ]);
    }
    if (flash?.error) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content: flash.error || "An error occurred.",
          timestamp: formatTimestamp(),
        },
      ]);
    }
  }, [flash]);

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.message.trim() || processing) return;

    post(route("chat.index"), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        reset();
        inputRef.current?.focus();
      },
      onError: () => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            role: "assistant",
            content: errors.message || "Failed to process request.",
            timestamp: formatTimestamp(),
          },
        ]);
      },
    });
  };

  // Enter key handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <AuthenticatedLayout header="Chat with AI & Database">
      <Head title="Chat with AI & Database" />
      <div className="flex-1 rounded-xl bg-muted/50 h-full">
        <Card className="flex-1 flex flex-col bg-background border-none shadow-lg">
          <ScrollArea className="flex-1 p-6" aria-label="Chat messages">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Ask about jobs or start a conversation with the AI! Try: "How many jobs in Kecamatan Naringgul in 2025?"
              </div>
            )}
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}
            {processing && (
              <div className="flex justify-start mb-4">
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <Card className="p-3 bg-secondary">
                    <CardContent className="p-0 text-sm flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t bg-background"
            aria-label="Message input form"
          >
            <div className="relative flex items-center gap-2">
              <Textarea
                value={data.message}
                onChange={(e) => setData("message", e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about jobs (e.g., 'How many jobs in Kecamatan Naringgul in 2025?') or chat with the AI..."
                className="flex-1 resize-none rounded-lg bg-muted/50 focus:ring-2 focus:ring-primary"
                rows={3}
                aria-label="Message input"
                disabled={processing}
                ref={inputRef}
              />
              <Button
                type="submit"
                disabled={processing || !data.message.trim()}
                className="rounded-full h-10 w-10 p-0 bg-primary hover:bg-primary/90 disabled:opacity-50"
                aria-label={processing ? "Processing request" : "Send message"}
              >
                {processing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 2L11 13" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                )}
              </Button>
            </div>
            {errors.message && (
              <p className="text-destructive text-sm mt-2">{errors.message}</p>
            )}
          </form>
        </Card>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </AuthenticatedLayout>
  );
}
