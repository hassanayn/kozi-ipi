import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { parse } from "csv-parse/sync"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

const baseDir = join(root, "data/raw/tanzania-post-form-four-dataset")
const enrichmentDir = join(root, "data/raw/tanzania-education-dataset")
const logoEnrichmentPath = join(root, "data/enrichment/institution-logos.seed.csv")
const outputDir = join(root, "data/processed")

type Row = Record<string, string>

function readCsv(path: string): Row[] {
  return parse(readFileSync(path, "utf8"), {
    bom: true,
    columns: true,
    skip_empty_lines: true,
  }) as Row[]
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

function institutionNameCandidates(value: string | undefined) {
  return [
    normalizeName(value),
    normalizeName(value?.replace(/\([^)]*\)/g, " ")),
  ].filter(Boolean)
}

function institutionAliases(institutionName: string | undefined, registrationNumber: string | undefined) {
  const aliases = new Set<string>()
  const combined = `${institutionName ?? ""} ${registrationNumber ?? ""}`.toUpperCase()

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

function normalizeSuitability(value: string | undefined) {
  const normalized = value?.trim().toLowerCase()
  if (normalized === "yes" || normalized === "no") {
    return normalized
  }
  return "unknown"
}

function normalizeConfidence(value: string | undefined) {
  const normalized = value?.trim().toLowerCase()
  if (normalized === "high" || normalized === "medium" || normalized === "low") {
    return normalized
  }
  return "low"
}

function normalizeLogoStatus(value: string | undefined) {
  const normalized = value?.trim().toLowerCase()
  if (normalized === "verified" || normalized === "missing" || normalized === "needs_review") {
    return normalized
  }
  return undefined
}

function firstValue(...values: Array<string | undefined>) {
  return values.map(blankToUndefined).find(Boolean)
}

function makeProgrammeKey(
  programme: string | undefined,
  institution: string | undefined,
  awardLevel: string | undefined,
) {
  return [programmeFingerprint(programme), normalizeName(institution), normalizeName(awardLevel)].join(
    "|",
  )
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
  if (!blankToUndefined(row.minimum_entry_requirements)) {
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

function keywordPack(fieldCategory: string, programmeName: string) {
  const joined = `${fieldCategory} ${programmeName}`.toLowerCase()
  const careerKeywords = new Set<string>()
  const swahiliKeywords = new Set<string>()
  let courseFamily = blankToUndefined(fieldCategory)

  if (joined.includes("health") || joined.includes("medical") || joined.includes("nursing")) {
    courseFamily = "health"
    ;["nurse", "hospital", "medical", "clinical", "health"].forEach((v) => careerKeywords.add(v))
    ;["afya", "hospitali", "nesi", "udaktari"].forEach((v) => swahiliKeywords.add(v))
  }
  if (joined.includes("ict") || joined.includes("computer") || joined.includes("information")) {
    courseFamily = "ICT"
    ;["computer", "IT", "software", "networking"].forEach((v) => careerKeywords.add(v))
    ;["kompyuta", "teknolojia"].forEach((v) => swahiliKeywords.add(v))
  }
  if (joined.includes("business") || joined.includes("account") || joined.includes("procurement")) {
    courseFamily = "business"
    ;["office", "bank", "business", "administration"].forEach((v) => careerKeywords.add(v))
    ;["biashara", "ofisini", "benki", "uhasibu", "manunuzi"].forEach((v) => swahiliKeywords.add(v))
  }
  if (joined.includes("education") || joined.includes("teacher")) {
    courseFamily = "education"
    ;["teacher", "school", "education"].forEach((v) => careerKeywords.add(v))
    ;["ualimu", "mwalimu", "elimu"].forEach((v) => swahiliKeywords.add(v))
  }
  if (joined.includes("tourism") || joined.includes("hospitality") || joined.includes("hotel")) {
    courseFamily = "tourism_hospitality"
    ;["hotel", "tourism", "travel", "hospitality"].forEach((v) => careerKeywords.add(v))
    ;["utalii", "hoteli"].forEach((v) => swahiliKeywords.add(v))
  }

  return {
    courseFamily,
    careerKeywords: [...careerKeywords],
    swahiliKeywords: [...swahiliKeywords],
  }
}

function writeJsonl(path: string, rows: unknown[]) {
  writeFileSync(path, rows.map((row) => JSON.stringify(row)).join("\n") + "\n")
}

mkdirSync(outputDir, { recursive: true })

const institutionsBase = readCsv(join(baseDir, "institutions.csv"))
const programmesBase = readCsv(join(baseDir, "programmes.csv"))
const institutionsEnrichment = readCsv(join(enrichmentDir, "institutions.csv"))
const programmesEnrichment = readCsv(join(enrichmentDir, "programmes.csv"))
const logoEnrichment = existsSync(logoEnrichmentPath) ? readCsv(logoEnrichmentPath) : []

const enrichmentInstitutionsByName = new Map(
  institutionsEnrichment.map((row) => [normalizeName(row.institution_name), row]),
)
const enrichmentProgrammesByKey = new Map(
  programmesEnrichment.map((row) => [
    makeProgrammeKey(row.normalized_programme_name, row.institution_name, row.award_level),
    row,
  ]),
)
const verifiedLogoByName = new Map(
  logoEnrichment
    .filter((row) => normalizeLogoStatus(row.logo_status) === "verified" && blankToUndefined(row.logo_url))
    .map((row) => [normalizeName(row.normalized_institution_name), row]),
)

const processedInstitutions = institutionsBase.map((row) => {
  const enrichment = enrichmentInstitutionsByName.get(normalizeName(row.institution_name))
  const reviewReasons = detectInstitutionReviewReasons(row)

  const institutionName = row.institution_name.trim()
  const normalizedInstitutionName =
    blankToUndefined(row.normalized_institution_name) ?? normalizeName(institutionName)
  const logoEnrichment = verifiedLogoByName.get(normalizedInstitutionName)
  const region = firstValue(row.region, enrichment?.region)
  const institutionType = firstValue(row.institution_type, enrichment?.institution_category) ?? "unknown"
  const ownershipType = firstValue(row.ownership_type, enrichment?.ownership_type) ?? "unknown"
  const aliases = institutionAliases(institutionName, row.registration_number)

  return {
    institutionName,
    normalizedInstitutionName,
    registrationNumber: firstValue(row.registration_number, enrichment?.registration_number),
    registrationNumberAsShown: firstValue(enrichment?.registration_number_as_shown),
    regulator: row.regulator.trim(),
    accreditationStatus: blankToUndefined(row.accreditation_status),
    ownershipType,
    institutionType,
    institutionCategory: firstValue(enrichment?.institution_category),
    region,
    districtOrCouncil: firstValue(row.district_or_council, enrichment?.["district/council"]),
    physicalLocation: firstValue(row.physical_location, enrichment?.physical_location),
    mainlandOrZanzibar: blankToUndefined(row.mainland_or_zanzibar),
    website: firstValue(row.website, enrichment?.website, logoEnrichment?.website),
    logoUrl: blankToUndefined(logoEnrichment?.logo_url),
    logoSourceUrl: blankToUndefined(logoEnrichment?.logo_source_url),
    logoStatus: normalizeLogoStatus(logoEnrichment?.logo_status),
    logoVerifiedAt: blankToUndefined(logoEnrichment?.last_checked_date),
    phoneNumbers: firstValue(row.phone_numbers, enrichment?.phone_numbers),
    email: firstValue(row.email, enrichment?.email),
    applicationMethod: firstValue(row.application_method, enrichment?.application_method),
    hasFormFourDirectProgramme: normalizeSuitability(enrichment?.has_form_four_direct_programme),
    officialSourceUrl: row.official_source_url.trim(),
    sourceType: row.source_type.trim(),
    sourceDatasets: enrichment ? ["post_form_four", "nactvet_enrichment"] : ["post_form_four"],
    confidenceLevel: normalizeConfidence(row.confidence_level),
    lastVerifiedDate: row.last_verified_date.trim(),
    notes: firstValue(row.notes, enrichment?.notes),
    needsReview: reviewReasons.length > 0,
    reviewReasons,
    searchText: [
      institutionName,
      normalizedInstitutionName,
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
})

const institutionByName = new Map<string, (typeof processedInstitutions)[number]>()
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

const processedProgrammes = programmesBase.map((row) => {
  const enrichment = enrichmentProgrammesByKey.get(
    makeProgrammeKey(row.normalized_programme_name, row.institution_name, row.award_level),
  )
  const rawNormalizedInstitutionName = normalizeName(row.institution_name)
  const institution = institutionNameCandidates(row.institution_name)
    .map((candidate) => institutionByName.get(candidate))
    .find(Boolean)
  const normalizedInstitutionName = institution?.normalizedInstitutionName ?? rawNormalizedInstitutionName
  const reviewReasons = detectProgrammeReviewReasons(row)
  const keywordData = keywordPack(row.field_category, row.programme_name)

  const programmeName = row.programme_name.trim()
  const normalizedProgrammeName =
    blankToUndefined(row.normalized_programme_name) ?? normalizeName(programmeName)
  const fieldCategory = row.field_category.trim() || "other"
  const awardLevel = row.award_level.trim() || "unknown"
  const suitableForFormFourLeaver = normalizeSuitability(row.suitable_for_form_four_leaver)
  const institutionSearchAliases = institutionAliases(
    row.institution_name,
    row.institution_registration_number,
  )

  return {
    programmeName,
    normalizedProgrammeName,
    awardLevel,
    fieldCategory,
    courseFamily: keywordData.courseFamily,
    institutionName: row.institution_name.trim(),
    normalizedInstitutionName,
    institutionRegistrationNumber: firstValue(
      row.institution_registration_number,
      enrichment?.institution_registration_number,
    ),
    regulator: row.regulator.trim(),
    institutionType: institution?.institutionType,
    ownershipType: institution?.ownershipType,
    region: institution?.region,
    districtOrCouncil: institution?.districtOrCouncil,
    minimumEntryRequirements: firstValue(
      row.minimum_entry_requirements,
      enrichment?.minimum_entry_requirements,
    ),
    requiredSubjects: firstValue(row.required_subjects, enrichment?.required_subjects),
    suitableForFormFourLeaver,
    duration: firstValue(row.duration, enrichment?.duration),
    feesIfAvailable: firstValue(row.fees_if_available, enrichment?.fees_if_available),
    feeBand: blankToUndefined(row.fees_if_available) ? "known_fee" : "unknown_fee",
    studyMode: firstValue(row.study_mode, enrichment?.mode),
    campusLocation: firstValue(row.campus_location, enrichment?.campus_location),
    admissionCapacity: firstValue(enrichment?.admission_capacity),
    entryRouteTypes: firstValue(enrichment?.entry_route_types),
    acceptsFormFourDirect: normalizeSuitability(enrichment?.accepts_form_four_direct),
    accreditationStatusIfAvailable: blankToUndefined(row.accreditation_status_if_available),
    applicationLink: blankToUndefined(row.application_link),
    officialSourceUrl: row.official_source_url.trim(),
    sourceType: row.source_type.trim(),
    sourceDatasets: enrichment ? ["post_form_four", "nactvet_enrichment"] : ["post_form_four"],
    confidenceLevel: normalizeConfidence(row.confidence_level),
    lastVerifiedDate: row.last_verified_date.trim(),
    notes: firstValue(row.notes, enrichment?.notes),
    needsReview: reviewReasons.length > 0,
    reviewReasons,
    careerKeywords: keywordData.careerKeywords,
    swahiliKeywords: keywordData.swahiliKeywords,
    searchText: [
      programmeName,
      normalizedProgrammeName,
      row.institution_name,
      awardLevel,
      fieldCategory,
      keywordData.courseFamily,
      institution?.institutionType,
      institution?.ownershipType,
      institution?.region,
      institution?.districtOrCouncil,
      row.regulator,
      row.minimum_entry_requirements,
      row.required_subjects,
      ...keywordData.careerKeywords,
      ...keywordData.swahiliKeywords,
      ...institutionSearchAliases,
    ]
      .filter(Boolean)
      .join(" "),
  }
})

const report = {
  generatedAt: new Date().toISOString(),
  baseDataset: "tanzania-post-form-four-dataset",
  enrichmentDataset: "tanzania-education-dataset",
  institutions: {
    rawBaseCount: institutionsBase.length,
    enrichmentCount: institutionsEnrichment.length,
    processedCount: processedInstitutions.length,
    enrichedCount: processedInstitutions.filter((row) =>
      row.sourceDatasets.includes("nactvet_enrichment"),
    ).length,
    verifiedLogoCount: processedInstitutions.filter((row) => row.logoStatus === "verified").length,
    needsReviewCount: processedInstitutions.filter((row) => row.needsReview).length,
  },
  programmes: {
    rawBaseCount: programmesBase.length,
    enrichmentCount: programmesEnrichment.length,
    processedCount: processedProgrammes.length,
    enrichedCount: processedProgrammes.filter((row) =>
      row.sourceDatasets.includes("nactvet_enrichment"),
    ).length,
    needsReviewCount: processedProgrammes.filter((row) => row.needsReview).length,
  },
}

writeFileSync(join(outputDir, "institutions.json"), JSON.stringify(processedInstitutions, null, 2))
writeFileSync(join(outputDir, "programmes.json"), JSON.stringify(processedProgrammes, null, 2))
writeJsonl(join(outputDir, "institutions.jsonl"), processedInstitutions)
writeJsonl(join(outputDir, "programmes.jsonl"), processedProgrammes)
writeFileSync(join(outputDir, "data-quality-report.json"), JSON.stringify(report, null, 2))

console.log(JSON.stringify(report, null, 2))
