import {
  IsEmail,
  IsString,
  MinLength,
} from 'class-validator';

import {
  ApiProperty,
} from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'Fermin Amador',
    description: 'Nombre del usuario',
    minLength: 2,
  })
  @IsString({
    message: 'nombre debe ser un texto',
  })
  @MinLength(2, {
    message:
      'nombre debe tener al menos 2 caracteres',
  })
  nombre!: string;

  @ApiProperty({
    example: 'fermin@example.com',
    description: 'Email único del usuario',
  })
  @IsEmail(
    {},
    {
      message: 'email debe ser válido',
    },
  )
  email!: string;

  @ApiProperty({
    example: 'Password123',
    description:
      'Contraseña de al menos 8 caracteres',
    minLength: 8,
  })
  @IsString({
    message: 'password debe ser un texto',
  })
  @MinLength(8, {
    message:
      'password debe tener al menos 8 caracteres',
  })
  password!: string;
}