import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { format, eachMonthOfInterval, parse } from "date-fns";
import { es } from "date-fns/locale";

import { ShedDocument } from '../schemas/shed.schema';
import { HealthManagement } from '../schemas/health-management.schema';
import { Low, LowDocument } from '../schemas/low.schema';
import { Sick } from '../schemas/sick.schema';
import { Recovered } from '../schemas/recovered.schema';
import { GetRateDto } from '../dto/sheds/get-rate.dto';
import { RegisterWeightDto } from '../dto/sheds/register-weight.dto';
import { Growth } from '../interfaces/health-management.interface';
import { ShedUtils } from 'src/utils/shed.utils';

@Injectable()
export class HealthManagementService {
  private readonly logger = new Logger(HealthManagementService.name)

  constructor(
    @InjectModel(Low.name)
    private readonly lowModel: Model<Low>,

    @InjectModel(Sick.name)
    private readonly sickModel: Model<Sick>,

    @InjectModel(Recovered.name)
    private readonly recoveredModel: Model<Recovered>,

    @InjectModel(HealthManagement.name)
    private readonly healthManagementModel: Model<HealthManagement>
  ) { }

  public async createHealthManagement(shed: ShedDocument) {
    if (shed.healthManagement)
      throw new BadRequestException(`El galpon: (${shed.name}) ya tiene un seguimiento activo`);

    try {
      const healthManagement = new this.healthManagementModel({ shed: shed._id });
      shed.healthManagement = healthManagement._id;
      healthManagement.dateRange.fromDate = shed.initialDate;

      const timeLineHealth: Growth[] = [
        { week: 0, minWeight: 0, maxWeight: 0, currentWeight: 0 },
        { week: 2, minWeight: 170, maxWeight: 170, currentWeight: null },
        { week: 4, minWeight: 370, maxWeight: 380, currentWeight: null },
        { week: 6, minWeight: 570, maxWeight: 600, currentWeight: null },
        { week: 8, minWeight: 760, maxWeight: 810, currentWeight: null },
        { week: 10, minWeight: 930, maxWeight: 1010, currentWeight: null },
        { week: 12, minWeight: 1100, maxWeight: 1190, currentWeight: null },
        { week: 14, minWeight: 1250, maxWeight: 1350, currentWeight: null },
        { week: 16, minWeight: 1390, maxWeight: 1490, currentWeight: null },
        { week: 18, minWeight: 1510, maxWeight: 1610, currentWeight: null },
        { week: 20, minWeight: 1605, maxWeight: 1700, currentWeight: null },
        { week: 22, minWeight: 1680, maxWeight: 1770, currentWeight: null },
        { week: 24, minWeight: 1740, maxWeight: 1830, currentWeight: null },
        { week: 26, minWeight: 1785, maxWeight: 1870, currentWeight: null },
        { week: 28, minWeight: 1810, maxWeight: 1900, currentWeight: null },
        { week: 30, minWeight: 1820, maxWeight: 1910, currentWeight: null },
        { week: 32, minWeight: 1810, maxWeight: 1910, currentWeight: null },
      ];

      healthManagement.reportGrowth = timeLineHealth;
      await shed.save();
      await healthManagement.save();
      return 'Registrado correctamente';
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getOneHealthManagement(trackingId: string) {
    const tracking = await this.healthManagementModel
      .findById(trackingId)
      .populate('shed', { name: 1, initialDate: 1, initialStock: 1, currentStock: 1 })
      .exec();

    if (!tracking) throw new NotFoundException('gestión no encontrado');

    if (!tracking.dateRange.toDate) {
      const { initialStock } = tracking.shed as any;
      const dateRangeFilter = {
        dateRegister: {
          $gte: tracking.dateRange.fromDate,
          $lte: new Date(),
        },
      };

      const lowsRegister = await this.lowModel.find({
        shedId: tracking.shed,
        sick: false,
        ...dateRangeFilter,
      });

      const lowsObsRegister = await this.lowModel.find({
        shedId: tracking.shed,
        sick: true,
        ...dateRangeFilter,
      });

      const sicksRegister = await this.sickModel.find({
        shedId: tracking.shed,
        ...dateRangeFilter,
      });

      const recoveredRegister = await this.recoveredModel.find({
        shedId: tracking.shed,
        ...dateRangeFilter,
      });

      tracking.reportHealth.lowsCount = lowsRegister.reduce((acc, low) => acc + low.quantity, 0);
      tracking.reportHealth.lowsObsCount = lowsObsRegister.reduce((acc, low) => acc + low.quantity, 0);
      tracking.reportHealth.sicksCount = sicksRegister.reduce((acc, sick) => acc + sick.quantity, 0);
      tracking.reportHealth.recoveredCount = recoveredRegister.reduce((acc, rec) => acc + rec.quantity, 0);
      tracking.reportHealth.tasaLow = parseFloat(((tracking.reportHealth.lowsCount / initialStock) * 100).toFixed(2));
      tracking.reportHealth.tasaLowObs = parseFloat(((tracking.reportHealth.lowsObsCount / initialStock) * 100).toFixed(2))
      tracking.reportHealth.tasaSick = parseFloat(((tracking.reportHealth.sicksCount / initialStock) * 100).toFixed(2))
      tracking.reportHealth.tasaRecovered = parseFloat(((tracking.reportHealth.recoveredCount / initialStock) * 100).toFixed(2))
      await tracking.save();
    }
    return tracking;
  }

  public async getAllHealthManagement() {
    try {
      return this.healthManagementModel.find({}, { createdAt: 1 }).populate('shed', { name: 1 });
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getRates(trackingId: string, getRateDto: GetRateDto) {
    const { fromDate, toDate } = getRateDto;

    const tracking = await this.healthManagementModel
      .findById(trackingId)
      .populate('shed', { initialDate: 1, initialStock: 1, currentStock: 1 })
      .exec();

    if (!tracking) throw new NotFoundException('gestión no encontrada');
    const { initialStock, initialDate } = tracking.shed as any;

    const isValidDataRange = ShedUtils.isValidDataRange(
      fromDate.toISOString().split('T')[0],
      toDate.toISOString().split('T')[0],
      initialDate.toISOString().split('T')[0]
    );

    if (!isValidDataRange) throw new BadRequestException('rango de fecha no valido');

    const allLowsRegister = await this.lowModel.find({
      shedId: tracking.shed,
      dateRegister: { $gte: initialDate, $lte: toDate },
    });

    const lows = allLowsRegister.filter(low => low.sick === false);
    const lowsObs = allLowsRegister.filter(low => low.sick === true);

    const lowsBeforeFromDate = allLowsRegister.filter(low => low.dateRegister < fromDate);

    const lowsInRange = lows.filter(low => low.dateRegister >= fromDate && low.dateRegister <= toDate);
    const lowsObsInRange = lowsObs.filter(low => low.dateRegister >= fromDate && low.dateRegister <= toDate);

    const lowsCountInitFrom = lowsBeforeFromDate.reduce((acc, low) => acc + low.quantity, 0);
    const lowsCount = lowsInRange.reduce((acc, low) => acc + low.quantity, 0);
    const lowsObsCount = lowsObsInRange.reduce((acc, low) => acc + low.quantity, 0);

    const currentStock = initialStock - lowsCountInitFrom;
    const tasaLow = parseFloat(((lowsCount / Math.max(currentStock, 1)) * 100).toFixed(2));
    const tasaLowObs = parseFloat(((lowsObsCount / Math.max(currentStock, 1)) * 100).toFixed(2));

    //* Calculo para registros de tasa de enfermedad
    const allSicksRegister = await this.sickModel.find({
      shedId: tracking.shed,
      dateRegister: { $gte: fromDate, $lte: toDate },
    });

    const sicksCount = allSicksRegister.reduce((acc, sick) => acc + sick.quantity, 0);
    const tasaSick = parseFloat(((sicksCount / Math.max(currentStock, 1)) * 100).toFixed(2));

    // * Calculo para registros de tasa de recuperacion
    const allRecoveredRegister = await this.recoveredModel.find({
      shedId: tracking.shed,
      dateRegister: { $gte: fromDate, $lte: toDate },
    });

    const recoveredCount = allRecoveredRegister.reduce((acc, rec) => acc + rec.quantity, 0);
    const tasaRecovered = parseFloat(((recoveredCount / Math.max(currentStock, 1)) * 100).toFixed(2));

    //* Registro de time line
    const groupByMonth = (data: LowDocument[]) =>
      data.reduce((acc, item) => {
        const month = format(new Date(item.dateRegister), "MMM yyyy", { locale: es });

        if (!acc[month])
          acc[month] = { month, lowsCount: 0, lowsObsCount: 0, sicksCount: 0, recoveredCount: 0 };

        acc[month].lowsCount += item.quantity || 0;
        return acc;
      }, {} as Record<string, { month: string; lowsCount: number; lowsObsCount: number; sicksCount: number; recoveredCount: number }>);

    const monthlyData = groupByMonth(lowsInRange);

    lowsObsInRange.forEach((item) => {
      const month = format(new Date(item.dateRegister), "MMM yyyy", { locale: es });
      monthlyData[month] = monthlyData[month] || { month, lowsCount: 0, lowsObsCount: 0, sicksCount: 0, recoveredCount: 0 };
      monthlyData[month].lowsObsCount += item.quantity || 0;
    });

    allSicksRegister.forEach((item) => {
      const month = format(new Date(item.dateRegister), "MMM yyyy", { locale: es });
      monthlyData[month] = monthlyData[month] || { month, lowsCount: 0, lowsObsCount: 0, sicksCount: 0, recoveredCount: 0 };
      monthlyData[month].sicksCount += item.quantity || 0;
    });

    allRecoveredRegister.forEach((item) => {
      const month = format(new Date(item.dateRegister), "MMM yyyy", { locale: es });
      monthlyData[month] = monthlyData[month] || { month, lowsCount: 0, lowsObsCount: 0, sicksCount: 0, recoveredCount: 0 };
      monthlyData[month].recoveredCount += item.quantity || 0;
    });

    const allMonthsInRange = eachMonthOfInterval({ start: fromDate, end: toDate }).map((date) =>
      format(date, "MMM yyyy", { locale: es })
    );

    allMonthsInRange.forEach((month) => {
      if (!monthlyData[month]) {
        monthlyData[month] = { month, lowsCount: 0, lowsObsCount: 0, sicksCount: 0, recoveredCount: 0 };
      }
    });

    const sortedMonthlyData = Object.values(monthlyData).sort((a, b) => {
      const dateA = parse(a.month, "MMM yyyy", new Date(), { locale: es });
      const dateB = parse(b.month, "MMM yyyy", new Date(), { locale: es });
      return dateA.getTime() - dateB.getTime();
    });

    tracking.reportHealth.lowsCount = lowsCount;
    tracking.reportHealth.lowsObsCount = lowsObsCount;
    tracking.reportHealth.sicksCount = sicksCount
    tracking.reportHealth.recoveredCount = recoveredCount
    tracking.reportHealth.tasaLow = tasaLow;
    tracking.reportHealth.tasaLowObs = tasaLowObs;
    tracking.reportHealth.tasaSick = tasaSick;
    tracking.reportHealth.tasaRecovered = tasaRecovered;
    tracking.timeLineHealth = sortedMonthlyData
    tracking.dateRange.fromDate = fromDate;
    tracking.dateRange.toDate = toDate;

    try {
      await tracking.save();
      return true;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async registerWeight(trackingId: string, registerWeightDto: RegisterWeightDto) {
    const { week, weight } = registerWeightDto;
    if (week % 2 !== 0 || week > 32)
      throw new BadRequestException('Semana no válida');

    const healthManagement = await this.healthManagementModel.findById(trackingId);
    if (!healthManagement) throw new NotFoundException('Gestión no encontrada');

    healthManagement.reportGrowth = healthManagement.reportGrowth.map(item => {
      if (week === item.week) {
        item.currentWeight = weight === 0 ? null : weight;
      }
      return item
    });

    try {
      await healthManagement.save();
      return 'Registrado correctamente';
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    this.logger.error(error);
    throw new InternalServerErrorException('Error - Please check server logs')
  }
}