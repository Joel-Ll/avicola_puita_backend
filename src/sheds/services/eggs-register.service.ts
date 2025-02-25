import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';

import { RegisterEggProductionDto } from '../dto/egg-production/register-egg-production.dto';
import { UpdateEggProductionDto } from '../dto/egg-production/update-egg-production.dto';

import { EggRegister } from '../schemas/egg-register.schema';
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
    const { shed: shedId, egg: eggId, dateRegister, unitQuantity, quantityPerBox } = registerEggProductionDto;
    const session = await this.connection.startSession();
    session.startTransaction();

    const shed = await this.shedModel.findById(shedId).session(session);
    if (!shed) throw new NotFoundException('galpón no encontrado');

    const egg = await this.eggModel.findById(eggId).session(session);
    if (!egg) throw new NotFoundException('huevo no encontrado');

    const register = new this.eggRegisterModel({
      shed: shedId,
      egg: eggId,
      dateRegister,
      unitQuantity,
      quantityPerBox,
      totalQuantity: unitQuantity + (quantityPerBox * 12)
    });

    egg.quantity += register.totalQuantity;

    try {
      await register.save({ session });
      await egg.save({ session });
      await session.commitTransaction();
      return 'Registrado correctamente';

    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  public async getEggsProduction() {
    try {
      const eggsProduction = await this.eggRegisterModel
        .find()
        .populate('shed', { name: 1 })
        .populate('egg', { size: 1 })
        .sort({ createdAt: -1 });
      return eggsProduction;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getEggProduction(registerEggId: string) {
    const registerEgg = await this.eggRegisterModel.findById(registerEggId);
    if(!registerEgg) throw new NotFoundException('Recurso no encontrado');
    return registerEgg;
  }

  public async updateEggProduction(registerEggId: string, updateEggProductionDto: UpdateEggProductionDto) {
    const { shed, egg: eggId, dateRegister, quantityPerBox, unitQuantity } = updateEggProductionDto;
    const session = await this.connection.startSession();
    session.startTransaction();

    const registerEgg = await this.eggRegisterModel.findById(registerEggId).session(session);
    if (!registerEgg) throw new NotFoundException('Registro no encontrado');

    // Verificamos el huevo correspondiente. 
    const egg = await this.eggModel.findById(registerEgg.egg).session(session);
    const currentEgg = await this.eggModel.findById(eggId).session(session);
    const newTotalQuantity = unitQuantity + (quantityPerBox * 12);

    if( egg.id === currentEgg.id) {
      // actualizamos egg
      egg.quantity += (newTotalQuantity - registerEgg.totalQuantity);
    } else {
      // actualizamos currentEgg
      egg.quantity -= registerEgg.totalQuantity;
      currentEgg.quantity += newTotalQuantity;
    }

    registerEgg.shed = new Types.ObjectId(shed);
    registerEgg.egg = new Types.ObjectId(eggId);
    registerEgg.dateRegister = dateRegister;
    registerEgg.unitQuantity = unitQuantity;
    registerEgg.quantityPerBox = quantityPerBox;
    registerEgg.totalQuantity = newTotalQuantity;

    try {
      await registerEgg.save({session});
      await egg.save({session});
      await currentEgg.save({session});
      await session.commitTransaction();
      return 'Actualizado correctamente';
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  public async deleteEggProduction(registerEggId: string) {
    const registerEgg = await this.eggRegisterModel.findById(registerEggId);
    if (!registerEgg) throw new NotFoundException('Registro no encontrado');
    const egg = await this.eggModel.findById(registerEgg.egg);
    if(!egg) throw new NotFoundException('Registro no encontrado');
    egg.quantity -= registerEgg.totalQuantity;

    try {
      await registerEgg.deleteOne();
      await egg.save();
      return 'Eliminado correctamente';
    } catch (error) {
      this.handleError(error);   
    }
  }
  
  private handleError(error: any) {
    this.logger.error(error)
    throw new InternalServerErrorException('Error - Please check server logs')
  }
}
