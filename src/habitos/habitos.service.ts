import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CrearHabitoDto } from 'src/habitos/dto/crear-habito.dto';
import { ActualizarHabitoDto } from 'src/habitos/dto/actualizar-habito.dto';


@Injectable()
export class HabitosService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async crear(
    usuarioId: number,
    dto: CrearHabitoDto,
  ) {
    return this.prisma.habito.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        estado: dto.estado,
        frecuencia: dto.frecuencia,
        usuarioId,
      },
    });
  }

  async listar(usuarioId: number) {
    return this.prisma.habito.findMany({
      where: {
        usuarioId,
      },

      orderBy: {
        creadoEn: 'desc',
      },
    });
  }

  async obtenerPorId(
    id: number,
    usuarioId: number,
  ) {
    const habito =
      await this.buscarPorId(id);

    this.verificarPropiedad(
      habito.usuarioId,
      usuarioId,
    );

    return habito;
  }

  async actualizar(
    id: number,
    usuarioId: number,
    dto: ActualizarHabitoDto,
  ) {
    const habito =
      await this.buscarPorId(id);

    this.verificarPropiedad(
      habito.usuarioId,
      usuarioId,
    );

    return this.prisma.habito.update({
      where: {
        id,
      },

      data: dto,
    });
  }

  async eliminar(
    id: number,
    usuarioId: number,
  ) {
    const habito =
      await this.buscarPorId(id);

    this.verificarPropiedad(
      habito.usuarioId,
      usuarioId,
    );

    await this.prisma.habito.delete({
      where: {
        id,
      },
    });
  }

  async listarTodos() {
    return this.prisma.habito.findMany({
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        estado: true,
        frecuencia: true,
        usuarioId: true,
        creadoEn: true,
      },

      orderBy: {
        creadoEn: 'desc',
      },
    });
  }

  private async buscarPorId(id: number) {
    const habito =
      await this.prisma.habito.findUnique({
        where: {
          id,
        },
      });

    if (!habito) {
      throw new NotFoundException(
        'Hábito no encontrado',
      );
    }

    return habito;
  }

  private verificarPropiedad(
    propietarioId: number,
    usuarioId: number,
  ) {
    if (propietarioId !== usuarioId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este hábito',
      );
    }
  }
}