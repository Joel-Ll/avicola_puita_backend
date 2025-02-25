import {
  ConflictException,
  Injectable, 
  InternalServerErrorException, 
  Logger
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateLowDto } from '../dto/lows/create-low.dto';

import { Low } from '../schemas/low.schema';
import { ShedDocument } from '../schemas/shed.schema';

@Injectable()
export class LowsService {
  private readonly logger = new Logger(LowsService.name);
  constructor(
    @InjectModel(Low.name)
    private readonly lowModel: Model<Low>,
  ) { }

  public async registerLow(shed: ShedDocument, createLowDto: CreateLowDto) {
    const { quantity, dateRegister, sick } = createLowDto;
    const register = new this.lowModel({ quantity, dateRegister, shedId: shed._id });
    if (quantity > shed.currentStock)
      throw new ConflictException('La cantidad de bajas debe ser menor a la cantidad actual');

    if (sick === true) {
      if (quantity > shed.sicksCount) {
        throw new ConflictException('La cantidad de bajas debe ser menor a la cantidad en observación');
      }
      shed.currentStock = shed.currentStock - quantity;
      shed.sicksCount = shed.sicksCount - quantity;
      shed.lowsCount = shed.lowsCount + quantity;
      register.sick = true;
    } else {
      shed.currentStock = shed.currentStock - quantity;
      shed.lowsCount = shed.lowsCount + quantity;
      register.sick = false
      
      if( shed.currentStock === 0) {
        shed.sicksCount = 0;
        shed.recoveredCount = 0;
      }
    }

    try {
      await register.save();
      await shed.save();
      return 'Registrado correctamente';
    } catch (error) {
      this.handleError(error)
    }
  }

  private handleError(error: any) {
    this.logger.error(error)
    throw new InternalServerErrorException('Error - Please check server logs')
  }
}
