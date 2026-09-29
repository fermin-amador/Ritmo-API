import { Rol } from '../../generated/prisma/enums';

export interface JwtPayload {
  sub: number;
  email: string;
  rol: Rol;
}