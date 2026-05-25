'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, Shield } from 'lucide-react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { adminRoleLabel, isSuperAdmin } from '@/lib/admin-auth';

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
const apiDocsUrl = `${apiBase}/api/docs`;

export default function AdminPlatformPage() {
  const router = useRouter();
  const { user, isLoadingUser } = useAuth();

  useEffect(() => {
    if (!isLoadingUser && user && !isSuperAdmin(user)) {
      router.replace('/work/admin/dashboard');
    }
  }, [isLoadingUser, user, router]);

  return (
    <AppLayout userRole="admin">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Administração da plataforma</h1>
            <p className="text-muted-foreground">
              {user ? adminRoleLabel(user.adminRole) : 'Super administrador'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gestão global (Swagger)</CardTitle>
            <CardDescription>
              Como super administrador, use a API para criar unidades, perfis de admin e
              configurações globais. O painel operacional por unidade é para administradores de
              hospital ou clínica.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>POST /units — cadastrar hospitais e clínicas</li>
              <li>POST /admins — criar admin de hospital/clínica com unitIds</li>
              <li>POST /users — criar contas de acesso</li>
            </ul>
            <Button asChild>
              <a href={apiDocsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Swagger
              </a>
            </Button>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          Credencial de teste: admin@vitalium.com / admin123456
        </p>
      </div>
    </AppLayout>
  );
}
