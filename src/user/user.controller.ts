import { Authorization } from "@/auth/decorators/auth.decorator";
import { Authorized } from "@/auth/decorators/authorized.decorator";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { UserRole } from "@prisma/__generated__";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Authorization()
  @Get("profile")
  @HttpCode(HttpStatus.OK)
  public async findProfile(@Authorized("id") userId: string) {
    return this.userService.findById(userId);
  }

  @Authorization(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get("by-id/:id")
  public async findById(@Param("id") id: string) {
    return this.userService.findById(id);
  }

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Patch("profile")
  public async updateProfile(
    @Authorized("id") userId: string,
    @Body() dto: UpdateUserDto
  ) {
    return this.userService.update(userId, dto);
  }
}
