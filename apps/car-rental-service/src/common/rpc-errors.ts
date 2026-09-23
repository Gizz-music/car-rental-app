import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

export const invalidArgument = (message: string) =>
  new RpcException({ code: status.INVALID_ARGUMENT, message });

export const notFound = (message: string) =>
  new RpcException({ code: status.NOT_FOUND, message });

export const failedPrecondition = (message: string) =>
  new RpcException({ code: status.FAILED_PRECONDITION, message });
