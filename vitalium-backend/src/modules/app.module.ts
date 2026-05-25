import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserModule } from './user.module';
import { DoctorModule } from './doctor.module';
import { PatientModule } from './patient.module';
import { MonitoringModule } from '../shared/monitoring/monitoring.module';
import { HealthController } from '../presentation/controllers/health.controller';
import { ExceptionsModule } from '../shared/execeptions/exceptions.module';
import { ConfigModule } from '@nestjs/config';
import { UnitModule } from './units.module';
import { DoctorUnitModule } from './doctor-unit.module';
import { LoggingInterceptor } from '../shared/interceptors/logging.interceptor';
import { AuthModule } from './auth.module';
import { AdminModule } from './admin.module';
import { ChatModule } from './chat.module';
import { SpecializationModule } from './specialization.module';
import { DoctorSpecializationModule } from './doctor-specialization.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    AuthModule,
    UserModule,
    DoctorModule,
    PatientModule,
    DoctorUnitModule,
    UnitModule,
    AdminModule,
    ChatModule,
    SpecializationModule,
    DoctorSpecializationModule,
    ExceptionsModule,
    MonitoringModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
