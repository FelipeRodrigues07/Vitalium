"use client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { chatApi, type Conversation } from "@/services/api/chat";
import {
  patientDoctorApi,
  type PatientSummary,
} from "@/services/api/patient-doctors/patientsByDoctor";
import type { UserRole } from "@/types/auth";

interface ChatSidebarProps {
  searchQuery: string;
  selectedChat: string | null;
  onSelectChat: (chatId: string, conversation: Conversation) => void;
  userId: string;
  userRole: UserRole;
}

export function ChatSidebar({
  searchQuery = "",
  selectedChat,
  onSelectChat,
  userId,
  userRole,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorEntityId, setDoctorEntityId] = useState<string | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        let data: Conversation[];
        if (userRole === "DOCTOR") {
          data = await chatApi.listByDoctor(userId);
          // Capture doctorId from first conversation if available
          if (data.length > 0) setDoctorEntityId(data[0].doctorId);
        } else if (userRole === "PATIENT") {
          data = await chatApi.listByPatient(userId);
        } else {
          data = [];
        }
        setConversations(data);
      } catch {
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, userRole]);

  const filteredConversations = conversations.filter((conv) =>
    conv.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const openNewChat = async () => {
    setNewChatOpen(true);
    setLoadingPatients(true);
    try {
      const data = await patientDoctorApi.listPatientsByUserDoctor(userId);
      setPatients(data);
      // Capture doctorId from first link if not yet known
      if (!doctorEntityId && data.length > 0) {
        setDoctorEntityId(data[0].doctorId);
      }
    } catch {
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleStartConversation = async (patientId: string) => {
    if (!doctorEntityId) return;
    setCreating(true);
    try {
      const conversation = await chatApi.createConversation({
        patientId,
        doctorId: doctorEntityId,
        channel: "WEB",
      });
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === conversation.id);
        return exists ? prev : [conversation, ...prev];
      });
      setNewChatOpen(false);
      onSelectChat(conversation.id, conversation);
    } catch {
      // silently fail — conversation may already exist
    } finally {
      setCreating(false);
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const ConversationItem = ({
    conversation,
  }: {
    conversation: Conversation;
  }) => {
    const isDoctor = userRole === "DOCTOR";
    const otherId = isDoctor ? conversation.patientId : conversation.doctorId;
    const initials = otherId.slice(0, 2).toUpperCase();
    const otherLabel = isDoctor ? "Paciente" : "Médico";

    return (
      <div
        className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
          selectedChat === conversation.id
            ? "bg-primary/10 border-r-2 border-primary"
            : ""
        }`}
        onClick={() => onSelectChat(conversation.id, conversation)}
      >
        <div className="flex items-start space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground truncate text-sm">
                {otherLabel}
              </h3>
              <span className="text-xs text-muted-foreground">
                {formatTime(conversation.updatedAt)}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mb-1 truncate">
              {otherId}
            </p>

            <div className="flex items-center justify-between">
              <Badge
                variant={
                  conversation.status === "ACTIVE" ? "default" : "secondary"
                }
                className="text-xs"
              >
                {conversation.status}
              </Badge>
              {(conversation.unreadCount ?? 0) > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground min-w-[20px] h-5 text-xs flex items-center justify-center">
                  {conversation.unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Conversas</h2>
          {userRole === "DOCTOR" && (
            <Button size="sm" variant="outline" onClick={openNewChat}>
              <Plus className="w-4 h-4 mr-2" />
              Nova
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Carregando...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Nenhuma conversa encontrada
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog: nova conversa */}
      <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova conversa</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-1 max-h-80 overflow-y-auto">
            {loadingPatients ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Carregando pacientes...
              </p>
            ) : patients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum paciente vinculado
              </p>
            ) : (
              patients.map((link) => {
                const name = link.patient
                  ? `${link.patient.firstName} ${link.patient.lastName}`
                  : link.patientId;
                const initials = name.slice(0, 2).toUpperCase();
                const alreadyExists = conversations.some(
                  (c) => c.patientId === link.patientId,
                );
                return (
                  <button
                    key={link.patientId}
                    disabled={creating || alreadyExists}
                    onClick={() => handleStartConversation(link.patientId)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{name}</p>
                      {link.patient && (
                        <p className="text-xs text-muted-foreground truncate">
                          {link.patient.email}
                        </p>
                      )}
                    </div>
                    {alreadyExists && (
                      <Badge
                        variant="secondary"
                        className="text-xs flex-shrink-0"
                      >
                        Existente
                      </Badge>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
