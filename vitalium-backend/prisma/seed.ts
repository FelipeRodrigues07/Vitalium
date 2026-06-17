import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole, AdminRole, Gender, BloodType, UnitType, WardType, SecurityLevel, AppointmentType, AppointmentStatus, RecordType, CaregiverRelationship } from '@prisma/client';
import { config as loadEnv } from 'dotenv';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

loadEnv();
if (!process.env.DATABASE_URL) {
  loadEnv({ path: '.env.development' });
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined. Load an environment file before running the seed.');
}

const adapter = new PrismaPg(
  new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (cuidado em produção!)
  await cleanDatabase();

  // Criar especialidades
  console.log('📋 Criando especialidades...');
  const specializations = await createSpecializations();

  // Criar unidades
  console.log('🏥 Criando unidades...');
  const units = await createUnits();

  // Criar usuários e seus perfis
  console.log('👥 Criando usuários...');
  const {
    adminUser,
    hospitalAdminUser,
    clinicAdminUser,
    doctorUsers,
    nurseUsers,
    patientUsers,
    caregiverUsers,
  } = await createUsers();

  // Criar admins (super + hospital + clínica com vínculo em admin_units)
  console.log('👨‍💼 Criando admins...');
  await createAdmins(adminUser, hospitalAdminUser, clinicAdminUser, units);

  // Criar médicos com especialidades
  console.log('👨‍⚕️ Criando médicos...');
  const hospitalUnit = units[0];
  const clinicUnit = units[1] ?? units[0];

  const doctors = await createDoctors(
    doctorUsers,
    hospitalUnit,
    clinicUnit,
    specializations,
  );

  // Criar enfermeiras
  console.log('👩‍⚕️ Criando enfermeiras...');
  await createNurses(nurseUsers, hospitalUnit, clinicUnit);

  // Criar pacientes
  console.log('👨‍🦽 Criando pacientes...');
  const patients = await createPatients(patientUsers, hospitalUnit, clinicUnit);

  // Criar cuidadores
  console.log('🤝 Criando cuidadores...');
  await createCaregivers(caregiverUsers, patients);

  // Criar associações médico-paciente
  console.log('📊 Criando associações médico-paciente...');
  await createPatientDoctors(patients);

  // Criar agendamentos
  console.log('📅 Criando agendamentos...');
  await createAppointments(patients);

  // Criar registros médicos
  console.log('📝 Criando registros médicos...');
  await createMedicalRecords(patients);

  // Criar logs de segurança
  console.log('🔐 Criando logs de segurança...');
  await createSecurityLogs();

  // Criar logs de erro
  console.log('⚠️ Criando logs de erro...');
  await createErrorLogs();

  // Criar eventos de negócio
  console.log('📈 Criando eventos de negócio...');
  await createBusinessEventLogs();

  console.log('✅ Seed concluído com sucesso!');
  console.log('');
  console.log('📌 Vínculos por unidade (para testar admin):');
  console.log(`   Hospital (${hospitalUnit.name}): medico1-2, paciente1-3, enfermeira1`);
  console.log(`   Clínica (${clinicUnit.name}): medico3, paciente4-5, enfermeira2`);
  console.log('   Paciente ↔ médico: mesmo vínculo de unidade (PatientDoctor)');
}

