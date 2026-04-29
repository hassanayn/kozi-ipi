# Kozi Ipi Search Queries

This document captures the kinds of searches Kozi Ipi should support. The goal is to make search work for Form Four leavers, Form Six leavers, diploma holders, parents, guardians, and students who may not know the exact name of a course or institution.

## Search Principles

- Support English, Swahili, and mixed-language queries.
- Support exact course and institution names.
- Support natural questions like "I want to become a nurse" or "naweza soma nini na division 3".
- Support searches by career goal, course, location, results, subjects, institution, affordability, and application path.
- Do not assume the user knows the official course title.
- Show requirements clearly when a course may require specific subjects or grades.

## Intent Types

### Career Intent

The user searches based on what they want to become or where they want to work.

Examples:

```text
I want to become a nurse
I want to be a doctor
I want to work in hospitals
I want to work in a bank
I want to become a teacher
I want to work in IT
I want to work at the airport
I want to start a business
I want to work in tourism
I want to work with electricity
I want to become a mechanic
I want to work in agriculture
```

Possible mappings:

```text
nurse -> nursing, clinical medicine, medical laboratory, pharmaceutical sciences, community health
hospital -> nursing, clinical medicine, medical laboratory, pharmacy, health records
bank -> accounting, banking, business administration, procurement
IT -> ICT, computer science, software development, networking, cybersecurity
airport -> travel and tourism, clearing and forwarding, logistics
teacher -> education, early childhood education, primary education
business -> business administration, entrepreneurship, marketing, accounting
electricity -> electrical installation, electrical engineering, renewable energy
mechanic -> automotive engineering, motor vehicle mechanics
agriculture -> agriculture, animal health, crop production, agribusiness
```

### Course Intent

The user already knows the course or a rough version of the course name.

Examples:

```text
clinical medicine
diploma in ICT
certificate in procurement
hotel management
electrical installation
community development
medical laboratory
pharmaceutical sciences
accounting
business administration
early childhood education
social work
law
journalism
clearing and forwarding
beauty and hair dressing
fashion design
```

### Location Intent

The user cares about where the institution is located.

Examples:

```text
colleges in Dar es Salaam
vyuo vya Dar es Salaam
vyuo vya Arusha
health colleges in Mwanza
VETA near Dodoma
nursing colleges in Kilimanjaro
technical colleges in Mbeya
business colleges in Morogoro
colleges in Zanzibar
vyuo karibu na nyumbani
```

### Qualification Intent

The user searches based on prior results, grades, qualification route, or eligibility.

Examples:

```text
I got division 3
I got division 4
naweza soma nini na division 3
naweza soma nini na division 4
courses for form four leaver
courses with four passes
courses for someone with D grades
courses for someone who failed math
I failed mathematics
I failed physics
I have D in biology
I have C in chemistry
I have four passes
I have two credits
```

### Subject Intent

The user searches based on subjects they studied, passed, failed, or avoided.

Examples:

```text
courses for arts students
courses for science students
courses for business students
courses for PCB
courses for PCM
what can I study with biology and chemistry
courses without physics
courses without mathematics
courses without biology
courses with geography
courses with commerce
courses with book keeping
courses with English and history
```

### Institution Intent

The user searches for a known institution, abbreviation, or campus.

Examples:

```text
DIT
VETA Chang'ombe
Mzumbe
CBE
IFM
Kampala International University Tanzania
St Joseph College
UDSM
Ardhi University
Muhimbili
NIT
TIA
ATC
```

### Affordability Intent

The user searches based on cost, ownership, or financial constraints.

Examples:

```text
affordable colleges in Dar
cheap diploma courses
government colleges
public colleges
private colleges
colleges with hostel
colleges with loan
courses with low fees
vyuo vya bei nafuu
vyuo vya serikali
```

### Application Intent

The user searches for how or when to apply.

Examples:

```text
how to apply for nursing
how to apply through NACTVET
NACTVET CAS courses
VETA application
TCU application
college application deadline
when do applications open
application link for clinical medicine
admission requirements for ICT
```

### Language Variants

Kozi Ipi should support Swahili, English, and mixed terms.

Examples:

```text
nursing colleges
vyuo vya nursing
vyuo vya afya
course za computer
kozi za computer
kozi za biashara
chuo cha hotel management
vyuo vya ufundi
vyuo vya walimu
naweza soma nini
nataka kusoma afya
nataka kuwa nurse
```

## Homepage Search Placeholder Ideas

Use rotating placeholders instead of one fixed example.

```text
Search "I want to become a nurse"
Search "courses without physics"
Search "vyuo vya afya Dar es Salaam"
Search "computer courses after Form Four"
Search "I got Division III, what can I study?"
Search "government colleges for diploma"
Search "hotel management colleges"
```

## Expected Search Behavior

Example:

```text
User query:
I want to work in hospitals but I did not take physics

Expected result:
- Show health-related course options.
- Highlight which courses require physics, biology, chemistry, or specific grades.
- Show safer alternatives if the user does not meet requirements.
- Show matching institutions and locations.
- Warn the user to verify final requirements with the institution or regulator.
```

Example:

```text
User query:
naweza soma nini na division 4

Expected result:
- Show certificate, vocational, and other realistic entry pathways.
- Avoid recommending courses that clearly require stronger grades unless marked as "unlikely".
- Show entry requirements for each option.
- Let the user filter by region, fees, and field.
```

## Data Fields Needed For Search

To support these queries, the dataset should include:

```text
institution_name
normalized_institution_name
abbreviations
institution_type
ownership_type
region
district_or_council
physical_location
regulator
accreditation_status
programme_name
normalized_programme_name
field_category
career_keywords
swahili_keywords
award_level
minimum_entry_requirements
required_subjects
duration
fees_if_available
application_method
application_link
source_url
last_verified_date
confidence_level
```

## Search Filters

Recommended filters:

```text
Region
District
Field category
Award level
Institution type
Ownership type
Regulator
Application method
Required subjects
Duration
Fees range
Accreditation status
Suitable for Form Four leaver
Confidence level
```
