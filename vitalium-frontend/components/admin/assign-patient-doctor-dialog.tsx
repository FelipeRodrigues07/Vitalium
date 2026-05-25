'use client';

import { useEffect, useState } from 'react';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GetPatientByUserService } from '@/services/api/patients/GetPatientByUser';
import { GetDoctorsService } from '@/services/api/doctors/GetDoctors';
import { CreatePatientDoctorService } from '@/services/api/patient-doctors/CreatePatientDoctor';
import { useSession } from '@/services/auth/use-session';

export interface AssignPatientDoctorTarget {
  userId: string;
  name: string;
  email: string;
}

interface AssignPatientDoctorDialogProps {
  patient: AssignPatientDoctorTarget;
  onClose: () => void;
  onAssigned?: () => void | Promise<void>;
}

function getActiveDoctorName(
  links: {
    endDate?: string | null;
    doctor?: { user?: { firstName: string; lastName: string } };
  }[],
): string | null {
  const active = links.find((link) => !link.endDate);
  if (!active?.doctor?.user) {
    return null;
  }
  return `${active.doctor.user.firstName} ${active.doctor.user.lastName}`.trim();
}

export function AssignPatientDoctorDialog({
  patient,
  onClose,
  onAssigned,
}: AssignPatientDoctorDialogProps) {
  const { activeUnitId } = useSession();
  const [patientProfileId, setPatientProfileId] = useState<string | null>(null);
  const [currentDoctorName, setCurrentDoctorName] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<
    { id: string; name: string; crm: string }[]
  >([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const profile = await GetPatientByUserService.getByUserId(patient.userId);
        if (cancelled) {
          return;
        }

        setPatientProfileId(profile.id);
        setCurrentDoctorName(
          getActiveDoctorName(profile.patientDoctors ?? []),
        );

        const doctorList = await GetDoctorsService.getDoctors(
          activeUnitId ?? undefined,
        );
        if (cancelled) {
          return;
        }

        setDoctors(
          doctorList.map((doctor) => ({
            id: doctor.id,
            name: doctor.user
              ? `${doctor.user.firstName} ${doctor.user.lastName}`.trim()
              : `Médico ${doctor.crm}`,
            crm: doctor.crm,
          })),
        );
      } catch (loadError) {
        console.error('Falha ao carregar dados do paciente:', loadError);
        if (!cancelled) {
          setError(
            'Não foi possível carregar o paciente. Verifique se o perfil de paciente foi criado.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [patient.userId, activeUnitId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!patientProfileId || !selectedDoctorId) {
      return;
    }

    if (!activeUnitId) {
      alert('Selecione a unidade ativa no topo da tela antes de vincular o médico.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await CreatePatientDoctorService.assign({
        patientId: patientProfileId,
        doctorId: selectedDoctorId,
        unitId: activeUnitId,
      });
      await onAssigned?.();
      onClose();
    } catch (submitError) {
      console.error('Falha ao vincular médico:', submitError);
      setError('Não foi possível vincular o médico. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Médico responsável</DialogTitle>
        <DialogDescription>
          Vincule um médico da unidade ativa ao paciente {patient.name}.
        </DialogDescription>
      </DialogHeader>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="rounded-md border p-3 text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">Paciente:</span>{' '}
              {patient.name}
            </p>
            <p>
              <span className="text-muted-foreground">E-mail:</span>{' '}
              {patient.email}
            </p>
            <p>
              <span className="text-muted-foreground">Médico atual:</span>{' '}
              {currentDoctorName ?? 'Nenhum'}
            </p>
          </div>

          {doctors.length === 0 ? (
            <p className="text-sm text-amber-700">
              Nenhum médico vinculado a esta unidade. Cadastre ou credencie um médico
              na unidade primeiro.
            </p>
          ) : (
            <div className="space-y-2">
              <Label>Médico responsável</Label>
              <Select
                value={selectedDoctorId}
                onValueChange={setSelectedDoctorId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o médico" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} — CRM {doctor.crm}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedDoctorId || !patientProfileId}
            >
              {isSubmitting ? 'Salvando...' : 'Vincular médico'}
            </Button>
          </div>
        </form>
      )}
    </DialogContent>
  );
}
