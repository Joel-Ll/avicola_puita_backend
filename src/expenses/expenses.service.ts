import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './schemas/expense.schema';
import { getExpenseReport } from 'src/reports';
import { PrinterService } from 'src/printer/printer.service';
import { GenerateReportDto } from './dto/generate-report.dto';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(Expense.name)

  constructor(
    @InjectModel(Expense.name)
    private readonly expenseModel: Model<Expense>,

    private readonly printerService: PrinterService,
  ) { }

  public async create(createExpenseDto: CreateExpenseDto) {
    try {
      const expense = new this.expenseModel(createExpenseDto);
      await expense.save();
      return 'Gasto registrado correctamente';
    } catch (error) {
      this.handleError(error);
    }
  }

  public async findAll() {
    try {
      const expenses = await this.expenseModel.find()
        .sort({ createdAt: -1 })
        .select({ category: 1, description: 1, amount: 1, date: 1 })
      return expenses;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async findOne(id: string) {
    const expense = await this.expenseModel.findById(id).select({ category: 1, description: 1, amount: 1, date: 1 });
    if (!expense) throw new NotFoundException('Gasto no encontrado');
    return expense;
  }

  public async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    const updated = await this.expenseModel.findByIdAndUpdate(id, updateExpenseDto);
    if (updated === null)
      throw new NotFoundException('Gasto no encontrado');

    return 'Actualizado correctamente';
  }

  public async remove(id: string) {
    const updated = await this.expenseModel.findByIdAndDelete(id);
    if (updated === null)
      throw new NotFoundException('Gasto no encontrado');

    return 'Eliminado correctamente';
  }

  public async getReportExpense(generateReportDto: GenerateReportDto) {
    const { category, fromDate, toDate } = generateReportDto;

    const filters: any = {
      date: {
        $gte: fromDate,
        $lte: toDate
      }
    }

    if (category !== 'all') {
      filters.category = category
    }

    const data = await this.expenseModel.find(filters)
      .sort({ createdAt: -1 })
      .select({ description: 1, amount: 1, date: 1 })

    if (!data || data.length === 0) {
      console.log('entra');
      throw new BadRequestException('No hay registros');
    }
    const docDefinition = getExpenseReport({ data, subTitle: 'Registro de Gastos' })
    return this.printerService.createPdf(docDefinition)
  }

  private handleError(error: any) {
    this.logger.error(error)
    throw new InternalServerErrorException('Error - Please check server logs')
  }
}
