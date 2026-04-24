# Tanzania post-Form Four institutions and programmes dataset
Verified on: 2026-04-24
This dataset was built primarily from the official 2025/2026 NACTVET admission guidebooks for technical institutions and universities, then enriched with TCU institution-status matches for relevant university/university college records. Blank cells in the CSVs mean null / not verified.
## Output files
- institutions.csv
- programmes.csv
## Headline counts
- Institutions found: 503
- Programmes found: 1771
- Programmes with an extracted direct Form Four route (CSEE-based or NVA/Trade Test + CSEE): 1568
- Institutions with at least one direct Form Four route: 491
- Institutions with no direct Form Four route in the extracted requirements: 12

## Source links used
- https://www.nactvet.go.tz/page/students-admission
- https://www.nactvet.go.tz/downloads
- https://www.nactvet.go.tz/uploads/documents/en-1748443044-GUIDEBOOK%20FOR%20ALL%20NTA_2025_2026.pdf
- https://www.nactvet.go.tz/uploads/documents/en-1748443284-GUIDEBOOK%20FOR%20ALL%20UNIVERSITIES_2025_2026.pdf
- https://www.nactvet.go.tz/index.php/registered-institutions
- https://tvetims.nacte.go.tz/
- https://www.tcu.go.tz/services/accreditation/universities-registered-tanzania
- https://pms.tcu.go.tz/

## Method notes
- Regulator / official admissions sources were prioritized over institution websites and blogs.
- The two NACTVET guidebooks were used as the primary bulk source because they include institution names, ownership, district/council, region, programme names, entry requirements, duration, capacity and fees.
- TCU was used to enrich university / university college accreditation status where the NACTVET guidebook did not provide it directly.
- Institution websites, phone numbers and emails were not bulk-enriched unless verifiable from official institutional/regulator pages at scale. Those fields remain blank where not verified.
- No speculative rows were added. Where data could not be verified, the field was left blank or marked unknown.

## Commonly missing fields
- institutions.phone_numbers: missing in 503 rows
- institutions.website: missing in 503 rows
- institutions.email: missing in 503 rows
- institutions.secondary_source_type: missing in 469 rows
- institutions.tcu_matched_name: missing in 469 rows
- institutions.secondary_source_url: missing in 469 rows
- programmes.application_link: missing in 1771 rows
- programmes.secondary_source_url: missing in 1476 rows
- programmes.secondary_source_type: missing in 1476 rows
- programmes.notes: missing in 740 rows
- programmes.required_subjects: missing in 656 rows
- programmes.entry_route_types: missing in 10 rows

## Duplicate / ambiguous / renamed institutions to watch
- HUBERT KAIRUKI MEMORIAL UNIVERSITY: TCU lists Kairuki University (KU), formerly HKMU
- CATHOLIC UNIVERSITY COLLEGE OF MBEYA: TCU lists Catholic University of Mbeya (CUoM), formerly CUCoM
- MOSHI UNIVERSITY COLLEGE OF COOPERATIVE AND BUSINESS STUDIES: TCU lists Moshi Cooperative University (MoCU)
- KILIMANJARO CHRISTIAN MEDICAL UNIVERSITY COLLEGE: TCU lists KCMC University
- ST. JOSEPH UNIVERSITY COLLEGE OF HEALTH SCIENCES: TCU lists St. Joseph University College of Health and Allied Sciences (SJCHAS)
- ST. AUGUSTINE UNIVERSITY OF TANZANIA - ARUSHA CENTRE: TCU lists the centre separately, with status "As per status of the Mother University"
- TUMAINI UNIVERSITY DAR ES SALAAM COLLEGE: TCU lists Dar es Salaam Tumaini University (DarTU), formerly TUDARCo

## Sources that were incomplete or awkward for bulk extraction
- The NACTVET registered-institutions page was useful as an official reference point, but the institution table was not exposed cleanly in the parsed HTML during this pass.
- The NACTVET admissions/download pages contained unrelated spammy/out-of-context links in the parsed page content, so the PDFs themselves were treated as the source of truth.
- One programme requirement looked truncated in the source guidebook: Catholic University College of Mbeya - Diploma in Law. It is flagged medium-confidence in programmes.csv and should be manually verified.
- TCU PMS and NACTVET CAS did not provide a simple public bulk-export path in this workflow, so they were treated as reference/spot-check sources rather than the main extraction source.

## What should be manually verified by phone/email
- Institution websites, general phone numbers and admissions emails.
- Exact accreditation / registration-status labels for technical institutions from NACTVET institution-detail pages.
- Any renamed / rebranded university and university college records, especially where the guidebook uses older branding but TCU uses current branding.
- Programme modes of study (full-time / part-time / online), because the guidebooks generally did not state mode.
- Application URLs, because the official admission page says applicants apply directly to institutions, but direct institution-level application links were not available in bulk.
- The flagged truncated requirement row for Diploma in Law at Catholic University College of Mbeya.

## Most common programme categories for Form Four leavers
- health: 566
- business: 282
- social work: 174
- engineering: 124
- other: 93
- ICT: 75
- logistics: 65
- media: 64
- agriculture: 54
- education: 25

## Suggested search/filter fields for the website
- institution_name
- region
- district/council
- ownership_type
- institution_category
- programme_name / normalized_programme_name
- award_level
- field_category
- accepts_form_four_direct
- entry_route_types
- required_subjects
- duration
- fees_if_available (and a derived fee range)
- accreditation_status / accreditation_status_if_available
- has_form_four_direct_programme
- application_method
- confidence_level

## Practical next-step recommendations
- Add a second enrichment pass focused only on institution contact details (website, phone, email), using regulator institution-detail pages and official institution websites.
- Build derived filters from minimum_entry_requirements, especially direct CSEE eligibility, science-subject requirements, and NTA-level top-up routes.
- Keep both raw and normalized names for institutions/programmes so renamed institutions remain searchable.
- Consider adding a separate admissions-intake table later if you want year-by-year change tracking (fees, capacity, entry rules, status).

## Notes on interpretation
- Many programmes combine multiple entry routes. In programmes.csv, these are merged into a single row and summarized in minimum_entry_requirements, duration, admission_capacity and fees_if_available.
- University accreditation_status_if_available is inherited from the matched TCU institution/university college status, not from programme-level accreditation records.
- The dataset includes diploma/top-up pathways as well as direct Form Four routes, because the official guidebooks bundle them together. Use accepts_form_four_direct to filter the direct-entry options.
- Blank website/phone/email/application_link fields should be treated as 'not yet verified', not 'does not exist'.
