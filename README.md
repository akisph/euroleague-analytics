# Euroleague API & Dashboard

A comprehensive NestJS REST API wrapper and Vue 3 frontend dashboard for the Euroleague competition engine. This project proxies and transforms data from the official Euroleague API, providing standardized endpoints for clubs, seasons, games, teams, players, and competition data.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Frontend Documentation](#frontend-documentation)
- [Docker Deployment](#docker-deployment)
- [Development Guidelines](#development-guidelines)
- [Contributing](#contributing)

## 🎯 Project Overview

This project consists of two main components:

### Backend (API)
A NestJS REST API that:
- **Proxies** requests to the official Euroleague API (`https://api-live.euroleague.net`)
- **Transforms** XML/JSON responses into consistent TypeScript DTOs
- **Implements** OAuth2 authentication for secure API access
- **Provides** standardized endpoints for data retrieval
- **Handles** pagination, filtering, and error management

### Frontend (Dashboard)
A Vue 3 + Nuxt 3 dashboard that:
- **Displays** comprehensive Euroleague competition data
- **Visualizes** player statistics, game results, and standings
- **Provides** interactive club and player profiles
- **Shows** season schedules and round information
- **Uses** Vuetify for UI components and Tailwind CSS for styling

## 🛠 Technology Stack

### Backend
- **Framework**: [NestJS](https://nestjs.com/) (v8.0+)
- **Runtime**: Node.js (v16+)
- **Language**: TypeScript
- **HTTP Client**: Axios (via NestJS HttpService)
- **Validation**: class-validator & class-transformer
- **Authentication**: OAuth2
- **API Documentation**: OpenAPI/Swagger

### Frontend
- **Framework**: [Vue 3](https://vuejs.org/)
- **Meta Framework**: [Nuxt 3](https://nuxt.com/)
- **UI Library**: [Vuetify 3](https://vuetifyjs.com/)
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Language**: TypeScript
- **HTTP Client**: Fetch API (via composables)

### DevOps
- **Containerization**: Docker & Docker Compose
- **Package Manager**: npm

## 📁 Project Structure

```
euroleague/
├── api/                          # NestJS Backend API
│   ├── src/
│   │   ├── main.ts              # Application entry point
│   │   ├── app.module.ts        # Root module
│   │   ├── constants.ts         # Shared constants
│   │   ├── clubs/               # Clubs module
│   │   ├── seasons/             # Seasons module
│   │   ├── games/               # Games module
│   │   ├── players/             # Players module
│   │   ├── teams/               # Teams module
│   │   ├── rounds/              # Rounds module
│   │   └── standings/           # Standings module
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── README.md
│
├── frontend/                     # Vue 3 + Nuxt 3 Dashboard
│   ├── pages/
│   │   ├── index.vue            # Home page
│   │   ├── clubs/               # Club pages
│   │   ├── games/               # Games pages
│   │   ├── players/             # Player pages
│   │   └── standings/           # Standings pages
│   ├── components/              # Reusable Vue components
│   │   ├── clubs/
│   │   ├── games/
│   │   ├── players/
│   │   ├── standings/
│   │   └── shared/
│   ├── composables/             # Vue 3 composables (API hooks)
│   ├── stores/                  # Pinia store
│   ├── types/                   # TypeScript type definitions
│   ├── assets/                  # Static assets
│   ├── layouts/                 # Layout components
│   ├── nuxt.config.ts
│   ├── tailwind.config.js
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
│
├── docker-compose.yml           # Docker Compose configuration
├── .github/
│   └── copilot-instructions.md # AI Assistant guidelines
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Docker & Docker Compose (for containerized setup)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd euroleague
   ```

2. **Install backend dependencies**
   ```bash
   cd api
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## 🔧 Environment Setup

### Backend (.env)

Create `api/.env` file:

```env
# Server configuration
PORT=3000
NODE_ENV=development

# Euroleague API configuration
EUROLEAGUE_API_BASE_URL=https://api-live.euroleague.net
EUROLEAGUE_CLIENT_ID=your_client_id
EUROLEAGUE_CLIENT_SECRET=your_client_secret

# Optional: Database configuration (if persisting data)
DATABASE_URL=postgresql://user:password@localhost:5432/euroleague
```

### Frontend (.env)

Create `frontend/.env` file:

```env
# API configuration
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

## ▶️ Running the Project

### Development Mode

**Backend (NestJS)**
```bash
cd api
npm run dev
# Server runs on http://localhost:3000
```

**Frontend (Nuxt)**
```bash
cd frontend
npm run dev
# Dashboard runs on http://localhost:3000 (dev server manages port)
```

### Production Mode

**Backend**
```bash
cd api
npm run build
npm run start
```

**Frontend**
```bash
cd frontend
npm run build
npm run preview
```

### Using Docker Compose

```bash
# From root directory
docker-compose up

# Frontend: http://localhost:3001
# API: http://localhost:3000
```

## 📚 API Documentation

The backend provides the following main endpoints:

### Clubs
- `GET /clubs` - Get all clubs
- `GET /clubs/:code` - Get club details

### Seasons
- `GET /seasons` - Get all seasons
- `GET /seasons/:seasonCode` - Get season details

### Games
- `GET /games` - Get games with filters
- `GET /games/:seasonCode/:gameCode` - Get game details

### Players
- `GET /players/:seasonCode` - Get all players for a season
- `GET /players/:seasonCode/:playerCode` - Get player details and stats

### Teams
- `GET /teams/:seasonCode/:clubCode` - Get team roster

### Rounds
- `GET /rounds/:seasonCode` - Get season rounds

### Standings
- `GET /standings/:seasonCode` - Get standings for a season

### Query Parameters

Most endpoints support:
- `limit` - Number of results (default: 50)
- `offset` - Result offset for pagination (default: 0)
- `search` - Search filter (for applicable endpoints)
- `sort` - Sort field and direction

### Response Format

All responses follow this structure:

```json
{
  "data": [...],
  "total": 100
}
```

For single resource endpoints:

```json
{
  "playerCode": "003469",
  "name": "VEZENKOV, SASHA",
  "clubCode": "OLY",
  "clubName": "Olympiacos Piraeus",
  "position": "Forward",
  ...
}
```

### Error Handling

API errors return appropriate HTTP status codes:

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - OAuth2 token invalid/expired |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

## 🎨 Frontend Documentation

### Pages

- **Home** (`/`) - Landing page with featured content
- **Clubs** (`/clubs`) - Browse all clubs
- **Club Detail** (`/clubs/:code`) - Detailed club information
- **Games** (`/games/:seasonCode`) - Season games and schedule
- **Game Detail** (`/games/:seasonCode/:gameCode`) - Detailed game stats
- **Players** (`/players/:seasonCode`) - Player directory
- **Player Profile** (`/players/:seasonCode/:playerCode`) - Detailed player statistics
- **Standings** (`/standings/:seasonCode`) - Season standings

### Components

#### Player Components
- `PlayerCard.vue` - Player summary card
- `PlayerInfoCard.vue` - Detailed player information
- `PlayerScoringStats.vue` - Scoring statistics
- `PlayerShootingGauges.vue` - Shooting percentages
- `PlayerReboundsStats.vue` - Rebound statistics
- `PlayerDefenseStats.vue` - Defensive statistics
- `PlayerGames.vue` - Player game list
- `PlayerPerGameChart.vue` - Per-game statistics chart

#### Game Components
- `card.vue` - Game summary card
- `CurrentRoundGames.vue` - Current round games display
- `Info.vue` - Game information
- `Stats.vue` - Game statistics
- `PlayersStats.vue` - Player performance in game
- `TeamComparison.vue` - Team comparison view

#### Shared Components
- `PageHeader.vue` - Page title and breadcrumbs
- `LoadingState.vue` - Loading skeleton
- `ErrorAlert.vue` - Error message display
- `EmptyState.vue` - Empty content placeholder
- `StatsCard.vue` - Statistic card component

### Composables

- `useApi.ts` - Base API client composable
- `useClubs.ts` - Clubs data fetching
- `useSeasons.ts` - Seasons data fetching
- `useGames.ts` - Games data fetching
- `usePlayers.ts` - Players data fetching
- `useTeams.ts` - Teams data fetching
- `useRounds.ts` - Rounds data fetching
- `useStandings.ts` - Standings data fetching

### State Management

The Pinia store manages:
- `season.ts` - Current selected season
- `theme.ts` - Theme preferences (dark/light mode)

### Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Vuetify** - Material Design components
- **Custom CSS** - Scoped styles for specific components

## 🐳 Docker Deployment

### Build Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build api
docker-compose build frontend
```

### Running Containers

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Accessing Services

- Frontend: `http://localhost:3001`
- API: `http://localhost:3000`
- API Docs: `http://localhost:3000/api`

## 👨‍💻 Development Guidelines

### Code Structure

#### Backend (NestJS)

```
module/
├── module.controller.ts     # HTTP request handlers
├── module.service.ts        # Business logic
├── module.module.ts         # Module definition
├── index.ts                 # Barrel export
└── dto/
    ├── resource.dto.ts      # Response DTO
    ├── resource-query.dto.ts# Query parameters DTO
    └── index.ts             # Barrel export
```

#### Frontend (Vue 3)

```
pages/
  [feature]/
    index.vue               # List view
    [id].vue               # Detail view

components/
  [feature]/
    ComponentName.vue      # Feature component

composables/
  use[Feature].ts          # Data fetching composable
```

### DTO Validation

All DTOs use class-validator decorators:

```typescript
export class PlayerDto {
  @IsString()
  @IsNotEmpty()
  playerCode: string;

  @IsOptional()
  @IsString()
  clubCode?: string;

  @IsArray()
  @ValidateNested()
  @Type(() => StatsDto)
  stats?: StatsDto[];
}
```

### Error Handling

Backend:
```typescript
catch (error) {
  this.logger.error(`Error fetching data: ${error.message}`);
  throw new HttpException(
    'Failed to fetch data',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
```

Frontend:
```typescript
const { data, error, pending } = await useAsyncData(() => 
  $fetch(`/api/players/${seasonCode}/${playerCode}`)
);
```

### Testing

Run tests:
```bash
# Backend
cd api
npm run test

# Frontend
cd frontend
npm run test
```

## 📝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Follow the code structure guidelines
3. Test your changes thoroughly
4. Commit with clear messages: `git commit -m "Add: description"`
5. Push to branch: `git push origin feature/your-feature`
6. Create a Pull Request

### Commit Message Format

```
[Type]: [Description]

Types: Add, Fix, Update, Remove, Refactor, Docs
Example: Add: New player statistics endpoint
```

## 📖 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Vue 3 Guide](https://vuejs.org/guide/)
- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Vuetify Documentation](https://vuetifyjs.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Euroleague API](https://api-live.euroleague.net)

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Backend Development**: NestJS/TypeScript
- **Frontend Development**: Vue 3/Nuxt
- **API Integration**: Euroleague Live API

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F
```

### CORS Issues

Ensure backend CORS is configured properly in `app.module.ts`:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
});
```

### OAuth2 Token Errors

Verify credentials in `.env`:
```
EUROLEAGUE_CLIENT_ID=<valid_id>
EUROLEAGUE_CLIENT_SECRET=<valid_secret>
```

### Frontend Build Issues

Clear cache and reinstall:
```bash
rm -rf node_modules .nuxt
npm install
npm run dev
```

## 📞 Support

For issues or questions, please open an issue on the repository or contact the development team.

---

**Last Updated**: February 2, 2026  
**Version**: 1.0.0
