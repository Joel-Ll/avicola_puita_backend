import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Egg, EggSchema } from './schemas/egg.schema';
import { EggRegister, EggRegisterSchema } from './schemas/egg-register.schema';
import { EggsRegisterService } from './services/eggs-register.service';
import { EggsService } from './services/eggs.service';
import { Event, EventSchema } from './schemas/event.schema';
import { HealthManagement, HealthManagementSchema } from './schemas/health-management.schema';
import { HealthManagementService } from './services/health-management.service';
import { Low, LowSchema } from './schemas/low.schema';
import { LowsService } from './services/lows.service';
import { Recovered, RecoveredSchema } from './schemas/recovered.schema';
import { RecoveredService } from './services/recovered.service';
import { Shed, ShedShema } from './schemas/shed.schema';
import { ShedMiddleware } from './middleware/shed.middleware';
import { ShedsController } from './sheds.controller';
import { ShedsService } from './sheds.service';
import { Sick, SickSchema } from './schemas/sick.schema';
import { SicksService } from './services/sicks.service';
import { VaccineControl, VaccineControlSchema } from './schemas/vaccine-control.schema';
import { VaccioneControlService } from './services/vaccione-control.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Egg.name, schema: EggSchema },
      { name: EggRegister.name, schema: EggRegisterSchema },
      { name: Event.name, schema: EventSchema },
      { name: HealthManagement.name, schema: HealthManagementSchema },
      { name: Low.name, schema: LowSchema },
      { name: Recovered.name, schema: RecoveredSchema },
      { name: Shed.name, schema: ShedShema },
      { name: Sick.name, schema: SickSchema },
      { name: VaccineControl.name, schema: VaccineControlSchema },
    ])
  ],
  controllers: [ShedsController],
  providers: [
    EggsRegisterService,
    EggsService,
    HealthManagementService,
    LowsService,
    RecoveredService,
    ShedsService,
    SicksService,
    VaccioneControlService,
  ],
})

export class ShedsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ShedMiddleware)
      .forRoutes(
        { path: 'sheds/:shedId', method: RequestMethod.GET },
        { path: 'sheds/:shedId/lows', method: RequestMethod.POST },
        { path: 'sheds/:shedId/sicks', method: RequestMethod.POST },
        { path: 'sheds/:shedId/recovered', method: RequestMethod.POST },
        { path: 'sheds/:shedId', method: RequestMethod.PATCH },
        { path: 'sheds/:shedId/reset', method: RequestMethod.PATCH },
        { path: 'sheds/summary/:shedId/:registerId/restore', method: RequestMethod.DELETE },
        { path: 'sheds/:shedId/vaccine-control', method: RequestMethod.POST },
        { path: 'sheds/:shedId/health-management', method: RequestMethod.POST }
      )
  }
}