async function cleanDatabase() {
  try {
    // Ordem importa devido às foreign keys
    await prisma.prescription.deleteMany();
    await prisma.medicalAttachment.deleteMany();
    await prisma.medicalRecord.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.wardAdmission.deleteMany();
    await prisma.ward.deleteMany();
    await prisma.patientCaregiver.deleteMany();
    await prisma.patientDoctor.deleteMany();
    await prisma.patientUnit.deleteMany();
    await prisma.doctorSpecialization.deleteMany();
    await prisma.doctorUnit.deleteMany();
    await prisma.nurseUnit.deleteMany();
    await prisma.businessEventLog.deleteMany();
    await prisma.securityLog.deleteMany();
    await prisma.errorLog.deleteMany();
    await prisma.requestLog.deleteMany();
    await prisma.databaseLog.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.nurse.deleteMany();
    await prisma.caregiver.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.specialization.deleteMany();
    await prisma.user.deleteMany();
    await prisma.unit.deleteMany();
  } catch (error) {
    console.log('❌ Erro ao limpar banco (provavelmente vazio):', error);
  }
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function createSpecializations() {
  const specs = [
    { name: 'Cardiologia', description: 'Especialista em doenças do coração' },
    { name: 'Neurologia', description: 'Especialista em doenças do sistema nervoso' },
    { name: 'Ortopedia', description: 'Especialista em ossos e articulações' },
    { name: 'Pediatria', description: 'Especialista em saúde infantil' },
    { name: 'Oncologia', description: 'Especialista em câncer' },
    { name: 'Dermatologia', description: 'Especialista em pele' },
  ];

  const created = [];
  for (const spec of specs) {
    const created_spec = await prisma.specialization.create({ data: spec });
    created.push(created_spec);
  }
  return created;
}

async function createUnits() {
  const units = [
    {
      name: 'Hospital Central',
      type: UnitType.HOSPITAL,
      cnpj: '12.345.678/0001-90',
      phone: '(11) 3000-0000',
      email: 'contato@hospitalcentral.com.br',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01311-100',
    },
    {
      name: 'Clínica do Bairro',
      type: UnitType.CLINIC,
      cnpj: '98.765.432/0001-10',
      phone: '(11) 3001-0000',
      email: 'contato@clinicabairro.com.br',
      address: 'Rua Augusta, 500',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305-100',
    },
  ];

  const created = [];
  for (const unit of units) {
    const created_unit = await prisma.unit.create({ data: unit });
    created.push(created_unit);
  }
  return created;
}

async function createUsers() {
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@vitalium.com',
      password: await hashPassword('admin123456'),
      firstName: 'Administrador',
      lastName: 'Sistema',
      phone: '(11) 99999-0001',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const hospitalAdminUser = await prisma.user.create({
    data: {
      email: 'admin.hospital@vitalium.com',
      password: await hashPassword('admin123456'),
      firstName: 'Admin',
      lastName: 'Hospital',
      phone: '(11) 99999-0002',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const clinicAdminUser = await prisma.user.create({
    data: {
      email: 'admin.clinica@vitalium.com',
      password: await hashPassword('admin123456'),
      firstName: 'Admin',
      lastName: 'Clínica',
      phone: '(11) 99999-0003',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const doctorUsers = [];
  for (let i = 1; i <= 3; i++) {
    const doctor = await prisma.user.create({
      data: {
        email: `medico${i}@vitalium.com`,
        password: await hashPassword('medico123456'),
        firstName: `Dr. Médico`,
        lastName: `${i}`,
        phone: `(11) 99999-000${i}`,
        role: UserRole.DOCTOR,
        isActive: true,
      },
    });
    doctorUsers.push(doctor);
  }

  const nurseUsers = [];
  for (let i = 1; i <= 2; i++) {
    const nurse = await prisma.user.create({
      data: {
        email: `enfermeira${i}@vitalium.com`,
        password: await hashPassword('nurse123456'),
        firstName: `Enfermeira`,
        lastName: `${i}`,
        phone: `(11) 99999-010${i}`,
        role: UserRole.NURSE,
        isActive: true,
      },
    });
    nurseUsers.push(nurse);
  }

  const patientUsers = [];
  for (let i = 1; i <= 5; i++) {
    const patient = await prisma.user.create({
      data: {
        email: `paciente${i}@vitalium.com`,
        password: await hashPassword('paciente123456'),
        firstName: `Paciente`,
        lastName: `${i}`,
        phone: `(11) 99999-020${i}`,
        role: UserRole.PATIENT,
        isActive: true,
      },
    });
    patientUsers.push(patient);
  }

  const caregiverUsers = [];
  for (let i = 1; i <= 2; i++) {
    const caregiver = await prisma.user.create({
      data: {
        email: `cuidador${i}@vitalium.com`,
        password: await hashPassword('caregiver123456'),
        firstName: `Cuidador`,
        lastName: `${i}`,
        phone: `(11) 99999-030${i}`,
        role: UserRole.CAREGIVER,
        isActive: true,
      },
    });
    caregiverUsers.push(caregiver);
  }

  return {
    adminUser,
    hospitalAdminUser,
    clinicAdminUser,
    doctorUsers,
    nurseUsers,
    patientUsers,
    caregiverUsers,
  };
}

async function createAdmins(
  adminUser: { id: string },
  hospitalAdminUser: { id: string },
  clinicAdminUser: { id: string },
  units: { id: string; name: string; type: UnitType }[],
) {
  const hospitalUnit = units.find((u) => u.type === UnitType.HOSPITAL) ?? units[0];
  const clinicUnit = units.find((u) => u.type === UnitType.CLINIC) ?? units[1];

  // SUPER_ADMIN — sem vínculo em admin_units (escopo global)
  await prisma.admin.create({
    data: {
      userId: adminUser.id,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  // HOSPITAL_ADMIN — pode ter várias unidades (ex.: hospital + clínica do grupo)
  const hospitalAdmin = await prisma.admin.create({
    data: {
      userId: hospitalAdminUser.id,
      role: AdminRole.HOSPITAL_ADMIN,
      isActive: true,
    },
  });

  await prisma.adminUnit.createMany({
    data: [
      {
        adminId: hospitalAdmin.id,
        unitId: hospitalUnit.id,
        isPrimary: true,
        isActive: true,
      },
      ...(clinicUnit.id !== hospitalUnit.id
        ? [
            {
              adminId: hospitalAdmin.id,
              unitId: clinicUnit.id,
              isPrimary: false,
              isActive: true,
            },
          ]
        : []),
    ],
  });

  // CLINIC_ADMIN — vinculado à Clínica do Bairro
  const clinicAdmin = await prisma.admin.create({
    data: {
      userId: clinicAdminUser.id,
      role: AdminRole.CLINIC_ADMIN,
      isActive: true,
    },
  });

  await prisma.adminUnit.create({
    data: {
      adminId: clinicAdmin.id,
      unitId: clinicUnit.id,
      isPrimary: true,
      isActive: true,
    },
  });

  console.log('   Super admin: admin@vitalium.com / admin123456 (sem unidade)');
  console.log(
    `   Hospital admin: admin.hospital@vitalium.com / admin123456 → ${hospitalUnit.name}${clinicUnit.id !== hospitalUnit.id ? ` + ${clinicUnit.name}` : ''}`,
  );
  console.log(
    `   Clínica admin: admin.clinica@vitalium.com / admin123456 → ${clinicUnit.name}`,
  );
  console.log(`   admin_units: hospital=${hospitalAdmin.id}, clinica=${clinicAdmin.id}`);
}

async function createDoctors(doctorUsers, hospitalUnit, clinicUnit, specializations) {
  const doctors = [];
  const unitAssignments = [
    [hospitalUnit],
    [hospitalUnit],
    [clinicUnit],
  ];

  for (let i = 0; i < doctorUsers.length; i++) {
    const doctor = await prisma.doctor.create({
      data: {
        userId: doctorUsers[i].id,
        crm: `123456${i + 1}`,
        crmState: true,
        isActive: true,
      },
    });

    const specs = [specializations[i], specializations[(i + 1) % specializations.length]];
    for (const spec of specs) {
      await prisma.doctorSpecialization.create({
        data: {
          doctorId: doctor.id,
          specializationId: spec.id,
        },
      });
    }

    const assignedUnits = unitAssignments[i] ?? [hospitalUnit];
    for (let j = 0; j < assignedUnits.length; j++) {
      await prisma.doctorUnit.create({
        data: {
          doctorId: doctor.id,
          unitId: assignedUnits[j].id,
          consultationPrice: 150.0 + i * 10,
          isPrimary: j === 0,
        },
      });
    }

    doctors.push(doctor);
  }
  return doctors;
}

async function createNurses(nurseUsers, hospitalUnit, clinicUnit) {
  const unitAssignments = [hospitalUnit, clinicUnit];

  for (let i = 0; i < nurseUsers.length; i++) {
    const nurse = await prisma.nurse.create({
      data: {
        userId: nurseUsers[i].id,
        coren: `123456${i + 1}`,
        corenState: true,
        isActive: true,
      },
    });

    const unit = unitAssignments[i] ?? hospitalUnit;
    await prisma.nurseUnit.create({
      data: {
        nurseId: nurse.id,
        unitId: unit.id,
        isPrimary: true,
      },
    });
  }
}

async function createPatients(patientUsers, hospitalUnit, clinicUnit) {
  const patients = [];
  const cpfs = [
    '12345678901',
    '98765432111',
    '11122233344',
    '55566677788',
    '99988877766',
  ];
  const bloodTypes = [
    BloodType.A_POSITIVE,
    BloodType.O_NEGATIVE,
    BloodType.B_POSITIVE,
    BloodType.AB_POSITIVE,
    BloodType.O_POSITIVE,
  ];
  const unitAssignments = [
    hospitalUnit,
    hospitalUnit,
    hospitalUnit,
    clinicUnit,
    clinicUnit,
  ];

  for (let i = 0; i < patientUsers.length; i++) {
    const unit = unitAssignments[i] ?? hospitalUnit;
    const patient = await prisma.patient.create({
      data: {
        userId: patientUsers[i].id,
        cpf: cpfs[i],
        rg: `123456789${i}`,
        birthDate: new Date(1990, i, 15),
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        bloodType: bloodTypes[i],
        allergies: i === 0 ? 'Penicilina' : undefined,
        emergencyContact: 'Contato de Emergência',
        emergencyPhone: '(11) 99999-9999',
        address: `Rua ${i}, 100`,
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01311-100',
        units: {
          create: {
            unitId: unit.id,
            isPrimary: true,
          },
        },
      },
    });

    patients.push(patient);
  }
  return patients;
}

async function createCaregivers(caregiverUsers, patients) {
  for (let i = 0; i < caregiverUsers.length; i++) {
    const caregiver = await prisma.caregiver.create({
      data: {
        userId: caregiverUsers[i].id,
        cpf: `999.999.99${i}-${9 - i}`,
        relationship: CaregiverRelationship.PARENT,
      },
    });

    // Associar a alguns pacientes
    for (let j = 0; j < 2 && j < patients.length; j++) {
      await prisma.patientCaregiver.create({
        data: {
          patientId: patients[j].id,
          caregiverId: caregiver.id,
        },
      });
    }
  }
}

async function createPatientDoctors(patients) {
  for (const patient of patients) {
    const patientUnit = await prisma.patientUnit.findFirst({
      where: { patientId: patient.id, isActive: true },
      orderBy: { isPrimary: 'desc' },
    });

    if (!patientUnit) {
      continue;
    }

    const doctorUnit = await prisma.doctorUnit.findFirst({
      where: {
        unitId: patientUnit.unitId,
        isActive: true,
      },
    });

    if (!doctorUnit) {
      continue;
    }

    await prisma.patientDoctor.create({
      data: {
        patientId: patient.id,
        doctorId: doctorUnit.doctorId,
        startDate: new Date(2024, 0, 1),
      },
    });
  }
}

async function createAppointments(patients) {
  const appointmentTypes = [AppointmentType.CONSULTATION, AppointmentType.FOLLOW_UP, AppointmentType.ROUTINE_CHECKUP, AppointmentType.EXAMINATION];
  const appointmentStatuses = [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED];

  for (let i = 0; i < patients.length; i++) {
    const patientDoctor = await prisma.patientDoctor.findFirst({
      where: { patientId: patients[i].id },
    });
    const patientUnit = await prisma.patientUnit.findFirst({
      where: { patientId: patients[i].id, isActive: true },
    });

    if (!patientDoctor || !patientUnit) {
      continue;
    }

    for (let j = 0; j < 3; j++) {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + j + 1);
      scheduledDate.setHours(9 + j * 2, 0, 0, 0);

      const doctorId = patientDoctor.doctorId;
      const unitId = patientUnit.unitId;
      const typeIndex = j % appointmentTypes.length;
      const statusIndex = j % appointmentStatuses.length;

      await prisma.appointment.create({
        data: {
          patientId: patients[i].id,
          doctorId,
          unitId,
          scheduledAt: scheduledDate,
          type: appointmentTypes[typeIndex],
          status: appointmentStatuses[statusIndex],
          title: `Agendamento de ${appointmentTypes[typeIndex]}`,
          description: `Consulta agendada com o doutor`,
          notes: `Acompanhamento de rotina`,
          duration: 30,
        },
      });
    }
  }
}

async function createMedicalRecords(patients) {
  const recordTypes = [RecordType.CONSULTATION, RecordType.EXAMINATION, RecordType.SURGERY, RecordType.DIAGNOSTIC];

  for (let i = 0; i < patients.length; i++) {
    const patientDoctor = await prisma.patientDoctor.findFirst({
      where: { patientId: patients[i].id },
    });

    if (!patientDoctor) {
      continue;
    }

    for (let j = 0; j < 2; j++) {
      const typeIndex = j % recordTypes.length;

      await prisma.medicalRecord.create({
        data: {
          patientId: patients[i].id,
          doctorId: patientDoctor.doctorId,
          recordType: recordTypes[typeIndex],
          title: `Registro Médico ${j + 1}`,
          description: `Descrição do registro médico número ${j + 1}`,
          symptoms: ['Febre', 'Dor de cabeça', 'Cansaço'],
          diagnosis: `Diagnóstico preliminar: Paciente saudável`,
          treatment: `Repouso e acompanhamento mensal`,
          observations: `Paciente apresenta bom estado geral`,
          recordDate: new Date(Date.now() - j * 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
}

async function createSecurityLogs() {
  const events = [
    'Login bem-sucedido',
    'Tentativa de acesso não autorizado',
    'Alteração de dados sensíveis',
    'Acesso a registros médicos',
    'Export de dados',
  ];

  for (let i = 0; i < 10; i++) {
    await prisma.securityLog.create({
      data: {
        event: events[i % events.length],
        severity: [SecurityLevel.LOW, SecurityLevel.MEDIUM, SecurityLevel.HIGH, SecurityLevel.CRITICAL][i % 4],
        description: `Evento de segurança número ${i + 1}`,
        ip: `192.168.1.${i + 1}`,
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
      },
    });
  }
}

async function createErrorLogs() {
  const errorTypes = ['ValidationError', 'DatabaseError', 'AuthenticationError', 'ServerError'];

  for (let i = 0; i < 8; i++) {
    await prisma.errorLog.create({
      data: {
        errorType: errorTypes[i % errorTypes.length],
        errorMessage: `Erro do tipo ${errorTypes[i % errorTypes.length]}: ${i}`,
        stackTrace: 'Stack trace simulado...',
        context: 'Contexto da aplicação',
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
        resolved: i < 3,
      },
    });
  }
}

async function createBusinessEventLogs() {
  const events = [
    { event: 'user_created', entity: 'User' },
    { event: 'appointment_scheduled', entity: 'Appointment' },
    { event: 'medical_record_created', entity: 'MedicalRecord' },
    { event: 'backup_completed', entity: 'System' },
    { event: 'compliance_check', entity: 'System' },
  ];

  for (let i = 0; i < 10; i++) {
    const ev = events[i % events.length];
    await prisma.businessEventLog.create({
      data: {
        event: ev.event,
        entity: ev.entity,
        entityId: `${i}`,
        metadata: { description: `Evento de negócio: ${ev.event}` },
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
      },
    });
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
