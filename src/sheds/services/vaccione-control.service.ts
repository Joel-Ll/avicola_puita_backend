import { 
  BadRequestException, 
  Injectable, 
  InternalServerErrorException, 
  Logger, 
  NotFoundException 
} from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';

import { EggsService } from './eggs.service';

import { CreateVaccineControlDto } from '../dto/vaccine-control/create-vaccine-control.dto';
import { CreateEventDto } from '../dto/events/create-event.dto';
import { UpdateEventDto } from '../dto/events/update-event.dto';
import { UpdateVaccineControlDto } from '../dto/vaccine-control/update-vaccine-control.dto';
import { ChangeEventStateDto } from '../dto/events/change-event-state.dto';
import { RescheduleEventsDto } from '../dto/events/reschedule-events.dto';

import { Shed, ShedDocument } from '../schemas/shed.schema';
import { VaccineControl } from '../schemas/vaccine-control.schema';
import { Event } from '../schemas/event.schema';

import { ShedUtils } from 'src/utils/shed.utils';
import { eventState } from 'src/common/constants/event-state';

@Injectable()
export class VaccioneControlService {
  private readonly logger = new Logger(EggsService.name);

  constructor(
    @InjectConnection()
    private readonly connection: Connection,

    @InjectModel(VaccineControl.name)
    private readonly vaccineControlModel: Model<VaccineControl>,

    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,

    @InjectModel(Shed.name)
    private readonly shedModel: Model<Shed>
  ) { }

