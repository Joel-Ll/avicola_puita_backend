import { 
  ConflictException, 
  Injectable, 
  InternalServerErrorException, 
  Logger 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateSickDto } from '../dto/sicks/create-sick.dto';

import { Sick } from '../schemas/sick.schema';
import { ShedDocument } from '../schemas/shed.schema';

@Injectable()
export class SicksService {
  private readonly logger = new Logger(SicksService.name);

  constructor(
    @InjectModel(Sick.name)
    private readonly sickModel: Model<Sick>,
  ) {}

  public async registerSick(shed: ShedDocument, createSickDto: CreateSickDto) {
    const { quantity, dateRegister } = createSickDto;
    const register = new this.sickModel({ quantity, dateRegister, shedId: shed._id });

    shed.sicksCount = shed.sicksCount + quantity;
    if (shed.sicksCount > shed.currentStock)
      throw new ConflictException('Cantidad no válida');

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