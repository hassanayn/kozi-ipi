# Data Enrichment

This directory holds reviewable enrichment artifacts that are not yet part of the canonical processed dataset.

## Institution Logos

`institution-logos.seed.csv` is a first-pass seed for institution logo metadata. It was built from `data/processed/institutions.jsonl` and `data/processed/programmes.jsonl`, prioritizing universities, high-recognition public/private institutions, and institutions with many programme rows.

No image files are downloaded into the repository. `logo_url` values point to official institution sources only, such as homepage header logos, official site icons/favicons, or institution-owned portal/header assets.

Status values:

- `verified`: logo metadata was found on an official institution-controlled source.
- `needs_review`: official source or logo candidate needs manual follow-up before import.
- `missing`: no official logo source has been identified.

Rows with campus-specific notes generally reuse the official parent institution logo until a campus-specific logo is verified.
