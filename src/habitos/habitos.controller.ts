import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Rol } from '../generated/prisma/enums';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import {
  UsuarioActual,
} from '../auth/usuario-actual.decorator';

import type {
  UsuarioActual as UsuarioActualType,
} from '../auth/usuario-actual.decorator';

import { HabitosService } from './habitos.service';

import { CrearHabitoDto } from './dto/crear-habito.dto';
import { ActualizarHabitoDto } from './dto/actualizar-habito.dto';

@Controller('habitos')
@UseGuards(JwtAuthGuard)
export class HabitosController {
  constructor(
    private readonly habitosService: HabitosService,
  ) {}

  @Post()
  crear(
    @UsuarioActual()
    usuario: UsuarioActualType,

    @Body()
    dto: CrearHabitoDto,
  ) {
    return this.habitosService.crear(
      usuario.id,
      dto,
    );
  }

  @Get()
  listar(
    @UsuarioActual()
    usuario: UsuarioActualType,
  ) {
    return this.habitosService.listar(
      usuario.id,
    );
  }

  // IMPORTANTE:
  // esta ruta debe estar antes de @Get(':id')
  @Get('admin/todos')
  @UseGuards(RolesGuard)
  @Roles(Rol.ADMIN)
  listarTodos() {
    return this.habitosService.listarTodos();
  }

  @Get(':id')
  obtenerPorId(
    @Param('id', ParseIntPipe)
    id: number,

    @UsuarioActual()
    usuario: UsuarioActualType,
  ) {
    return this.habitosService.obtenerPorId(
      id,
      usuario.id,
    );
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe)
    id: number,

    @UsuarioActual()
    usuario: UsuarioActualType,

    @Body()
    dto: ActualizarHabitoDto,
  ) {
    return this.habitosService.actualizar(
      id,
      usuario.id,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Param('id', ParseIntPipe)
    id: number,

    @UsuarioActual()
    usuario: UsuarioActualType,
  ): Promise<void> {
    await this.habitosService.eliminar(
      id,
      usuario.id,
    );
  }
}