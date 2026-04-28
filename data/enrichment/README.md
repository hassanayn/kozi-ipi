# Data Enrichment

This directory holds reviewable enrichment artifacts that are not yet part of the canonical processed dataset.

## UDSM Prospectus Programmes

`udsm-undergraduate-prospectus-2024-2025-programmes.csv` contains programme rows extracted from the University of Dar es Salaam Undergraduate Prospectus 2024/2025. It covers the prospectus section "Undergraduate programmes offered for the university certificates, diplomas and degrees awards" on printed pages 31-33.

The file is intended as a reviewable enrichment source for UDSM bachelor, professional undergraduate, ordinary diploma, and certificate offerings. It preserves source wording for questionable rows and records obvious extraction/source issues in the `notes` column.

`udsm-tcu-admission-guidebook-2025-2026-programmes.csv` contains UDSM bachelor and professional undergraduate rows from the TCU Bachelor Degree Admission Guidebook for the 2025/2026 academic year. This source includes TCU programme codes, admission capacities, and programme durations, so it should be preferred when enriching current UDSM bachelor-level search records.

## Institution Logos

`institution-logos.seed.csv` is a first-pass seed for institution logo metadata. It was built from `data/processed/institutions.jsonl` and `data/processed/programmes.jsonl`, prioritizing universities, high-recognition public/private institutions, and institutions with many programme rows.

No image files are downloaded into the repository. `logo_url` values point to official institution sources only, such as homepage header logos, official site icons/favicons, or institution-owned portal/header assets.

Status values:

- `verified`: logo metadata was found on an official institution-controlled source.
- `needs_review`: official source or logo candidate needs manual follow-up before import.
- `missing`: no official logo source has been identified.

Rows with campus-specific notes generally reuse the official parent institution logo until a campus-specific logo is verified.
