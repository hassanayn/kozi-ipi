import { VyuoPageClient } from "@/components/vyuo/vyuo-page-client"
import {
  buildInstitutions,
  type RawInstitution,
  type RawProgramme,
} from "@/components/vyuo/institutions"
import rawInstitutions from "@/data/processed/institutions.json"
import rawProgrammes from "@/data/processed/programmes.json"

export default function VyuoPage() {
  const institutions = buildInstitutions(
    rawInstitutions as RawInstitution[],
    rawProgrammes as RawProgramme[]
  )

  return <VyuoPageClient institutions={institutions} />
}
