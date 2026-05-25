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
<<<<<<< HEAD
import { MedicalRecordModule } from './medical-record.module';
import { AppointmentModule } from './appointment.module';
import { PrescriptionModule } from './prescription.module';
import { WardModule } from './ward.module';
import { CaregiverModule } from './caregiver.module';
import { PatientDoctorModule } from './patient-doctor.module';
import { PatientCaregiverModule } from './patient-caregiver.module';
import { PatientUnitModule } from './patient-unit.module';
import { NurseModule } from './nurse.module';
import { SpecializationModule } from './specialization.module';
=======
import { SpecializationModule } from './specialization.module';
import { DoctorSpecializationModule } from './doctor-specialization.module';
import { PatientDoctorModule } from './patient-doctor.module';
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a

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
<<<<<<< HEAD
    MedicalRecordModule,
    AppointmentModule,
    PrescriptionModule,
    WardModule,
    CaregiverModule,
    PatientDoctorModule,
    PatientCaregiverModule,
    PatientUnitModule,
    NurseModule,
    SpecializationModule,
=======
    SpecializationModule,
    DoctorSpecializationModule,
    PatientDoctorModule,
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
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
