import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Rol } from '../generated/prisma/enums';

export interface UsuarioActual {
  id: number;
  email: string;
  rol: Rol;
}

export const UsuarioActual =
  createParamDecorator(
    (
      _data: unknown,
      ctx: ExecutionContext,
    ): UsuarioActual => {
      const request =
        ctx.switchToHttp().getRequest();

      return request.user;
    },
  );