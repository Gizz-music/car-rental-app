import { Controller } from '@nestjs/common';
import { auth } from '@car-rental/contracts';
import { AuthService } from './auth.service';

// gRPC-контроллер: методы и типы задаёт контракт auth.proto
@Controller()
@auth.AuthServiceControllerMethods()
export class AuthController implements auth.AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  register(request: auth.RegisterRequest) {
    return this.authService.register(request);
  }

  login(request: auth.LoginRequest) {
    return this.authService.login(request);
  }

  getUserById(request: auth.GetUserByIdRequest) {
    return this.authService.getUserById(request);
  }
}
