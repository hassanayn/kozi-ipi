# Tanzania post-Form-Four education dataset research report

Verification date: 2026-04-24

## Scope
This export was built to support a national college/course discovery website for students after Form Four. It combines official regulator sources, ministry admissions sources, and selected institution-level official pages for enrichment.

## Final output summary
- Total institutions in `institutions.csv`: **631**
- Total programmes in `programmes.csv`: **2777**
- Institutions with high confidence: **575**
- Institutions with medium confidence: **56**
- Programmes with high confidence: **2018**
- Programmes with medium confidence: **759**
- Mainland institutions: **602**
- Zanzibar institutions: **29**

## Official sources used
- NACTVET technical institutions guidebook 2025/2026: https://www.nactvet.go.tz/storage/public/files/GUIDEBOOK_FOR_ALL_NTA_2025_2026.pdf
- NACTVET universities certificate and diploma guidebook 2025/2026: https://www.nactvet.go.tz/storage/public/files/GUIDEBOOK_FOR_ALL_UNIVERSITIES_2025_2026.pdf
- VETA 2026 list of centres and trades: https://www.veta.go.tz/publication/doc/ORODHA%20YA%20VYUO%20VYA%20VETA%20NA%20FANI%20ZITAKAZOTOLEWA%20KWENYE%20VYUO%20WA%20VETA%20MWAKA%202026.pdf
- TCU bachelor's degree admission guidebook for holders of secondary school qualifications 2025/2026: https://www.tcu.go.tz/sites/default/files/admission_guidebooks/Bachelors_Degree_Admission_Guidebook_for_the_2025_2026_Academic_Year_For_Holders_of_Secondary_School_Qualifications.pdf
- Ministry of Education public colleges page (community development and teacher-college list): https://www.moe.go.tz/sw/vyuo/chuo-cha-ualimu-bunda
- Ministry of Education 2025/2026 teacher diploma admission notice: https://www.moe.go.tz/sw/matangazo/tangazo-la-nafasi-za-mafunzo-ya-ualimu-ngazi-ya-stashahada-ya-ualimu-elimu-ya-awali-na
- Ministry joining-instruction PDFs used to enrich selected teacher colleges (e.g. Butimba, Kabanga, Dakawa, Mpwapwa, Ngorongoro, Singachini)
- Zanzibar Vocational Training Authority home page: https://www.zvta.go.tz/
- Zanzibar VTA centre pages used for programme extraction: https://www.zvta.go.tz/index.php/our-centers/government-center/makunduchi-vtc/ and https://www.zvta.go.tz/index.php/our-centers/government-center/daya-vtc/
- NACTVET institute detail page used to enrich Zanzibar College of Health and Technology: https://www.nactvet.go.tz/institute/zanzibar-college-of-health-and-technology-zanzibar/f9399fed7824fb1bc428439241b1ea648a4a1dd0

## Regulators covered
- NACTVET: 390 institutions, 1463 programmes
- TCU: 90 institutions, 672 programmes
- VETA: 77 institutions, 480 programmes
- Ministry of Education: 89 institutions, 122 programmes
- Zanzibar authority (ZVTA): 5 institutions, 40 programmes

## Regions covered
The institutions dataset covers **32** region / island labels:
Arusha, Dar es Salaam, Dodoma, Geita, Iringa, Kagera, Katavi, Kigoma, Kilimanjaro, Lindi, Manyara, Mara, Mbeya, Morogoro, Mtwara, Mwanza, Njombe, North Pemba, Pwani, Rukwa, Ruvuma, Shinyanga, Simiyu, Singida, Songwe, South Pemba, South Unguja, Tabora, Tanga, Zanzibar, Zanzibar Central/South, Zanzibar Urban/West

## Institution-type breakdown
- health college: 154
- business college: 113
- vocational centre: 83
- teacher college: 75
- technical college: 63
- agriculture college: 37
- community development/social work college: 36
- university: 34
- mixed: 21
- university college: 12
- ICT college: 2
- tourism/hospitality college: 1

## Programme award-level breakdown
- ordinary diploma: 1278
- degree: 638
- vocational certificate: 505
- unknown: 137
- diploma: 122
- certificate: 28
- basic technician certificate: 20
- short course: 15

## Programme field-category breakdown
- health: 700
- business: 460
- other: 256
- ICT: 209
- education: 206
- engineering: 126
- mechanical: 117
- construction: 99
- electrical: 94
- accounting: 86
- beauty/fashion: 62
- agriculture: 57
- community development: 54
- social work: 44
- arts: 41

## Method notes
1. Official regulator and ministry sources were prioritized over institution marketing pages and all non-official sources.
2. Missing facts were left blank or set to `unknown`; no missing data was guessed.
3. Institutions were deduplicated primarily by normalized name, then enriched by combining official fields such as registration number, regulator coverage, contacts, and source URLs.
4. TCU institution rows are high confidence because they come directly from the official guidebook. TCU programme rows are medium confidence because the source PDF layout is difficult to parse cleanly at scale and some rows require a human verification pass.
5. Teacher-college rows were built from the official ministry admission notice for 2025/2026, plus selected official joining-instruction PDFs used to enrich contacts and locations.
6. Zanzibar vocational coverage was extended using official Zanzibar VTA centre pages for Makunduchi and Daya, and the ZVTA portal for the list of government centres.
7. Explicit police/military-only institutions were omitted from this youth-facing export.

## Important source-vintage note
As of 2026-04-24, the latest NACTVET guidebooks publicly available on the official site were the **2025/2026** guidebooks. The NACTVET academic calendar indicated the 2026/2027 guidebook publication would come later, so the 2025/2026 guidebooks were used as the latest official NACTVET programme source available at verification time.

