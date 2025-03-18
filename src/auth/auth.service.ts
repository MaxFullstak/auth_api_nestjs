import { UserService } from "@/user/user.service";
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthMethod, User } from "@prisma/__generated__";
import { RegisterDto } from "./dto/register.dto";
import { Request, Response } from "express";
import { LoginDto } from "./dto/login.dto";
import { verify } from "argon2";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  public constructor(
    // private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    // private readonly providerService: ProviderService,
    // private readonly emailConfirmationService: EmailConfirmationService,
    // private readonly twoFactorAuthService: TwoFactorAuthService
  ) {}

  public async register(req: Request, dto: RegisterDto) {
    const isExists = await this.userService.findByEmail(dto.email);

    if (isExists) {
      throw new ConflictException(
        "Регистрация не удалась. Пользователь с таким email уже существует. Пожалуйста, используйте другой email или войдите в систему."
      );
    }

    const newUser = await this.userService.create(
      dto.email,
      dto.password,
      dto.name,
      "",
      AuthMethod.CREDENTIALS,
      false
    );

    // await this.emailConfirmationService.sendVerificationToken(newUser.email)

    // return {
    // 	message:
    // 		'Вы успешно зарегистрировались. Пожалуйста, подтвердите ваш email. Сообщение было отправлено на ваш почтовый адрес.'
    // }

    return this.saveSession(req, newUser);
  }

  public async login(req: Request, dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !user.password) {
      throw new NotFoundException(
        "Пользователь не найден. Пожалуйста, проверьте введенные данные"
      );
    }

    const isValidPassword = await verify(user.password, dto.password);

    if (!isValidPassword) {
      throw new UnauthorizedException(
        "Неверный пароль. Пожалуйста, попробуйте еще раз или восстановите пароль, если забыли его."
      );
    }

    return this.saveSession(req, user);
  }

  public async logout(req: Request, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              "Не удалось завершить сессию. Возможно, возникла проблема с сервером или сессия уже была завершена."
            )
          );
        }
        res.clearCookie(this.configService.getOrThrow<string>("SESSION_NAME"));
        resolve();
      });
    });
  }

  private async saveSession(req: Request, user: User) {
    return new Promise((resolve, reject) => {
      req.session.userId = user.id;

      req.session.save((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              "Не удалось сохранить сессию. Проверьте, правильно ли настроены параметры сессии."
            )
          );
        }
        resolve({
          user,
        });
      });
    });
  }
}
