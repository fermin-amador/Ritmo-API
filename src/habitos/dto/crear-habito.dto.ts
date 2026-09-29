import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  EstadoHabito,
  FrecuenciaHabito,
} from '../../generated/prisma/enums';

export class CrearHabitoDto {
  @ApiProperty({
    example: 'Leer 30 minutos',
    description: 'Nombre del hábito',
    minLength: 3,
    maxLength: 120,
  })
  @IsString({
    message: 'nombre debe ser un texto',
  })
  @MinLength(3, {
    message:
      'nombre debe tener al menos 3 caracteres',
  })
  @MaxLength(120, {
    message:
      'nombre no puede superar 120 caracteres',
  })
  nombre!: string;

  @ApiPropertyOptional({
    example: 'Leer antes de dormir',
    description: 'Descripción opcional',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({
    message:
      'descripcion debe ser un texto',
  })
  @MaxLength(500, {
    message:
      'descripcion no puede superar 500 caracteres',
  })
  descripcion?: string;

  @ApiPropertyOptional({
    enum: EstadoHabito,
    example: EstadoHabito.ACTIVO,
    default: EstadoHabito.ACTIVO,
  })
  @IsOptional()
  @IsEnum(EstadoHabito, {
    message:
      'estado debe ser ACTIVO, PAUSADO o ARCHIVADO',
  })
  estado?: EstadoHabito;

  @ApiPropertyOptional({
    enum: FrecuenciaHabito,
    example: FrecuenciaHabito.DIARIA,
    default: FrecuenciaHabito.DIARIA,
  })
  @IsOptional()
  @IsEnum(FrecuenciaHabito, {
    message:
      'frecuencia debe ser DIARIA, SEMANAL o MENSUAL',
  })
  frecuencia?: FrecuenciaHabito;
}