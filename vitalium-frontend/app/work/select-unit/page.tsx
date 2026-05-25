'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import axios from 'axios';
import { GetAdminUnitsService } from '@/services/api/units/GetAdminUnits';
import { buildFallbackUnitsFromProfile } from '@/lib/admin-units-fallback';
import { getPostLoginPath } from '@/lib/auth-routes';
import { isUnitScopedAdmin, needsUnitSelection } from '@/lib/admin-auth';
import type { AdminUnitSummary } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SelectUnitPage() {
  const router = useRouter();
  const { user, isLoadingUser, selectActiveUnit, activeUnitId, logout } = useAuth();
  const [units, setUnits] = useState<AdminUnitSummary[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isLoadingUser) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    if (!isUnitScopedAdmin(user)) {
      router.replace(getPostLoginPath(user, activeUnitId));
      return;
    }

    if (!needsUnitSelection(user, activeUnitId)) {
      router.replace('/work/admin/dashboard');
      return;
    }

    setIsLoadingUnits(true);
    GetAdminUnitsService.getUnits()
      .then((data) => {
        const allowed = data.filter((unit) => user.unitIds?.includes(unit.id));
        setUnits(allowed.length > 0 ? allowed : data);
        if (allowed.length === 0 && data.length === 0) {
          setErrorMessage('Nenhuma unidade disponível para este administrador.');
        }
      })
      .catch((error) => {
        const fallback = buildFallbackUnitsFromProfile(user);
        if (fallback.length > 0) {
          setUnits(fallback);
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            setErrorMessage(null);
          }
          return;
        }
        setErrorMessage(
          'Não foi possível carregar as unidades. Reinicie o backend e faça login novamente.',
        );
      })
      .finally(() => setIsLoadingUnits(false));
  }, [user, isLoadingUser, activeUnitId, router]);

  const handleSelect = (unitId: string) => {
    selectActiveUnit(unitId);
    router.replace('/work/admin/dashboard');
  };

  if (isLoadingUser || isLoadingUnits) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando unidades...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Selecione a unidade</CardTitle>
          <CardDescription>
            Olá, {user?.firstName}. Escolha em qual unidade deseja trabalhar nesta sessão.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

          {units.map((unit) => (
            <Button
              key={unit.id}
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => handleSelect(unit.id)}
            >
              <Building2 className="h-5 w-5 mr-3 shrink-0" />
              <div className="text-left">
                <p className="font-semibold">{unit.name}</p>
                <p className="text-xs text-muted-foreground">
                  {unit.type}
                  {unit.city ? ` · ${unit.city}${unit.state ? `/${unit.state}` : ''}` : ''}
                </p>
              </div>
            </Button>
          ))}

          <Button variant="ghost" className="w-full" onClick={() => void logout()}>
            Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
