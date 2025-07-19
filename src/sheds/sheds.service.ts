import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { isMongoId } from 'class-validator';

import { CreateShedDto, UpdateShedDto } from './dto';
import { SelectShedDto } from './dto/sheds/select-shed.dto';

import { EggRegister } from './schemas/egg-register.schema';
import { Event } from './schemas/event.schema';
import { HealthManagement } from './schemas/health-management.schema';
import { Low } from './schemas/low.schema';
import { Recovered } from './schemas/recovered.schema';
import { Shed, ShedDocument } from './schemas/shed.schema';
import { Sick } from './schemas/sick.schema';
import { VaccineControl } from './schemas/vaccine-control.schema';

@Injectable()
export class ShedsService {
  private readonly logger = new Logger(ShedsService.name);

  constructor(
    @InjectConnection()
    private readonly connection: Connection,

    @InjectModel(Shed.name)
    private readonly shedModel: Model<Shed>,

    @InjectModel(Low.name)
    private readonly lowModel: Model<Low>,

    @InjectModel(Sick.name)
    private readonly sickModel: Model<Sick>,

    @InjectModel(Recovered.name)
    private readonly recoveredModel: Model<Recovered>,

    @InjectModel(EggRegister.name)
    private readonly eggRegisterModel: Model<EggRegister>,

    @InjectModel(VaccineControl.name)
    private readonly vaccineControlModel: Model<VaccineControl>,

    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,

    @InjectModel(HealthManagement.name)
    private readonly healthManagementModel: Model<HealthManagement>
  ) { }

  public async create(createShedDto: CreateShedDto) {
    const shed = new this.shedModel(createShedDto);
    shed.slug = shed.name.toLowerCase().replaceAll(' ', '_').replaceAll("'", '')

    const shedExists = await this.shedModel.findOne({ slug: shed.slug });
    if (shedExists)
      throw new ConflictException(`El registro (${shed.name}) ya existe`);

    try {
      await shed.save();
      return 'Registrado correctamente';
    } catch (error) {
      this.handleError(error)
    }
  }

  public async findAll() {
    try {
      const sheds = await this.shedModel.find({});
      return sheds
    } catch (error) {
      this.handleError(error);
    }
  }

  public findOne(shed: ShedDocument) {
    return shed;
  }

  public async update(reqShed: ShedDocument, updateShedDto: UpdateShedDto) {
    const { name, state, initialDate, initialStock } = updateShedDto;
    reqShed.name = name;
    reqShed.state = state;
    reqShed.initialDate = initialDate;
    reqShed.initialStock = initialStock;
    reqShed.currentStock = initialStock - reqShed.lowsCount;
    reqShed.slug = name.toLowerCase().replaceAll(' ', '_').replaceAll("'", '')

    if (reqShed.currentStock < 0)
      throw new BadRequestException('Cantidad no válida');

    const session = await this.connection.startSession()
    session.startTransaction();

    const shedExists = await this.shedModel.findOne({
      slug: reqShed.slug,
      _id: { $ne: reqShed._id }
    }).session(session);

    if (shedExists)
      throw new ConflictException(`El registro (${reqShed.name}) ya existe`);

    if (initialStock === 0) {
      reqShed.initialStock = 0;
      reqShed.currentStock = 0;
      reqShed.initialDate = null;
      reqShed.lowsCount = 0;
      reqShed.sicksCount = 0;
      reqShed.recoveredCount = 0;
      reqShed.state = 'inactive';

      await this.lowModel.deleteMany({ shedId: reqShed._id }).session(session)
      await this.sickModel.deleteMany({ shedId: reqShed._id }).session(session)
      await this.recoveredModel.deleteMany({ shedId: reqShed._id }).session(session)
      await this.eggRegisterModel.deleteMany({ shedId: reqShed._id }).session(session)

      if (reqShed.vaccineControl) {
        const vaccineControl = await this.vaccineControlModel.findById(reqShed.vaccineControl).session(session);
        const eventIds = vaccineControl.events.flatMap(event => event._id);
        if (eventIds.length) {
          await this.eventModel.deleteMany({ _id: { $in: eventIds } }).session(session);
        }
        await vaccineControl.deleteOne().session(session);
        reqShed.vaccineControl = null;
      }

      if (reqShed.healthManagement) {
        await this.healthManagementModel.findByIdAndDelete({ _id: reqShed.healthManagement }).session(session);
        reqShed.healthManagement = null;
      }
    }

    try {
      await reqShed.save({ session });
      await session.commitTransaction();
      return 'Actualizado correctamente';
    } catch (error) {
      await session.abortTransaction()
      this.handleError(error);
    } finally {
      await session.endSession();
    }
  }

