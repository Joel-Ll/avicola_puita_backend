import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { Customer } from '../schemas/customer.schema';
import { Order, OrderDocument } from '../schemas/order.schema';
import { Item, ItemDocument, } from '../schemas/item.schema';
import { Egg, EggDocument } from 'src/sheds/schemas/egg.schema';
import { CreateOrderDto } from '../dto/create-order.dto';
import { CreateItemDto } from '../dto/create-item.dto';
import { CompletedOrderDto } from '../dto/completed-order.dto';
import { Payment } from '../schemas/payment.schema';
import { DeliveryDateDto } from '../dto/delivery-date.dto';
import { DeliveryGuideDto } from '../dto/delivery-guide.dto';
import { getDeliveryGuide } from 'src/reports/delivery-guide';
import { PrinterService } from 'src/printer/printer.service';
import { orderPrintSchema } from '../interface/delivery-guide.interface';
import { PaymentGuideDto } from '../dto/payment-guide.dto';
import { getPaymentGuide } from 'src/reports/payments-guide';

@Injectable()
export class OrdersService {

  private logger = new Logger(OrdersService.name);

  constructor(
    @InjectConnection()
    private readonly connection: Connection,

    @InjectModel(Customer.name)
    private readonly customerModel: Model<Customer>,

    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,

    @InjectModel(Item.name)
    private readonly itemModel: Model<Item>,

    @InjectModel(Egg.name)
    private readonly eggModel: Model<Egg>,

    @InjectModel(Payment.name)
    private readonly paymentModel: Model<Payment>,

    private readonly printerService: PrinterService,
  ) { }

