import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { parse } from "csv-parse/sync"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

const legacyBaseDir = join(root, "data/raw/tanzania-post-form-four-dataset")
const nactvetEnrichmentDir = join(root, "data/raw/tanzania-education-dataset")
const pathwaysDir = join(root, "data/raw/tanzania-education-pathways-dataset")
const logoEnrichmentPath = join(root, "data/enrichment/institution-logos.seed.csv")
const outputDir = join(root, "data/processed")

type Row = Record<string, string>
type Suitability = "yes" | "no" | "unknown"
type ConfidenceLevel = "high" | "medium" | "low"
type LogoStatus = "verified" | "missing" | "needs_review"

type ProcessedInstitution = {
  institutionName: string
  normalizedInstitutionName: string
  registrationNumber?: string
  registrationNumberAsShown?: string
  regulator: string
  accreditationStatus?: string
  ownershipType: string
  institutionType: string
  institutionCategory?: string
  region?: string
  districtOrCouncil?: string
  physicalLocation?: string
  mainlandOrZanzibar?: string
  website?: string
  logoUrl?: string
  logoSourceUrl?: string
  logoStatus?: LogoStatus
  logoVerifiedAt?: string
  phoneNumbers?: string
  email?: string
  applicationMethod?: string
  admissionsUrl?: string
  applicationUrl?: string
  hasFormFourDirectProgramme: Suitability
  programmeCount?: number
  awardLevels?: string[]
  fieldCategories?: string[]
  courseFamilies?: string[]
  browseSearchText?: string
  officialSourceUrl: string
  sourceType: string
  sourceDatasets: string[]
  confidenceLevel: ConfidenceLevel
  lastVerifiedDate: string
  notes?: string
  needsReview: boolean
  reviewReasons: string[]
  searchText: string
}

type ProcessedProgramme = {
  programmeName: string
  normalizedProgrammeName: string
  programmeCode?: string
  awardLevel: string
  qualificationLevel?: string
  pathwayType?: string
  fieldCategory: string
  courseFamily?: string
  institutionName: string
  normalizedInstitutionName: string
  institutionRegistrationNumber?: string
  regulator: string
  institutionType?: string
  ownershipType?: string
  region?: string
  districtOrCouncil?: string
  minimumEntryRequirements?: string
  requiredSubjects?: string
  suitableForFormFourLeaver: Suitability
  acceptsFormSix: Suitability
  acceptsCertificate: Suitability
  acceptsDiploma: Suitability
  acceptsEquivalent: Suitability
  duration?: string
  feesIfAvailable?: string
  feeBand?: string
  studyMode?: string
  campusLocation?: string
  admissionCapacity?: string
  entryRouteTypes?: string
  acceptsFormFourDirect: Suitability
  accreditationStatusIfAvailable?: string
  applicationLink?: string
  officialSourceUrl: string
  sourceType: string
  sourceDatasets: string[]
  confidenceLevel: ConfidenceLevel
  lastVerifiedDate: string
  notes?: string
  needsReview: boolean
  reviewReasons: string[]
  careerKeywords: string[]
  swahiliKeywords: string[]
  searchText: string
}

type ProcessedEntryRequirement = {
  programmeName: string
  normalizedProgrammeName: string
  institutionName: string
  normalizedInstitutionName: string
  rawRequirementText: string
  acceptsFormFourDirect: Suitability
  acceptsFormSix: Suitability
  acceptsCertificate: Suitability
  acceptsDiploma: Suitability
  acceptsEquivalent: Suitability
  minimumCseeDivisionIfAvailable?: string
  minimumAcseePrincipalPassesIfAvailable?: string
  minimumPointsIfAvailable?: string
  requiredSubjects?: string
  requiredSubjectGradesIfAvailable?: string
  requiredPriorFieldIfAvailable?: string
  bridgeOrFoundationRequired: Suitability
  eligibilityConfidence: ConfidenceLevel
  officialSourceUrl: string
  notes?: string
  searchText: string
}

function readCsv(path: string): Row[] {
  return parse(readFileSync(path, "utf8"), {
    bom: true,
    columns: true,
    skip_empty_lines: true,
  }) as Row[]
}

function readCsvIfExists(path: string): Row[] {
  return existsSync(path) ? readCsv(path) : []
}

