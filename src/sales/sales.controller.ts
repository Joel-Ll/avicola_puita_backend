import { Response } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { SalesService } from './sales.service';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { ReqSale } from './interface/sale.interface';
import { CreateItemDto } from 'src/customers/dto/create-item.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { CreateSoldProductDto } from './dto/create-sold-producto.dto';
import {  SaleHistoryDto } from './dto/sales-history.dto';
import { EditSoldProductDto } from './dto/edit-sold-product.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('sales')
@Auth()
export class SalesController {
  constructor(private readonly salesService: SalesService) { }

  @Post()
  create() {
    return this.salesService.create();
  }

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':idSale')
  findOne(
    @Req() reqSale: ReqSale
  ) {
    return this.salesService.findOne(reqSale.sale);
  }

  @Patch(':idSale')
  update(
    @Req() req: ReqSale,
    @Body() updateSaleDto: UpdateSaleDto
  ) {
    return this.salesService.update(req.sale, updateSaleDto);
  }

  @Delete(':idSale')
  remove(
    @Req() req: ReqSale
  ) {
    return this.salesService.remove(req.sale);
  }

  @Post(':idSale/confirm-sending')
  confirmSending(
    @Req() reqSale: ReqSale
  ) {
    return this.salesService.confirmSending(reqSale.sale);
  }

  @Post(':idSale/finalize-sale')
  finalizedSale(
    @Req() reqSale: ReqSale
  ) {
    return this.salesService.finalizeSale(reqSale.sale);
  }

  // Sale Items
  @Post(':idSale/items')
  createItem(
    @Req() req: ReqSale,
    @Body() createItemDto: CreateItemDto
  ) {
    return this.salesService.createItem(req.sale, createItemDto)
  }

  @Delete(':idSale/items/:idItem')
  deleteItem(
    @Req() req: ReqSale,
    @Param('idItem', ParseMongoIdPipe) idItem: string,
  ) {
    return this.salesService.deleteItem(req.sale, idItem)
  }

  // Product Sale Sold
  @Post(':idSale/sold-products')
  registerSoldProduct(
    @Req() reqSale: ReqSale,
    @Body() createSoldProductDto: CreateSoldProductDto
  ) {
    return this.salesService.registerSoldProduct(reqSale.sale, createSoldProductDto);
  }

  @Get('products-sold/:idProduct')
  getOneSoldProduct(
    @Param('idProduct', ParseMongoIdPipe) idProduct: string
  ) {
    return this.salesService.getOneSoldProduct(idProduct);
  }

  @Patch('products-sold/:idProduct')
  editSoldProduct(
    @Param('idProduct', ParseMongoIdPipe) idProduct: string,
    @Body() editSoldProductDto: EditSoldProductDto
  ) {
    return this.salesService.editSoldProduct(idProduct, editSoldProductDto);
  }

  @Delete('products-sold/:idProduct')
  deleteProductSold(
    @Param('idProduct', ParseMongoIdPipe) idProduct: string
  ) {
    return this.salesService.deleteSoldProduct(idProduct);
  }

  @Post(':idSale/return-products')
  returnProducts(
    @Req() reqSale: ReqSale
  ) {
    return this.salesService.returnProducts(reqSale.sale)
  }

  @Post('/products-sold/history')
  getPayments(
    @Body() productsSoldDto: SaleHistoryDto
  ) {
    return this.salesService.getAllProductsSold(productsSoldDto);
  }

  // Generate Guide Sale
  @Post(':idSale/guide')
  async SaleGuidePDF(
    @Req() reqSale: ReqSale,
    @Res() response: Response,
  ) {
    const pdfDoc = await this.salesService.generateSaleGuide(reqSale.sale);
    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @Post('export/xml')
  async exportToExcel(
    @Body() saleReporExcelDto: SaleHistoryDto,
    @Res() res: Response
  ) {
    await this.salesService.exportToExcel(saleReporExcelDto, res);
  }
}
