import {
  ArgumentsHost,
  Catch,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { status, type ServiceError } from '@grpc/grpc-js';

// Бизнес-ошибки: текст формирует наш сервис, его можно показать клиенту
const HTTP_STATUS_BY_GRPC_CODE: Partial<Record<status, HttpStatus>> = {
  [status.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
  [status.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
  [status.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
  [status.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [status.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [status.FAILED_PRECONDITION]: HttpStatus.CONFLICT,
};

// Сбои инфраструктуры: детали (адреса, причины) наружу не отдаём
const INFRASTRUCTURE_ERRORS: Partial<Record<status, () => HttpException>> = {
  [status.UNAVAILABLE]: () => new ServiceUnavailableException(),
  [status.DEADLINE_EXCEEDED]: () => new GatewayTimeoutException(),
};

const isGrpcError = (exception: unknown): exception is ServiceError =>
  exception instanceof Error &&
  typeof (exception as ServiceError).code === 'number' &&
  typeof (exception as ServiceError).details === 'string';

const toHttpException = ({ code, details }: ServiceError) => {
  const httpStatus = HTTP_STATUS_BY_GRPC_CODE[code];
  if (httpStatus) {
    return new HttpException(details, httpStatus);
  }
  return INFRASTRUCTURE_ERRORS[code]?.();
};

// Ошибки downstream-сервисов приходят как gRPC-статусы — переводим их в HTTP.
// Неизвестные коды остаются 500 без утечки деталей наружу.
@Catch()
export class GrpcExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const httpException = isGrpcError(exception)
      ? toHttpException(exception)
      : undefined;

    super.catch(httpException ?? exception, host);
  }
}
