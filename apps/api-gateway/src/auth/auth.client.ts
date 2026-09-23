import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { auth } from '@car-rental/contracts';

// Обёртка над gRPC-клиентом auth-service: контроллер работает с Promise
// и не знает о транспорте
@Injectable()
export class AuthClient implements OnModuleInit {
  private authService: auth.AuthServiceClient;

  constructor(
    @Inject(auth.AUTH_PACKAGE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService = this.client.getService<auth.AuthServiceClient>(
      auth.AUTH_SERVICE_NAME,
    );
  }

  register(request: auth.RegisterRequest) {
    return lastValueFrom(this.authService.register(request));
  }

  login(request: auth.LoginRequest) {
    return lastValueFrom(this.authService.login(request));
  }

  getUserById(request: auth.GetUserByIdRequest) {
    return lastValueFrom(this.authService.getUserById(request));
  }
}
