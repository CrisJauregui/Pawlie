import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../users/enums/user-role.enum';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100)
  name: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'El correo no es válido' })
  @MaxLength(150)
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72) // bcrypt solo usa los primeros 72 bytes
  @Matches(/(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'La contraseña debe tener al menos una letra y un número',
  })
  password: string;

  @IsEnum(UserRole, { message: 'El rol debe ser OWNER o CAREGIVER' })
  role: UserRole;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
