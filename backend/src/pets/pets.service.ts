import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet } from './pet.entity';

// Reglas de las mascotas. Todas las consultas filtran por el id del dueño
// que viene del token, así nadie ve ni toca mascotas ajenas.
@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private readonly petsRepository: Repository<Pet>,
  ) {}

  create(ownerId: string, dto: CreatePetDto): Promise<Pet> {
    const pet = this.petsRepository.create({
      name: dto.name,
      species: dto.species,
      breed: dto.breed ?? null,
      age: dto.age ?? null,
      notes: dto.notes ?? null,
      owner: { id: ownerId },
    });
    return this.petsRepository.save(pet);
  }

  // Las más recientes primero.
  findAll(ownerId: string): Promise<Pet[]> {
    return this.petsRepository.find({
      where: { owner: { id: ownerId } },
      order: { createdAt: 'DESC' },
    });
  }

  // Busca por id Y por dueño: si es de otro, no aparece y responde 404.
  async findOne(ownerId: string, id: string): Promise<Pet> {
    const pet = await this.petsRepository.findOneBy({
      id,
      owner: { id: ownerId },
    });
    if (!pet) {
      throw new NotFoundException('Mascota no encontrada');
    }
    return pet;
  }

  async update(ownerId: string, id: string, dto: UpdatePetDto): Promise<Pet> {
    const pet = await this.findOne(ownerId, id);
    Object.assign(pet, dto);
    return this.petsRepository.save(pet);
  }

  // No se puede borrar una mascota con solicitudes: la base de datos lo
  // impide (código 23503) y lo convertimos en un 409 claro.
  async remove(ownerId: string, id: string): Promise<void> {
    const pet = await this.findOne(ownerId, id);
    try {
      await this.petsRepository.remove(pet);
    } catch (error) {
      const code = (error as { driverError?: { code?: string } }).driverError
        ?.code;
      if (error instanceof QueryFailedError && code === '23503') {
        throw new ConflictException(
          'La mascota tiene solicitudes asociadas y no se puede eliminar',
        );
      }
      throw error;
    }
  }
}
