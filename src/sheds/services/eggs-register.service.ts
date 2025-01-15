import { 
  Injectable, 
  InternalServerErrorException, 
  Logger,
  NotFoundException 
} from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { EggRegister } from '../schemas/egg-register.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { RegisterEggProductionDto } from '../dto/egg-production/register-egg-production.dto';
import { Shed } from '../schemas/shed.schema';
import { Egg } from '../schemas/egg.schema';

@Injectable()
export class EggsRegisterService {
  private readonly logger = new Logger(EggRegister.name);

  constructor(
    @InjectConnection()
    private readonly connection: Connection,

    @InjectModel(Shed.name)
    private readonly shedModel: Model<Shed>,

    @InjectModel(Egg.name)
    private readonly eggModel: Model<Egg>,

    @InjectModel(EggRegister.name)
    private readonly eggRegisterModel: Model<EggRegister>,
  ) { }

  public async registerEgg(registerEggProductionDto: RegisterEggProductionDto) {

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { shedId, eggId, dateRegister, quantity } = registerEggProductionDto;

      const shed = await this.shedModel.findById(shedId).session(session);
      if (!shed) throw new NotFoundException('galpón no encontrado');

      const egg = await this.eggModel.findById(eggId).session(session);
      if (!egg) throw new NotFoundException('huevo no encontrado');


      const register = new this.eggRegisterModel({
        shedId,
        eggId,
        shedName: shed.name,
        dateRegister,
        size: egg.size,
        quantity,
      });
      egg.quantity += quantity;

      await register.save({ session });
      await egg.save({ session });

      await session.commitTransaction();
      session.endSession();
      return 'Registrado correctamente';

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      this.handleError(error); 
    }
  }

  public async getEggProduction() {
    try {
      const eggsProduction = await this.eggRegisterModel
        .find()
        .sort({ createdAt: -1 });
      return eggsProduction;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    this.logger.error(error)
    throw new InternalServerErrorException('Error - Please check server logs')
  }
}
