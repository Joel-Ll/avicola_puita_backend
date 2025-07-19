import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ShedDocument } from '../schemas/shed.schema';
import { HealthManagement } from '../schemas/health-management.schema';
import { Low } from '../schemas/low.schema';
import { Sick } from '../schemas/sick.schema';
import { Recovered } from '../schemas/recovered.schema';
import { GetRateDto } from '../dto/sheds/get-rate.dto';
import { RegisterWeightDto } from '../dto/sheds/register-weight.dto';
import { Growth } from '../interfaces/health-management.interface';

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
      throw new BadRequestException(`El galpon: (${shed.name}) ya tiene un registro sanitario`);

    try {
      const healthManagement = new this.healthManagementModel({ shed: shed._id });
      shed.healthManagement = healthManagement._id;

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

    if (!tracking) throw new NotFoundException('Registro no encontrado');

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
    const { timeRange } = getRateDto;

    const tracking = await this.healthManagementModel
      .findById(trackingId)
      .populate('shed', { initialDate: 1, initialStock: 1, currentStock: 1 })
      .exec();

    if (!tracking) throw new NotFoundException('Registro no encontrado');

    const { initialStock } = tracking.shed as any;

    const populationBase = Math.max(initialStock, 1);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - timeRange);

    const [lowsRecord, sicksRecord, recoveredsRecord] = await Promise.all([
      this.lowModel.find({
        shedId: tracking.shed,
        dateRegister: {
          $gte: startDate,
          $lte: endDate
        }
      }).exec(),
      this.sickModel.find({
        shedId: tracking.shed,
        dateRegister: {
          $gte: startDate,
          $lte: endDate
        }
      }).exec(),
      this.recoveredModel.find({
        shedId: tracking.shed,
        dateRegister: {
          $gte: startDate,
          $lte: endDate
        }
      }).exec()
    ]);

    // Clasificación de bajas
    const lows = lowsRecord.filter(low => low.sick === false);
    const lowsObs = lowsRecord.filter(low => low.sick === true);

    // Cálculo de cantidades
    const lowsCount = lows.reduce((acc, low) => acc + low.quantity, 0);
    const lowsObsCount = lowsObs.reduce((acc, low) => acc + low.quantity, 0);
    const sicksCount = sicksRecord.reduce((acc, sick) => acc + sick.quantity, 0);
    const recoveredCount = recoveredsRecord.reduce((acc, rec) => acc + rec.quantity, 0);

    // Cálculo de tasas 
    const tasaLow = parseFloat(((lowsCount / populationBase) * 100).toFixed(2));
    const tasaLowObs = parseFloat(((lowsObsCount / populationBase) * 100).toFixed(2));
    const tasaSick = parseFloat(((sicksCount / populationBase) * 100).toFixed(2));
    const tasaRecovered = parseFloat(((recoveredCount / populationBase) * 100).toFixed(2));

    // Mapeo de datos temporales
    const timeLineHealth = new Map<string, {
      date: Date;
      lowsRecord: number;
      sicksRecord: number;
      recoveredsRecord: number;
    }>();


    // Inicialización del timeline
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      timeLineHealth.set(dateKey, {
        date: new Date(currentDate),
        lowsRecord: 0,
        sicksRecord: 0,
        recoveredsRecord: 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Procesamiento de registros
    lowsRecord.forEach(low => {
      const dateKey = low.dateRegister.toISOString().split('T')[0];
      const dayData = timeLineHealth.get(dateKey) || { date: low.dateRegister, lowsRecord: 0, sicksRecord: 0, recoveredsRecord: 0 };
      dayData.lowsRecord += low.quantity;
      timeLineHealth.set(dateKey, dayData);
    });

    sicksRecord.forEach(sick => {
      const dateKey = sick.dateRegister.toISOString().split('T')[0];
      const dayData = timeLineHealth.get(dateKey) || { date: sick.dateRegister, lowsRecord: 0, sicksRecord: 0, recoveredsRecord: 0 };
      dayData.sicksRecord += sick.quantity;
      timeLineHealth.set(dateKey, dayData);
    });

    recoveredsRecord.forEach(rec => {
      const dateKey = rec.dateRegister.toISOString().split('T')[0];
      const dayData = timeLineHealth.get(dateKey) || { date: rec.dateRegister, lowsRecord: 0, sicksRecord: 0, recoveredsRecord: 0 };
      dayData.recoveredsRecord += rec.quantity;
      timeLineHealth.set(dateKey, dayData);
    });

    // Formateo de resultados
    const result = Array.from(timeLineHealth.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(item => ({
        date: item.date.toISOString().split('T')[0],
        lowsRecord: Number(item.lowsRecord),
        sicksRecord: Number(item.sicksRecord),
        recoveredsRecord: Number(item.recoveredsRecord),
      }));

    // Formateo de meses
    const formatter = new Intl.DateTimeFormat('es-ES', { month: 'long' });
    const formatMonth = (date: Date) => {
      const month = formatter.format(date);
      return month.charAt(0).toUpperCase() + month.slice(1);
    };

    const startMonth = formatMonth(startDate);
    const endMonth = formatMonth(endDate);

    try {
      return {
        monthRange: `${startMonth} - ${endMonth}`,
        chartData: result,
        totalLows: lowsCount,
        totalLowsObs: lowsObsCount,
        totalSicks: sicksCount,
        totalRecovereds: recoveredCount,
        tasaLow,
        tasaLowObs,
        tasaSick,
        tasaRecovered,
      };
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