## Data gaps
- VETA's wider registered-centre catalogue (including many non-VETA-run private / NGO / faith-based vocational centres) was only spot-checked, not fully scraped zone-by-zone. The final dataset includes the official 2026 VETA-centre list and trades, but a future pass should extract the full `vetcat` registry.
- Community development colleges were found on the ministry list, but central programme-by-programme data was not published on the same source page. These institutions are included with medium confidence and flagged for follow-up.
- Many non-government teacher colleges are listed in the ministry notice only by short name. Their exact official legal names, locations, contacts, and websites still need institution-level verification.
- Fees are strong in NACTVET guidebooks but sparse in VETA, TCU, ministry teacher pages, and Zanzibar VTA pages.
- Many institutions do not publish structured phone/email/website data in regulator lists.
- Study mode is often unspecified outside VETA and selected Zanzibar VTA centre pages.
- Application links are strong for government teacher colleges (ministry portal) and institution-level admission systems are still sparse elsewhere.
- TCU programme parsing still needs a second QA pass before public launch if you want near-perfect undergraduate coverage.

## Duplicate or ambiguous institutions merged / flagged
These institutions had alternate official spellings or appeared across multiple official sources:
- COLLEGE OF BUSINESS EDUCATION - DAR ES SALAAM
- COLLEGE OF BUSINESS EDUCATION - DODOMA
- COLLEGE OF BUSINESS EDUCATION - MWANZA
- DAR ES SALAAM INSTITUTE OF TECHNOLOGY
- DAR ES SALAAM INSTITUTE OF TECHNOLOGY - MWANZA CAMPUS
- DAR ES SALAAM MARITIME INSTITUTE
- INSTITUTE OF ACCOUNTANCY ARUSHA
- INSTITUTE OF FINANCE MANAGEMENT
- INSTITUTE OF RURAL DEVELOPMENT PLANNING - MWANZA
- INSTITUTE OF SOCIAL WORK - KISANGARA CAMPUS
- MS TRAINING CENTRE FOR DEVELOPMENT COOPERATION
- NATIONAL INSTITUTE OF TRANSPORT (NIT)
- TENGERU INSTITUTE OF COMMUNITY DEVELOPMENT
- THE MWALIMU NYERERE MEMORIAL ACADEMY - ZANZIBAR
- WATER INSTITUTE

## Unreliable sources encountered
- No non-official source was imported into the final dataset.
- Search results and snippets were used only to locate official PDFs / official ministry pages where needed.
- Rows that could not be anchored to an official source URL were excluded.

## Fields that require phone/email verification
Summary:
- Institutions missing phone numbers: **621**
- Institutions missing email addresses: **621**
- Institutions missing websites: **624**
- Institutions with blank region: **99**
- Programmes missing fees: **1280**
- Programmes missing entry requirements: **520**
- Programmes with unknown Form-Four suitability: **570**
- Programmes missing duration: **505**
- Programmes missing application link: **2708**

Priority examples for direct phone/email verification:
- Chuo cha Maendeleo ya Wananchi Kasulu
- Chuo cha Maendeleo ya Wananchi Ilula
- Chuo cha Maendeleo ya Wananchi Chilala
- Chuo cha Maendeleo ya Wananchi Newala
- Chuo cha Maendeleo ya Wananchi Mtawanya
- Chuo cha Maendeleo ya Wananchi Mhukuru
- Chuo cha Maendeleo ya Wananchi Sofi
- Chuo cha Maendeleo ya Wananchi Kilwa Masoko
- Chuo cha Maendeleo ya Wananchi Ikwiriri
- Chuo cha Maendeleo ya Wananchi Kiwanda
- Chuo cha Maendeleo ya Wananchi Mto wa Mbu
- Chuo cha Maendeleo ya Wananchi Gera
- Chuo cha Maendeleo ya Wananchi Chisalu
- Chuo cha Maendeleo ya Wananchi Handeni
- Chuo cha Maendeleo ya Wananchi Munguri
- Chuo cha Maendeleo ya Wananchi Rubondo
- Chuo cha Maendeleo ya Wananchi Tarime
- Chuo cha Maendeleo ya Wananchi Karumo
- Chuo cha Maendeleo ya Wananchi Arnautoglu
- Chuo cha Ualimu Singachini
- Al harmain
- Arafah
- Arusha
- Bishorp Daniel
- Coast

## Recommended search filters for the website
- mainland_or_zanzibar
- region
- district_or_council
- regulator
- institution_type
- ownership_type
- accreditation_status
- confidence_level
- award_level
- field_category
- suitable_for_form_four_leaver
- study_mode
- application_method
- fees_if_available (present / missing)
- registration_number present / missing

## Recommended course categories for Form Four leavers
Use these top-level categories for search and recommendation:
- Health and allied sciences
- Engineering and technical studies
- Construction, electrical, and mechanical trades
- ICT and computing
- Business, accounting, finance, procurement, logistics
- Agriculture, livestock, fisheries, natural resources
- Tourism, hospitality, food production, front office
- Teacher education
- Community development and social work
- Media, arts, law, and communication
- Beauty, fashion, tailoring, garment design
- Short vocational courses

## Recommended next enrichment pass
1. Fully scrape the official VETA `vetcat` centre registry, including registration number, owner, registration status, and occupations per centre.
2. Add institution-level websites and contact pages for the medium-confidence teacher / community-development / Zanzibar rows.
3. Re-run TCU programme extraction with a manual QA layer or page-by-page correction.
4. Add fee tables and application deadlines from institution-level admissions pages where available.
5. Add course tags for recommendation, for example: STEM, health, business, hands-on trade, fast-to-employment, suitable_for_form_four_leaver, English-medium, Kiswahili-medium.

## Files delivered
- `institutions.csv`
- `programmes.csv`
