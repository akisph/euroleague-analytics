# Euroleague Basketball Frontend

A modern, responsive Nuxt 3 frontend application for the Euroleague Basketball API.

## Technology Stack

- **Nuxt 3** - Vue 3 with Composition API
- **Vuetify 3** - Material Design component framework
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety
- **Pinia** - State management

## Features

- 🏀 **Dashboard** - Overview of current season with recent results and upcoming games
- 🏟️ **Clubs** - Browse all Euroleague clubs with detailed information
- 🎮 **Games** - View all games with filtering by round and team
- 📊 **Standings** - Current season standings with statistics
- 👥 **Teams** - Team rosters and player information
- 📅 **Seasons** - Switch between different seasons
- 🌓 **Dark/Light Theme** - Full theme support
- 📱 **Responsive Design** - Works on all devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (default: http://localhost:3000)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your API URL in .env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:3001`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── assets/
│   └── css/
│       └── main.css          # Global styles
├── components/
│   ├── EmptyState.vue        # Empty state placeholder
│   ├── ErrorAlert.vue        # Error message display
│   ├── GameCard.vue          # Game display card
│   ├── LoadingState.vue      # Loading spinner wrapper
│   ├── PageHeader.vue        # Page title and breadcrumbs
│   ├── PlayerCard.vue        # Player information card
│   ├── StandingsTable.vue    # Standings data table
│   ├── StatsCard.vue         # Statistics display card
│   └── TeamCard.vue          # Team information card
├── composables/
│   ├── useApi.ts             # Base API client
│   ├── useClubs.ts           # Clubs API
│   ├── useGames.ts           # Games API
│   ├── useRounds.ts          # Rounds API
│   ├── useSeasons.ts         # Seasons API
│   ├── useStandings.ts       # Standings API
│   └── useTeams.ts           # Teams API
├── layouts/
│   └── default.vue           # Main app layout
├── pages/
│   ├── index.vue             # Dashboard
│   ├── clubs/
│   │   ├── index.vue         # Clubs list
│   │   └── [code].vue        # Club details
│   ├── games/
│   │   ├── index.vue         # Games list
│   │   └── [seasonCode]/
│   │       └── [gameCode].vue # Game details
│   ├── players/
│   │   └── [playerCode].vue  # Player details
│   ├── seasons/
│   │   └── index.vue         # Seasons list
│   ├── standings/
│   │   └── index.vue         # Standings table
│   └── teams/
│       ├── index.vue         # Teams list
│       └── [clubCode].vue    # Team roster
├── plugins/
│   └── vuetify.ts            # Vuetify configuration
├── stores/
│   ├── season.ts             # Season state management
│   └── theme.ts              # Theme state management
├── types/
│   ├── index.ts              # Type exports
│   ├── club.ts               # Club types
│   ├── game.ts               # Game types
│   ├── round.ts              # Round types
│   ├── season.ts             # Season types
│   ├── standing.ts           # Standing types
│   └── team.ts               # Team/Player types
├── app.vue                   # Root component
├── nuxt.config.ts            # Nuxt configuration
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

## API Endpoints Used

The frontend consumes the following backend API endpoints:

### Clubs
- `GET /clubs` - List all clubs
- `GET /clubs/:clubCode` - Get club details
- `GET /clubs/:clubCode/info` - Get club history

### Games
- `GET /games/season/:seasonCode` - Get all season games
- `GET /games/season/:seasonCode/:gameCode` - Get game details
- `GET /games/season/:seasonCode/team/:teamCode` - Get team games
- `GET /games/season/:seasonCode/round/:roundNumber` - Get round games

### Standings
- `GET /standings/season/:seasonCode/round/:roundNumber` - Get standings
- `GET /standings/season/:seasonCode/round/:roundNumber/group/:groupId` - Get group standings

### Teams
- `GET /teams/season/:seasonCode` - Get all season teams
- `GET /teams/season/:seasonCode/:clubCode/roster` - Get team roster
- `GET /teams/season/:seasonCode/:clubCode/players` - Get team players
- `GET /teams/player/:playerCode` - Get player details

### Seasons
- `GET /seasons` - List all seasons
- `GET /seasons/current` - Get current season
- `GET /seasons/:seasonCode` - Get season details
- `GET /seasons/:seasonCode/clubs` - Get season clubs

### Rounds
- `GET /rounds/season/:seasonCode` - Get all rounds
- `GET /rounds/season/:seasonCode/:roundNumber` - Get round details
- `GET /rounds/season/:seasonCode/phase/:phaseCode` - Get phase rounds

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NUXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:3000` |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
