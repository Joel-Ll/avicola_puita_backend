import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ShedMiddleware } from './middleware/shed.middleware';
import { ShedsController } from './sheds.controller';
import { RecoveredService } from './services/recovered.service';
import { ShedsService } from './sheds.service';
import { LowsService } from './services/lows.service';
import { SicksService } from './services/sicks.service';
import { Shed, ShedShema } from './schemas/shed.schema';
import { Recovered, RecoveredSchema } from './schemas/recovered.schema';
import { Low, LowSchema } from './schemas/low.schema';
import { Sick, SickSchema } from './schemas/sick.schema';
import { EggsService } from './services/eggs.service';
import { Egg, EggSchema } from './schemas/egg.schema';
import { EggRegister, EggRegisterSchema } from './schemas/egg-register.schema';
import { EggsRegisterService } from './services/eggs-register.service';
import { VaccioneControlService } from './services/vaccione-control.service';
import { VaccineControl, VaccineControlSchema } from './schemas/vaccine-control.schema';
import { Event, EventSchema } from './schemas/event.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Shed.name, schema: ShedShema },
    { name: Low.name, schema: LowSchema },
    { name: Sick.name, schema: SickSchema },
    { name: Recovered.name, schema: RecoveredSchema },
    { name: Egg.name, schema: EggSchema },
    { name: EggRegister.name, schema: EggRegisterSchema },
    { name: VaccineControl.name, schema: VaccineControlSchema },
    { name: Event.name, schema: EventSchema },
  ])],
  controllers: [ShedsController],
  providers: [
    ShedsService, 
    RecoveredService, 
    LowsService, 
    SicksService, 
    EggsService, 
    EggsRegisterService, 
    VaccioneControlService
  ],
})

export class ShedsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ShedMiddleware)
      .forRoutes(
        { path: 'sheds/:shedId', method: RequestMethod.GET},
        { path: 'sheds/:shedId/lows', method: RequestMethod.POST},
        { path: 'sheds/:shedId/sicks', method: RequestMethod.POST},
        { path: 'sheds/:shedId/recovered', method: RequestMethod.POST},
        { path: 'sheds/:shedId', method: RequestMethod.PATCH},
        { path: 'sheds/:shedId/reset', method: RequestMethod.PATCH},
        { path: 'sheds/summary/:shedId/:registerId/restore', method: RequestMethod.DELETE},
        { path: 'sheds/:shedId/vaccine-control', method: RequestMethod.POST },
      )
  }
}


