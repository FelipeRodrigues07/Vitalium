import { ForbiddenException, Injectable } from '@nestjs/common';
import { SecurityLevel, UserRole } from '@prisma/client';
import { PrismaProvider } from '../../../infrastructure/database/prisma.provider';
import {
  getScopedUnitIds,
  isSuperAdmin,
  isUnitScopedAdmin,
} from '../../../shared/auth/auth-scope.helper';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';

export interface AdminDashboardActivity {
  id: string;
  type: 'user_registration' | 'security_alert' | 'system_update' | 'compliance';
  message: string;
  severity: 'info' | 'warning' | 'success' | 'error';
  occurredAt: Date;
}

export interface AdminDashboardResponse {
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
    lastBackup: Date | null;
  };
  systemStatus: {
    server: 'Online' | 'Offline';
    database: 'Saudavel' | 'Instavel';
    lgpdCompliance: 'Ativa' | 'Atencao';
  };
  recentActivity: AdminDashboardActivity[];
}

@Injectable()
export class GetAdminDashboardUseCase {
  constructor(private readonly prisma: PrismaProvider) {}

  async execute(
    authUser: AuthJwtPayload,
    filterUnitId?: string,
  ): Promise<AdminDashboardResponse> {
    const unitIds = this.resolveUnitFilter(authUser, filterUnitId);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (!unitIds) {
      return this.buildGlobalDashboard(todayStart, oneDayAgo);
    }

    return this.buildUnitDashboard(unitIds, todayStart, oneDayAgo);
  }

  private resolveUnitFilter(
    authUser: AuthJwtPayload,
    filterUnitId?: string,
  ): string[] | null {
    const scopedUnitIds = getScopedUnitIds(authUser);

    if (filterUnitId) {
      if (isSuperAdmin(authUser)) {
        return [filterUnitId];
      }

      if (isUnitScopedAdmin(authUser)) {
        if (!scopedUnitIds.includes(filterUnitId)) {
          throw new ForbiddenException(
            'Unidade não permitida para este administrador',
          );
        }
        return [filterUnitId];
      }
    }

    if (isUnitScopedAdmin(authUser) && scopedUnitIds.length > 0) {
      return scopedUnitIds;
    }

    return null;
  }

  private usersInUnitsWhere(unitIds: string[]) {
    return {
      OR: [
        {
          admin: {
            units: {
              some: { unitId: { in: unitIds }, isActive: true },
            },
          },
        },
        {
          doctor: {
            units: {
              some: { unitId: { in: unitIds }, isActive: true },
            },
          },
        },
        {
          patient: {
            units: {
              some: { unitId: { in: unitIds }, isActive: true },
            },
          },
        },
        {
          nurse: {
            units: {
              some: { unitId: { in: unitIds }, isActive: true },
            },
          },
        },
      ],
    };
  }