function blankToUndefined(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function normalizeName(value: string | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizeAwardLevel(value: string | undefined) {
  const normalized = normalizeName(value)
  if (!normalized || normalized === "unknown") return "unknown"
  if (normalized.includes("short")) return "short course"
  if (normalized.includes("diploma")) return "ordinary diploma"
  if (normalized.includes("certificate")) return "certificate"
  if (normalized.includes("degree") || normalized.includes("bachelor")) return "degree"
  if (normalized.includes("vocational")) return "vocational certificate"
  return normalized
}

function normalizeFieldCategory(value: string | undefined) {
  const normalized = normalizeName(value)
  if (!normalized) return "other"
  if (normalized.includes("ict") || normalized.includes("comput")) return "ICT"
  return normalized
}

function normalizeCourseFamily(value: string | undefined) {
  const normalized = normalizeName(value)
  if (!normalized) return undefined
  if (normalized.includes("tourism") || normalized.includes("hospitality")) return "tourism_hospitality"
  if (normalized.includes("ict") || normalized.includes("comput")) return "ICT"
  if (normalized.includes("business") || normalized.includes("account")) return "business"
  if (normalized.includes("health") || normalized.includes("medical")) return "health"
  if (normalized.includes("education") || normalized.includes("teaching")) return "education"
  if (normalized.includes("engineering")) return "engineering"
  return normalized
}

function institutionNameCandidates(value: string | undefined) {
  const base = normalizeName(value)
  const withoutParenthetical = normalizeName(value?.replace(/\([^)]*\)/g, " "))
  const stripTrailingInstitutionWords = (name: string) =>
    name
      .replace(/\b(main\s+)?campus$/, "")
      .replace(/\btraining\s+centre$/, "")
      .replace(/\btraining\s+center$/, "")
      .replace(/\btraining\s+institute$/, "")
      .replace(/\b(university|college|institute|institution|centre|center)$/, "")
      .replace(/\s+/g, " ")
      .trim()

  return [
    base,
    withoutParenthetical,
    stripTrailingInstitutionWords(base),
    stripTrailingInstitutionWords(withoutParenthetical),
  ].filter((candidate) => candidate && candidate.split(" ").length > 1)
}

function institutionAliases(
  institutionName: string | undefined,
  registrationNumber: string | undefined,
  abbreviationOrAliases?: string,
) {
  const aliases = new Set<string>()
  const combined = `${institutionName ?? ""} ${registrationNumber ?? ""} ${abbreviationOrAliases ?? ""}`.toUpperCase()

  for (const alias of (abbreviationOrAliases ?? "").split(/[;,|]/)) {
    const normalized = alias.trim()
    if (normalized) aliases.add(normalized)
  }

  if (combined.includes("INSTITUTE OF FINANCE MANAGEMENT") || combined.includes("IFM")) {
    aliases.add("IFM")
  }

  return [...aliases]
}

function programmeFingerprint(value: string | undefined) {
  return normalizeName(value)
    .replace(
      /^(ordinary diploma|basic technician certificate|technician certificate|certificate|diploma|bachelor degree|bachelor|degree)\s+/,
      "",
    )
    .replace(/^in\s+/, "")
    .replace(/\s+in\s+/g, " ")
    .replace(/\s+and\s+/g, " ")
    .replace(/\s+with\s+/g, " ")
    .trim()
}

function normalizeSuitability(value: string | undefined): Suitability {
  const normalized = value?.trim().toLowerCase()
  if (normalized === "yes" || normalized === "no") {
    return normalized
  }
  return "unknown"
}

function normalizeConfidence(value: string | undefined): ConfidenceLevel {
  const normalized = value?.trim().toLowerCase()
  if (normalized === "high" || normalized === "medium" || normalized === "low") {
    return normalized
  }
  return "low"
}

function normalizeBoolean(value: string | undefined) {
  const normalized = value?.trim().toLowerCase()
  return normalized === "yes" || normalized === "true"
}

function normalizeLogoStatus(value: string | undefined): LogoStatus | undefined {
  const normalized = value?.trim().toLowerCase()
  if (normalized === "verified" || normalized === "missing" || normalized === "needs_review") {
    return normalized
  }
  return undefined
}

function firstValue(...values: Array<string | undefined>) {
  return values.map(blankToUndefined).find(Boolean)
}

function uniqueValues(values: Array<string | undefined>) {
  return [...new Set(values.map(blankToUndefined).filter(Boolean) as string[])]
}

function mergeSuitability(left: Suitability, right: Suitability): Suitability {
  if (left === "yes" || right === "yes") return "yes"
  if (left === "unknown" || right === "unknown") return "unknown"
  return "no"
}

function makeProgrammeKey(
  programme: string | undefined,
  institution: string | undefined,
  awardLevel: string | undefined,
) {
  return [programmeFingerprint(programme), normalizeName(institution), normalizeAwardLevel(awardLevel)].join(
    "|",
  )
}

function makeRequirementKey(programme: string | undefined, institution: string | undefined) {
  return [programmeFingerprint(programme), normalizeName(institution)].join("|")
}

function detectProgrammeReviewReasons(row: Row) {
  const reasons: string[] = []
  const name = row.programme_name ?? ""

  if (/\b(in|of|and|with)$/i.test(name.trim())) {
    reasons.push("programme_name_looks_incomplete")
  }
  if (/\(in-?$/i.test(name.trim())) {
    reasons.push("programme_name_looks_incomplete")
  }
  if (/Bachelor (Degree )?of\s*$/i.test(name.trim())) {
    reasons.push("programme_name_looks_incomplete")
  }
  if ((row.award_level ?? "").trim().toLowerCase() === "unknown") {
    reasons.push("unknown_award_level")
  }
  if (!blankToUndefined(row.minimum_entry_requirements) && !blankToUndefined(row.raw_requirement_text)) {
    reasons.push("missing_entry_requirements")
  }
  if (!blankToUndefined(row.duration)) {
    reasons.push("missing_duration")
  }

  return reasons
}

function detectInstitutionReviewReasons(row: Row) {
  const reasons: string[] = []

  if (!blankToUndefined(row.region)) {
    reasons.push("missing_region")
  }
  if (!blankToUndefined(row.registration_number)) {
    reasons.push("missing_registration_number")
  }
  if (normalizeConfidence(row.confidence_level) !== "high") {
    reasons.push("not_high_confidence")
  }

  return reasons
}

function keywordPack(fieldCategory: string, programmeName: string, courseFamily?: string) {
  const joined = `${fieldCategory} ${programmeName} ${courseFamily ?? ""}`.toLowerCase()
  const careerKeywords = new Set<string>()
  const swahiliKeywords = new Set<string>()
  let detectedCourseFamily = normalizeCourseFamily(courseFamily) ?? normalizeCourseFamily(fieldCategory)

  if (joined.includes("health") || joined.includes("medical") || joined.includes("nursing")) {
    detectedCourseFamily = "health"
    ;["nurse", "hospital", "medical", "clinical", "health"].forEach((v) => careerKeywords.add(v))
    ;["afya", "hospitali", "nesi", "udaktari"].forEach((v) => swahiliKeywords.add(v))
  }
  if (joined.includes("ict") || joined.includes("computer") || joined.includes("information")) {
    detectedCourseFamily = "ICT"
    ;["computer", "IT", "software", "networking"].forEach((v) => careerKeywords.add(v))
    ;["kompyuta", "teknolojia"].forEach((v) => swahiliKeywords.add(v))
  }
  if (joined.includes("business") || joined.includes("account") || joined.includes("procurement")) {
    detectedCourseFamily = "business"
    ;["office", "bank", "business", "administration"].forEach((v) => careerKeywords.add(v))
    ;["biashara", "ofisini", "benki", "uhasibu", "manunuzi"].forEach((v) => swahiliKeywords.add(v))
  }
  if (joined.includes("education") || joined.includes("teacher")) {
    detectedCourseFamily = "education"
    ;["teacher", "school", "education"].forEach((v) => careerKeywords.add(v))
    ;["ualimu", "mwalimu", "elimu"].forEach((v) => swahiliKeywords.add(v))
  }
  if (joined.includes("tourism") || joined.includes("hospitality") || joined.includes("hotel")) {
    detectedCourseFamily = "tourism_hospitality"
    ;["hotel", "tourism", "travel", "hospitality"].forEach((v) => careerKeywords.add(v))
    ;["utalii", "hoteli"].forEach((v) => swahiliKeywords.add(v))
  }
  if (joined.includes("engineering")) {
    detectedCourseFamily = "engineering"
    ;["engineering", "engineer", "civil", "mechanical", "electrical"].forEach((v) =>
      careerKeywords.add(v),
    )
    ;["uhandisi"].forEach((v) => swahiliKeywords.add(v))
  }
  if (joined.includes("agriculture")) {
    detectedCourseFamily = "agriculture"
    careerKeywords.add("agriculture")
    swahiliKeywords.add("kilimo")
  }

  return {
    courseFamily: detectedCourseFamily,
    careerKeywords: [...careerKeywords],
    swahiliKeywords: [...swahiliKeywords],
  }
}

function writeJsonl(path: string, rows: unknown[]) {
  writeFileSync(path, rows.map((row) => JSON.stringify(row)).join("\n") + "\n")
}

function requirementRouteSummary(requirements: ProcessedEntryRequirement[]) {
  const summarize = (selector: (requirement: ProcessedEntryRequirement) => Suitability): Suitability => {
    if (requirements.some((requirement) => selector(requirement) === "yes")) return "yes"
    if (requirements.length > 0 && requirements.every((requirement) => selector(requirement) === "no")) return "no"
    return "unknown"
  }

  const routeTypes = [
    summarize((requirement) => requirement.acceptsFormFourDirect) === "yes" ? "CSEE" : undefined,
    summarize((requirement) => requirement.acceptsFormSix) === "yes" ? "ACSEE" : undefined,
    summarize((requirement) => requirement.acceptsCertificate) === "yes" ? "Certificate" : undefined,
    summarize((requirement) => requirement.acceptsDiploma) === "yes" ? "Diploma" : undefined,
    summarize((requirement) => requirement.acceptsEquivalent) === "yes" ? "Equivalent" : undefined,
  ].filter(Boolean) as string[]

  return {
    acceptsFormFourDirect: summarize((requirement) => requirement.acceptsFormFourDirect),
    acceptsFormSix: summarize((requirement) => requirement.acceptsFormSix),
    acceptsCertificate: summarize((requirement) => requirement.acceptsCertificate),
    acceptsDiploma: summarize((requirement) => requirement.acceptsDiploma),
    acceptsEquivalent: summarize((requirement) => requirement.acceptsEquivalent),
    rawRequirementText: uniqueValues(requirements.map((requirement) => requirement.rawRequirementText))
      .slice(0, 5)
      .join(" || "),
    requiredSubjects: uniqueValues(requirements.map((requirement) => requirement.requiredSubjects)).join("; "),
    entryRouteTypes: routeTypes.join("; "),
  }
}

mkdirSync(outputDir, { recursive: true })

const legacyInstitutions = readCsv(join(legacyBaseDir, "institutions.csv"))
const legacyProgrammes = readCsv(join(legacyBaseDir, "programmes.csv"))
const nactvetInstitutions = readCsv(join(nactvetEnrichmentDir, "institutions.csv"))
const nactvetProgrammes = readCsv(join(nactvetEnrichmentDir, "programmes.csv"))
const pathwayInstitutions = readCsvIfExists(join(pathwaysDir, "institutions.csv"))
const pathwayProgrammes = readCsvIfExists(join(pathwaysDir, "programmes.csv"))
const pathwayEntryRequirements = readCsvIfExists(join(pathwaysDir, "entry_requirements.csv"))
const pathwayInstitutionEnrichment = readCsvIfExists(join(pathwaysDir, "institution_enrichment.csv"))
const logoEnrichment = existsSync(logoEnrichmentPath) ? readCsv(logoEnrichmentPath) : []

const nactvetInstitutionsByName = new Map(
  nactvetInstitutions.map((row) => [normalizeName(row.institution_name), row]),
)
const nactvetProgrammesByKey = new Map(
  nactvetProgrammes.map((row) => [
    makeProgrammeKey(row.normalized_programme_name, row.institution_name, row.award_level),
    row,
  ]),
)
const pathwayEnrichmentByName = new Map(
  pathwayInstitutionEnrichment.map((row) => [normalizeName(row.normalized_institution_name), row]),
)
const verifiedLogoByName = new Map(
  logoEnrichment
    .filter((row) => normalizeLogoStatus(row.logo_status) === "verified" && blankToUndefined(row.logo_url))
    .map((row) => [normalizeName(row.normalized_institution_name), row]),
)
const verifiedLogoByCandidate = new Map<string, Row>()
for (const row of logoEnrichment.filter(
  (entry) => normalizeLogoStatus(entry.logo_status) === "verified" && blankToUndefined(entry.logo_url),
)) {
  for (const candidate of institutionNameCandidates(
    firstValue(row.normalized_institution_name, row.institution_name),
  )) {
    if (!verifiedLogoByCandidate.has(candidate)) {
      verifiedLogoByCandidate.set(candidate, row)
    }
  }
}

function findVerifiedLogo(normalizedInstitutionName: string, institutionName: string) {
  return (
    verifiedLogoByName.get(normalizedInstitutionName) ??
    institutionNameCandidates(institutionName)
      .map((candidate) => verifiedLogoByCandidate.get(candidate))
      .find(Boolean)
  )
}

const processedEntryRequirements: ProcessedEntryRequirement[] = pathwayEntryRequirements.map((row) => {
  const programmeName = row.programme_name.trim()
  const institutionName = row.institution_name.trim()
  const normalizedProgrammeName =
    blankToUndefined(row.normalized_programme_name) ?? normalizeName(programmeName)
  const normalizedInstitutionName =
    blankToUndefined(row.normalized_institution_name) ?? normalizeName(institutionName)

  return {
    programmeName,
    normalizedProgrammeName,
    institutionName,
    normalizedInstitutionName,
    rawRequirementText: row.raw_requirement_text.trim(),
    acceptsFormFourDirect: normalizeSuitability(row.accepts_form_four_direct),
    acceptsFormSix: normalizeSuitability(row.accepts_form_six),
    acceptsCertificate: normalizeSuitability(row.accepts_certificate),
    acceptsDiploma: normalizeSuitability(row.accepts_diploma),
    acceptsEquivalent: normalizeSuitability(row.accepts_equivalent),
    minimumCseeDivisionIfAvailable: blankToUndefined(row.minimum_csee_division_if_available),
    minimumAcseePrincipalPassesIfAvailable: blankToUndefined(
      row.minimum_acsee_principal_passes_if_available,
    ),
    minimumPointsIfAvailable: blankToUndefined(row.minimum_points_if_available),
    requiredSubjects: blankToUndefined(row.required_subjects),
    requiredSubjectGradesIfAvailable: blankToUndefined(row.required_subject_grades_if_available),
    requiredPriorFieldIfAvailable: blankToUndefined(row.required_prior_field_if_available),
    bridgeOrFoundationRequired: normalizeSuitability(row.bridge_or_foundation_required),
    eligibilityConfidence: normalizeConfidence(row.eligibility_confidence),
    officialSourceUrl: row.official_source_url.trim(),
    notes: blankToUndefined(row.notes),
    searchText: [
      programmeName,
      normalizedProgrammeName,
      institutionName,
      normalizedInstitutionName,
      row.raw_requirement_text,
      row.required_subjects,
      row.required_prior_field_if_available,
    ]
      .filter(Boolean)
      .join(" "),
  }
})

const requirementsByProgramme = new Map<string, ProcessedEntryRequirement[]>()
for (const requirement of processedEntryRequirements) {
  const key = makeRequirementKey(
    requirement.normalizedProgrammeName,
    requirement.normalizedInstitutionName,
  )
  requirementsByProgramme.set(key, [...(requirementsByProgramme.get(key) ?? []), requirement])
}

function buildInstitution(row: Row, sourceDataset: string): ProcessedInstitution {
  const enrichment = firstValue(row.normalized_institution_name)
    ? pathwayEnrichmentByName.get(normalizeName(row.normalized_institution_name))
    : undefined
  const nactvetEnrichment = nactvetInstitutionsByName.get(normalizeName(row.institution_name))
  const reviewReasons = uniqueValues([
    ...detectInstitutionReviewReasons(row),
    ...(row.review_reasons ?? "").split(/[;,|]/),
  ])

  const institutionName = row.institution_name.trim()
  const normalizedInstitutionName =
    blankToUndefined(row.normalized_institution_name) ?? normalizeName(institutionName)
  const logoEnrichment = findVerifiedLogo(normalizedInstitutionName, institutionName)
  const region = firstValue(row.region, enrichment?.region, nactvetEnrichment?.region)
  const institutionType =
    firstValue(row.institution_type, nactvetEnrichment?.institution_category) ?? "unknown"
  const ownershipType = firstValue(row.ownership_type, nactvetEnrichment?.ownership_type) ?? "unknown"
  const aliases = institutionAliases(
    institutionName,
    row.registration_number,
    row.abbreviation_or_aliases,
  )

  return {
    institutionName,
    normalizedInstitutionName,
    registrationNumber: firstValue(row.registration_number, nactvetEnrichment?.registration_number),
    registrationNumberAsShown: firstValue(nactvetEnrichment?.registration_number_as_shown),
    regulator: firstValue(row.regulator, nactvetEnrichment?.regulator) ?? "unknown",
    accreditationStatus: blankToUndefined(row.accreditation_status),
    ownershipType,
    institutionType,
    institutionCategory: firstValue(row.institution_category, nactvetEnrichment?.institution_category),
    region,
    districtOrCouncil: firstValue(
      row.district_or_council,
      row["district/council"],
      nactvetEnrichment?.["district/council"],
    ),
    physicalLocation: firstValue(row.physical_location, nactvetEnrichment?.physical_location),
    mainlandOrZanzibar: blankToUndefined(row.mainland_or_zanzibar),
    website: firstValue(row.website, enrichment?.website, nactvetEnrichment?.website, logoEnrichment?.website),
    admissionsUrl: firstValue(row.admissions_url, enrichment?.admissions_url),
    applicationUrl: firstValue(row.application_url, enrichment?.application_url),
    logoUrl: blankToUndefined(logoEnrichment?.logo_url),
    logoSourceUrl: blankToUndefined(logoEnrichment?.logo_source_url),
    logoStatus: normalizeLogoStatus(logoEnrichment?.logo_status),
    logoVerifiedAt: blankToUndefined(logoEnrichment?.last_checked_date),
    phoneNumbers: firstValue(row.phone_numbers, enrichment?.phone_numbers, nactvetEnrichment?.phone_numbers),
    email: firstValue(row.email, enrichment?.email, nactvetEnrichment?.email),
    applicationMethod: firstValue(row.application_method, nactvetEnrichment?.application_method),
    hasFormFourDirectProgramme: normalizeSuitability(nactvetEnrichment?.has_form_four_direct_programme),
    officialSourceUrl: firstValue(row.official_source_url, nactvetEnrichment?.official_source_url) ?? "",
    sourceType: firstValue(row.source_type, nactvetEnrichment?.source_type) ?? "unknown",
    sourceDatasets: [sourceDataset],
    confidenceLevel: normalizeConfidence(row.confidence_level),
    lastVerifiedDate: firstValue(row.last_verified_date, nactvetEnrichment?.last_verified_date) ?? "",
    notes: firstValue(row.notes, enrichment?.notes, nactvetEnrichment?.notes),
    needsReview: normalizeBoolean(row.needs_review) || reviewReasons.length > 0,
    reviewReasons,
    searchText: [
      institutionName,
      normalizedInstitutionName,
      row.abbreviation_or_aliases,
      row.registration_number,
      row.regulator,
      institutionType,
      ownershipType,
      region,
      row.district_or_council,
      row.mainland_or_zanzibar,
      ...aliases,
    ]
      .filter(Boolean)
      .join(" "),
  }
}

function mergeInstitution(left: ProcessedInstitution, right: ProcessedInstitution): ProcessedInstitution {
  return {
    ...left,
    registrationNumber: firstValue(left.registrationNumber, right.registrationNumber),
    registrationNumberAsShown: firstValue(left.registrationNumberAsShown, right.registrationNumberAsShown),
    accreditationStatus: firstValue(left.accreditationStatus, right.accreditationStatus),
    ownershipType: firstValue(left.ownershipType, right.ownershipType) ?? "unknown",
    institutionType: firstValue(left.institutionType, right.institutionType) ?? "unknown",
    institutionCategory: firstValue(left.institutionCategory, right.institutionCategory),
    region: firstValue(left.region, right.region),
    districtOrCouncil: firstValue(left.districtOrCouncil, right.districtOrCouncil),
    physicalLocation: firstValue(left.physicalLocation, right.physicalLocation),
    mainlandOrZanzibar: firstValue(left.mainlandOrZanzibar, right.mainlandOrZanzibar),
    website: firstValue(left.website, right.website),
    admissionsUrl: firstValue(left.admissionsUrl, right.admissionsUrl),
    applicationUrl: firstValue(left.applicationUrl, right.applicationUrl),
    logoUrl: firstValue(left.logoUrl, right.logoUrl),
    logoSourceUrl: firstValue(left.logoSourceUrl, right.logoSourceUrl),
    logoStatus: left.logoStatus ?? right.logoStatus,
    logoVerifiedAt: firstValue(left.logoVerifiedAt, right.logoVerifiedAt),
    phoneNumbers: firstValue(left.phoneNumbers, right.phoneNumbers),
    email: firstValue(left.email, right.email),
    applicationMethod: firstValue(left.applicationMethod, right.applicationMethod),
    hasFormFourDirectProgramme: mergeSuitability(
      left.hasFormFourDirectProgramme,
      right.hasFormFourDirectProgramme,
    ),
    officialSourceUrl: firstValue(left.officialSourceUrl, right.officialSourceUrl) ?? "",
    sourceDatasets: uniqueValues([...left.sourceDatasets, ...right.sourceDatasets]),
    confidenceLevel: left.confidenceLevel === "high" ? left.confidenceLevel : right.confidenceLevel,
    lastVerifiedDate: firstValue(left.lastVerifiedDate, right.lastVerifiedDate) ?? "",
    notes: uniqueValues([left.notes, right.notes]).join(" || ") || undefined,
    needsReview: left.needsReview || right.needsReview,
    reviewReasons: uniqueValues([...left.reviewReasons, ...right.reviewReasons]),
    searchText: uniqueValues([left.searchText, right.searchText]).join(" "),
  }
}

const institutionsByName = new Map<string, ProcessedInstitution>()
const institutionCandidateToPrimaryName = new Map<string, string>()

function registerInstitutionCandidates(institution: ProcessedInstitution) {
  for (const candidate of institutionNameCandidates(institution.institutionName)) {
    const existing = institutionCandidateToPrimaryName.get(candidate)
    if (existing && existing !== institution.normalizedInstitutionName) {
      institutionCandidateToPrimaryName.delete(candidate)
    } else if (!existing) {
      institutionCandidateToPrimaryName.set(candidate, institution.normalizedInstitutionName)
    }
  }
}

for (const institution of [
  ...pathwayInstitutions.map((row) => buildInstitution(row, "education_pathways")),
  ...legacyInstitutions.map((row) => buildInstitution(row, "post_form_four")),
]) {
  const existingKey =
    institutionCandidateToPrimaryName.get(institution.normalizedInstitutionName) ??
    institutionNameCandidates(institution.institutionName)
      .map((candidate) => institutionCandidateToPrimaryName.get(candidate))
      .find(Boolean) ??
    institution.normalizedInstitutionName
  const existing = institutionsByName.get(existingKey)
  institutionsByName.set(
    existingKey,
    existing ? mergeInstitution(existing, institution) : institution,
  )
  registerInstitutionCandidates(institutionsByName.get(existingKey)!)
}

const processedInstitutions = [...institutionsByName.values()]

const institutionByName = new Map<string, ProcessedInstitution>()
for (const institution of processedInstitutions) {
  const candidates = [
    institution.normalizedInstitutionName,
    ...institutionNameCandidates(institution.institutionName),
  ]

  for (const candidate of candidates) {
    if (!institutionByName.has(candidate)) {
      institutionByName.set(candidate, institution)
    }
  }
}

function buildProgramme(row: Row, sourceDataset: string): ProcessedProgramme {
  const awardLevel = normalizeAwardLevel(row.award_level)
  const nactvetEnrichment = nactvetProgrammesByKey.get(
    makeProgrammeKey(row.normalized_programme_name, row.institution_name, row.award_level),
  )
  const institution = institutionNameCandidates(
    firstValue(row.normalized_institution_name, row.institution_name),
  )
    .map((candidate) => institutionByName.get(candidate))
    .find(Boolean)
  const rawNormalizedInstitutionName =
    blankToUndefined(row.normalized_institution_name) ?? normalizeName(row.institution_name)
  const normalizedInstitutionName = institution?.normalizedInstitutionName ?? rawNormalizedInstitutionName
  const programmeName = row.programme_name.trim()
  const normalizedProgrammeName =
    blankToUndefined(row.normalized_programme_name) ?? normalizeName(programmeName)
  const fieldCategory = normalizeFieldCategory(row.field_category)
  const requirements = requirementsByProgramme.get(
    makeRequirementKey(normalizedProgrammeName, rawNormalizedInstitutionName),
  ) ?? []
  const routeSummary = requirementRouteSummary(requirements)
  const legacyFormFourSuitability = normalizeSuitability(row.suitable_for_form_four_leaver)
  const keywordData = keywordPack(fieldCategory, programmeName, row.course_family)
  const rawReviewReasons = uniqueValues([
    ...detectProgrammeReviewReasons(row),
    ...(row.review_reasons ?? "").split(/[;,|]/),
  ])
  const reviewReasons = routeSummary.rawRequirementText
    ? rawReviewReasons.filter((reason) => reason !== "missing_entry_requirements")
    : rawReviewReasons
  const institutionSearchAliases = institutionAliases(
    row.institution_name,
    row.institution_registration_number,
  )

  return {
    programmeName,
    normalizedProgrammeName,
    programmeCode: blankToUndefined(row.programme_code),
    awardLevel,
    qualificationLevel: blankToUndefined(row.qualification_level),
    pathwayType: blankToUndefined(row.pathway_type),
    fieldCategory,
    courseFamily: keywordData.courseFamily,
    institutionName: row.institution_name.trim(),
    normalizedInstitutionName,
    institutionRegistrationNumber: firstValue(
      row.institution_registration_number,
      nactvetEnrichment?.institution_registration_number,
    ),
    regulator: firstValue(row.regulator, institution?.regulator) ?? "unknown",
    institutionType: firstValue(row.institution_type, institution?.institutionType),
    ownershipType: firstValue(row.ownership_type, institution?.ownershipType),
    region: firstValue(row.region, institution?.region),
    districtOrCouncil: firstValue(row.district_or_council, institution?.districtOrCouncil),
    minimumEntryRequirements: firstValue(
      row.minimum_entry_requirements,
      routeSummary.rawRequirementText,
      nactvetEnrichment?.minimum_entry_requirements,
    ),
    requiredSubjects: firstValue(row.required_subjects, routeSummary.requiredSubjects, nactvetEnrichment?.required_subjects),
    suitableForFormFourLeaver: mergeSuitability(
      legacyFormFourSuitability,
      routeSummary.acceptsFormFourDirect,
    ),
    acceptsFormSix: routeSummary.acceptsFormSix,
    acceptsCertificate: routeSummary.acceptsCertificate,
    acceptsDiploma: routeSummary.acceptsDiploma,
    acceptsEquivalent: routeSummary.acceptsEquivalent,
    duration: firstValue(row.duration, nactvetEnrichment?.duration),
    feesIfAvailable: firstValue(row.fees_if_available, nactvetEnrichment?.fees_if_available),
    feeBand:
      firstValue(row.fee_band) ??
      (blankToUndefined(row.fees_if_available) ? "known_fee" : "unknown_fee"),
    studyMode: firstValue(row.study_mode, nactvetEnrichment?.mode),
    campusLocation: firstValue(row.campus_location, row.campus_name),
    admissionCapacity: firstValue(row.admission_capacity, nactvetEnrichment?.admission_capacity),
    entryRouteTypes: firstValue(routeSummary.entryRouteTypes, nactvetEnrichment?.entry_route_types),
    acceptsFormFourDirect: mergeSuitability(
      normalizeSuitability(nactvetEnrichment?.accepts_form_four_direct),
      routeSummary.acceptsFormFourDirect,
    ),
    accreditationStatusIfAvailable: blankToUndefined(row.accreditation_status_if_available),
    applicationLink: firstValue(row.application_link, row.application_method),
    officialSourceUrl: row.official_source_url.trim(),
    sourceType: row.source_type.trim(),
    sourceDatasets: sourceDataset === "post_form_four" && nactvetEnrichment
      ? ["post_form_four", "nactvet_enrichment"]
      : [sourceDataset],
    confidenceLevel: normalizeConfidence(row.confidence_level),
    lastVerifiedDate: row.last_verified_date.trim(),
    notes: firstValue(row.notes, nactvetEnrichment?.notes),
    needsReview: normalizeBoolean(row.needs_review) || reviewReasons.length > 0,
    reviewReasons,
    careerKeywords: keywordData.careerKeywords,
    swahiliKeywords: keywordData.swahiliKeywords,
    searchText: [
      programmeName,
      normalizedProgrammeName,
      row.programme_code,
      row.institution_name,
      awardLevel,
      row.qualification_level,
      row.pathway_type,
      fieldCategory,
      keywordData.courseFamily,
      institution?.institutionType,
      institution?.ownershipType,
      institution?.region,
      institution?.districtOrCouncil,
      row.regulator,
      row.minimum_entry_requirements,
      routeSummary.rawRequirementText,
      row.required_subjects,
      routeSummary.requiredSubjects,
      routeSummary.entryRouteTypes,
      ...keywordData.careerKeywords,
      ...keywordData.swahiliKeywords,
      ...institutionSearchAliases,
    ]
      .filter(Boolean)
      .join(" "),
  }
}

function mergeProgramme(left: ProcessedProgramme, right: ProcessedProgramme): ProcessedProgramme {
  return {
    ...left,
    programmeCode: firstValue(left.programmeCode, right.programmeCode),
    qualificationLevel: firstValue(left.qualificationLevel, right.qualificationLevel),
    pathwayType: firstValue(left.pathwayType, right.pathwayType),
    institutionRegistrationNumber: firstValue(
      left.institutionRegistrationNumber,
      right.institutionRegistrationNumber,
    ),
    institutionType: firstValue(left.institutionType, right.institutionType),
    ownershipType: firstValue(left.ownershipType, right.ownershipType),
    region: firstValue(left.region, right.region),
    districtOrCouncil: firstValue(left.districtOrCouncil, right.districtOrCouncil),
    minimumEntryRequirements: firstValue(left.minimumEntryRequirements, right.minimumEntryRequirements),
    requiredSubjects: firstValue(left.requiredSubjects, right.requiredSubjects),
    suitableForFormFourLeaver: mergeSuitability(
      left.suitableForFormFourLeaver,
      right.suitableForFormFourLeaver,
    ),
    acceptsFormSix: mergeSuitability(left.acceptsFormSix, right.acceptsFormSix),
    acceptsCertificate: mergeSuitability(left.acceptsCertificate, right.acceptsCertificate),
    acceptsDiploma: mergeSuitability(left.acceptsDiploma, right.acceptsDiploma),
    acceptsEquivalent: mergeSuitability(left.acceptsEquivalent, right.acceptsEquivalent),
    duration: firstValue(left.duration, right.duration),
    feesIfAvailable: firstValue(left.feesIfAvailable, right.feesIfAvailable),
    feeBand: firstValue(left.feeBand, right.feeBand),
    studyMode: firstValue(left.studyMode, right.studyMode),
    campusLocation: firstValue(left.campusLocation, right.campusLocation),
    admissionCapacity: firstValue(left.admissionCapacity, right.admissionCapacity),
    entryRouteTypes: firstValue(left.entryRouteTypes, right.entryRouteTypes),
    acceptsFormFourDirect: mergeSuitability(left.acceptsFormFourDirect, right.acceptsFormFourDirect),
    accreditationStatusIfAvailable: firstValue(
      left.accreditationStatusIfAvailable,
      right.accreditationStatusIfAvailable,
    ),
    applicationLink: firstValue(left.applicationLink, right.applicationLink),
    sourceDatasets: uniqueValues([...left.sourceDatasets, ...right.sourceDatasets]),
    confidenceLevel: left.confidenceLevel === "high" ? left.confidenceLevel : right.confidenceLevel,
    notes: uniqueValues([left.notes, right.notes]).join(" || ") || undefined,
    needsReview: left.needsReview || right.needsReview,
    reviewReasons: uniqueValues([...left.reviewReasons, ...right.reviewReasons]),
    careerKeywords: uniqueValues([...left.careerKeywords, ...right.careerKeywords]),
    swahiliKeywords: uniqueValues([...left.swahiliKeywords, ...right.swahiliKeywords]),
    searchText: uniqueValues([left.searchText, right.searchText]).join(" "),
  }
}

const programmesByKey = new Map<string, ProcessedProgramme>()
for (const programme of [
  ...pathwayProgrammes.map((row) => buildProgramme(row, "education_pathways")),
  ...legacyProgrammes.map((row) => buildProgramme(row, "post_form_four")),
]) {
  const key = makeProgrammeKey(
    programme.normalizedProgrammeName,
    programme.normalizedInstitutionName,
    programme.awardLevel,
  )
  const existing = programmesByKey.get(key)
  programmesByKey.set(key, existing ? mergeProgramme(existing, programme) : programme)
}

const processedProgrammes = [...programmesByKey.values()]

type InstitutionSummary = {
  programmeCount: number
  awardLevels: Map<string, number>
  fieldCategories: Map<string, number>
  courseFamilies: Map<string, number>
  hasFormFourDirectProgramme: Suitability
  browseTerms: Set<string>
}

function emptyInstitutionSummary(): InstitutionSummary {
  return {
    programmeCount: 0,
    awardLevels: new Map(),
    fieldCategories: new Map(),
    courseFamilies: new Map(),
    hasFormFourDirectProgramme: "unknown",
    browseTerms: new Set(),
  }
}

function addSummaryValue(map: Map<string, number>, value: string | undefined) {
  const normalized = value?.trim()
  if (!normalized || normalized.toLowerCase() === "unknown") {
    return
  }

  map.set(normalized, (map.get(normalized) ?? 0) + 1)
}

function rankedSummaryValues(values: Map<string, number>, limit: number) {
  return [...values]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([value]) => value)
}

const institutionSummaries = new Map<string, InstitutionSummary>()

for (const programme of processedProgrammes) {
  const summary =
    institutionSummaries.get(programme.normalizedInstitutionName) ?? emptyInstitutionSummary()

  summary.programmeCount += 1
  addSummaryValue(summary.awardLevels, programme.awardLevel)
  addSummaryValue(summary.fieldCategories, programme.fieldCategory)
  addSummaryValue(summary.courseFamilies, programme.courseFamily)
  summary.hasFormFourDirectProgramme = mergeSuitability(
    summary.hasFormFourDirectProgramme,
    programme.acceptsFormFourDirect,
  )
  summary.browseTerms.add(programme.awardLevel)
  summary.browseTerms.add(programme.fieldCategory)
  if (programme.courseFamily) summary.browseTerms.add(programme.courseFamily)

  institutionSummaries.set(programme.normalizedInstitutionName, summary)
}

for (const institution of processedInstitutions) {
  const summary = institutionSummaries.get(institution.normalizedInstitutionName)

  if (summary) {
    Object.assign(institution, {
      hasFormFourDirectProgramme: mergeSuitability(
        institution.hasFormFourDirectProgramme,
        summary.hasFormFourDirectProgramme,
      ),
      programmeCount: summary.programmeCount,
      awardLevels: rankedSummaryValues(summary.awardLevels, 8),
      fieldCategories: rankedSummaryValues(summary.fieldCategories, 8),
      courseFamilies: rankedSummaryValues(summary.courseFamilies, 8),
      browseSearchText: [...summary.browseTerms].join(" "),
    })
  } else {
    Object.assign(institution, {
      programmeCount: 0,
      awardLevels: [],
      fieldCategories: [],
      courseFamilies: [],
      browseSearchText: "",
    })
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  canonicalDataset: "tanzania-education-pathways-dataset",
  fallbackDataset: "tanzania-post-form-four-dataset",
  enrichmentDatasets: ["tanzania-education-dataset", "institution-logos.seed.csv"],
  institutions: {
    rawPathwayCount: pathwayInstitutions.length,
    rawLegacyCount: legacyInstitutions.length,
    nactvetEnrichmentCount: nactvetInstitutions.length,
    processedCount: processedInstitutions.length,
    fromPathwaysCount: processedInstitutions.filter((row) =>
      row.sourceDatasets.includes("education_pathways"),
    ).length,
    fallbackOnlyCount: processedInstitutions.filter(
      (row) => !row.sourceDatasets.includes("education_pathways"),
    ).length,
    verifiedLogoCount: processedInstitutions.filter((row) => row.logoStatus === "verified").length,
    needsReviewCount: processedInstitutions.filter((row) => row.needsReview).length,
  },
  programmes: {
    rawPathwayCount: pathwayProgrammes.length,
    rawLegacyCount: legacyProgrammes.length,
    nactvetEnrichmentCount: nactvetProgrammes.length,
    processedCount: processedProgrammes.length,
    fromPathwaysCount: processedProgrammes.filter((row) =>
      row.sourceDatasets.includes("education_pathways"),
    ).length,
    fallbackOnlyCount: processedProgrammes.filter(
      (row) => !row.sourceDatasets.includes("education_pathways"),
    ).length,
    degreeCount: processedProgrammes.filter((row) => row.awardLevel === "degree").length,
    formSixRouteCount: processedProgrammes.filter((row) => row.acceptsFormSix === "yes").length,
    certificateRouteCount: processedProgrammes.filter((row) => row.acceptsCertificate === "yes").length,
    diplomaRouteCount: processedProgrammes.filter((row) => row.acceptsDiploma === "yes").length,
    needsReviewCount: processedProgrammes.filter((row) => row.needsReview).length,
  },
  entryRequirements: {
    rawPathwayCount: pathwayEntryRequirements.length,
    processedCount: processedEntryRequirements.length,
    formFourRouteCount: processedEntryRequirements.filter(
      (row) => row.acceptsFormFourDirect === "yes",
    ).length,
    formSixRouteCount: processedEntryRequirements.filter((row) => row.acceptsFormSix === "yes").length,
    certificateRouteCount: processedEntryRequirements.filter(
      (row) => row.acceptsCertificate === "yes",
    ).length,
    diplomaRouteCount: processedEntryRequirements.filter((row) => row.acceptsDiploma === "yes").length,
  },
}

writeFileSync(join(outputDir, "institutions.json"), JSON.stringify(processedInstitutions, null, 2))
writeFileSync(join(outputDir, "programmes.json"), JSON.stringify(processedProgrammes, null, 2))
writeFileSync(
  join(outputDir, "entry-requirements.json"),
  JSON.stringify(processedEntryRequirements, null, 2),
)
writeJsonl(join(outputDir, "institutions.jsonl"), processedInstitutions)
writeJsonl(join(outputDir, "programmes.jsonl"), processedProgrammes)
writeJsonl(join(outputDir, "entry-requirements.jsonl"), processedEntryRequirements)
writeFileSync(join(outputDir, "data-quality-report.json"), JSON.stringify(report, null, 2))

console.log(JSON.stringify(report, null, 2))
