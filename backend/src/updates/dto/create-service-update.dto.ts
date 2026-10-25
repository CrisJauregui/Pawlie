import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateServiceUpdateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message!: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  photoUrl?: string;
}