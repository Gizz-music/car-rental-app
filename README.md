# Car Rental App

A full-stack car rental platform: browse a fleet, register, book a car for a date range, manage your reservations, and receive email confirmations.

The backend is a **NestJS microservices** monorepo. The frontend is a **React** SPA. Shared gRPC contracts live in one package so services stay in sync.


## Architecture

```mermaid
flowchart LR
  Browser["React client<br/>:5173"] -->|"HTTP + cookie JWT"| Gateway["API Gateway<br/>:3000"]

  Gateway -->|"gRPC :50051"| Auth["Auth service"]
  Gateway -->|"gRPC :50052"| Rental["Car-rental service"]

  Auth --> AuthDB[("PostgreSQL<br/>car_rental_auth")]
  Rental --> RentalDB[("PostgreSQL<br/>car_rental_rentals")]
  Rental -->|"car.booked<br/>booking.cancelled"| RMQ["RabbitMQ<br/>notifications queue"]
  RMQ --> Notify["Notification service"]
  Notify --> SMTP["Mailpit SMTP<br/>:1025"]
```

| Piece | Role |
| --- | --- |
| **client** | SPA: catalog, auth, profile, bookings. Talks only to the gateway. |
| **api-gateway** | Public HTTP API. Validates JWT from an httpOnly cookie, maps gRPC errors to HTTP. |
| **auth-service** | Register / login / user lookup over gRPC. Owns users and signs JWTs. |
| **car-rental-service** | Cars and bookings over gRPC. Owns availability, pricing, and domain events. |
| **notification-service** | Consumes RabbitMQ events and sends email. No HTTP or gRPC surface. |
| **@car-rental/contracts** | Protobuf APIs, generated TypeScript, JWT payload, RMQ queue options, event types. |

Services do **not** share tables. Postgres is started once, then two databases are created on first boot: `car_rental_auth` and `car_rental_rentals`.

## Features

- Register and log in (email + password, default role `client`)
- Session via an **httpOnly** `access_token` cookie — the SPA never reads the JWT
- Public car catalog with photos, pagination, and availability for today by default
- Book a car for `[startDate, endDate)` — the return day is free again
- Overlap protection with a pessimistic lock on the car row
- Cancel an upcoming booking, or end an in-progress rental early (price is recalculated)
- Email on booking and cancellation (Mailpit in local development)
- Demo fleet is seeded automatically when the rentals database is empty

## Tech stack

