# 1Village

A platform connecting classrooms from different countries inside shared virtual villages. Teachers and students interact through activities (challenges, games, reports, stories, etc.), while admins and mediators moderate the experience.

## Tech Stack

- **Next.js 16** + **React 19**
- **TypeScript**
- **Drizzle ORM** + **PostgreSQL**
- **better-auth**
- **next-intl**
- **AWS S3**
- **ProseMirror** (rich text editor)
- **H5P** (interactive content)
- **MapLibre** + **Three.js** (2D/3D world maps)

## Getting Started

Prerequisites: Node.js 24+ with pnpm.

```bash
pnpm install
pnpm dev
pnpm db:migrate # Optional, to do at first launch and when there are new migrations
```

The app runs at `http://localhost:3000`.

Other useful commands:

```bash
pnpm lint         # ESLint
pnpm typecheck    # TypeScript
pnpm db:studio    # Drizzle Studio
pnpm db:generate  # Generate sql migrations
pnpm i18n:extract # Extract translation keys
```

## Project Structure

```
src/
├── app/            # Next.js App Router pages and route handlers
├── frontend/       # Client components, hooks, contexts, and UI
├── server/         # Database, auth, AWS, emails, i18n
├── server-actions/ # Server actions invoked by the UI
└── lib/            # Shared utilities
```

## Deployment

See [how-to-deploy.md](./how-to-deploy.md) for the full AWS deployment guide.

## License

[GNU GPLv3](https://choosealicense.com/licenses/gpl-3.0/)
