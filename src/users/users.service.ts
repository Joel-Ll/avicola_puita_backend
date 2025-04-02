import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Hash } from 'src/utils/hash.utils';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService implements OnModuleInit {

  private readonly logger = new Logger(UsersService.name)

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    private readonly configService: ConfigService,
  ) { }

  async onModuleInit() {
    await this.createAdminUser();
  }

  private async createAdminUser() {
    const adminExists = await this.userModel.findOne({ role: 'admin' });
    if (adminExists)
      return;

    const username = this.configService.get('USERNAME_ADMIN');
    const email = this.configService.get('EMAIL_ADMIN');
    const password = this.configService.get('PASSWORD_ADMIN');
    const hashedPassword = await Hash.hashPassword(password);

    const admin = new this.userModel({
      username,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    try {
      await admin.save();
      console.log('Usuario administrador creado correctamente');
    } catch (error) {
      this.handleError(error);
    }
  }

  public async updateAdminUsername(admin: UserDocument, updateUsernameDto: UpdateUsernameDto) {
    const { username } = updateUsernameDto;

    if (admin.username === username)
      return 'Actualizado correctamente';

    const existingUser = await this.userModel.findOne({ username, _id: { $ne: admin.id } });
    if (existingUser)
      throw new BadRequestException('El nombre de usuario ya está en uso');

    await this.userModel.findByIdAndUpdate(admin.id, { username });
    return 'Actualizado correctamente';
  }

  public async updateAdminPassword(user: UserDocument, updatePasswordDto: UpdatePasswordDto) {
    const admin = await this.userModel.findById(user.id);
    
    const { currentPassword, newPassword } = updatePasswordDto;
    const passwordCorrect = await Hash.checkPassword(currentPassword, admin.password);
    if(!passwordCorrect)
      throw new BadRequestException('La contraseña actual es incorrecta');

    admin.password = await Hash.hashPassword(newPassword);
    await admin.save();
    return 'Contraseña actualizada correctamente';
  }


  public async create(createUserDto: CreateUserDto) {
    const user = new this.userModel(createUserDto);
    const userExists = await this.userModel.findOne({ username: user.username })
    if (userExists)
      throw new ConflictException('El nombre de usuario ya esta registrado');

    user.password = await Hash.hashPassword(user.password);

    try {
      await user.save();
      return 'Usuario registrado correctamente'
    } catch (error) {
      this.handleError(error);
    }
  }

  public async findAll() {
    try {
      const users = await this.userModel.find({ role: 'user' })
      return users;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async findOne(id: string) {
    const user = await this.userModel.findById(id).select({ username: 1, isActive: 1, createdAt: 1 });
    if (!user)
      throw new BadRequestException('Usuario no encontrado');
    return user;
  }

  public async updateState(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.isActive = !user.isActive;
    await user.save();
    return 'ok';
  }

  public async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const { username, password } = updateUserDto;
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const existingUser = await this.userModel.findOne({ username, _id: { $ne: id } });
    if (existingUser) throw new BadRequestException('El nombre de usuario ya está en uso');

    try {
      if (username) user.username = username;
      if (password) user.password = await Hash.hashPassword(password);

      await user.save();
      return 'Usuario actualizado correctamente';
    } catch (error) {
      this.handleError(error);
    }
  }

  public async remove(id: string) {
    const updated = await this.userModel.findByIdAndDelete(id);
    if (updated === null)
      throw new NotFoundException('Usuario no encontrado');
    return 'Usuario eliminado correctamente';
  }

  private handleError(error: any) {
    this.logger.error(error);
    throw new InternalServerErrorException('Error - Please check server logs')
  }
}
