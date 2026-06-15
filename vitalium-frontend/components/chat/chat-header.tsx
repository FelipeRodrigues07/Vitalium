"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  Calendar,
  FileText,
  MoreVertical,
  Phone,
  User,
  Video,
} from "lucide-react";
import type { Conversation } from "@/services/api/chat";

interface ChatHeaderProps {
  conversation: Conversation;
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
}

export function ChatHeader({ conversation, currentUser }: ChatHeaderProps) {
  const isDoctor = currentUser.role.toUpperCase() === "DOCTOR";
  const otherId = isDoctor ? conversation.patientId : conversation.doctorId;
  const otherLabel = isDoctor ? "Paciente" : "Médico";
  const initials = otherId.slice(0, 2).toUpperCase();

  const statusColor =
    conversation.status === "ACTIVE" ? "bg-green-500" : "bg-gray-400";

  return (
    <div className="border-b border-border bg-card/50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${statusColor}`}
          />
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-foreground">
              {otherLabel}
            </h2>
            <Badge
              variant={
                conversation.status === "ACTIVE" ? "default" : "secondary"
              }
              className="text-xs"
            >
              {conversation.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {conversation.channel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate max-w-xs">
            ID: {otherId}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm">
          <Phone className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Video className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Ver Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="w-4 h-4 mr-2" />
              Histórico Médico
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Consulta
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Marcar como Urgente
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
