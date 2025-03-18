import { Authorization } from "@/auth/decorators/auth.decorator";
import { Authorized } from "@/auth/decorators/authorized.decorator";
import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserRole } from "@prisma/__generated__";

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
	@Get('by-id/:id')
	public async findById(@Param('id') id: string) {
		return this.userService.findById(id)
	}
}
