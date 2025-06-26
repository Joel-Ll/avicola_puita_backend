import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Egg } from '../schemas/egg.schema';
import { UpdateEggDto } from '../dto/eggs/update-egg.dto';
import { initialEggs } from 'src/common/constants/egg-size';

@Injectable()
export class EggsService {
  private readonly logger = new Logger(EggsService.name);

  constructor(
    @InjectModel(Egg.name)
    private readonly eggModel: Model<Egg>
  ) { }

  public async getEggs() {
    try {
      let eggs = await this.eggModel.find({}).sort({ sizeOrder: 1 });
      if (eggs.length) return eggs;
  
      const results = await Promise.allSettled(
        initialEggs.map(async (item) => {
          const egg = new this.eggModel(item);
          return egg.save();
        })
      );
  
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Error al crear el huevo ${initialEggs[index].description}:`, result.reason);
        }
      });

      return await this.eggModel.find({}).sort({ sizeOrder: 1 });
  
    } catch (error) {
      console.error('Error al obtener o inicializar los huevos:', error);
      throw new Error('No se pudo obtener la lista de huevos.');
    }
  }

  public async getOneEgg(eggId: string) {
    const egg = await this.eggModel.findById(eggId);
    if(!egg) 
      throw new NotFoundException('Registro no encontrado');
    return egg;
  }

  public async editEgg(eggId: string, updateEggDto: UpdateEggDto) {
    const { quantity, unit_price, box_price } = updateEggDto;
    const egg = await this.getOneEgg(eggId)

    egg.quantity = quantity 
    egg.unit_price = unit_price;
    egg.box_price = box_price;

    try {
      await egg.save();
      return 'Actualizado correctamente';     
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    this.logger.error(error)
    throw new InternalServerErrorException('Error - Please check server logs')
  }
}
