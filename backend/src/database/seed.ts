import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Availability } from '../availability/availability.entity';
import { CaregiverProfile } from '../caregivers/caregiver-profile.entity';
import { Pet } from '../pets/pet.entity';
import { RequestStatus } from '../requests/enums/request-status.enum';
import { Request } from '../requests/request.entity';
import { Review } from '../reviews/review.entity';
import { ServiceType } from '../services/enums/service-type.enum';
import { Service } from '../services/service.entity';
import { ServiceUpdate } from '../updates/service-update.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { User } from '../users/user.entity';
import dataSource from './data-source';

// Datos de demostración (npm run seed). Todas las cuentas usan la
// contraseña "Pawlie123". Si los datos ya existen, no hace nada.
const PASSWORD = 'Pawlie123';
const HORA = 60 * 60 * 1000;
const DIA = 24 * HORA;

// Fecha relativa a hoy, a una hora exacta (ej: en(1, 10) = mañana a las 10:00).
function en(dias: number, hora: number, minutos = 0): Date {
  const fecha = new Date(Date.now() + dias * DIA);
  fecha.setHours(hora, minutos, 0, 0);
  return fecha;
}

async function seed(ds: DataSource) {
  const users = ds.getRepository(User);
  if (await users.exists({ where: { email: 'maria@pawlie.com' } })) {
    console.log('Los datos demo ya existen. No se hizo ningún cambio.');
    return;
  }

  await ds.transaction(async (m) => {
    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    const crearUsuario = (
      name: string,
      email: string,
      role: UserRole,
      phone: string,
    ) => m.save(m.create(User, { name, email, role, phone, passwordHash }));

    const maria = await crearUsuario(
      'María González',
      'maria@pawlie.com',
      UserRole.OWNER,
      '300 123 4567',
    );
    const camilaUser = await crearUsuario(
      'Camila Ruiz',
      'camila@pawlie.com',
      UserRole.CAREGIVER,
      '311 456 7890',
    );
    const andresUser = await crearUsuario(
      'Andrés Molina',
      'andres@pawlie.com',
      UserRole.CAREGIVER,
      '315 222 3344',
    );

    const camila = await m.save(
      m.create(CaregiverProfile, {
        user: camilaUser,
        city: 'San Fernando, Cali',
        bio: 'Amo los animales desde pequeña. Paseos largos por el Parque del Perro y mucho cariño.',
        yearsExperience: 4,
      }),
    );
    const andres = await m.save(
      m.create(CaregiverProfile, {
        user: andresUser,
        city: 'Ciudad Jardín, Cali',
        bio: 'Cuidador con experiencia en gatos y conejos. Tengo patio y mucha paciencia.',
        yearsExperience: 6,
      }),
    );

    const servicio = (
      caregiver: CaregiverProfile,
      name: string,
      type: ServiceType,
      price: number,
      durationMinutes: number,
    ) =>
      m.save(
        m.create(Service, {
          caregiver,
          name,
          type,
          price: String(price),
          durationMinutes,
        }),
      );

    const paseoCamila = await servicio(
      camila,
      'Paseo de 1 hora',
      ServiceType.PASEO,
      35000,
      60,
    );
    await servicio(camila, 'Baño y cepillado', ServiceType.BANO, 45000, 90);
    const paseoAndres = await servicio(
      andres,
      'Paseo de 30 minutos',
      ServiceType.PASEO,
      25000,
      30,
    );
    const cuidadoAndres = await servicio(
      andres,
      'Cuidado en casa',
      ServiceType.CUIDADO_EN_CASA,
      80000,
      240,
    );

    // Lunes a viernes de 8:00 a 12:00 y de 14:00 a 18:00.
    for (const caregiver of [camila, andres]) {
      for (let dia = 1; dia <= 5; dia++) {
        await m.save(
          m.create(Availability, {
            caregiver,
            dayOfWeek: dia,
            startTime: '08:00',
            endTime: '12:00',
          }),
        );
        await m.save(
          m.create(Availability, {
            caregiver,
            dayOfWeek: dia,
            startTime: '14:00',
            endTime: '18:00',
          }),
        );
      }
    }

    const mascota = (
      name: string,
      species: string,
      breed: string,
      age: number,
      notes: string,
    ) =>
      m.save(m.create(Pet, { owner: maria, name, species, breed, age, notes }));
    const max = await mascota(
      'Max',
      'Perro',
      'Golden Retriever',
      3,
      'Cariñoso y sociable. Le encanta el parque.',
    );
    const luna = await mascota(
      'Luna',
      'Gato',
      'Gato doméstico',
      2,
      'Tranquila y curiosa.',
    );
    const nube = await mascota(
      'Nube',
      'Conejo',
      'Conejo enano',
      1,
      'Dulce y juguetona.',
    );

    const solicitud = (
      pet: Pet,
      caregiver: CaregiverProfile,
      service: Service,
      startAt: Date,
      status: RequestStatus,
      notes: string | null,
    ) =>
      m.save(
        m.create(Request, {
          owner: maria,
          pet,
          caregiver,
          service,
          startAt,
          endAt: new Date(
            startAt.getTime() + service.durationMinutes * 60 * 1000,
          ),
          status,
          notes,
          totalPrice: service.price,
        }),
      );

    await solicitud(
      max,
      camila,
      paseoCamila,
      en(1, 10),
      RequestStatus.PENDIENTE,
      'Max es muy sociable. Por favor llevar agua.',
    );
    await solicitud(
      luna,
      andres,
      cuidadoAndres,
      en(2, 14),
      RequestStatus.ACEPTADA,
      'Luna es tímida al principio.',
    );

    // Servicio en curso: empezó hace 40 minutos.
    const inicio = new Date(Date.now() - 40 * 60 * 1000);
    const enCurso = await solicitud(
      max,
      camila,
      paseoCamila,
      inicio,
      RequestStatus.EN_CURSO,
      'Llevarlo al Parque del Perro si se puede.',
    );
    const actualizacion = (
      request: Request,
      message: string,
      minutosDespues: number,
    ) =>
      m.save(
        m.create(ServiceUpdate, {
          request,
          message,
          createdAt: new Date(
            request.startAt.getTime() + minutosDespues * 60 * 1000,
          ),
        }),
      );
    await actualizacion(
      enCurso,
      'Recogí a Max, salimos hacia el Parque del Perro.',
      0,
    );
    await actualizacion(
      enCurso,
      'Max está jugando con otros perros, muy feliz.',
      20,
    );
    await actualizacion(
      enCurso,
      'Tomó agua y descansamos un rato a la sombra.',
      35,
    );

    // Finalizado sin reseña (para probar la calificación).
    const finalizado = await solicitud(
      max,
      andres,
      paseoAndres,
      en(-3, 9),
      RequestStatus.FINALIZADA,
      null,
    );
    await actualizacion(finalizado, 'Salimos a caminar por el barrio.', 0);
    await actualizacion(
      finalizado,
      'Paseo terminado. Max quedó en casa tranquilo.',
      30,
    );

    // Finalizado con reseña.
    const conResena = await solicitud(
      nube,
      andres,
      cuidadoAndres,
      en(-10, 8),
      RequestStatus.FINALIZADA,
      null,
    );
    await actualizacion(conResena, 'Nube comió bien y está tranquila.', 60);
    await m.save(
      m.create(Review, {
        request: conResena,
        rating: 5,
        comment: 'Andrés fue súper atento y me envió fotos todo el tiempo.',
        tags: ['Muy puntual', 'Fotos durante el servicio'],
      }),
    );

    await solicitud(
      luna,
      camila,
      paseoCamila,
      en(-6, 16),
      RequestStatus.CANCELADA,
      null,
    );
  });

  console.log('Datos demo creados. Contraseña de todas las cuentas: Pawlie123');
  console.log('  Dueña:      maria@pawlie.com');
  console.log('  Cuidadores: camila@pawlie.com, andres@pawlie.com');
}

dataSource
  .initialize()
  .then((ds) => seed(ds).finally(() => ds.destroy()))
  .catch((error: unknown) => {
    console.error('No se pudieron crear los datos demo:', error);
    process.exit(1);
  });
