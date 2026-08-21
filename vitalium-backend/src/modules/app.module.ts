import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HealthController } from '../presentation/controllers/health.controller';
import { ExceptionsModule } from '../shared/execeptions/exceptions.module';
import { LoggingInterceptor } from '../shared/interceptors/logging.interceptor';
import { MonitoringModule } from '../shared/monitoring/monitoring.module';
import { AdminModule } from './admin.module';
import { AppointmentModule } from './appointment.module';
import { AuthModule } from './auth.module';
import { CaregiverModule } from './caregiver.module';
import { ChatModule } from './chat.module';
import { DoctorModule } from './doctor.module';
import { DoctorUnitModule } from './doctor-unit.module';
import { MedicalRecordModule } from './medical-record.module';
import { NurseModule } from './nurse.module';
import { PatientModule } from './patient.module';
import { PatientCaregiverModule } from './patient-caregiver.module';
import { PatientDoctorModule } from './patient-doctor.module';
import { PatientUnitModule } from './patient-unit.module';
import { PrescriptionModule } from './prescription.module';
import { SpecializationModule } from './specialization.module';
import { SecretaryModule } from './secretary.module';
import { SymptomLogModule } from './symptom-log.module';
import { UnitModule } from './units.module';
import { UserModule } from './user.module';
import { WardModule } from './ward.module';

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
    MedicalRecordModule,
    AppointmentModule,
    PrescriptionModule,
    WardModule,
    CaregiverModule,
    PatientDoctorModule,
    PatientCaregiverModule,
    PatientUnitModule,
    NurseModule,
    SecretaryModule,
    SpecializationModule,
    SymptomLogModule,
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