  public async createVaccineControl(shed: ShedDocument, createVaccioneControlDto: CreateVaccineControlDto) {
    const { adviser, phone, geneticLine, origin } = createVaccioneControlDto;

    if (shed.vaccineControl)
      throw new BadRequestException(`El ${shed.name} ya tiene un plan de vacunas`);

    const vaccioneControl = new this.vaccineControlModel({ adviser, phone, geneticLine, origin, shed: shed._id });
    shed.vaccineControl = vaccioneControl._id;

    try {
      await vaccioneControl.save();
      await shed.save();
      return `Registrado correctamente`;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async updateVaccineControl(vaccineControlId: string, updateVaccineControlDto: UpdateVaccineControlDto) {
    const vaccineControl = await this.vaccineControlModel.findById(vaccineControlId);
    if (!vaccineControl) throw new NotFoundException('No se encontró el plan de vacunas');
    try {
      await vaccineControl.updateOne(updateVaccineControlDto);
      return 'Actualizado correctamente';
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getVaccineControl(vaccineControlId: string) {
    const vaccineControl = await this.vaccineControlModel.findById(vaccineControlId)
      .populate('shed', {
        name: 1,
        initialStock: 1,
        initialDate: 1,
      }).populate({ path: 'events', options: { sort: { date: 1 } }, }).exec();

    if (!vaccineControl)
      throw new BadRequestException('Registro no encontrado');
    return vaccineControl;
  }

  public async getAllVaccineControl() {
    try {
      const events = await this.eventModel.find({});

      const bulkOperations = events.map((event) => {
        const { date, state: currentState } = event;
        const newState = ShedUtils.setStatusEvent(date, currentState);

        if (currentState !== newState) {
          return {
            updateOne: {
              filter: { _id: event._id },
              update: { state: newState },
            },
          };
        }
        return null;
      }).filter(Boolean);

      if (bulkOperations.length > 0) {
        await this.eventModel.bulkWrite(bulkOperations);
      }

      return await this.vaccineControlModel
        .find({}, { shed: true })
        .populate('shed', {
          name: 1,
          initialStock: 1,
        })
        .exec();
    } catch (error) {
      this.handleError(error);
    }
  }

  public async removeVaccineControl(vaccineControlId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();
    const vaccineControl = await this.vaccineControlModel.findById(vaccineControlId);
    if (!vaccineControl) throw new NotFoundException('Registro no encontrado');

    const shed = await this.shedModel.findById(vaccineControl.shed._id);
    if (!shed) throw new NotFoundException('Galpón no encontrado');
    shed.vaccineControl = null;

    try {
      const deletedEventIds = vaccineControl.events.map(event => event._id.toString());
      const deletedVaccineControlId = vaccineControl._id.toString();
      await this.eventModel.deleteMany({ _id: { $in: vaccineControl.events } }).session(session);
      await vaccineControl.deleteOne({ session });
      await shed.save({ session });
      await session.commitTransaction();
      return {
        message: 'Eliminado correctamente',
        deletedEventIds,
        deletedVaccineControlId,
      };
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      session.endSession();
    }
  }

  public async addEvent(vaccineControlId: string, createEventDto: CreateEventDto) {
    const session = await this.connection.startSession();
    session.startTransaction();
    let week: number;

    const { date } = createEventDto;
    const validDate = ShedUtils.validateEventDate(date);
    if (!validDate) throw new BadRequestException('Fecha no válida');

    const vaccineControl = await this.vaccineControlModel.findById(vaccineControlId)
      .session(session)
      .populate('shed', { initialDate: 1 });

    if (!vaccineControl)
      throw new BadRequestException('Registro no encontrado');

    week = ShedUtils.calculateWeek(vaccineControl.shed['initialDate'], date);

    if (week < 0)
      throw new BadRequestException('Fecha no válida');

    const event = new this.eventModel({ ...createEventDto, week, shedId: vaccineControl.shed})
    vaccineControl.events.push(event._id);

    try {
      await event.save({ session });
      await vaccineControl.save({ session });
      await session.commitTransaction();
      return 'Registrado correctamente';
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      session.endSession();
    }
  }

  public async updateEvent(vaccineControlId: string, eventId: string, updateEventDto: UpdateEventDto) {
    let week: number;

    const vaccineControl = await this.vaccineControlModel.findById(vaccineControlId)
      .populate('shed', { initialDate: 1 });

    if (!vaccineControl)
      throw new BadRequestException('Registro no encontrado');

    week = ShedUtils.calculateWeek(vaccineControl.shed['initialDate'], updateEventDto.date);

    if (week < 0)
      throw new BadRequestException('Fecha no válida');

    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException('Registro no encontrado');

    try {
      await event.updateOne({
        ...updateEventDto,
        week
      });

      return 'Actualizado correctamente';
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getOneEvent(eventId: string) {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException('Registro no encontrado');
    return event;
  }

  public async changeEventState(eventId: string, changeEventStateDto: ChangeEventStateDto) {
    const { completed } = changeEventStateDto;
    const event = await this.eventModel.findById(eventId);
    if (!event)
      throw new BadRequestException('Registro no encontrado')

    const validDate = ShedUtils.validateEventDate(event.date);

    const state = completed
      ? eventState.COMPLETED
      : validDate
        ? eventState.PENDING
        : eventState.EXPIRED;

    event.state = state;

    try {
      event.save();
      return `Actualizado correctamente`;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async deleteEvent(vaccineControlId: string, eventId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    const vaccineControl = await this.vaccineControlModel.findById(vaccineControlId).session(session);
    const event = await this.eventModel.findById(eventId).session(session);

    if (!vaccineControl) throw new NotFoundException('Registro no encontrado');
    if (!event) throw new NotFoundException('Registro no encontrado');

    const existsEvent = vaccineControl.events.find(item => item._id.toString() === event._id.toString());
    if (!existsEvent)
      throw new BadRequestException('Acción no válida');

    vaccineControl.events = vaccineControl.events.filter(item => item._id.toString() !== event._id.toString());

    try {
      await event.deleteOne({ session })
      await vaccineControl.save({ session });
      await session.commitTransaction();
      return 'Eliminado correctamente';
    } catch (error) {
      await session.abortTransaction();
      this.handleError(error);
    } finally {
      await session.endSession()
    }
  }

  public async rescheduleEvents(vaccineControlId: string, rescheduleEventsDto: RescheduleEventsDto) {
    const { quantityDays } = rescheduleEventsDto;
    const vaccineControl = await this.vaccineControlModel.findById(vaccineControlId)
      .populate('shed', {
        initialDate: 1,
      }).populate('events')

    if (!vaccineControl)
      throw new NotFoundException('Registro no encontrado');

    const pendingEvents = vaccineControl.events.filter((event: any) => event.state === 'pending');
    const updatePending = pendingEvents.map(event => event._id.toString());

    if(!pendingEvents.length) 
      throw new BadRequestException('No hay fechas pendientes para reprogramar')

    try {

      await Promise.all(
        pendingEvents.map(async (event: any) => {
          const updatedDate = new Date(event.date);
          updatedDate.setDate(updatedDate.getDate() + quantityDays);

          await this.eventModel.findByIdAndUpdate(event._id, {
            date: updatedDate,
            week: ShedUtils.calculateWeek(vaccineControl.shed['initialDate'], updatedDate),
          });
        })
      );

      return {
        message: 'Se modificaron las fechas programadas',
        updatePending
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    this.logger.error(error)
    throw new InternalServerErrorException('Error - Please check server logs')
  }
}
