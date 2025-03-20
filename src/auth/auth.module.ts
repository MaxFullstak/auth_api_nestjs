import { getProvidersConfig } from "@/config/providers.config";
import { getRecaptchaConfig } from "@/config/recaptcha.config";
import { MailService } from "@/libs/mail/mail.service";
import { UserService } from "@/user/user.service";
import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GoogleRecaptchaModule } from "@nestlab/google-recaptcha";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { EmailConfirmationModule } from "./email-confirmation/email-confirmation.module";
import { ProviderModule } from "./provider/provider.module";

@Module({
  imports: [
    ProviderModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getProvidersConfig,
      inject: [ConfigService],
    }),
    GoogleRecaptchaModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getRecaptchaConfig,
      inject: [ConfigService],
    }),
    forwardRef(() => EmailConfirmationModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, MailService],
  exports: [AuthService],
})
export class AuthModule {}
