import { api } from '@/services/api/api';

export interface AdminDashboardActivity {
  id: string;
  type: 'user_registration' | 'security_alert' | 'system_update' | 'compliance';
  message: string;
  severity: 'info' | 'warning' | 'success' | 'error';
  occurredAt: string;
}

export interface AdminDashboardData {
  systemStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    pendingApprovals: number;
    totalDoctors: number;
    totalPatients: number;
    totalUnits: number;
    systemUptime: string;
    criticalAlerts: number;
    dataBackupStatus: 'Completed' | 'Pending';
    lastBackup: string | null;
  };
  systemStatus: {
    server: 'Online' | 'Offline';
    database: 'Saudavel' | 'Instavel';
    lgpdCompliance: 'Ativa' | 'Atencao';
  };
  recentActivity: AdminDashboardActivity[];
}

export const GetAdminDashboardService = {
  getDashboard: async (unitId?: string): Promise<AdminDashboardData> => {
    const response = await api.get('/admin/dashboard', {
      params: unitId ? { unitId } : undefined,
    });
    return response.data;
  },
};
