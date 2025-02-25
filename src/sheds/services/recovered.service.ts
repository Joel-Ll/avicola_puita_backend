import { 
  ConflictException, 
  Injectable, 
  InternalServerErrorException, 
  Logger 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateRecoveredDto } from '../dto/recovered/create-recovered.dto';

import { Shed, ShedDocument } from '../schemas/shed.schema';
import { Recovered } from '../schemas/recovered.schema';

@Injectable()
export class RecoveredService {
  private readonly logger = new Logger(RecoveredService.name);
  constructor(
    @InjectModel(Recovered.name)
    private readonly recoveredModel: Model<Shed>, 
  ) {}

  public async registerRecovered(shed: ShedDocument, createRecoveredDto: CreateRecoveredDto) {
    const { quantity, dateRegister } = createRecoveredDto;
    const register = new this.recoveredModel({ quantity, dateRegister, shedId: shed._id });

    if(shed.sicksCount === 0)
      throw new ConflictException('No hay registros en observación');

    if(quantity > shed.sicksCount) 
      throw new ConflictException('Cantidad no válida');

    shed.sicksCount = shed.sicksCount - quantity;
    shed.recoveredCount = shed.recoveredCount + quantity;

    try {
      await register.save();
      await shed.save();
      return 'Registrado correctamente';
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    this.logger.error(error);
    throw new InternalServerErrorException('Error - Please check server logs');
  }
}
