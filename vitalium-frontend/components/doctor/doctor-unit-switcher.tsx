'use client';

import { Building2, ChevronDown } from 'lucide-react';
import { useDoctorActiveUnit } from '@/components/doctor/doctor-unit-provider';
import { useAuth } from '@/providers/auth-provider';
import { normalizeRole } from '@/lib/auth-routes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DoctorUnitSwitcher() {
  const { user } = useAuth();
  const { units, activeUnit, activeUnitId, selectUnit, isLoading } =
    useDoctorActiveUnit();

  if (normalizeRole(user?.role) !== 'doctor') {
    return null;
  }

  if (isLoading && units.length === 0) {
    return null;
  }

  if (units.length === 0) {
    return null;
  }

  if (units.length === 1) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span className="font-medium text-foreground">
          {activeUnit?.name ?? units[0].name}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 max-w-[220px]">
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {activeUnit?.name ?? 'Selecionar unidade'}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {units.map((unit) => (
          <DropdownMenuItem
            key={unit.id}
            onClick={() => selectUnit(unit.id)}
            className={unit.id === activeUnitId ? 'font-semibold' : ''}
          >
            {unit.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
