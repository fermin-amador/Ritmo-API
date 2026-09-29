import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar usuario',
    description:
      'Crea una cuenta nueva. El servidor asigna siempre el rol USUARIO.',
  })
  @ApiCreatedResponse({
    description:
      'Usuario creado correctamente sin passwordHash.',
  })
  @ApiBadRequestResponse({
    description:
      'Datos de registro inválidos.',
  })
  @ApiConflictResponse({
    description:
      'El email ya se encuentra registrado.',
  })
  register(
    @Body() dto: RegisterDto,
  ) {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Valida las credenciales y devuelve un JWT.',
  })
  @ApiOkResponse({
    description:
      'Credenciales válidas. Devuelve access_token.',
  })
  @ApiBadRequestResponse({
    description:
      'Formato de entrada inválido.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Credenciales inválidas.',
  })
  login(
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(dto);
  }
}