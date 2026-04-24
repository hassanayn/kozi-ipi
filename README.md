# Kozi Ipi

Kozi Ipi is a Tanzania post-Form Four education discovery platform. It helps students, parents, and guardians search institutions and programmes using course names, careers, locations, subjects, and eligibility constraints.

## Stack

- Next.js
- shadcn UI preset
- Convex
- Bun

## Local Setup

Install dependencies:

```sh
bun install
```

Build the processed dataset:

```sh
bun run data:build
```

Start Convex:

```sh
bun run convex:dev
```

Import processed data into Convex:

```sh
bun run data:import
```

Import processed data into production Convex:

```sh
bun run data:import:prod
```

Start Next.js:

```sh
bun run dev
```

## Data Flow

Raw datasets live in:

```text
data/raw/tanzania-post-form-four-dataset
data/raw/tanzania-education-dataset
```

The broader post-Form Four dataset is the canonical base. The NACTVET-focused dataset enriches matching institutions and programmes.

Processed import files are generated in:

```text
data/processed
```

## Search Principle

```text
Lexical search finds.
Rules decide eligibility.
Semantic search suggests.
```
