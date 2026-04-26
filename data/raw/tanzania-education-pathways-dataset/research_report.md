# Kozi Ipi Tanzania Education Dataset Research Report

Research date: 2026-04-26  
Output files: `institutions.csv`, `programmes.csv`, `entry_requirements.csv`, `institution_enrichment.csv`

## Executive summary

This is an import-ready official-source dataset for Tanzanian education pathways across Form Four, Form Six, Certificate / NTA Level 4 or 5, Ordinary Diploma / NTA Level 6, vocational trades, and equivalent qualification routes.

The build uses official regulator sources as the source of truth. Institution websites were not broadly scraped for logos because verified logos require official institution pages and the task priority was the regulator guidebook core. Logo fields are therefore conservative: blank plus `logo_status = missing` unless an official page was verified.

## Source vintage

The latest official guidebooks found and used at the research date were 2025/2026 guidebooks.

- TCU: 2025/2026 undergraduate admission guidebooks for holders of secondary-school qualifications and ordinary diploma/equivalent applicants.
- NACTVET: 2025/2026 NTA Admission Guidebook and 2025/2026 Guidebook for Universities.
- NACTVET 2026/2027: not used because the public downloads page still listed 2025/2026 guidebooks during this build. A NACTVET calendar/result snippet indicated 2026/2027 guidebook compilation activities in 2026, so a later refresh should check again.
- VETA: official VETA institutional training page plus official occupations-offered PDF for VETA-owned centres.
- Zanzibar: official Zanzibar Vocational Training Authority pages for government centres.

## Sources used

- TCU undergraduate admission guidebooks page: https://tcu.go.tz/services/admissions-coordination-and-database-management/admission-guidebooks/undergraduate
- TCU 2025/2026 secondary-school qualifications guidebook: https://tcu.go.tz/sites/default/files/public_notices/2025-07/Admission%20Guidebook%20for%20Holders%20of%20Secondary%20School%20Qualifications_2025_2026.pdf
- TCU 2025/2026 ordinary diploma/equivalent guidebook: https://tcu.go.tz/sites/default/files/file_uploads/guide_books/2025-07/Admissions%20Guidebook%20for%20Holders%20of%20Diploma%20or%20Equivalent%20Qualifications_2025_2026.pdf
- NACTVET downloads page: https://www.nactvet.go.tz/page/downloads
- NACTVET students admission page: https://www.nactvet.go.tz/page/students-admission
- NACTVET 2025/2026 NTA guidebook: https://www.nactvet.go.tz/storage/public/files/GUIDEBOOK_FOR_ALL_NTA_2025_2026.pdf
- NACTVET 2025/2026 universities guidebook: https://www.nactvet.go.tz/storage/public/files/GUIDEBOOK_FOR_ALL_UNIVERSITIES_2025_2026.pdf
- VETA institutional based training page: https://www.veta.go.tz/institutional-based-training
- VETA occupations offered in VETA-owned centres PDF: https://www.veta.go.tz/publication/doc/hqxwsDjWybeZr6IpHKhaFwXoCG3kT0nS8fEaNHmw.pdf
- Zanzibar VTA homepage: https://www.zvta.go.tz/
- ZVTA Mwanakwerekwe official centre page: https://www.zvta.go.tz/index.php/our-centers/government-center/mwanakwerekwe-vtc/
- ZVTA Makunduchi official centre page: https://www.zvta.go.tz/index.php/our-centers/government-center/makunduchi-vtc/
- ZVTA Daya official centre page: https://www.zvta.go.tz/index.php/our-centers/government-center/daya-vtc/
- ZVTA Vitongoji official centre page: https://www.zvta.go.tz/index.php/our-centers/government-center/vitongoji-vtc/
- ZVTA Mkokotoni official centre page: https://www.zvta.go.tz/index.php/our-centers/government-center/mkokotoni-vtc/

## Dataset coverage

### Row counts

- Institutions: 621
- Programmes: 2916
- Entry requirement routes: 4503
- Institution enrichment rows: 612

