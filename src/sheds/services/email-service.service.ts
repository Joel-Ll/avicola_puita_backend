import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from 'src/users/schemas/user.schema';
import { eventsSchemas } from '../interfaces/health-management.interface';

@Injectable()
export class EmailServiceService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,

    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: +this.configService.get('SMTP_PORT'),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      }
    })
  }
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  public async sendVaccineReminder() {
    const user = await this.userModel.findOne({ role: 'admin' });
    if (!user) return;

    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 1);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const events = await this.eventModel.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      state: "pending"
    }).populate('shedId');
    const result = eventsSchemas.safeParse(events);
    if (result.success) {
      if (result.data.length === 0) return;
      try {
        await this.transporter.sendMail({
          from: 'Avícola Puita <notificaciones@avicolapuita.com>',
          to: `${user.email}`,
          subject: '🛎️ Recordatorio: Vacunación Pendiente',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px;">
              <div style="background-color: #f8f1e9; padding: 20px; text-align: center; border-bottom: 1px solid #e1e1e1;">
                <h1 style="color: #d35400;">Avícola Puita</h1>
                <h2 style="color: #e67e22;">Recordatorio de Vacunación</h2>
              </div>
      
              <div style="padding: 20px;">
                <p>Hola <strong>${user.username}</strong>,</p>
                <p>Tienes <strong>${result.data.length} vacuna(s)</strong> programada(s) para mañana:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 8px 0;">
                  <thead>
                    <tr style="background-color: #f2f2f2;">
                      <th style="padding: 10px; text-align: left; border: 1px solid #ddd; font-size: 11px;">Galpón</th>
                      <th style="padding: 10px; text-align: left; border: 1px solid #ddd; font-size: 11px;">Vacuna</th>
                      <th style="padding: 10px; text-align: left; border: 1px solid #ddd; font-size: 11px;">Enfermedad</th>
                      <th style="padding: 10px; text-align: left; border: 1px solid #ddd; font-size: 11px;">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${result.data.map((event) => `
                      <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-size: 11px;">${event.shedId.name || 'N/A'}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; font-size: 11px;">${event.vaccine || 'N/A'}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; font-size: 11px;">${event.illness || 'N/A'}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; font-size: 11px;">${new Date(event.date).toLocaleDateString('es-BO', { timeZone: 'America/La_Paz' })}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
      
                <p style="margin-top: 20px;">
                  <a href="https://admin.avicolapuita.com/sheds/vaccine-control" style="display: inline-block; background-color: #e67e22; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver en plataforma</a>
                </p>
              </div>
            </div>
          `
        });
      } catch (error) {
        console.error('Error enviando correo:', error);
        throw new Error('Falló el envío del recordatorio');
      }
    }
  }
}
