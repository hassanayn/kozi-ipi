import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { matchesField } from "../lib/domain/taxonomy"
import { interpretProgrammeQuery } from "../convex/programmeSearch/interpret"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

type Institution = {
  normalizedInstitutionName: string
  logoStatus?: string
  logoUrl?: string
  website?: string
}

type Programme = {
  normalizedInstitutionName: string
  institutionLogoUrl?: string
  institutionWebsite?: string
}

function readJsonl<T>(path: string): T[] {
  return readFileSync(path, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T)
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

const interpretedNursing = interpretProgrammeQuery("nataka kuwa nurse")
assert(
  interpretedNursing.inferredCourseFamily === "health",
  'Expected "nataka kuwa nurse" to infer the health course family.',
)

const interpretedEngineering = interpretProgrammeQuery("civil engineering")
assert(
  interpretedEngineering.inferredCourseFamily === "engineering",
  'Expected "civil engineering" to infer the engineering course family.',
)

assert(
  matchesField("technical automotive engineering", "Engineering"),
  "Engineering field taxonomy should match technical/automotive text.",
)
assert(
  !matchesField("technical automotive engineering", "Business"),
  "Business field taxonomy must not match engineering-only text.",
)

const institutions = readJsonl<Institution>(join(root, "data/processed/institutions.jsonl"))
const programmes = readJsonl<Programme>(join(root, "data/processed/programmes.jsonl"))
const institutionsByName = new Map(
  institutions.map((institution) => [institution.normalizedInstitutionName, institution]),
)

const programmesWithLogo = programmes.filter((programme) => programme.institutionLogoUrl)
assert(
  programmesWithLogo.length > 0,
  "Expected at least one processed programme to carry a denormalized institution logo URL.",
)

for (const programme of programmesWithLogo) {
  const institution = institutionsByName.get(programme.normalizedInstitutionName)
  assert(
    institution,
    `Missing processed institution for programme ${programme.normalizedInstitutionName}.`,
  )
  assert(
    institution.logoStatus === "verified",
    `Programme logo should only be denormalized from verified institutions: ${programme.normalizedInstitutionName}.`,
  )
  assert(
    programme.institutionLogoUrl === institution.logoUrl,
    `Programme logo URL drifted from institution logo URL for ${programme.normalizedInstitutionName}.`,
  )
}

const programmesWithWebsite = programmes.filter((programme) => programme.institutionWebsite)
assert(
  programmesWithWebsite.length > 0,
  "Expected at least one processed programme to carry a denormalized institution website.",
)

console.log(
  `Search contract checks passed for ${programmesWithLogo.length} logo-bearing programmes and ${programmesWithWebsite.length} programmes with websites.`,
)
