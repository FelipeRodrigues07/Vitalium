"use client";

import { useEffect, useState } from "react";
import type { Conversation } from "@/services/api/chat";
import {
  getLinkedPerson,
  getLinkedPersonDisplayName,
  patientDoctorApi,
} from "@/services/api/patient-doctors/patientsByDoctor";
import { normalizeRole } from "@/lib/auth-routes";
import type { UserRole } from "@/types/auth";

export interface ChatContactInfo {
  name: string;
  email?: string;
}

export function useChatContactNames(userId: string, userRole: UserRole) {
  const [namesByEntityId, setNamesByEntityId] = useState<
    Record<string, ChatContactInfo>
  >({});
  const [loading, setLoading] = useState(true);

  const isDoctor = normalizeRole(userRole) === "doctor";
  const isPatient = normalizeRole(userRole) === "patient";

  useEffect(() => {
    if (!userId) {
      setNamesByEntityId({});
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        if (isDoctor) {
          const data = await patientDoctorApi.listPatientsByUserDoctor(userId);
          if (cancelled) return;

          setNamesByEntityId(
            Object.fromEntries(
              data.map((link) => {
                const person = getLinkedPerson(link.patient);
                return [
                  link.patientId,
                  {
                    name: getLinkedPersonDisplayName(link.patient, "Paciente"),
                    email: person?.email,
                  },
                ];
              }),
            ),
          );
        } else if (isPatient) {
          const data = await patientDoctorApi.listDoctorsByUserPatient(userId);
          if (cancelled) return;

          setNamesByEntityId(
            Object.fromEntries(
              data.map((link) => {
                const person = getLinkedPerson(link.doctor);
                return [
                  link.doctorId,
                  {
                    name: getLinkedPersonDisplayName(link.doctor, "Médico"),
                    email: person?.email,
                  },
                ];
              }),
            ),
          );
        } else {
          setNamesByEntityId({});
        }
      } catch (error) {
        console.error("Erro ao carregar contatos do chat:", error);
        if (!cancelled) setNamesByEntityId({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [userId, userRole, isDoctor, isPatient]);

  const getOtherParty = (conversation: Conversation): ChatContactInfo => {
    const entityId = isDoctor ? conversation.patientId : conversation.doctorId;
    const fallback = isDoctor ? "Paciente" : "Médico";

    return namesByEntityId[entityId] ?? { name: fallback };
  };

  return {
    namesByEntityId,
    getOtherParty,
    isDoctor,
    isPatient,
    loading,
  };
}
