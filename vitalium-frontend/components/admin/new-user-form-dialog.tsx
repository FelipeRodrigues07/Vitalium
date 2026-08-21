import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import { CreateUserService, CreateUserPayload } from '@/services/api/users/CreateUser';
import { CreateDoctorService, CreateDoctorPayload } from '@/services/api/doctors/CreateDoctor';
import { CreateDoctorUnitService } from '@/services/api/doctor-units/CreateDoctorUnit';
import { CreatePatientService } from '@/services/api/patients/CreatePatient';
import { CreateSecretaryService, CreateSecretaryUnitService } from '@/services/api/secretaries';
import { GetSpecializationsService } from '@/services/api/specializations/GetSpecializations';
import { CreateDoctorSpecializationService } from '@/services/api/doctor-specializations/CreateDoctorSpecialization';
import { useSession } from '@/services/auth/use-session';

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits;
  }
  if (digits.length === 13 && digits.startsWith('55')) {
    return digits.slice(2);
  }
  return digits;
}


interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  role: 'DOCTOR' | 'PATIENT' | 'NURSE' | 'CAREGIVER' | 'ADMIN' | 'SECRETARY' | '';
  cpf: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  specializationId: string;
  crm: string;
  consultationPrice: number;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  role: '',
  specializationId: '',
  crm: '',
  consultationPrice: 0,
  cpf: '',
  birthDate: '',
  gender: 'MALE',
};

interface NewUserFormProps {
  onClose: () => void;
  onUserCreated?: () => void | Promise<void>;
}


