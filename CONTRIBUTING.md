# Contributing to Kozi Ipi

Thanks for helping improve Kozi Ipi.

## What You Can Contribute

You can help by:

- correcting institution names
- adding missing campuses
- fixing programme names
- adding official source links
- improving entry requirements
- adding institution logos from official websites
- improving search synonyms
- improving UI, accessibility, and performance

## Data Contribution Rules

Please do not guess.

Every data change should include a source, preferably from:

- NACTVET
- TCU
- VETA
- Ministry of Education
- official institution websites
- official admission guidebooks or notices

If a value is uncertain, mark it as needing review instead of presenting it as verified.

Do not commit private student data, exam-result data, admin keys, Convex deployment secrets, or private notes.

## Local Setup

Install dependencies:

```sh
bun install
```

Build the processed dataset:

```sh
bun run data:build
```

Run Convex and import data:

```sh
bun run convex:dev
bun run data:import
```

Start the Next.js app:

```sh
bun run dev
```

## Before Opening a Pull Request

Run:

```sh
bun run typecheck
bun run lint
bun run data:build
```

If your change affects Convex data, import the processed data locally and test the relevant search query before opening the pull request.

## Environment Variables

Never commit `.env`, `.env.local`, admin keys, Convex deployment secrets, or private notes.

Use `.env.example` as the public template.