  private async buildUnitDashboard(
    unitIds: string[],
    todayStart: Date,
    oneDayAgo: Date,
  ): Promise<AdminDashboardResponse> {
    const unitFilter = this.usersInUnitsWhere(unitIds);

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      pendingApprovals,
      totalDoctors,
      totalPatients,
      totalUnits,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count({ where: unitFilter }),
      this.prisma.user.count({
        where: { isActive: true, ...unitFilter },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: todayStart }, ...unitFilter },
      }),
      this.prisma.user.count({
        where: {
          role: UserRole.DOCTOR,
          isActive: false,
          ...unitFilter,
        },
      }),
      this.prisma.doctor.count({
        where: {
          units: {
            some: { unitId: { in: unitIds }, isActive: true },
          },
        },
      }),
      this.prisma.patient.count({
        where: {
          units: {
            some: { unitId: { in: unitIds }, isActive: true },
          },
        },
      }),
      this.prisma.unit.count({
        where: { id: { in: unitIds }, isActive: true },
      }),
      this.prisma.user.findMany({
        where: unitFilter,
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          role: true,
        },
      }),
    ]);

    const recentActivity: AdminDashboardActivity[] = recentUsers.map(
      (user) => ({
        id: `user-${user.id}`,
        type: 'user_registration' as const,
        severity: 'info' as const,
        message: `Novo ${this.getRoleLabel(user.role)} cadastrado: ${user.firstName} ${user.lastName}`,
        occurredAt: user.createdAt,
      }),
    );

    return {
      systemStats: {
        totalUsers,
        activeUsers,
        newUsersToday,
        pendingApprovals,
        totalDoctors,
        totalPatients,
        totalUnits,
        systemUptime: this.formatUptime(process.uptime()),
        criticalAlerts: 0,
        dataBackupStatus: 'Completed',
        lastBackup: oneDayAgo,
      },
      systemStatus: {
        server: 'Online',
        database: 'Saudavel',
        lgpdCompliance: 'Ativa',
      },
      recentActivity,
    };
  }

  private async buildGlobalDashboard(
    todayStart: Date,
    oneDayAgo: Date,
  ): Promise<AdminDashboardResponse> {
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      pendingApprovals,
      totalDoctors,
      totalPatients,
      totalUnits,
      criticalSecurityAlerts,
      unresolvedErrors,
      latestBackup,
      recentUsers,
      recentSecurity,
      recentBusinessEvents,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.user.count({
        where: {
          role: UserRole.DOCTOR,
          isActive: false,
        },
      }),
      this.prisma.doctor.count(),
      this.prisma.patient.count(),
      this.prisma.unit.count({ where: { isActive: true } }),
      this.prisma.securityLog.count({
        where: {
          severity: SecurityLevel.CRITICAL,
          timestamp: { gte: oneDayAgo },
        },
      }),
      this.prisma.errorLog.count({
        where: {
          resolved: false,
          timestamp: { gte: oneDayAgo },
        },
      }),
      this.prisma.businessEventLog.findFirst({
        where: {
          event: {
            contains: 'backup',
            mode: 'insensitive',
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      }),
      this.prisma.user.findMany({
        take: 4,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          role: true,
        },
      }),
      this.prisma.securityLog.findMany({
        take: 4,
        orderBy: {
          timestamp: 'desc',
        },
        select: {
          id: true,
          event: true,
          severity: true,
          timestamp: true,
        },
      }),
      this.prisma.businessEventLog.findMany({
        take: 4,
        orderBy: {
          timestamp: 'desc',
        },
        select: {
          id: true,
          event: true,
          entity: true,
          timestamp: true,
        },
      }),
    ]);

    const criticalAlerts = criticalSecurityAlerts + unresolvedErrors;

    const recentActivity: AdminDashboardActivity[] = [
      ...recentUsers.map((user) => ({
        id: `user-${user.id}`,
        type: 'user_registration' as const,
        severity: 'info' as const,
        message: `Novo ${this.getRoleLabel(user.role)} cadastrado: ${user.firstName} ${user.lastName}`,
        occurredAt: user.createdAt,
      })),
      ...recentSecurity.map((security) => ({
        id: `security-${security.id}`,
        type: 'security_alert' as const,
        severity: this.mapSecuritySeverity(security.severity),
        message: `Evento de seguranca: ${security.event}`,
        occurredAt: security.timestamp,
      })),
      ...recentBusinessEvents.map((event) => ({
        id: `business-${event.id}`,
        type: event.event.toLowerCase().includes('compliance')
          ? ('compliance' as const)
          : ('system_update' as const),
        severity: event.event.toLowerCase().includes('backup')
          ? ('success' as const)
          : ('info' as const),
        message: `${event.event} (${event.entity})`,
        occurredAt: event.timestamp,
      })),
    ]
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, 8);

    return {
      systemStats: {
        totalUsers,
        activeUsers,
        newUsersToday,
        pendingApprovals,
        totalDoctors,
        totalPatients,
        totalUnits,
        systemUptime: this.formatUptime(process.uptime()),
        criticalAlerts,
        dataBackupStatus:
          latestBackup && latestBackup.timestamp >= oneDayAgo
            ? 'Completed'
            : 'Pending',
        lastBackup: latestBackup?.timestamp ?? null,
      },
      systemStatus: {
        server: 'Online',
        database: 'Saudavel',
        lgpdCompliance: criticalAlerts > 0 ? 'Atencao' : 'Ativa',
      },
      recentActivity,
    };
  }

  private getRoleLabel(role: UserRole): string {
    switch (role) {
      case UserRole.DOCTOR:
        return 'medico';
      case UserRole.PATIENT:
        return 'paciente';
      case UserRole.NURSE:
        return 'enfermeiro';
      case UserRole.ADMIN:
        return 'administrador';
      case UserRole.CAREGIVER:
        return 'cuidador';
      default:
        return 'usuario';
    }
  }

  private mapSecuritySeverity(
    severity: SecurityLevel,
  ): AdminDashboardActivity['severity'] {
    switch (severity) {
      case SecurityLevel.CRITICAL:
        return 'error';
      case SecurityLevel.HIGH:
        return 'warning';
      default:
        return 'info';
    }
  }

  private formatUptime(uptimeInSeconds: number): string {
    const totalSeconds = Math.floor(uptimeInSeconds);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) {
      return `${days} dias, ${hours} horas`;
    }

    return `${hours} horas, ${minutes} minutos`;
  }
}
