"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { ChatHeader } from "@/components/chat/chat-header";
import { AppLayout } from "@/components/app-layout";
import { useChatContactNames } from "@/hooks/use-chat-contact-names";
import { useSession } from "@/services/auth/use-session";
import type { Conversation } from "@/services/api/chat";

export default function ChatPage() {
  const { user, isReady } = useSession();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const { getOtherParty, isDoctor } = useChatContactNames(
    user?.id ?? "",
    user?.role ?? "PATIENT",
  );

  const handleSelectChat = (chatId: string, conversation: Conversation) => {
    setSelectedChatId(chatId);
    setSelectedConversation(conversation);
  };

  if (!isReady || !user) {
    return (
      <AppLayout userRole="doctor" showSidebar>
        <div className="h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </AppLayout>
    );
  }

  const currentUser = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role.toLowerCase(),
  };

  const otherParty = selectedConversation
    ? getOtherParty(selectedConversation)
    : undefined;

  return (
    <AppLayout userRole={currentUser.role} showSidebar={true}>
      <div className="h-screen bg-background flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          <div className="h-full w-80 border-r border-border flex-shrink-0">
            <ChatSidebar
              searchQuery=""
              selectedChat={selectedChatId}
              onSelectChat={handleSelectChat}
              userId={user.id}
              userRole={user.role}
              getOtherParty={getOtherParty}
              isDoctor={isDoctor}
            />
          </div>

          <div className="flex-1 flex flex-col">
            {selectedChatId && selectedConversation ? (
              <>
                <ChatHeader
                  conversation={selectedConversation}
                  currentUser={currentUser}
                  otherPartyName={otherParty?.name}
                  otherPartyEmail={otherParty?.email}
                />
                <ChatWindow chatId={selectedChatId} currentUser={currentUser} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Selecione uma conversa
                  </h3>
                  <p className="text-muted-foreground">
                    Escolha uma conversa para começar a trocar mensagens
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
