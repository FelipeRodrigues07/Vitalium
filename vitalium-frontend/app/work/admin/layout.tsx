'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { getPostLoginPath } from '@/lib/auth-routes';
import {
  isSuperAdmin,
  isUnitScopedAdmin,
  needsUnitSelection,
} from '@/lib/admin-auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoadingUser, activeUnitId } = useAuth();

  useEffect(() => {
    if (isLoadingUser || !user) {
      return;
    }

    if (pathname === '/work/admin/platform' && isSuperAdmin(user)) {
      return;
    }

    if (isSuperAdmin(user)) {
      router.replace('/work/admin/platform');
      return;
    }

    if (isUnitScopedAdmin(user) && needsUnitSelection(user, activeUnitId)) {
      router.replace('/work/select-unit');
      return;
    }

    if (pathname === '/work/admin/platform' && isUnitScopedAdmin(user)) {
      router.replace(getPostLoginPath(user, activeUnitId));
    }
  }, [user, isLoadingUser, activeUnitId, pathname, router]);

  return <>{children}</>;
}