### Institutions by regulator

- NACTVET: 502
- TCU: 80
- VETA: 34
- ZVTA/VTA Zanzibar: 5

### Programmes by regulator

- NACTVET: 1686
- TCU: 887
- VETA: 297
- ZVTA/VTA Zanzibar: 46

### Programmes by pathway type

- diploma: 1619
- certificate: 65
- unknown: 2
- degree: 887
- vocational: 337
- short_course: 6

### Entry requirement confidence

- high: 3615
- medium: 534
- low: 354

### Eligibility flag distribution

Form Four direct:
- no: 2634
- yes: 1515
- unknown: 354

Form Six:
- no: 2367
- yes: 1782
- unknown: 354

Certificate:
- yes: 1625
- no: 2524
- unknown: 354

Diploma:
- no: 3253
- yes: 891
- unknown: 359

### Logo/contact enrichment status

Logo status:
- missing: 612

Rows with website values: 39 of 612  
Rows with email values: 31 of 612  
Rows with phone values: 28 of 612

## What was included

- Bachelor degree programmes and entry routes from TCU 2025/2026 undergraduate admission guidebooks.
- Form Six / ACSEE degree routes from the TCU secondary-school qualifications guidebook.
- Ordinary Diploma / equivalent degree routes from the TCU diploma/equivalent guidebook.
- Certificate, technician certificate, and ordinary diploma programmes from NACTVET 2025/2026 NTA and universities guidebooks.
- NACTVET programme durations, capacities, fees where available in the official guidebook text.
- VETA-owned centre occupations/trades from the official VETA occupations PDF.
- Zanzibar VTA government-centre course lists from official ZVTA centre pages where course names were accessible.
- Conservative normalized eligibility flags for Kozi Ipi filtering.

## What was excluded

- Blogs, SEO admission portals, copied admission lists, social posts, unofficial summaries, and third-party logo websites.
- Unverified logos from Google Images or logo repositories.
- Institution-level programme claims from unofficial prospectus mirrors.
- VETA private/registered centre catalogue rows not present in the official VETA-owned-centres PDF used in this pass.
- Zanzibar private centre data, unless present on official ZVTA pages. The current ZVTA extraction focused on government-centre pages.

## Normalization and eligibility approach

Eligibility flags are deliberately conservative.

- `accepts_form_four_direct = yes` only when the official requirement supports direct CSEE / Form Four entry.
- TCU bachelor degree rows from the secondary-school guidebook are marked `accepts_form_six = yes` and `accepts_form_four_direct = no`.
- TCU ordinary diploma/equivalent routes are marked `accepts_diploma = yes` where supported and `accepts_form_four_direct = no`.
- NACTVET direct CSEE certificate/diploma routes are marked Form Four eligible only when the requirement route begins with CSEE/Certificate of Secondary Education wording.
- If a source lists a course but does not state academic entry requirements, eligibility flags are `unknown`.
- Kozi Ipi should treat `unknown` as not enough evidence to claim eligibility.
- Interest matching should remain separate from eligibility filtering.

## Known gaps and limitations

- TCU PDFs contain many line-wrapped table cells. Programme names, codes, capacities, and durations were parsed where possible; rows with uncertain parsing are marked `needs_review = yes`.
- TCU campus names and ownership types are not fully populated in this pass. Some institutions appear in multiple campus contexts, but the guidebook text extraction did not always expose campus fields cleanly.
- Some TCU programme names remain flagged as potentially truncated because the PDF text split the programme name around line breaks. These rows are in the manual review queue.
- VETA source used here lists occupations offered at VETA-owned centres, but not programme-specific academic entry requirements. VETA eligibility flags are therefore `unknown`.
- ZVTA Mkokotoni page states that the centre offers programmes, but accessible text did not expose the programme names in the source used here. It is marked for manual review.
- Logos are almost all missing by design. Verified logo enrichment should be a separate crawl of official institution homepages/admission portals.
- Fees are included only where available in the official guidebook text. Fee strings should not be treated as definitive billing without a fresh institution confirmation.

