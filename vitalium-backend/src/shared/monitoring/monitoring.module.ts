import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { LoggingPersistenceService } from './logging-persistence.service';
import { MetricsCollectorService } from './metrics-collector.service';
import { SystemHealthService } from './system-health.service';

@Module({
  imports: [PrismaModule],
  providers: [
    MetricsCollectorService,
    SystemHealthService,
    LoggingPersistenceService,
  ],
  exports: [
    MetricsCollectorService,
    SystemHealthService,
    LoggingPersistenceService,
  ],
})
export class MonitoringModule {}
