// Payload of the access token: signed by the Auth service, verified by the Gateway.
export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  roles: string[];
}
