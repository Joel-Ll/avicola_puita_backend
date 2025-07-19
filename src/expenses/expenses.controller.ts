import { Response } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { GenerateReportDto } from './dto/generate-report.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('expenses')
@Auth()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) { }

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  findAll() {
    return this.expensesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.expensesService.remove(id);
  }

  @Post('report/expenses')
  async getReportAsset(
    @Res() response: Response,
    @Body() generateReportDto: GenerateReportDto
  ) {
    const pdfDoc = await this.expensesService.getReportExpense(generateReportDto);
    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.pipe(response);
    pdfDoc.end()
  }
}
