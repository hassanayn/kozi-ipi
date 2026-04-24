# Data Integration Plan

Kozi Ipi has two raw datasets:

- `data/raw/tanzania-post-form-four-dataset`: canonical base dataset.
- `data/raw/tanzania-education-dataset`: NACTVET-focused enrichment dataset.

The broader post-Form Four dataset stays canonical because it covers NACTVET, VETA, TCU, Ministry teacher pathways, and Zanzibar vocational sources. The NACTVET-focused dataset is used to enrich matching rows with fields that are useful but not present in the broader export.

## Merge Strategy

```text
post-form-four institutions
-> merge matching NACTVET institution fields
-> processed institutions

post-form-four programmes
-> merge matching NACTVET programme fields
-> add search keywords and review flags
-> processed programmes
```

Matching uses normalized institution names and programme tuples:

```text
normalized_programme_name + institution_name + award_level
```

The raw CSVs must not be manually edited. All cleanup should happen through scripts so the process is repeatable.

## Output Files

Run:

```sh
bun run data:build
```

This generates:

```text
data/processed/institutions.json
data/processed/institutions.jsonl
data/processed/programmes.json
data/processed/programmes.jsonl
data/processed/data-quality-report.json
```

Use the JSONL files for backend imports once the backend is installed.

## Review Flags

Rows are flagged with:

```text
needsReview
reviewReasons
```

Examples:

```text
programme_name_looks_incomplete
unknown_award_level
missing_entry_requirements
missing_duration
missing_region
missing_registration_number
missing_website
missing_phone_numbers
not_high_confidence
```

Search should demote rows with `needsReview = true` until they are verified or cleaned.
