export type InstitutionType = "University" | "College" | "TVET"
export type InstitutionOwnership = "Public" | "Private"
export type InstitutionTone = "amber" | "blue" | "green" | "indigo" | "ink" | "red"

export type Institution = {
  id: string
  name: string
  short: string
  type: InstitutionType
  accredited: boolean
  region: string
  ownership: InstitutionOwnership
  blurb: string
  fields: string[]
  programmes: number
  monogramTone: InstitutionTone
  awardLevels: string[]
  logoUrl?: string
}

export const institutions: Institution[] = [
  {
    id: "udsm",
    name: "University of Dar es Salaam",
    short: "UDSM",
    type: "University",
    accredited: true,
    region: "Dar es Salaam",
    ownership: "Public",
    blurb:
      "Chuo kikuu kongwe na kikubwa zaidi Tanzania, kinachoongoza katika ubora wa elimu na utafiti.",
    fields: ["Engineering", "Business", "Law"],
    programmes: 124,
    monogramTone: "blue",
    awardLevels: ["Certificate", "Diploma", "Degree", "Postgraduate"],
    logoUrl: "https://www.udsm.ac.tz/sites/default/files/udsm%20logo.png",
  },
  {
    id: "ardhi",
    name: "Ardhi University",
    short: "ARU",
    type: "University",
    accredited: true,
    region: "Dar es Salaam",
    ownership: "Public",
    blurb:
      "Kinara katika masomo ya ardhi, upangaji miji, uhandisi na usimamizi wa mazingira.",
    fields: ["Land Management", "Architecture", "Surveying"],
    programmes: 45,
    monogramTone: "ink",
    awardLevels: ["Diploma", "Degree", "Postgraduate"],
    logoUrl: "https://www.aru.ac.tz/site/images/logo.jpg",
  },
  {
    id: "muhas",
    name: "Muhimbili University of Health and Allied Sciences",
    short: "MUHAS",
    type: "University",
    accredited: true,
    region: "Dar es Salaam",
    ownership: "Public",
    blurb: "Kinara wa elimu ya afya na sayansi shirikishi barani Afrika Mashariki.",
    fields: ["Medicine", "Nursing", "Pharmacy"],
    programmes: 38,
    monogramTone: "red",
    awardLevels: ["Diploma", "Degree", "Postgraduate"],
    logoUrl: "/institution-logos/muhas-logo.png",
  },
  {
    id: "nm-aist",
    name: "The Nelson Mandela African Institution of Science and Technology",
    short: "NM-AIST",
    type: "University",
    accredited: true,
    region: "Arusha",
    ownership: "Public",
    blurb:
      "Chuo cha sayansi na teknolojia kinachozingatia ubunifu na utafiti wa viwango vya kimataifa.",
    fields: ["ICT", "Engineering", "Applied Sciences"],
    programmes: 22,
    monogramTone: "green",
    awardLevels: ["Postgraduate"],
  },
  {
    id: "sjut",
    name: "St. John's University of Tanzania",
    short: "SJUT",
    type: "University",
    accredited: true,
    region: "Dodoma",
    ownership: "Private",
    blurb: "Kutoa elimu yenye maadili katika mazingira ya kikristo na kibaaluma.",
    fields: ["Education", "Business", "Law"],
    programmes: 41,
    monogramTone: "indigo",
    awardLevels: ["Certificate", "Diploma", "Degree"],
    logoUrl: "https://www.sjut.ac.tz/images/images/logo-sitename.jpg",
  },
  {
    id: "must",
    name: "Mbeya University of Science and Technology",
    short: "MUST",
    type: "University",
    accredited: true,
    region: "Mbeya",
    ownership: "Public",
    blurb: "Kutoa elimu bora ya sayansi, teknolojia na uvumbuzi.",
    fields: ["Engineering", "ICT", "Environmental Science"],
    programmes: 36,
    monogramTone: "amber",
    awardLevels: ["Certificate", "Diploma", "Degree"],
    logoUrl: "https://www.must.ac.tz/assets/images/must-logo.png",
  },
  {
    id: "dit",
    name: "Dar es Salaam Institute of Technology",
    short: "DIT",
    type: "College",
    accredited: true,
    region: "Dar es Salaam",
    ownership: "Public",
    blurb:
      "Chuo cha teknolojia kinachoandaa mafundi na wahandisi wenye ujuzi wa vitendo.",
    fields: ["Engineering", "ICT", "Laboratory Science"],
    programmes: 52,
    monogramTone: "blue",
    awardLevels: ["Certificate", "Diploma", "Degree"],
    logoUrl: "https://www.dit.ac.tz/storage/images/slogo.png",
  },
  {
    id: "atc",
    name: "Arusha Technical College",
    short: "ATC",
    type: "TVET",
    accredited: true,
    region: "Arusha",
    ownership: "Public",
    blurb: "Mafunzo ya kiufundi yanayolenga viwanda na soko la ajira.",
    fields: ["Mechanical", "Electrical", "Auto"],
    programmes: 31,
    monogramTone: "ink",
    awardLevels: ["Certificate", "Diploma"],
    logoUrl: "https://www.atc.ac.tz/rjm/img/atc%20logo.png",
  },
  {
    id: "ifm",
    name: "Institute of Finance Management",
    short: "IFM",
    type: "College",
    accredited: true,
    region: "Dar es Salaam",
    ownership: "Public",
    blurb: "Kinara katika fani za fedha, uhasibu, bima na teknolojia ya habari.",
    fields: ["Accounting", "Banking", "Insurance"],
    programmes: 28,
    monogramTone: "green",
    awardLevels: ["Certificate", "Diploma", "Degree", "Postgraduate"],
    logoUrl: "https://ifm.ac.tz/storage/logo.png",
  },
  {
    id: "udom",
    name: "University of Dodoma",
    short: "UDOM",
    type: "University",
    accredited: true,
    region: "Dodoma",
    ownership: "Public",
    blurb:
      "Mojawapo ya vyuo vikuu vikubwa zaidi vya umma vinavyotoa programu mbalimbali.",
    fields: ["Education", "ICT", "Health"],
    programmes: 96,
    monogramTone: "indigo",
    awardLevels: ["Certificate", "Diploma", "Degree", "Postgraduate"],
    logoUrl: "https://www.udom.ac.tz/images/logo-170x172.png",
  },
  {
    id: "nct",
    name: "National College of Tourism",
    short: "NCT",
    type: "TVET",
    accredited: true,
    region: "Arusha",
    ownership: "Public",
    blurb:
      "Mafunzo maalum kwenye sekta ya utalii na ukarimu kwa viwango vya kimataifa.",
    fields: ["Hospitality", "Tour Guiding", "Culinary"],
    programmes: 14,
    monogramTone: "amber",
    awardLevels: ["Certificate", "Diploma"],
  },
  {
    id: "muce",
    name: "Mkwawa University College of Education",
    short: "MUCE",
    type: "College",
    accredited: true,
    region: "Iringa",
    ownership: "Public",
    blurb: "Kuandaa walimu wa sekondari wenye ujuzi wa kufundisha na ufundishaji.",
    fields: ["Education", "Sciences", "Languages"],
    programmes: 26,
    monogramTone: "red",
    awardLevels: ["Diploma", "Degree"],
    logoUrl: "https://www.udsm.ac.tz/sites/default/files/udsm%20logo.png",
  },
]

export const popularRegions = [
  "Dar es Salaam",
  "Arusha",
  "Mwanza",
  "Dodoma",
  "Kilimanjaro",
  "Zanzibar",
]

export const fieldFocus = [
  "Engineering",
  "Health",
  "ICT",
  "Business",
  "Education",
  "Agriculture",
  "Law",
  "Tourism",
]
