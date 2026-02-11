import { Response } from 'express';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Workbook } from 'exceljs';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale, SaleDocument } from './schemas/sale.schema';
import { saleState } from 'src/common/constants/sale-state';
import { CreateItemDto } from 'src/customers/dto/create-item.dto';
import { Egg, EggDocument } from 'src/sheds/schemas/egg.schema';
import { SaleItem, SaleItemDocument } from './schemas/sale-item.schema';
import { CreateSoldProductDto } from './dto/create-sold-producto.dto';
import { ProductSold } from './schemas/product-sold';
import { salePrintSchema } from './interface/sale-guide.interface';
import { getSaleGuide } from 'src/reports/sale-guide';
import { PrinterService } from 'src/printer/printer.service';
import { updateDetailSold } from 'src/utils/sale.utils';
import { SaleHistoryDto } from './dto/sales-history.dto';
import { EditSoldProductDto } from './dto/edit-sold-product.dto';
import { saleXmlSchema } from './interface/sale-xml.interface';
import { agent } from 'supertest';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name)

  constructor(
    @InjectConnection()
    private readonly connection: Connection,

    @InjectModel(Sale.name)
    private readonly saleModel: Model<Sale>,

    @InjectModel(Egg.name)
    private readonly eggModel: Model<Egg>,

    @InjectModel(SaleItem.name)
    private readonly saleItemModel: Model<SaleItem>,

    @InjectModel(ProductSold.name)
    private readonly productSoldModel: Model<ProductSold>,

    private readonly printerService: PrinterService,
  ) { }

  public async create() {
    const totalSales = await this.saleModel.countDocuments();
    const sale = new this.saleModel({
      saleCode: `VTM-${totalSales + 1}`
    });

    try {
      await sale.save();
      return {
        message: 'Nueva venta...',
        idSale: sale.id
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  public async findAll() {
    const sales = await this.saleModel.find({ state: { $nin: ['finalized'] } }).sort({ createdAt: -1 })
      .select({
        saleDate: 1,
        saleCode: 1,
        state: 1,
        detailSold: 1,
        soldTotalPrice: 1
      })
    return sales;
  }

  public async findOne(sale: SaleDocument) {
    await sale.populate('saleItems');
    return sale;
  }

  public async update(sale: SaleDocument, updateSaleDto: UpdateSaleDto) {
    const { saleDate, agent, sending } = updateSaleDto;
    if (sale.saleItems.length === 0)
      throw new BadRequestException('Seleccione al menos un producto a la venta');

    sale.saleDate = saleDate;
    sale.agent = agent;
    sale.sending = sending;
    sale.state = saleState.PENDING;

    try {
      await sale.save();
      return 'Venta registrada';
    } catch (error) {
      this.handleError(error);
    }
  }

  public async remove(sale: SaleDocument) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const currentSale = await sale.populate({
        path: 'saleItems',
        populate: {
          path: 'idEgg',
          model: 'Egg'
        }
      })

      const items = currentSale.saleItems as unknown as (SaleItemDocument & { idEgg: EggDocument })[];

      for (const item of items) {
        const egg = item.idEgg;

        egg.quantity += item.totalQuantity;
        await egg.save({ session });
        await this.saleItemModel.findByIdAndDelete(item._id).session(session);
      }

      await sale.deleteOne({ session });
      await session.commitTransaction();
      return 'Eliminado correctamente';
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  public async confirmSending(sale: SaleDocument) {
    try {
      sale.state = 'dispatched';
      await sale.save();
      return 'Enviado correctamente';
    } catch (error) {
      this.handleError(error);
    }
  }

  public async finalizeSale(sale: SaleDocument) {
    sale.state = 'finalized';
    await sale.save();
    return 'Venta finalizada';
  }

  // Sale Items
  public async createItem(sale: SaleDocument, createItemDto: CreateItemDto) {
    let totalQuantity = 0;
    const { idEgg, unitQuantity, quantityPerBox } = createItemDto;

    const egg = await this.eggModel.findById(idEgg);
    if (!egg)
      throw new BadRequestException('Producto no encontrado');

    totalQuantity = unitQuantity + (quantityPerBox * 12);

    if (totalQuantity > egg.quantity)
      throw new BadRequestException('Cantidad no válida');

    const existingItems = await this.saleItemModel.find({
      _id: { $in: sale.saleItems },
      idEgg: idEgg
    });

    if (existingItems.length > 0)
      throw new BadRequestException('El producto ya fue registrado');

    const session = await this.connection.startSession();
    session.startTransaction();

    const item = new this.saleItemModel({
      idEgg,
      totalQuantity,
      detail: `Huevo "${egg.size}": ${Math.floor(totalQuantity / 12)}C - ${totalQuantity % 12}M`,
    });

    egg.quantity -= totalQuantity
    sale.saleItems.push(item.id)
    sale.state = saleState.PENDING

    try {
      await item.save({ session });
      await egg.save({ session });
      await sale.save({ session });
      await session.commitTransaction();
      return 'Producto registrado';
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  public async deleteItem(sale: SaleDocument, idItem: string) {
    const item = await this.saleItemModel.findById(idItem);
    let totalQuantity = 0;

    if (!item)
      throw new NotFoundException('Item no encontrado');

    const egg = await this.eggModel.findById(item.idEgg);
    if (!egg)
      throw new NotFoundException('Producto no encontrado');

    const session = await this.connection.startSession();
    session.startTransaction();

    totalQuantity = item.totalQuantity;
    egg.quantity += totalQuantity;

    sale.saleItems = sale.saleItems.filter(id => id.toString() !== item.id.toString())
    // sale.sendTotalPrice -= item.totalPrice;

    try {
      await item.deleteOne({ session })
      await egg.save({ session });
      await sale.save({ session });
      await session.commitTransaction();
      return 'Producto eliminado';
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  // Register Sold Products
  public async registerSoldProduct(sale: SaleDocument, createSoldProductDto: CreateSoldProductDto) {
    const { idEgg, unitQuantity, quantityPerBox, amount } = createSoldProductDto;
    const currentSale = await sale.populate({
      path: 'saleItems',
      populate: {
        path: 'idEgg',
        model: 'Egg'
      }
    })

    const items = currentSale.saleItems as unknown as (SaleItemDocument & { idEgg: EggDocument })[];
    const saleItem = items.find(item => item.idEgg.id.toString() === idEgg);
    if (!saleItem)
      throw new NotFoundException('El producto no esta en la lista de ventas');

    const totalToSell = unitQuantity + (quantityPerBox * 12);

    if (totalToSell > saleItem.totalQuantity)
      throw new BadRequestException('Cantidad no válida');

    // Reducir cantidades
    const session = await this.connection.startSession();
    session.startTransaction();

    saleItem.totalQuantity -= totalToSell;

    saleItem.detail = `Huevo "${saleItem.idEgg.size}": ${Math.floor(saleItem.totalQuantity / 12)}C - ${saleItem.totalQuantity % 12}M`;


    const newProductSold = new this.productSoldModel({
      idSale: sale.id,
      ...createSoldProductDto,
    });

    sale.detailSold = updateDetailSold(
      sale.detailSold,
      saleItem.idEgg.size,
      unitQuantity,
      quantityPerBox,
      true
    );
    sale.markModified('detailSold');
    sale.soldTotalPrice += amount;
    sale.state = saleState.RECONCILING;

    try {
      await newProductSold.save({ session });
      await saleItem.save({ session });
      await sale.save({ session });
      await session.commitTransaction();
      return 'Venta registrada';

    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  public async getOneSoldProduct(idProduct: string) {
    const soldProduct = await this.productSoldModel.findById(idProduct).select({ amount: 1, method: 1, observation: 1 });
    if (!soldProduct)
      throw new NotFoundException('Registro no encontrado');
    return soldProduct;
  }

  public async editSoldProduct(idProduct: string, editSoldProductDto: EditSoldProductDto) {
    const { amount, method, observation } = editSoldProductDto;
    const soldProduct = await this.productSoldModel.findById(idProduct);
    const sale = await this.saleModel.findById(soldProduct.idSale);
    if (!soldProduct || !sale)
      throw new BadRequestException('Registro no encontrado');

    if (sale.state === 'completed' || sale.state === 'finalized')
      throw new BadRequestException('La venta ya fue completada');

    const session = await this.connection.startSession();
    session.startTransaction();

    sale.soldTotalPrice = (sale.soldTotalPrice - soldProduct.amount) + amount;
    soldProduct.amount = amount;
    soldProduct.method = method;
    soldProduct.observation = observation;

    try {
      await sale.save({ session })
      await soldProduct.save({ session });
      await session.commitTransaction();
      return {
        message: 'Editado correctamente',
        idSale: sale.id
      }
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  public async deleteSoldProduct(idProduct: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    const productSold = await this.productSoldModel.findById(idProduct).session(session);
    if (!productSold) throw new BadRequestException('Registro no encontrado');

    const sale = await this.saleModel.findById(productSold.idSale).session(session).populate({
      path: 'saleItems',
      populate: {
        path: 'idEgg',
        model: 'Egg'
      }
    });
    if (!sale) throw new BadRequestException('Registro no encontrado');

    if (sale.state === 'completed' || sale.state === 'finalized')
      throw new BadRequestException('La venta ya fue completada');

    const items = sale.saleItems as unknown as (SaleItemDocument & { idEgg: EggDocument })[];
    const saleItem = items.find(item => item.idEgg.id.toString() === productSold.idEgg.toString());
    const egg = await this.eggModel.findById(productSold.idEgg).session(session);

    if (!saleItem || !egg) {
      throw new BadRequestException('Datos relacionados no encontrados');
    }

    const totalQuantity = productSold.unitQuantity + (productSold.quantityPerBox * 12);
    sale.soldTotalPrice -= productSold.amount;
    saleItem.totalQuantity += totalQuantity;
    saleItem.detail = `Huevo "${egg.size}": ${Math.floor(saleItem.totalQuantity / 12)}C - ${saleItem.totalQuantity % 12}M`;

    sale.detailSold = updateDetailSold(
      sale.detailSold,
      egg.size,
      productSold.unitQuantity,
      productSold.quantityPerBox,
      false
    );
    sale.markModified('detailSold');

    try {
      await sale.save({ session });
      await saleItem.save({ session });
      await productSold.deleteOne({ session });
      await session.commitTransaction();
      return {
        message: 'Eliminado correctamente',
        idSale: sale.id
      };
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  public async returnProducts(sale: SaleDocument) {
    const session = await this.connection.startSession();
    session.startTransaction();

    const currentSale = await sale.populate({
      path: 'saleItems',
      populate: {
        path: 'idEgg',
        model: 'Egg'
      }
    })

    try {
      const items = currentSale.saleItems as unknown as (SaleItemDocument & { idEgg: EggDocument })[];

      for (const item of items) {
        const egg = item.idEgg;
        egg.quantity += item.totalQuantity;
        await egg.save({ session });
      }
      sale.saleItems = [];
      sale.state = 'completed';
      await sale.save({ session });
      await session.commitTransaction();
      return 'Los productos fueron agregados al almacen';
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  // Generate Report PDF
  public async generateSaleGuide(sale: SaleDocument) {
    const validState = ['pending', 'onHold'];
    if (!validState.includes(sale.state))
      throw new BadRequestException('No se puede generar el pdf');

    const currentSale = await sale.populate({
      path: 'saleItems',
      select: {
        idEgg: 1, detail: 1
      },
      populate: {
        path: 'idEgg',
        model: 'Egg',
        select: {
          unit_price: 1,
          box_price: 1
        }
      }
    });

    const response = salePrintSchema.safeParse(currentSale);

    if (response.success) {
      const docDefinition = getSaleGuide({
        data: response.data,
        title: `Guía de Venta ${response.data.saleCode}`,
        subTitle: `${response.data.sending} - ${response.data.agent}`,
        date: response.data.saleDate
      });
      sale.state = 'onHold'
      await sale.save();
      return this.printerService.createPdf(docDefinition)
    } else {
      throw new BadRequestException('No se pudo generar el pdf, vuelva a intentarlo');
    }
  }

  // Generar XML
  public async exportToExcel(exportToExcelDto: SaleHistoryDto, res: Response) {
    const { fromDate, toDate } = exportToExcelDto;

    if (new Date(fromDate) > new Date(toDate))
      throw new BadRequestException('Fecha no valida');

    const startOfFromDate = new Date(fromDate);
    startOfFromDate.setHours(0, 0, 0, 0);

    const endOfToDay = new Date(toDate);
    endOfToDay.setHours(23, 59, 59, 999);

    const productsSold = await this.productSoldModel.find({
      createdAt: { $gte: startOfFromDate, $lte: endOfToDay }
    }).select({ method: 1, amount: 1, unitQuantity: 1, quantityPerBox: 1, observation: 1, createdAt: 1 })
      .populate({
        path: 'idSale',
        select: { saleCode: 1, agent: 1 },
      })
      .populate({
        path: 'idEgg',
        select: { size: 1 }
      })

    const response = saleXmlSchema.safeParse(productsSold);

    if (response.success) {
      const workbook = new Workbook();
      const sheet = workbook.addWorksheet('Pagos');

      // Cabeceras
      sheet.addRow([
        'Fecha',
        'Código',
        'Agente',
        'Tamaño',
        'Cajas',
        'Maples',
        'Monto',
        'Método de pago',
        'Observaciones'
      ]);

      response.data.forEach((productSold) => {
        sheet.addRow([
          new Date(productSold.createdAt).toLocaleDateString(),
          productSold.idSale.saleCode,
          productSold.idSale.agent,
          productSold.idEgg.size,
          productSold.quantityPerBox,
          productSold.unitQuantity,
          productSold.amount,
          productSold.method,
          productSold.observation,
        ]);
      });

      // Total automático al final
      sheet.addRow(['', '', '', '', '', 'Total', { formula: `SUM(G2:G${productsSold.length + 1})` }]);

      // Estilos básicos (opcional)
      sheet.columns.forEach((col) => (col.width = 20));

      // Enviar al cliente como descarga
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=ventas.xlsx',
      );

      await workbook.xlsx.write(res);
      res.end();
    } else {
      this.logger.error(response.error);
      res.end();
    }
  }

  // Ventas internas
  public async getAllProductsSold(saleHistory: SaleHistoryDto) {
    const { fromDate, toDate } = saleHistory;
    if (new Date(fromDate) > new Date(toDate))
      throw new BadRequestException('Fecha no valida');

    const startOfFromDate = new Date(fromDate);
    startOfFromDate.setHours(0, 0, 0, 0);

    const endOfToDay = new Date(toDate);
    endOfToDay.setHours(23, 59, 59, 999);

    try {
      const productsSold = await this.productSoldModel.find({
        createdAt: { $gte: startOfFromDate, $lte: endOfToDay }
      }).sort({ createdAt: -1 })
        .populate({
          path: 'idSale',
          populate: 'saleItems'
        })
        .populate('idEgg', { description: 1 });
      return productsSold;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    this.logger.error(error)
    throw new InternalServerErrorException('Error - Please check server logs')
  }
}
