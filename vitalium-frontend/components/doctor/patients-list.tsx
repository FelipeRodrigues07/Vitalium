'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, MessageCircle, FileText, Pill, Activity } from 'lucide-react';
import {
  GetPatientsService,
  type PatientListItemModel,
} from '@/services/api/patients/GetPatients';
import { useSession } from '@/services/auth/use-session';

interface PatientsListProps {
  searchQuery: string;
  onSelectPatient: (patientId: string) => void;
}

function getPatientName(patient: PatientListItemModel): string {
  if (patient.user) {
    return `${patient.user.firstName} ${patient.user.lastName}`.trim();
  }
  return `Paciente ${patient.cpf.slice(-4)}`;
}

function getAge(birthDate: string): number | null {
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }
  return age;
}

export function PatientsList({
  searchQuery = '',
  onSelectPatient,
}: PatientsListProps) {
  const { isReady, accessToken, user } = useSession();
  const [patients, setPatients] = useState<PatientListItemModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('name');

  const fetchPatients = useCallback(async () => {
    if (!accessToken || user?.role !== 'DOCTOR') {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      const list = await GetPatientsService.getMyPatients();
      setPatients(list);
    } catch (error) {
      console.error('Falha ao carregar pacientes do médico:', error);
      setLoadError('Não foi possível carregar seus pacientes.');
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, user?.role]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    void fetchPatients();
  }, [fetchPatients, isReady]);

  const filteredPatients = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const filtered = patients.filter((patient) => {
      const name = getPatientName(patient).toLowerCase();
      const email = patient.user?.email?.toLowerCase() ?? '';
      return name.includes(query) || email.includes(query);
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return getPatientName(a).localeCompare(getPatientName(b), 'pt-BR');
      }
      return 0;
    });
  }, [patients, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Carregando pacientes...</p>
    );
  }

  if (loadError) {
    return <p className="text-sm text-red-600">{loadError}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nome</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {filteredPatients.length} paciente(s) vinculado(s)
        </p>
      </div>

      <div className="grid gap-6">
        {filteredPatients.map((patient) => {
          const name = getPatientName(patient);
          const age = getAge(patient.birthDate);

          return (
            <Card
              key={patient.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {age != null ? `${age} anos` : 'Idade não informada'}
                        {patient.user?.email
                          ? ` • ${patient.user.email}`
                          : ''}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Vinculado
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    CPF: {patient.cpf}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectPatient(patient.id)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/work/doctor/medical-records?patientId=${patient.id}`}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Prontuário
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/work/doctor/prescriptions?patientId=${patient.id}`}
                      >
                        <Pill className="w-4 h-4 mr-2" />
                        Receitas
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/work/doctor/symptoms?patientId=${patient.id}`}
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        Sintomas
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum paciente vinculado
            </h3>
            <p className="text-muted-foreground">
              Peça ao administrador da unidade para vincular pacientes a você em
              Usuários → Médico responsável.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