| Layer | Tools |
| --- | --- |
| Monorepo | npm workspaces, [Turborepo](https://turbo.build) |
| Frontend | React 19, Vite, React Router, Redux Toolkit Query, [Consta UI](https://consta.design) |
| Backend | NestJS 11, TypeORM, class-validator |
| RPC / events | gRPC (`@grpc/grpc-js`, Buf + ts-proto), RabbitMQ |
| Data / mail | PostgreSQL 17, Mailpit |
| Auth | JWT (signed in auth-service, verified in the gateway), bcrypt |

## Repository layout

```
car-rental-app/
├── apps/
│   ├── client/                 # React SPA (Feature-Sliced Design)
│   ├── api-gateway/            # HTTP → gRPC BFF
│   ├── auth-service/           # gRPC AuthService
│   ├── car-rental-service/     # gRPC CarsService + BookingsService
│   └── notification-service/   # RabbitMQ consumer + SMTP
├── packages/
│   └── contracts/              # proto/, generated TS, events, RMQ helpers
├── infra/postgres/init/        # creates the two databases
├── docker-compose.yml          # Postgres, RabbitMQ, Mailpit
└── turbo.json
```

Frontend slices (FSD): `app` → `pages` → `widgets` → `features` → `entities` → `shared`.

## Prerequisites

- **Node.js** 18+ (see `engines` in the root `package.json`)
- **npm** 11 (the repo is an npm workspace; `packageManager` is `npm@11.8.0`)
- **Docker** and Docker Compose (Postgres, RabbitMQ, Mailpit)

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd car-rental-app
npm install
```

### 2. Environment files

Copy the examples. Defaults match `docker-compose.yml`, so local development works without edits.

```bash
cp .env.example .env
cp apps/api-gateway/.env.example apps/api-gateway/.env
cp apps/auth-service/.env.example apps/auth-service/.env
cp apps/car-rental-service/.env.example apps/car-rental-service/.env
cp apps/notification-service/.env.example apps/notification-service/.env
```

The client already has `apps/client/.env.development` with `VITE_API_URL=http://localhost:3000/`.

`JWT_ACCESS_SECRET` in **api-gateway** and **auth-service** must be the same value.

### 3. Start infrastructure

```bash
npm run infra:up
```

This starts:

| Service | URL / port | Notes |
| --- | --- | --- |
| PostgreSQL | `localhost:5432` | User/password `postgres` / `postgres` |
| RabbitMQ AMQP | `localhost:5672` | User/password `guest` / `guest` |
| RabbitMQ UI | http://localhost:15672 | Same credentials |
| Mailpit SMTP | `localhost:1025` | Catch-all inbox, nothing leaves the machine |
| Mailpit UI | http://localhost:8025 | Open this to read booking emails |

Init SQL runs **only** when the `postgres-data` volume is empty. If databases are missing after a broken first start, remove the volume and bring compose up again:

```bash
docker compose down -v
npm run infra:up
```

### 4. Run the apps

From the repo root:

```bash
npm run dev
```

Turbo builds `@car-rental/contracts` first, then starts every app in watch mode.

| App | Default URL |
| --- | --- |
| Web UI | http://localhost:5173 |
| API Gateway | http://localhost:3000 |
| Auth gRPC | `localhost:50051` |
| Car-rental gRPC | `localhost:50052` |

Open the UI, register (password at least **7** characters), then go to **Cars**.

To stop infrastructure later:

```bash
npm run infra:down
```

## Try the happy path

```mermaid
sequenceDiagram
  actor User
  participant UI as Client
  participant GW as API Gateway
  participant Auth as Auth service
  participant Rental as Car-rental service
  participant Q as RabbitMQ
  participant Mail as Notification service

  User->>UI: Register / login
  UI->>GW: POST /auth/register or /login
  GW->>Auth: gRPC Register / Login
  Auth-->>GW: user + JWT
  GW-->>UI: Set-Cookie access_token

  User->>UI: Reserve dates
  UI->>GW: POST /bookings (cookie)
  GW->>Rental: gRPC CreateBooking
  Rental->>Rental: lock car, check overlap, save
  Rental->>Q: car.booked
  Q->>Mail: send confirmation email
  Rental-->>UI: booking
```

1. Register at `/registration` or log in at `/login`.
2. Open **Cars** (`/cars`) — eight demo cars are seeded on first start of car-rental-service.
3. Pick dates and reserve. Price is `days × pricePerDay` (half-open range).
4. Open **Profile** (`/profile`) for your bookings. Cancel upcoming ones, or finish an active rental early.
5. Open [Mailpit](http://localhost:8025) to see the confirmation / cancellation email.

## HTTP API (gateway)

Base URL: `http://localhost:3000`. The SPA sends `credentials: include` so the cookie is attached.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | Body: `{ name, email, password }`. Sets cookie, returns user. |
| `POST` | `/auth/login` | No | Body: `{ email, password }`. Sets cookie, returns user. |
| `POST` | `/auth/logout` | No | Clears the cookie. |
| `GET` | `/auth/current-user` | Cookie | Fresh user from auth-service. |
| `GET` | `/cars` | No | Query: `startDate`, `endDate` (`YYYY-MM-DD`, both or neither), `page`, `pageSize` (max 50, default 6). |
| `POST` | `/bookings` | Cookie | Body: `{ carId, startDate, endDate }`. User is taken from JWT, not the body. |
| `GET` | `/bookings` | Cookie | Current user's bookings. |
| `POST` | `/bookings/:id/cancel` | Cookie | Cancel or end early. Other people's IDs look like 404. |

gRPC status codes from downstream services are mapped to HTTP (`INVALID_ARGUMENT` → 400, `UNAUTHENTICATED` → 401, `NOT_FOUND` → 404, `ALREADY_EXISTS` / `FAILED_PRECONDITION` → 409, and so on).

## Booking rules

Dates are ISO calendar days `YYYY-MM-DD` (UTC). A booking occupies the **half-open** interval `[startDate, endDate)`:

- Start and end must both be present, and the range must contain at least one paid day.
- The car is free again **on** `endDate`.
- Two active bookings overlap when `a.start < b.end && a.end > b.start`.
- Adjacent bookings that touch (`endDate` of one equals `startDate` of the next) are treated as one busy stretch for availability.
- **Upcoming** cancel → status `cancelled`.
- **In progress** cancel → last paid day is today, `endDate` becomes tomorrow, `totalPrice` is prorated from the original daily rate stored on the booking (not the current catalog price).
- A booking that already ended cannot be cancelled.

TypeORM `synchronize: true` is on for local development. Replace it with migrations before production.

## Contracts package

Protobuf sources:

- `packages/contracts/proto/auth/auth.proto`
- `packages/contracts/proto/car_rental/car_rental.proto`

Generate TypeScript (Buf + ts-proto) and compile:

```bash
npm run build --workspace=@car-rental/contracts
```

`npm run dev` at the root already depends on this build. After you change a `.proto` file, rebuild contracts (or restart `dev`) so gateway and services pick up new types.

Events published to the `notifications` queue:

| Event | When |
| --- | --- |
| `car.booked` | Booking created |
| `booking.cancelled` | Booking cancelled or ended early (`endedEarly: true`) |

Payloads include car, dates, price, and customer email so the notification service never calls other services synchronously.

## Useful scripts

From the **repository root**:

```bash
npm run dev          # all apps in watch mode
npm run build        # production build of every workspace
npm run lint
npm run check-types
npm run format       # Prettier
npm run infra:up     # docker compose up -d --wait
npm run infra:down   # docker compose down
```

One app only (Turbo filter):

```bash
npx turbo dev --filter=client
npx turbo dev --filter=api-gateway
npx turbo dev --filter=auth-service
npx turbo dev --filter=car-rental-service
npx turbo dev --filter=notification-service
```

Inside a Nest app you can also use `npm run start:debug` for the inspector.

## Configuration cheat sheet

| Variable | Where | Default / purpose |
| --- | --- | --- |
| `PORT` | api-gateway | `3000` |
| `CORS_ORIGIN` | api-gateway | `http://localhost:5173` (comma-separated) |
| `AUTH_GRPC_URL` | api-gateway | `localhost:50051` |
| `CAR_RENTAL_GRPC_URL` | api-gateway | `localhost:50052` |
| `JWT_ACCESS_SECRET` | gateway + auth | Must match |
| `JWT_ACCESS_EXPIRES` | auth-service | `7d` |
| `GRPC_URL` | auth / car-rental | Bind address for that service |
| `DATABASE_URL` | auth / car-rental | Separate DBs; auth has a local default if unset |
| `RABBITMQ_URL` | car-rental + notifications | `amqp://guest:guest@localhost:5672` |
| `SMTP_*` / `MAIL_FROM` | notifications | Mailpit locally; set user/pass for a real SMTP host |
| `VITE_API_URL` | client | Gateway base URL (trailing slash) |

Root `.env` only overrides Docker Compose ports and credentials (`POSTGRES_*`, `RABBITMQ_*`, `SMTP_PORT`, `MAILPIT_UI_PORT`).