  public async createOrder(createOrderDto: CreateOrderDto) {
    const { idCustomer } = createOrderDto;
    const customer = await this.customerModel.findById(idCustomer);

    if (!customer)
      throw new NotFoundException('Cliente no encontrado');

    const session = await this.connection.startSession();
    session.startTransaction();

    const totalOrders = await this.orderModel.countDocuments();
    const order = new this.orderModel({ customerId: customer.id, orderCode: `ORD-${totalOrders + 1}` })
    customer.orders.push(order.id);

    try {
      await order.save({ session });
      await customer.save({ session });
      await session.commitTransaction();
      return {
        message: 'Orden registrado',
        idOrder: order.id
      };
    } catch (error) {
      await session.abortTransaction()
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  public async getOrders() {
    const orders = await this.orderModel.find({ state: { $ne: 'finalized' } }).sort({ createdAt: -1 })
      .populate('customerId', {
        name: 1, phone: 1, address: 1
      })
      .populate('orderItems', {
        detail: 1
      })
    return orders;
  }

  public async getOneOrder(order: OrderDocument) {
    const currentOrder = await this.orderModel
      .findById(order._id)
      .populate('customerId', {
        name: 1, phone: 1, address: 1
      })
      .populate('orderItems')

    return currentOrder;
  }

  public async deleteOrder(order: OrderDocument) {
    const session = await this.connection.startSession();
    session.startTransaction();

    const customer = await this.customerModel.findById(order.customerId)
    if (!customer)
      throw new NotFoundException('Cliente no encontrado');

    try {
      const currentOrder = await order.populate({
        path: 'orderItems',
        populate: {
          path: 'idEgg',
          model: 'Egg'
        }
      })

      const items = currentOrder.orderItems as unknown as (ItemDocument & { idEgg: EggDocument })[];

      for (const item of items) {
        const egg = item.idEgg;

        const quantityToReturn = item.unitQuantity + item.quantityPerBox * 12;
        egg.quantity += quantityToReturn;
        await egg.save({ session });

        await this.itemModel.findByIdAndDelete(item._id).session(session);
      }

      customer.orders = customer.orders.filter(id => id.toString() !== order.id.toString());

      await order.deleteOne({ session });
      await customer.save({ session });
      await session.commitTransaction();
      return 'Eliminado correctamente';

    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  public async completedOrder(order: OrderDocument, completedOrderDto: CompletedOrderDto) {
    const { amountToPay, nextPay, methodToPay } = completedOrderDto;

    const session = await this.connection.startSession();
    session.startTransaction();

    if (amountToPay > order.balance)
      throw new BadRequestException('Cantidad no válida');

    if (amountToPay === 0 && !nextPay) {
      throw new BadRequestException('Ingresa la fecha del próximo pago');
    }

    if (amountToPay === 0 && nextPay) {
      order.nextPay = nextPay;
      await order.save();
      return 'Fecha agendada...'
    }

    if (amountToPay > 0 && !methodToPay)
      throw new BadRequestException('Seleccione un método de pago');

    const payment = new this.paymentModel({
      order: order._id,
      amount: amountToPay,
      method: methodToPay
    });

    order.balance -= payment.amount;
    order.nextPay = nextPay;

    if (order.balance > 0 && !nextPay)
      throw new BadRequestException('Ingrese la fecha del próximo pago');

    if (order.balance === 0) {
      order.state = 'completed';
      order.nextPay = null;
    }

    try {
      await payment.save({ session });
      await order.save({ session });
      await session.commitTransaction();
      return 'Agregado correctamente';
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  public async finalizedOrder(order: OrderDocument) {
    if (order.state !== 'completed')
      throw new BadRequestException('El pedido aún no fue completado');
    order.state = 'finalized';
    try {
      await order.save();
      return 'El pedido se ha finalizado correctamente';
    } catch (error) {
      this.handleError(error)
    }
  }

  public async deliveryDate(order: OrderDocument, deliveryDateDto: DeliveryDateDto) {
    const { date } = deliveryDateDto;

    if (!order.orderItems || order.orderItems.length === 0)
      throw new BadRequestException('Seleccione al menos un producto');

    if (date === null)
      throw new BadRequestException('Seleccione una fecha de entrega');

    order.deliveryDate = date;

    try {
      await order.save();
      return 'Cambios realizados...';
    } catch (error) {
      this.handleError(error);
    }
  }

  public async deliveryGuide(deliveryGuideDto: DeliveryGuideDto) {
    const { date } = deliveryGuideDto;
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await this.orderModel.find({
      state: { $in: ['to_pay', 'completed'] },
      deliveryDate: { $gte: startOfDay, $lte: endOfDay },
    }).populate('customerId', {
      name: 1, phone: 1, address: 1
    }).populate('orderItems', {
      detail: 1
    });

    if (orders.length === 0)
      throw new NotFoundException('No hay registros');

    const response = orderPrintSchema.safeParse(orders);
    if (response.success) {
      const docDefinition = getDeliveryGuide({ data: response.data, subTitle: 'Guía de Entrega', date })
      return this.printerService.createPdf(docDefinition);
    } else {
      throw new BadRequestException('No se pudo generar el pdf, vuelva a intentarlo');
    }
  }

  public async paymentGuide(paymentGuideDto: PaymentGuideDto) {
    const { date } = paymentGuideDto;
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await this.orderModel.find({
      state: { $in: ['to_pay'] },
      nextPay: { $gte: startOfDay, $lte: endOfDay },
    }).populate('customerId', {
      name: 1, phone: 1, address: 1
    }).populate('orderItems', {
      detail: 1
    });

    if (orders.length === 0)
      throw new NotFoundException('No hay registros');

    const response = orderPrintSchema.safeParse(orders);
    if (response.success) {
      const docDefinition = getPaymentGuide({ data: response.data, subTitle: 'Guía de Cobros', date })
      return this.printerService.createPdf(docDefinition)
    } else {
      throw new BadRequestException('No se pudo generar el pdf, vuelva a intentarlo');
    }
  }

  // ITEMS (ORDER ITEM)
  public async createItem(order: OrderDocument, createItemDto: CreateItemDto) {
    let totalQuantity = 0;
    const { idEgg, unitQuantity, quantityPerBox, totalPrice} = createItemDto;

    const egg = await this.eggModel.findById(idEgg);

    if (!egg)
      throw new BadRequestException('Item no encontrado');

    totalQuantity = unitQuantity + (quantityPerBox * 12);

    if (totalQuantity > egg.quantity)
      throw new BadRequestException('Cantidad no válida');

    const existingItems = await this.itemModel.find({
      _id: { $in: order.orderItems },
      idEgg: idEgg
    });

    if (existingItems.length > 0) {
      throw new BadRequestException('Este producto ya fue registrado en el pedido');
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    const item = new this.itemModel({
      idEgg,
      unitQuantity,
      quantityPerBox,
      detail: `Huevo "${egg.size}": ${quantityPerBox}C - ${unitQuantity}M`,
      totalPrice: totalPrice
      // totalPrice: (unitQuantity * egg.unit_price) + (quantityPerBox * egg.box_price),
    });

    egg.quantity -= totalQuantity
    order.orderItems.push(item.id)
    order.totalAmount += item.totalPrice
    order.balance += item.totalPrice
    if (order.balance > 0) order.state = 'to_pay';

    try {
      await item.save({ session });
      await egg.save({ session });
      await order.save({ session });
      await session.commitTransaction();
      return 'Item agregado correctamente';
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  public async deleteItem(order: OrderDocument, idItem: string) {
    const item = await this.itemModel.findById(idItem);
    let totalQuantity = 0;

    if (!item)
      throw new NotFoundException('Item no encontrado');

    const egg = await this.eggModel.findById(item.idEgg);
    if (!egg)
      throw new NotFoundException('Producto no encontrado');

    const session = await this.connection.startSession();
    session.startTransaction();

    totalQuantity = item.unitQuantity + (item.quantityPerBox * 12);
    egg.quantity += totalQuantity;

    order.orderItems = order.orderItems.filter(id => id.toString() !== item.id.toString())
    order.balance -= item.totalPrice;
    order.totalAmount -= item.totalPrice;

    if (order.balance === 0)
      order.state = 'pending';

    try {
      await item.deleteOne({ session })
      await egg.save({ session });
      await order.save({ session });
      await session.commitTransaction();
      return 'Eliminado correctamente';
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  private handleError(error: any) {
    this.logger.error(error)
    throw new InternalServerErrorException('Error - Please check server logs')
  }
}
