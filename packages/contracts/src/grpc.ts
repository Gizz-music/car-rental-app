import { join } from 'node:path';
import type { GrpcOptions } from '@nestjs/microservices';

import { AUTH_PACKAGE_NAME } from './generated/auth/auth';
import { CAR_RENTAL_PACKAGE_NAME } from './generated/car_rental/car_rental';

const PROTO_ROOT = join(__dirname, '..', 'proto');

// Shared by server and client so both sides decode messages identically.
// `arrays: true` keeps empty repeated fields as [] instead of dropping them.
const grpcOptions =
  (packageName: string, protoFile: string) =>
  (url: string): GrpcOptions['options'] => ({
    url,
    package: packageName,
    protoPath: join(PROTO_ROOT, protoFile),
    loader: { arrays: true },
  });

export const authGrpcOptions = grpcOptions(AUTH_PACKAGE_NAME, 'auth/auth.proto');

export const carRentalGrpcOptions = grpcOptions(
  CAR_RENTAL_PACKAGE_NAME,
  'car_rental/car_rental.proto',
);