  public async removeMany(ids: string[]) {
    const session = await this.connection.startSession();
    session.startTransaction();

    const vaccineControls = await this.vaccineControlModel.find({ shed: { $in: ids } }).session(session);
    const vaccineControlIds = vaccineControls.map((control) => control._id);
    const eventIds = vaccineControls.flatMap(control => control.events);

    const healthManagement = await this.healthManagementModel.find({ shed: { $in: ids } }).session(session)
    const healthManagementIds = healthManagement.map(item => item._id);

    const countVaccineControlIds = vaccineControlIds.map(id => id.toString());
    const countEventIds = eventIds.map(event => event._id.toString());
    const countHealthManagementIds = healthManagementIds.map(item => item._id.toString());

    const eggsRegisters = await this.eggRegisterModel.find({ shed: { $in: ids } });
    const eggsRegistersIds = eggsRegisters.map(item => item._id);
    const countEggsRegistersIds = eggsRegistersIds.map(item => item._id.toString());


    try {
      await this.lowModel.deleteMany({ shedId: { $in: ids } }).session(session);
      await this.sickModel.deleteMany({ shedId: { $in: ids } }).session(session);
      await this.recoveredModel.deleteMany({ shedId: { $in: ids } }).session(session);
      await this.eggRegisterModel.deleteMany({ shedId: { $in: ids } }).session(session)
      await this.eventModel.deleteMany({ _id: { $in: eventIds } }).session(session);
      await this.vaccineControlModel.deleteMany({ _id: { $in: vaccineControlIds } }).session(session);
      await this.healthManagementModel.deleteMany({ _id: { $in: healthManagementIds } }).session(session);
      await this.shedModel.deleteMany({ _id: { $in: ids } }).session(session);
      await this.eggRegisterModel.deleteMany({ _id: { $in: eggsRegistersIds } }).session(session);

      await session.commitTransaction();
      return {
        message: 'Eliminado correctamente',
        countVaccineControlIds,
        countEventIds,
        countHealthManagementIds,
        countEggsRegistersIds
      };
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      session.endSession();
    }
  }

  public async getSelect(selectShedDto: SelectShedDto) {
    const { shedOption } = selectShedDto;
    const report = {
      initialStock: 0,
      currentStock: 0,
      lowsCount: 0,
      sicksCount: 0,
      recoveredCount: 0,
      initialDate: null
    }

    if (isMongoId(shedOption)) {
      const shed = await this.shedModel.findById(shedOption);
      report.initialStock = shed.initialStock;
      report.currentStock = shed.currentStock;
      report.lowsCount = shed.lowsCount;
      report.sicksCount = shed.sicksCount;
      report.recoveredCount = shed.recoveredCount;
      report.initialDate = shed.initialDate
      return report;
    }

    const sheds = await this.shedModel.find({});
    sheds.forEach(shed => {
      report.initialStock += shed.initialStock;
      report.currentStock += shed.currentStock;
      report.lowsCount += shed.lowsCount;
      report.sicksCount += shed.sicksCount;
      report.recoveredCount += shed.recoveredCount;
    });
    return report;
  }

  public async resetShed(reqShed: ShedDocument) {
    const session = await this.connection.startSession();
    session.startTransaction();

    reqShed.state = 'inactive';
    reqShed.initialDate = null;
    reqShed.initialStock = 0;
    reqShed.currentStock = 0;
    reqShed.lowsCount = 0;
    reqShed.sicksCount = 0;
    reqShed.recoveredCount = 0;

    try {
      await this.lowModel.deleteMany({ shedId: reqShed._id }).session(session);
      await this.sickModel.deleteMany({ shedId: reqShed._id }).session(session);
      await this.recoveredModel.deleteMany({ shedId: reqShed._id }).session(session);
      await this.eggRegisterModel.deleteMany({ shed: reqShed._id }).session(session);

      if (reqShed.vaccineControl) {
        const vaccineControl = await this.vaccineControlModel.findById(reqShed.vaccineControl).session(session);
        const eventIds = vaccineControl.events.flatMap(event => event._id);
        if (eventIds.length) {
          await this.eventModel.deleteMany({ _id: { $in: eventIds } }).session(session);
        }
        await vaccineControl.deleteOne().session(session);
        reqShed.vaccineControl = null;
      }

      if (reqShed.healthManagement) {
        await this.healthManagementModel.findByIdAndDelete({ _id: reqShed.healthManagement }).session(session);
        reqShed.healthManagement = null;
      }
      await reqShed.save({ session });
      await session.commitTransaction();
      return 'Reiniciado correctamente';
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      session.endSession();
    }
  }

  public async summaryRegister() {
    try {
      const [lows, sicks, recovereds] = await Promise.all([
        this.lowModel.find().populate('shedId', { name: true }).sort({ createdAt: -1 }).limit(5),
        this.sickModel.find().populate('shedId', { name: true }).sort({ createdAt: -1 }).limit(5),
        this.recoveredModel.find().populate('shedId', { name: true }).sort({ createdAt: -1 }).limit(5),
      ]);
      const combinedRecords = [...lows, ...sicks, ...recovereds];
      combinedRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const firstFiveRecords = combinedRecords.slice(0, 5);
      return firstFiveRecords;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async deleteRegister(registerId: string, reqShed: ShedDocument) {
    const low = await this.lowModel.findById(registerId);
    const sick = await this.sickModel.findById(registerId);
    const recovered = await this.recoveredModel.findById(registerId);

    if (low) {
      if (low.sick === true) {
        reqShed.lowsCount = reqShed.lowsCount - low.quantity;
        reqShed.sicksCount = reqShed.sicksCount + low.quantity;
        reqShed.currentStock = reqShed.currentStock + low.quantity;
      } else {
        reqShed.lowsCount = reqShed.lowsCount - low.quantity;
        reqShed.currentStock = reqShed.currentStock + low.quantity;
      }
      await low.deleteOne();
      await reqShed.save();
      return 'Se restauró correctamente';
    }

    if (sick) {
      reqShed.sicksCount = reqShed.sicksCount - sick.quantity;
      await sick.deleteOne();
      await reqShed.save();
      return 'Se restauró correctamente';
    }

    if (recovered) {
      reqShed.recoveredCount = reqShed.recoveredCount - recovered.quantity;
      reqShed.sicksCount = reqShed.sicksCount + recovered.quantity;
      await recovered.deleteOne();
      await reqShed.save();
      return 'Se restauró correctamente';
    }
  }

  private handleError(error: any) {
    this.logger.error(error)
    throw new InternalServerErrorException('Error - Please check server logs')
  }
}