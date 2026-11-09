# Adulting

Adulting är en lärplattform för unga vuxna som vill få bättre koll på praktiska delar av vuxenlivet, till exempel ekonomi, boende, jobb, försäkringar och vardagsbeslut.

Projektet kombinerar kurser, quiz, personlig progression och AI-stöd. Målet är att användaren inte bara ska läsa innehåll, utan också få hjälp att förstå vad hen redan kan, vad som behöver repeteras och vad nästa steg bör vara.

## Innehåll

- Kurser inom olika vuxenlivsområden
- Quiz kopplade till kursinnehåll
- Personifierad kursupplevelse baserat på quizresultat
- AI-chat med kontext om användarens progression
- Rollbaserad dashboard för olika användartyper
- MCP-server för projekt-specifika AI-verktyg
- Docker-baserad lokal utvecklingsmiljö
- Health checks och Prometheus metrics

## Tech stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- App Router
- Client/server components
- Cookie-baserad session mot backend

### Backend

- Express
- TypeScript
- PostgreSQL
- Drizzle ORM
- Better Auth
- REST API
- Prometheus metrics via `/metrics`

### MCP Server

- Separat intern server för AI/MCP-funktionalitet
- Körs i Docker tillsammans med backend
- Används av backend, inte direkt av frontend
- Skyddas med intern token, till exempel `MCP_INTERNAL_TOKEN`

### Infrastruktur

- Docker Compose för lokal utveckling
- Deployas till kubernetes automatiskt med en GitLab pipeline
- Backend och frontend skalas horizontelt beroende på resursanvändning
- loggar metrics i Prometheus som visualiseras i Grafana


## MCP-servern

MCP-servern fungerar som ett internt verktygslager för AI-funktioner i Adulting.

I stället för att AI-chatten bara svarar generellt kan backend använda MCP-servern för att ge AI:n tillgång till projektets egen kontext, till exempel:

- vilka kurser användaren läser
- vilka block användaren har klarat
- vilka quizfrågor användaren svarat rätt eller fel på
- vilka ämnen användaren behöver repetera
- vilken typ av vägledning som passar användaren bäst


## Säkerhet för MCP

MCP-servern ska ses som en intern service.

Rekommenderad princip:

- MCP-servern exponeras inte publikt
- Endast backend får anropa MCP-servern
- Backend skickar med `MCP_INTERNAL_TOKEN`
- MCP-servern verifierar token innan den svarar
- Token ska vara ett långt slumpmässigt värde

Exempel:

```env
MCP_INTERNAL_TOKEN=replace-with-a-long-random-secret
```

Detta värde ska vara samma i backend och MCP-serverns miljövariabler.

## Lokal utveckling

Projektet körs lokalt med Docker Compose.

### Starta projektet

```bash
docker compose up --build
```

eller, om containrarna redan är byggda:

```bash
docker compose up
```

### Stoppa projektet

```bash
docker compose down
```

### Stoppa och ta bort volymer

Varning: detta tar bort lokal databasdata.

```bash
docker compose down -v
```

## Miljövariabler

Exempel på miljövariabler som behövs i projektet.

### Backend

```env
DATABASE_URL=postgres://postgres:postgres@db:5432/adulting
BACKEND_URL=http://backend:3001
FRONTEND_URL=http://localhost:3000

MCP_SERVER_URL=http://mcp-server:3002
MCP_INTERNAL_TOKEN=replace-with-a-long-random-secret

BETTER_AUTH_SECRET=replace-with-auth-secret
BETTER_AUTH_URL=http://localhost:3001
```

### Frontend

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
BACKEND_URL=http://backend:3001
```

### MCP Server

```env
PORT=3002
MCP_INTERNAL_TOKEN=replace-with-a-long-random-secret
```

Observera att namnen kan behöva justeras efter exakt hur `.env`-filerna är uppsatta i projektet.

## Databas

Projektet använder PostgreSQL och Drizzle.

Vanliga kommandon:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:push
```

Vid Docker-baserad utveckling körs kommandon oftast inne i backend-containern:

```bash
docker compose exec backend pnpm db:migrate
```

eller:

```bash
docker compose exec backend pnpm db:push
```

## Health checks

Backend har en health endpoint:

```bash
GET /health
```

Exempel lokalt:

```bash
curl http://localhost:3001/health
```

MCP-servern bör också ha en health endpoint:

```bash
GET /health
```

Exempel:

```bash
curl http://localhost:3002/health
```

Om MCP-servern endast är intern i Docker kan den testas från backend-containern:

```bash
docker compose exec backend curl http://mcp-server:3002/health
```

## Metrics

Backend exponerar Prometheus metrics via:

```bash
GET /metrics
```

Exempel:

```bash
curl http://localhost:3001/metrics
```

Metrics kan användas för att följa till exempel:

- antal requests
- svarstider
- processdata
- uptime
- felstatusar
- framtida produktmetriker, till exempel quiz attempts eller AI-anrop

## Roller och behörigheter

Projektet stödjer rollbaserad logik. Exakta roller kan variera, men systemet är byggt för att kunna visa olika vyer och funktioner beroende på användarens roll.

Exempel:

- vanlig användare
- creator
- admin

Rollerna används bland annat för dashboard, navigation och skyddade sidor.

## Kursflöde

Ett typiskt kursflöde:

1. Användaren väljer eller tilldelas en kurs
2. Användaren kan göra ett quiz
3. Quizresultatet analyseras
4. Systemet markerar starka och svaga områden
5. Kursen kan prioriteras eller anpassas utifrån resultatet
6. AI-chatten kan använda resultatet som kontext

Målet är att kursen ska kännas mer personlig än en statisk textkurs.

## AI-chat

AI-chatten är tänkt att fungera som en personlig guide.

Den kan på sikt använda information om:

- användarens kursprogression
- tidigare quizresultat
- ämnen användaren har svårt med
- aktuella kursblock
- rekommenderade nästa steg

Det gör att AI:n kan ge mer relevanta svar än en generell chatbot.

## Vanliga kommandon

### Installera dependencies

```bash
pnpm install
```

### Starta frontend lokalt

```bash
cd frontend
pnpm dev
```

### Starta backend lokalt

```bash
cd backend
pnpm dev
```

### Köra allt med Docker

```bash
docker compose up --build
```

### Köra migrations i Docker

```bash
docker compose exec backend pnpm db:migrate
```

### Kontrollera backend logs

```bash
docker compose logs backend
```

### Kontrollera MCP logs

```bash
docker compose logs mcp-server
```

## Deployment notes

Vid deployment bör följande säkerställas:

- Frontend har rätt publik backend-URL
- Backend har rätt intern databas-URL
- Backend kan nå MCP-servern via intern serviceadress
- MCP-servern är inte publikt exponerad
- `MCP_INTERNAL_TOKEN` är samma i backend och MCP-server
- Secrets lagras som riktiga secrets, inte hårdkodade värden
- `/health` används för readiness/liveness checks
- `/metrics` exponeras enligt vald monitoring-lösning

## Status

Projektet är under aktiv utveckling.

Aktuella fokusområden:

- förbättrad kursupplevelse
- quizbaserad personalisering
- AI-chat med bättre användarkontext
- MCP-integration
- deployment och observability

## Team

Adulting utvecklas som ett student-/produktprojekt med fokus på att hjälpa unga vuxna ta sina första steg in i vuxenlivet.