import { Response } from 'express';
import { Body, Controller, Delete, Get, Param, Patch, Post, Res } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { PaymentsReporExcelDto } from '../dto/export-to-excel.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('payments')
@Auth()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService
  ) { }

  @Post()
  getPayments(
    @Body() paymentsReporExcelDto: PaymentsReporExcelDto
  ) {
    return this.paymentsService.getAllPayments(paymentsReporExcelDto);
  }

  @Get(':idPayment')
  getOnePayment(
    @Param('idPayment', ParseMongoIdPipe) idPayment: string
  ) {
    return this.paymentsService.getOnePayment(idPayment);
  }

  @Patch(':idPayment')
  updatePayment(
    @Param('idPayment', ParseMongoIdPipe) idPayment: string,
    @Body() updatePaymentDto: UpdatePaymentDto
  ) {
    return this.paymentsService.editPayment(idPayment, updatePaymentDto)
  }

  @Delete(':idPayment')
  deletePayment(
    @Param('idPayment', ParseMongoIdPipe) idPayment: string
  ) {
    return this.paymentsService.deletePayment(idPayment);
  }

  @Post('export')
  async exportToExcel(
    @Body() paymentsReporExcelDto: PaymentsReporExcelDto,
    @Res() res: Response
  ) {
    await this.paymentsService.exportToExcel(paymentsReporExcelDto, res);
  }
}
