import { Response } from 'express';
import { Body, Controller, Delete, Get, Param, Post, Req, Res } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ReqOrder } from '../interface/order.interface';
import { CreateItemDto } from '../dto/create-item.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { CompletedOrderDto } from '../dto/completed-order.dto';
import { DeliveryDateDto } from '../dto/delivery-date.dto';
import { PaymentGuideDto } from '../dto/payment-guide.dto';

@Controller('orders')
export class OrdersController {
  
  constructor(
    private readonly ordersService: OrdersService
  ) {}
  
  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto)
  }

  @Post(':idOrder')
  completedOrder(
    @Req() req: ReqOrder,
    @Body() completedOrderDto: CompletedOrderDto
  ) {
    return this.ordersService.completedOrder(req.order, completedOrderDto);
  }

  @Get()
  getOrders() {
    return this.ordersService.getOrders();
  }

  @Get(':idOrder')
  getOneOrder(
    @Req() req: ReqOrder
  ) {
    return this.ordersService.getOneOrder(req.order);
  }

  @Delete(':idOrder')
  deleteOrder(
    @Req() req: ReqOrder
  ) {
    return this.ordersService.deleteOrder(req.order)
  }

  @Post(':idOrder/delivery-date')
  deliveryDate(
    @Req() req: ReqOrder,
    @Body() deliveryDateDto: DeliveryDateDto
  ) {
    return this.ordersService.deliveryDate(req.order, deliveryDateDto);
  }

  @Post('reports/delivery-guide')
  async deliveryGuidePDF(
    @Res() response: Response,
    @Body() deliveryGuideDto: DeliveryDateDto
  ) {
    const pdfDoc = await this.ordersService.deliveryGuide(deliveryGuideDto);
    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.pipe(response);
    pdfDoc.end()
  }

  @Post('reports/payment-guide')
  async paymentGuidePDF(
    @Res() response: Response,
    @Body() paymentGuideDto: PaymentGuideDto
  ) {
    const pdfDoc = await this.ordersService.paymentGuide(paymentGuideDto);
    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.pipe(response);
    pdfDoc.end()
  }

  // Order Items
  @Post(':idOrder/items')
  createItem(
    @Req() req: ReqOrder,
    @Body() createItemDto: CreateItemDto
  ) {
    return this.ordersService.createItem(req.order, createItemDto)
  }

  @Delete(':idOrder/items/:idItem')
  deleteItem(
    @Req() req: ReqOrder,
    @Param('idItem', ParseMongoIdPipe) idItem: string,
  ) {
    return this.ordersService.deleteItem(req.order, idItem)
  }

  @Post(':idOrder/finalized')
  finalizedOrder(
    @Req() req: ReqOrder
  ) {
    return this.ordersService.finalizedOrder(req.order);
  }
}
