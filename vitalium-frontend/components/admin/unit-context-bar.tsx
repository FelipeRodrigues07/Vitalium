'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ChevronDown } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { isUnitScopedAdmin } from '@/lib/admin-auth';
import { GetAdminUnitsService } from '@/services/api/units/GetAdminUnits';
import type { AdminUnitSummary } from '@/types/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UnitContextBar() {
  const router = useRouter();
  const { user, activeUnitId, selectActiveUnit } = useAuth();
  const [units, setUnits] = useState<AdminUnitSummary[]>([]);

  useEffect(() => {
    if (!isUnitScopedAdmin(user)) {
      return;
    }

    GetAdminUnitsService.getUnits()
      .then(setUnits)
      .catch((error) => console.error('Falha ao carregar unidades:', error));
  }, [user]);

  if (!isUnitScopedAdmin(user) || !activeUnitId) {
    return null;
  }

  const activeUnit = units.find((unit) => unit.id === activeUnitId);
  const hasMultipleUnits = (user?.unitIds?.length ?? 0) > 1;

  const handleSelect = (unitId: string) => {
    selectActiveUnit(unitId);
    router.refresh();
  };

  if (!hasMultipleUnits) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span className="font-medium text-foreground">
          {activeUnit?.name ?? 'Unidade ativa'}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 max-w-[220px]">
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{activeUnit?.name ?? 'Selecionar unidade'}</span>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {units.map((unit) => (
          <DropdownMenuItem
            key={unit.id}
            onClick={() => handleSelect(unit.id)}
            className={unit.id === activeUnitId ? 'font-semibold' : ''}
          >
            {unit.name}
            {unit.city ? ` — ${unit.city}` : ''}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={() => router.push('/work/select-unit')}>
          Trocar unidade...
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
