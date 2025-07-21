import { Head, useForm, usePage } from "@inertiajs/react";
import type { PageProps } from '@/types';
import { useState, useEffect, useRef, useCallback, memo } from "react";
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Interfaces for type safety
interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  databaseResults?: string | null; // Markdown table string or null
}

interface FlashData {
  data?: {
    userMessage?: string;
    aiMessage?: string;
    databaseResults?: string | null;
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

// Parse Markdown table into headers and rows
const parseMarkdownTable = (markdown: string) => {
  const lines = markdown.trim().split("\n").filter((line) => line.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  // Extract headers (first line, split by |)
  const headers = lines[0]
    .split("|")
    .map((header) => header.trim())
    .filter((header) => header);

  // Skip separator line (e.g., |---|---|)
  const rows = lines.slice(2).map((line) =>
    line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell)
  );

  return { headers, rows };
};

// Message component with memoization
const MessageItem = memo(({ message }: { message: Message }) => {
  const { headers, rows } = message.databaseResults
    ? parseMarkdownTable(message.databaseResults)
    : { headers: [], rows: [] };

  return (
    <div
      className={`flex mb-4 animate-fade-in ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div className="flex items-start space-x-3 max-w-[85%]">
        {message.role === "assistant" && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-muted text-muted-foreground">
              AI
            </AvatarFallback>
          </Avatar>
        )}
        <Card
          className={`p-4 rounded-2xl shadow-sm ${
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-background border border-muted"
          }`}
        >
          <CardContent className="p-0 text-sm whitespace-pre-wrap">
            <p className="leading-relaxed">{message.content}</p>
            <div className="flex items-center gap-1 text-xs opacity-60 mt-2">
              <Clock className="h-3 w-3" />
              <span>{message.timestamp}</span>
            </div>
            {message.databaseResults && headers.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-sm mb-2">Database Results:</p>
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      {headers.map((header, index) => (
                        <TableHead key={index} className="font-medium">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length > 0 ? (
                      rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex}>{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={headers.length} className="text-center">
                          No results found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        {message.role === "user" && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary">
              U
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";

export default function Chat({ initialMessages }: Props) {
  const { auth } = usePage<PageProps>().props;
  const user = auth.user;
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { flash } = usePage<{ flash?: FlashData }>().props;

  // Inertia.js form with debounced input
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
          databaseResults: data.databaseResults || null,
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

  // Debounced form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
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
    },
    [data.message, processing, post, reset, errors.message]
  );

  // Enter key handling
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
      }
    },
    [handleSubmit]
  );

  // Debounced input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setData("message", e.target.value);
    },
    [setData]
  );

  return (
    <AuthenticatedLayout user={user} header="Chat with AI & Database">
      <Head title="Chat with AI & Database" />
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl flex flex-col h-[80vh] bg-background border-muted shadow-xl rounded-2xl">
          <ScrollArea className="flex-1 p-6" aria-label="Chat messages">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Ask about jobs or start a conversation with the AI! Try: "How many jobs in Kecamatan Naringgul in 2025?"
              </div>
            )}
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}
            {processing && (
              <div className="flex justify-start mb-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <Card className="p-4 bg-background border border-muted rounded-2xl">
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
            className="p-4 border-t border-muted bg-background"
            aria-label="Message input form"
          >
            <div className="relative flex items-center gap-3">
              <Input
                value={data.message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about jobs or chat with the AI..."
                className="flex-1 rounded-full bg-muted/50 border-muted focus:ring-2 focus:ring-primary py-6 text-sm"
                aria-label="Message input"
                disabled={processing}
                ref={inputRef}
                autoFocus
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
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            {errors.message && (
              <p className="text-destructive text-xs mt-2">{errors.message}</p>
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
        .max-w-2xl {
          max-width: 672px;
        }
      `}</style>
    </AuthenticatedLayout>
  );
}