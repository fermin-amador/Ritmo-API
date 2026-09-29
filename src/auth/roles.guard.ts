import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Rol } from '../generated/prisma/enums';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const rolesRequeridos =
      this.reflector.getAllAndOverride<Rol[]>(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (!rolesRequeridos) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest();

    const usuario = request.user;

    if (!usuario) {
      return false;
    }

    return rolesRequeridos.includes(
      usuario.rol,
    );
  }
}