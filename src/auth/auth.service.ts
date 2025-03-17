import { UserService } from "@/user/user.service";
import { ConflictException, Injectable } from "@nestjs/common";
import { AuthMethod, User } from "@prisma/__generated__";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  public constructor(
    // private readonly prismaService: PrismaService,
    private readonly userService: UserService
    // private readonly configService: ConfigService,
    // private readonly providerService: ProviderService,
    // private readonly emailConfirmationService: EmailConfirmationService,
    // private readonly twoFactorAuthService: TwoFactorAuthService
  ) {}

  public async register(dto: RegisterDto) {
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

    return this.saveSession(newUser);
  }

  public async login() {}

  public async logout() {}

  private async saveSession(user: User) {
    console.log("Session save. User: ", user);
  }
}
