import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import { CreateUserService, CreateUserPayload } from '@/services/api/users/CreateUser';
import { CreateDoctorService, CreateDoctorPayload } from '@/services/api/doctors/CreateDoctor';


interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  role: 'DOCTOR' | 'PATIENT' | 'NURSE' | 'CAREGIVER' | 'ADMIN' | '';
  specialty: string;
  crm: string;
  consultationPrice: number;
  bio: string;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  role: '',
  specialty: '',
  crm: '',
  consultationPrice: 0,
  bio: '',
};

interface NewUserFormProps {
  onClose: () => void;
  onUserCreated?: () => void | Promise<void>;
}


export function NewUserForm({ onClose, onUserCreated }: NewUserFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDoctor = formData.role === 'DOCTOR';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;

    setFormData(prev => ({ ...prev, [id]: newValue }));
  };

  const handleRoleChange = (value: string) => {
    const validRoles = ['DOCTOR', 'PATIENT', 'NURSE', 'CAREGIVER', 'ADMIN', ''];
    const newRole = validRoles.includes(value as FormData['role']) ? value as FormData['role'] : '';

    setFormData(prev => ({ ...prev, role: newRole }));
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userPayload: CreateUserPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role as CreateUserPayload['role'],
        password: formData.password,
        isActive: true,
      };

      const createdUser = await CreateUserService.createUser(userPayload);
      if (isDoctor) {
        const doctorPayload: CreateDoctorPayload = {
          userId: createdUser.id,
          crm: formData.crm,
          crmState: true,
          isActive: true,
        };

        await CreateDoctorService.createDoctor(doctorPayload);
        alert(`Médico ${createdUser.firstName} criado com sucesso!`);
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
        <DialogDescription>Crie uma nova conta de usuário na plataforma</DialogDescription>
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
                <SelectItem value="NURSE">Enfermeira</SelectItem>
                <SelectItem value="CAREGIVER">Cuidador</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                    placeholder="Ex: 150"
                    value={formData.consultationPrice}
                    onChange={handleChange}
                    required={isDoctor}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input id="specialty" placeholder="Ex: Cardiologia" value={formData.specialty} onChange={handleChange} required={isDoctor} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Descreva sua experiência, qualificações e áreas de foco."
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  required={isDoctor}
                />
              </div>
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
