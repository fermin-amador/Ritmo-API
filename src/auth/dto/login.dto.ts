import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

import {
  ApiProperty,
} from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'fermin@example.com',
    description: 'Email registrado',
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
    description: 'Contraseña del usuario',
  })
  @IsString({
    message: 'password debe ser un texto',
  })
  @IsNotEmpty({
    message: 'password es obligatorio',
  })
  password!: string;
}