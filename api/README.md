# Euroleague API

A NestJS wrapper API for the Euroleague Live API (`api-live.euroleague.net`).

## Description

This API acts as a proxy/wrapper for the official Euroleague API, providing a clean interface with Swagger documentation for all endpoints.

## Available Modules

### Clubs Module

The clubs module provides endpoints to interact with club data:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v3/clubs` | GET | Get all registered clubs |
| `/v3/clubs/:clubCode` | GET | Get a specific club by its code |
| `/v3/clubs/:clubCode/info` | GET | Get club info/history |

#### Query Parameters for `/v3/clubs`

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Maximum number of clubs to return |
| `offset` | number | Number of clubs to skip |
| `hasParentClub` | boolean | Filter clubs by parent club status |
| `search` | string | Search clubs by name |

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
EUROLEAGUE_API_BASE_URL=https://api-live.euroleague.net/v3
PORT=3000
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api
```

## Example Requests

### Get all clubs
```bash
curl -X GET "http://localhost:3000/v3/clubs" -H "accept: application/json"
```

### Get all clubs with pagination
```bash
curl -X GET "http://localhost:3000/v3/clubs?limit=10&offset=0" -H "accept: application/json"
```

### Search clubs by name
```bash
curl -X GET "http://localhost:3000/v3/clubs?search=Olympiacos" -H "accept: application/json"
```

### Get a specific club
```bash
curl -X GET "http://localhost:3000/v3/clubs/OLY" -H "accept: application/json"
```

### Get club info/history
```bash
curl -X GET "http://localhost:3000/v3/clubs/OLY/info" -H "accept: application/json"
```

## Project Structure

```
euroleague/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   └── clubs/
│       ├── clubs.module.ts        # Clubs module
│       ├── clubs.controller.ts    # Clubs controller with endpoints
│       ├── clubs.service.ts       # Clubs service (API calls)
│       ├── dto/
│       │   ├── club.dto.ts        # Club DTOs
│       │   ├── clubs-query.dto.ts # Query parameters DTO
│       │   └── index.ts           # DTO exports
│       └── index.ts               # Module exports
├── .env                           # Environment variables
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Adding New Modules

To add new endpoints (e.g., games, players, standings), create a new module following the same structure:

1. Create a new folder under `src/` (e.g., `src/games/`)
2. Create the module, controller, service, and DTOs
3. Import the module in `app.module.ts`

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## License

MIT
