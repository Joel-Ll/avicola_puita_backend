import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { count } from 'console';
import { Model } from 'mongoose';
import { Customer } from 'src/customers/schemas/customer.schema';
import { Order } from 'src/customers/schemas/order.schema';
import { Payment } from 'src/customers/schemas/payment.schema';
import { Expense } from 'src/expenses/schemas/expense.schema';
import { ProductSold } from 'src/sales/schemas/product-sold';
import { Sale } from 'src/sales/schemas/sale.schema';
import { SummaryEggRegistersDto } from './dto/summary-egg-registers';
import { EggRegister } from 'src/sheds/schemas/egg-register.schema';
import { SummaryFinancialDto } from './dto/summary-financial.dto';

@Injectable()
export class DashboardService {
  private logger = new Logger(DashboardService.name);

  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<Customer>,

    @InjectModel(ProductSold.name)
    private readonly productSold: Model<ProductSold>,

    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,

    @InjectModel(Sale.name)
    private readonly saleModel: Model<Sale>,

    @InjectModel(Payment.name)
    private readonly paymentModel: Model<Payment>,

    @InjectModel(Expense.name)
    private readonly expenseModel: Model<Expense>,

    @InjectModel(EggRegister.name)
    private readonly eggRegistersModel: Model<EggRegister>,

    @InjectModel(ProductSold.name)
    private readonly productSoldModel: Model<ProductSold>,
  ) { }

  // Clientes - Pedidos - Ventas - Ingresos - Egresos
  public async getGeneralSummary() {
    const customers = await this.customerModel.countDocuments();
    const orders = await this.orderModel.find({ state: 'finalized' }).countDocuments();
    const sales = await this.saleModel.find({ state: 'finalized' }).countDocuments();
    const payments = await this.paymentModel.find({});
    const productsSold = await this.productSold.find({});
    const expenses = await this.expenseModel.find({});

    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalSales = productsSold.reduce((sum, product) => sum + product.amount, 0);
    const totalIncome = totalPayments + totalSales;
    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return [
      {
        label: 'Clientes',
        count: customers,
        color: 'blue'
      },
      {
        label: 'Pedidos finalizados',
        count: orders,
        color: 'red'
      },
      {
        label: 'Ventas finalizadas',
        count: sales,
        color: 'green'
      },
      {
        label: 'Ingresos',
        count: totalIncome,
        color: 'yellow'
      },
      {
        label: 'Egresos',
        count: totalExpense,
        color: 'pink'
      }
    ]
  }

  public async getSummaryEggRegisters(summaryEggRegistersDto: SummaryEggRegistersDto) {
    const { shed, timeRange } = summaryEggRegistersDto;
    // Calcular fechas de inicio y fin
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - timeRange);

    // Obtener registros existentes en el rango
    const existingRegisters = await this.eggRegistersModel.find({
      shed,
      dateRegister: {
        $gte: startDate,
        $lte: endDate
      }
    }).exec();

    // Crear mapa de registros por fecha para fácil acceso
    const registersByDate = new Map<string, number>();
    existingRegisters.forEach(register => {
      const dateStr = register.dateRegister.toISOString().split('T')[0];
      registersByDate.set(dateStr, register.totalQuantity);
    });

    // Generar el rango completo de días
    const result = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        totalQuantity: registersByDate.get(dateStr) || 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return result;
  }

  public async getSummaryFinancial(summaryFinancialDto: SummaryFinancialDto) {
    const { timeRange } = summaryFinancialDto;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - timeRange);

    const [expenses, productsSold, payments] = await Promise.all([
      this.expenseModel.find({
        date: { $gte: startDate, $lte: endDate }
      }).exec(),
      this.productSoldModel.find({
        date: { $gte: startDate, $lte: endDate }
      }).exec(),
      this.paymentModel.find({
        date: { $gte: startDate, $lte: endDate }
      }).exec()
    ]);

    // Crear mapa para almacenar los datos por fecha
    const dailySummary = new Map<string, {
      date: Date;
      income: number;
      expense: number;
    }>();
    let totalIncome = 0;
    let totalExpense = 0;

    // Procesar gastos (egresos)
    expenses.forEach(expense => {
      totalExpense += expense.amount;
    });

    // Procesar ingresos (products sold + payments)
    productsSold.forEach(product => {
      totalIncome += product.amount;
    });

    payments.forEach(payment => {
      totalIncome += payment.amount;
    });

    // Inicializar todas las fechas en el rango
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailySummary.set(dateKey, {
        date: new Date(currentDate),
        income: 0,
        expense: 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    expenses.forEach(expense => {
      const dateKey = expense.date.toISOString().split('T')[0];
      const dayData = dailySummary.get(dateKey) || { date: expense.date, income: 0, expense: 0 };
      dayData.expense += expense.amount;
      dailySummary.set(dateKey, dayData);
    });

    // Procesar productos vendidos (ingresos)
    productsSold.forEach(product => {
      const dateKey = product.createdAt.toISOString().split('T')[0];
      const dayData = dailySummary.get(dateKey) || { date: product.createdAt, income: 0, expense: 0 };
      dayData.income += product.amount;
      dailySummary.set(dateKey, dayData);
    });

    // Procesar pagos (ingresos)
    payments.forEach(payment => {
      const dateKey = payment.createdAt.toISOString().split('T')[0];
      const dayData = dailySummary.get(dateKey) || { date: payment.createdAt, income: 0, expense: 0 };
      dayData.income += payment.amount;
      dailySummary.set(dateKey, dayData);
    });

    // Convertir a array ordenado por fecha
    const result = Array.from(dailySummary.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(item => ({
        date: item.date.toISOString().split('T')[0],
        income: Number(item.income.toFixed(2)),
        expense: Number(item.expense.toFixed(2)),
      }));

    // Retornar los meses del rango de fechas
    const formatter = new Intl.DateTimeFormat('es-ES', { month: 'long' });
    const formatMonth = (date: Date) => {
      const month = formatter.format(date);
      return month.charAt(0).toUpperCase() + month.slice(1);
    };
    const startMonth = formatMonth(startDate);
    const endMonth = formatMonth(endDate);

    return {
      data: result,
      summary: [
        {
          financial: 'Ingresos',
          totalAmount: totalIncome,
          fill: "var(--color-income)"
        },
        {
          financial: 'Egresos',
          totalAmount: totalExpense,
          fill: "var(--color-expense)"
        }
      ],
      monthRange: `${startMonth} - ${endMonth}`
    };
  }
}
