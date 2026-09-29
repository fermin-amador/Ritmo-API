import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  EstadoHabito,
  FrecuenciaHabito,
} from '../../generated/prisma/enums';

export class ActualizarHabitoDto {
  @ApiPropertyOptional({
    example: 'Leer 45 minutos',
    minLength: 3,
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  nombre?: string;

  @ApiPropertyOptional({
    example: 'Leer después de cenar',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional({
    enum: EstadoHabito,
    example: EstadoHabito.PAUSADO,
  })
  @IsOptional()
  @IsEnum(EstadoHabito)
  estado?: EstadoHabito;

  @ApiPropertyOptional({
    enum: FrecuenciaHabito,
    example: FrecuenciaHabito.SEMANAL,
  })
  @IsOptional()
  @IsEnum(FrecuenciaHabito)
  frecuencia?: FrecuenciaHabito;
}