export function NewUserForm({ onClose, onUserCreated }: NewUserFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specializations, setSpecializations] = useState<
    { id: string; name: string }[]
  >([]);
  const { activeUnitId } = useSession();

  const isDoctor = formData.role === 'DOCTOR';
  const isPatient = formData.role === 'PATIENT';
  const isSecretary = formData.role === 'SECRETARY';
  const linkUnitId = activeUnitId ?? undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;

    setFormData(prev => ({ ...prev, [id]: newValue }));
  };

  useEffect(() => {
    if (!isDoctor) {
      return;
    }

    GetSpecializationsService.getSpecializations()
      .then((items) => {
        setSpecializations(
          items
            .filter((item) => item.isActive)
            .map((item) => ({
              id: item.id,
              name: item.name,
            })),
        );
      })
      .catch((error) => console.error('Falha ao carregar especialidades:', error));
  }, [isDoctor]);

  const handleRoleChange = (value: string) => {
    const validRoles = ['DOCTOR', 'PATIENT', 'NURSE', 'CAREGIVER', 'ADMIN', 'SECRETARY', ''];
    const newRole = validRoles.includes(value as FormData['role']) ? value as FormData['role'] : '';

    setFormData(prev => ({ ...prev, role: newRole }));
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const phone = normalizePhone(formData.phone);
      if (phone.length !== 11) {
        alert('Telefone deve ter 11 dígitos (ex.: 62999999999).');
        return;
      }

      if (isDoctor) {
        if (!formData.crm.trim()) {
          alert('Informe o CRM.');
          return;
        }
        if (linkUnitId && formData.consultationPrice <= 0) {
          alert('Informe o preço da consulta (maior que zero) para vincular à unidade.');
          return;
        }
      }

      if (isPatient) {
        const cpfDigits = formData.cpf.replace(/\D/g, '');
        if (cpfDigits.length !== 11) {
          alert('CPF deve conter exatamente 11 dígitos.');
          return;
        }
        if (!formData.birthDate) {
          alert('Informe a data de nascimento.');
          return;
        }
      }

      const userPayload: CreateUserPayload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone,
        role: formData.role as CreateUserPayload['role'],
        password: formData.password,
        isActive: true,
      };

      const createdUser = await CreateUserService.createUser(userPayload);

      if (isDoctor) {
        const doctor = await CreateDoctorService.createDoctor({
          userId: createdUser.id,
          crm: formData.crm.trim(),
          crmState: true,
          isActive: true,
        } satisfies CreateDoctorPayload);

        if (formData.specializationId) {
          await CreateDoctorSpecializationService.create({
            doctorId: doctor.id,
            specializationId: formData.specializationId,
          });
        }

        if (linkUnitId) {
          await CreateDoctorUnitService.createDoctorUnit({
            doctorId: doctor.id,
            unitId: linkUnitId,
            consultationPrice: formData.consultationPrice,
            isPrimary: true,
            isActive: true,
          });
        }

        alert(
          linkUnitId
            ? `Médico ${createdUser.firstName} criado e vinculado à unidade ativa.`
            : `Médico ${createdUser.firstName} criado. Vincule-o a uma unidade para aparecer na listagem.`,
        );
      } else if (isPatient) {
        const cpfDigits = formData.cpf.replace(/\D/g, '');

        await CreatePatientService.createPatient({
          userId: createdUser.id,
          cpf: cpfDigits,
          birthDate: formData.birthDate,
          gender: formData.gender,
          unitId: linkUnitId,
          isPrimary: true,
        });
        alert(
          linkUnitId
            ? `Paciente ${createdUser.firstName} criado e vinculado à unidade ativa.`
            : `Paciente ${createdUser.firstName} criado. Vincule-o a uma unidade para aparecer na listagem.`,
        );
      } else if (isSecretary) {
        const secretary = await CreateSecretaryService.createSecretary({
          userId: createdUser.id,
          isActive: true,
        });

        if (linkUnitId) {
          await CreateSecretaryUnitService.createSecretaryUnit({
            secretaryId: secretary.id,
            unitId: linkUnitId,
            isPrimary: true,
          });
        }

        alert(
          linkUnitId
            ? `Secretaria ${createdUser.firstName} criada e vinculada à unidade ativa.`
            : `Secretaria ${createdUser.firstName} criada. Vincule-a a uma unidade para acessar a agenda.`,
        );
      } else {
        alert(`Usuário ${createdUser.firstName} (${createdUser.role}) criado com sucesso!`);
      }
      if (onUserCreated) {
        await onUserCreated();
      }
      setFormData(initialFormData);
      onClose();

    } catch (error) {
      alert('Ocorreu um erro ao criar o usuário. Verifique o console.');
      console.error('Erro de criação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Adicionar Novo Usuário</DialogTitle>
        <DialogDescription>
          {linkUnitId
            ? 'O perfil será vinculado à unidade selecionada no topo da tela.'
            : 'Crie uma nova conta. Médicos e pacientes precisam de vínculo com unidade para aparecer na lista.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleCreateUser}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome</Label>
              <Input id="firstName" placeholder="Digite o primeiro nome" value={formData.firstName} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input id="lastName" placeholder="Digite o sobrenome" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite a senha"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="62999999999 (11 dígitos)"
                value={formData.phone}
                onChange={handleChange}
                required
                minLength={11}
                maxLength={13}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@exemplo.com" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Tipo de usuário</Label>
            <Select onValueChange={handleRoleChange} value={formData.role} required>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DOCTOR">Médico</SelectItem>
                <SelectItem value="PATIENT">Paciente</SelectItem>
                <SelectItem value="SECRETARY">Secretaria</SelectItem>
                <SelectItem value="NURSE">Enfermeira</SelectItem>
                <SelectItem value="CAREGIVER">Cuidador</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isPatient && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-semibold">Dados do paciente</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="Somente 11 dígitos"
                    value={formData.cpf}
                    onChange={handleChange}
                    required={isPatient}
                    minLength={11}
                    maxLength={14}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required={isPatient}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gênero</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      gender: value as FormData['gender'],
                    }))
                  }
                >
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Masculino</SelectItem>
                    <SelectItem value="FEMALE">Feminino</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {isDoctor && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-semibold">Informações do Médico</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crm">CRM</Label>
                  <Input id="crm" placeholder="Ex: 123456" value={formData.crm} onChange={handleChange} required={isDoctor} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultationPrice">Preço da Consulta (R$)</Label>
                  <Input
                    id="consultationPrice"
                    type="number"
                    min={1}
                    step="0.01"
                    placeholder="Ex: 150"
                    value={formData.consultationPrice || ''}
                    onChange={handleChange}
                    required={isDoctor && !!linkUnitId}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specializationId">Especialidade</Label>
                  <Select
                    value={formData.specializationId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, specializationId: value }))
                    }
                  >
                    <SelectTrigger id="specializationId">
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec.id} value={spec.id}>
                          {spec.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {linkUnitId && (
                <p className="text-xs text-muted-foreground">
                  Preço da consulta é salvo no vínculo com a unidade ativa.
                </p>
              )}
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button className="flex-1" type="submit" disabled={isSubmitting || !formData.role}>
              {isSubmitting ? 'Criando...' : 'Criar Usuário'}
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" type="button" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </DialogContent>
  );
}
