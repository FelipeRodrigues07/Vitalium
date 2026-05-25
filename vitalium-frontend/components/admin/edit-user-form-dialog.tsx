'use client';

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axios from 'axios';
import { UpdateUserService, type UpdateUserPayload } from '@/services/api/users/UpdateUser';
import {
  mapRoleToApi,
  roleLabels,
  type DashboardUserRole,
  type DashboardUserStatus,
} from '@/lib/users-mapper';

export interface EditableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: DashboardUserRole;
  status: DashboardUserStatus;
}

interface EditUserFormProps {
  user: EditableUser;
  onClose: () => void;
  onUserUpdated?: () => void | Promise<void>;
}

export function EditUserForm({ user, onClose, onUserUpdated }: EditUserFormProps) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone === '-' ? '' : user.phone);
  const [status, setStatus] = useState<DashboardUserStatus>(user.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPhone(user.phone === '-' ? '' : user.phone);
    setStatus(user.status);
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: UpdateUserPayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        isActive: status === 'active',
        role: mapRoleToApi(user.role),
      };

      await UpdateUserService.updateUser(user.id, payload);

      if (onUserUpdated) {
        await onUserUpdated();
      }

      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setErrorMessage(
          Array.isArray(message) ? message.join(', ') : (message ?? 'Não foi possível atualizar o usuário.'),
        );
      } else {
        setErrorMessage('Não foi possível atualizar o usuário.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Editar usuário</DialogTitle>
        <DialogDescription>
          Atualize os dados de {user.firstName} {user.lastName}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-firstName">Nome</Label>
            <Input
              id="edit-firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-lastName">Sobrenome</Label>
            <Input
              id="edit-lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="edit-email">Email</Label>
          <Input
            id="edit-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="edit-phone">Telefone</Label>
          <Input
            id="edit-phone"
            placeholder="62999999999 (11 dígitos)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={13}
          />
        </div>

        <div>
          <Label>Tipo de usuário</Label>
          <Input value={roleLabels[user.role]} disabled className="bg-muted" />
        </div>

        <div>
          <Label htmlFor="edit-status">Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as DashboardUserStatus)}>
            <SelectTrigger id="edit-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        <div className="flex space-x-2 pt-2">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

