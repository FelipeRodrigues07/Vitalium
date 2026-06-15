"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Calendar,
  Camera,
  Check,
  CheckCheck,
  FileText,
  ImageIcon,
  Mic,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
} from "lucide-react";
import { chatApi, type Message, type MessageOrigin } from "@/services/api/chat";

interface ChatWindowProps {
  chatId: string;
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
}

export function ChatWindow({ chatId, currentUser }: ChatWindowProps) {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      const result = await chatApi.getMessages(chatId);
      setMessages(result.messages);
    } catch {
      // silently fail on polling errors
    }
  }, [chatId]);

  useEffect(() => {
    setMessages([]);
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getOrigin = (): MessageOrigin => {
    const r = currentUser.role.toUpperCase();
    if (r === "DOCTOR") return "DOCTOR";
    if (r === "PATIENT") return "PATIENT";
    return "SYSTEM";
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;
    setSending(true);
    try {
      const sent = await chatApi.sendMessage(chatId, {
        content: messageText.trim(),
        origin: getOrigin(),
        channel: "WEB",
        senderId: currentUser.id,
      });
      setMessages((prev) => [...prev, sent]);
      setMessageText("");
    } catch {
      // could show a toast here
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case "SENT":
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case "DELIVERED":
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case "READ":
        return <CheckCheck className="w-3 h-3 text-primary" />;
      default:
        return null;
    }
  };

  const isCurrentUserOrigin = (msg: Message) => {
    const r = currentUser.role.toUpperCase();
    if (r === "DOCTOR") return msg.origin === "DOCTOR";
    if (r === "PATIENT") return msg.origin === "PATIENT";
    return msg.senderId === currentUser.id;
  };

  const MessageBubble = ({ msg }: { msg: Message }) => {
    const isMe = isCurrentUserOrigin(msg);

    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4`}>
        <div
          className={`flex items-end space-x-2 max-w-[70%] ${isMe ? "flex-row-reverse space-x-reverse" : ""}`}
        >
          {!isMe && (
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {msg.origin.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}

          <div
            className={`rounded-lg px-4 py-2 ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            <p className="text-sm">{msg.content}</p>
            <div
              className={`flex items-center justify-end space-x-1 mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}
            >
              <span className="text-xs">{formatTime(msg.timestamp)}</span>
              {isMe && getMessageStatusIcon(msg.status)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm pt-8">
            Nenhuma mensagem ainda. Diga olá!
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-end space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Paperclip className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" />
                Documento
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ImageIcon className="w-4 h-4 mr-2" />
                Imagem
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Camera className="w-4 h-4 mr-2" />
                Câmera
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Consulta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex-1 relative">
            <Input
              placeholder="Digite sua mensagem..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-20"
              disabled={sending}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button variant="ghost" size="sm">
                <Smile className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-red-600">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Marcar como Urgente
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Consulta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 mt-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Agendar Consulta
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Solicitar Exames
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Urgente
          </Button>
        </div>
      </div>
    </div>
  );
}
