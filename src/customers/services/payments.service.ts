import { Response } from 'express';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';

import { Connection, Model } from 'mongoose';
import { Workbook } from 'exceljs';
import { Payment } from '../schemas/payment.schema';
import { PaymentsReporExcelDto } from '../dto/export-to-excel.dto';
import { paymentsSchema } from '../interface/payment.interface';
import { Order } from '../schemas/order.schema';
import { UpdatePaymentDto } from '../dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  private logger = new Logger();

  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<Payment>,

    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,

    @InjectConnection()
    private readonly connection: Connection,
  ) { }

  public async getAllPayments(paymentsReporExcelDto: PaymentsReporExcelDto) {
    const { fromDate, toDate } = paymentsReporExcelDto;
    if (new Date(fromDate) > new Date(toDate))
      throw new BadRequestException('Fecha no valida');

    const startOfFromDate = new Date(fromDate);
    startOfFromDate.setHours(0, 0, 0, 0);

    const endOfToDay = new Date(toDate);
    endOfToDay.setHours(23, 59, 59, 999);

    try {
      const payments = await this.paymentModel.find({
        createdAt: { $gte: startOfFromDate, $lte: endOfToDay }
      }).select({ method: 1, amount: 1, createdAt: 1 }).sort({ createdAt: -1 })
        .populate({
          path: 'order',
          select: { orderCode: 1, state: 1 },
          populate: {
            path: 'customerId',
            select: { name: 1 }
          },
        }).lean();
      return payments;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getOnePayment(idPayment: string) {
    const payment = await this.paymentModel.findById(idPayment);
    if (!payment)
      throw new NotFoundException('Registro no encontrado');

    const order = await this.orderModel.findById(payment.order);
    if (!order)
      throw new NotFoundException('Registro no encontrado');

    return payment;
  }

  public async editPayment(idPayment: string, updatePaymentDto: UpdatePaymentDto) {
    const { amount, method } = updatePaymentDto;
    const payment = await this.paymentModel.findById(idPayment);
    if (!payment)
      throw new NotFoundException('Registro no encontrado');

    const order = await this.orderModel.findById(payment.order);
    if (!order)
      throw new NotFoundException('Registro no encontrado');

    if (order.state === 'finalized')
      throw new BadRequestException('La order ya fue finalizada');

    const session = await this.connection.startSession();
    session.startTransaction();
    order.balance -= (amount - payment.amount);
    payment.amount = amount;
    payment.method = method;

    if (order.balance < 0)
      throw new BadRequestException("No puede haber sobrepago");

    if (order.balance > 0)
      order.state = 'to_pay';

    if (order.balance === 0)
      order.state = 'completed';

    try {
      await payment.save({ session });
      await order.save({ session });
      await session.commitTransaction();
      return {
        message: 'Actualizado correctamente',
        idOrder: order.id
      }
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  public async deletePayment(idPayment: string) {
    const payment = await this.paymentModel.findById(idPayment);
    const order = await this.orderModel.findById(payment.order);
    if (!payment || !order)
      throw new NotFoundException('Registro no encontrado');

    if (order.state === 'finalized')
      throw new BadRequestException('La order ya fue finalizada');

    const session = await this.connection.startSession();
    session.startTransaction();

    order.balance += payment.amount;

    if (order.balance > 0)
      order.state = 'to_pay';

    try {
      await payment.deleteOne({ session })
      await order.save({ session });
      await session.commitTransaction();
      return {
        message: 'Eliminado correctamente',
        idOrder: order.id
      }
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  public async exportToExcel(exportToExcelDto: PaymentsReporExcelDto, res: Response) {
    const { fromDate, toDate } = exportToExcelDto;

    if (new Date(fromDate) > new Date(toDate))
      throw new BadRequestException('Fecha no valida');

    const startOfFromDate = new Date(fromDate);
    startOfFromDate.setHours(0, 0, 0, 0);

    const endOfToDay = new Date(toDate);
    endOfToDay.setHours(23, 59, 59, 999);

    const payments = await this.paymentModel.find({
      createdAt: { $gte: startOfFromDate, $lte: endOfToDay }
    }).select({ method: 1, amount: 1, createdAt: 1 })
      .populate({
        path: 'order',
        select: { orderCode: 1 },
        populate: {
          path: 'customerId',
          select: { name: 1 }
        },
      }).lean();

    const response = paymentsSchema.safeParse(payments);

    if (response.success) {
      const workbook = new Workbook();
      const sheet = workbook.addWorksheet('Pagos');

      // Cabeceras
      sheet.addRow([
        'Fecha',
        'Cliente',
        'Pedido',
        'Monto',
        'Método de pago',
      ]);

      response.data.forEach((payment) => {
        sheet.addRow([
          new Date(payment.createdAt).toLocaleDateString(),
          payment.order.customerId.name,
          payment.order.orderCode,
          payment.amount,
          payment.method,
        ]);
      });

      // Total automático al final
      sheet.addRow(['', '', 'Total', { formula: `SUM(D2:D${payments.length + 1})` }]);

      // Estilos básicos (opcional)
      sheet.columns.forEach((col) => (col.width = 20));

      // Enviar al cliente como descarga
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=pagos.xlsx',
      );

      await workbook.xlsx.write(res);
      res.end();
    } else {
      this.logger.error(response.error);
      res.end();
    }
  }

  private handleError(error: any) {
    this.logger.error(error)
    throw new InternalServerErrorException('Error - Please check server logs')
  }
}