## Duplicate and renamed institution considerations

Possible duplicate or campus-sensitive cases to review before production display:

- College of Business Education campuses and code prefixes.
- Institute of Accountancy Arusha campuses.
- Tanzania Institute of Accountancy campuses.
- Dar es Salaam Institute of Technology campuses.
- Mzumbe University main/campus contexts.
- University names that appear in both TCU and NACTVET because universities can offer both degree and NTA certificate/diploma pathways.
- Names that include legacy spellings, hyphenation, or abbreviations such as SUMAIT, IAA, CBE, DIT, TIA, IFM, NIT.

## Manual review queue

Institution rows needing review: 35  
Programme rows needing review: 862

Top programme review reasons:

- Verify current trade availability and programme-specific entry requirements before claiming eligibility.: 297
- admission_capacity differs across official source rows: 264
- admission points/capacity/duration not confidently parsed: 228
- capacity/duration not confidently parsed: 52
- programme code not confidently parsed: 31
- programme name appears truncated by PDF extraction: 13
- duration differs across official source rows: 8

Top institution review reasons:

- Verify centre contact/region and current programme-specific entry requirements: 34
- source is an official but irregular PDF table.: 34
- Programme names not visible in accessible official page text.: 1

Suggested manual review priority:

1. TCU rows where `review_reasons` contains `programme name appears truncated by PDF extraction`.
2. TCU rows where `programme code not confidently parsed`.
3. TCU rows where admission capacity or duration differs across official source rows.
4. VETA rows before showing eligibility claims.
5. ZVTA Mkokotoni programmes.
6. Institution enrichment fields, especially logos, emails, and admissions URLs.

## Recommended Kozi Ipi search and eligibility logic

### Search filters

Use these fields directly:

- Course name: `programme_name`, `normalized_programme_name`
- Institution name: `institution_name`, `normalized_institution_name`, `abbreviation_or_aliases`
- Career goal: derive from `field_category` and `course_family`
- Field/category: `field_category`, `course_family`
- Region: `region`
- Award level: `award_level`, `qualification_level`
- Regulator: `regulator`
- Pathway: `pathway_type`
- Institution type: `institution_type`
- Ownership: `ownership_type`

### Eligibility rules

- A Form Four leaver should be shown as eligible only when at least one matching entry route has `accepts_form_four_direct = yes`.
- A Form Six leaver should be shown as eligible only when at least one matching entry route has `accepts_form_six = yes` and any subject/points requirement is satisfied.
- A certificate holder should be shown as eligible only when `accepts_certificate = yes` and the prior-field requirement is satisfied or not specified.
- A diploma holder should be shown as eligible only when `accepts_diploma = yes` and the prior-field/GPA requirement is satisfied or not specified.
- Equivalent qualification holders should be routed through `accepts_equivalent = yes`, but the app should ask for the exact qualification and show a caution where `eligibility_confidence` is medium or low.
- Rows with `unknown` should be displayed as “check with institution/regulator,” not “eligible.”
- Rows with `needs_review = yes` should be hidden from automatic eligibility claims until reviewed, or shown with a review badge.

## Refresh recommendations

- Re-check TCU and NACTVET official pages when 2026/2027 guidebooks are released.
- Add a dedicated official institution-site enrichment crawl for websites, admissions URLs, application URLs, emails, phones, and logos.
- Add a human-in-the-loop review table for flagged rows.
- Consider storing entry routes as child records linked to canonical programme IDs, because one programme can have multiple valid routes: Form Six, diploma/equivalent, certificate progression, or direct CSEE.

## Import notes

- CSVs are UTF-8 encoded.
- Source URLs are included row-wise.
- `raw_requirement_text` is preserved for audit and should be kept in the database.
- `confidence_level`, `eligibility_confidence`, `needs_review`, and `review_reasons` should be retained in production tables.
