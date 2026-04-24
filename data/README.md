# Kozi Ipi Data

This folder stores education datasets used by Kozi Ipi.

## Raw Datasets

### `raw/tanzania-post-form-four-dataset`

Recommended baseline dataset.

- 631 institution records
- 2,743 programme records
- Broader coverage across NACTVET, VETA, TCU, Ministry teacher pathways, and Zanzibar vocational sources
- Better aligned with the product goal of covering technical and non-technical post-Form Four pathways

### `raw/tanzania-education-dataset`

Useful secondary source dataset.

- 503 institution records
- 1,771 programme records
- Stronger NACTVET-focused fields such as `entry_route_types`, `admission_capacity`, `registration_number_as_shown`, and `accepts_form_four_direct`
- Useful for enrichment and cross-checking against the broader baseline dataset

## Recommended Data Flow

```text
raw CSV exports
-> schema validation
-> normalization
-> deduplication
-> enrichment
-> processed import files
-> backend database import
```

## Next Cleanup Priorities

- Normalize column names across both datasets.
- Preserve original raw files without manual edits.
- Create processed `institutions.csv` and `programmes.csv` files from the broader post-Form Four dataset.
- Merge useful NACTVET-specific fields from the education dataset where institution/programme records match.
- Add search fields such as `search_text`, `career_keywords`, `swahili_keywords`, and `aliases`.
- Validate required fields before import.
- Flag missing contacts, fees, websites, application URLs, and accreditation details for enrichment.
