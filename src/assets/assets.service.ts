import { 
  ConflictException, 
  Injectable, 
  InternalServerErrorException, 
  Logger, 
  NotFoundException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Asset } from './schemas/asset.schema';
import { getAssetReport } from 'src/reports/assets.report';
import { PrinterService } from 'src/printer/printer.service';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    @InjectModel(Asset.name)
    private readonly assetModel: Model<Asset>,

    private readonly printService: PrinterService

  ) { }

  public async create(createAssetDto: CreateAssetDto) {
    const asset = new this.assetModel(createAssetDto);
    asset.slug = asset.name.toLowerCase().replaceAll(' ', '_').replaceAll("'", '')

    const assetExists = await this.assetModel.findOne({ slug: asset.slug });
    if (assetExists)
      throw new ConflictException(`El registro (${asset.name}) ya existe`);

    try {
      await asset.save();
      return 'Registrado correctamente';
    } catch (error) {
      this.handleError(error)
    }
  }

  public async findAll() {
    try {
      const assets = await this.assetModel.find({})
        .sort({ updatedAt: -1 })
        .select({ name: 1, quantity: 1, updatedAt: 1 })
      return assets
    } catch (error) {
      this.handleError(error);
    }
  }

  public async findOne(id: string) {
    const asset = await this.assetModel.findById(id);
    if (!asset)
      throw new NotFoundException('Registro no encontrado');
    return asset;
  }

  public async update(id: string, updateAssetDto: UpdateAssetDto) {
    const updated = await this.assetModel.findByIdAndUpdate(id, updateAssetDto);
    if (updated === null)
      throw new NotFoundException('Registro no encontrado');

    return 'Actualizado correctamente';
  }

  public async remove(id: string) {
    const updated = await this.assetModel.findByIdAndDelete(id);
    if (updated === null)
      throw new NotFoundException('Registro no encontrado');

    return 'Eliminado correctamente';
  }

  public async getReportAsset() {
    const data = await this.assetModel.find({}).sort({ updatedAt: -1 })
      .select({ name: 1, quantity: 1, updatedAt: 1 })
    const docDefinition = getAssetReport({ data, subTitle: 'Informe de Activos' })
    return this.printService.createPdf(docDefinition)
  }

  private handleError(error: any) {
    this.logger.error(error)
    throw new InternalServerErrorException('Error - Please check server logs')
  }
}
