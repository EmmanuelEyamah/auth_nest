import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthEntity } from './entities/auth.entity';
import { RegisterUsersDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    const user = await this.prisma.users.findUnique({ where: { email } });

    if (!user) throw new NotFoundException(`No user found for email: ${email}`);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) throw new UnauthorizedException('Invalid password.');

    return {
      accessToken: this.jwtService.sign({ userId: user.id }),
    };
  }

  async register(registerDto: RegisterUsersDto): Promise<AuthEntity> {
    const existingUser = await this.prisma.users.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.prisma.users.create({
      data: {
        ...registerDto,
        password: hashedPassword,
      },
    });

    return {
      accessToken: this.jwtService.sign({ userId: newUser.id }),
    };
  }
}
