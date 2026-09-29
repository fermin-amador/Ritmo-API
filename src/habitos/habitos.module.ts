import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

import { HabitosController } from './habitos.controller';
import { HabitosService } from './habitos.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],

  controllers: [
    HabitosController,
  ],

  providers: [
    HabitosService,
  ],
})
export class HabitosModule {}