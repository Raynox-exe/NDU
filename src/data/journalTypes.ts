export interface JournalEntry {
  id: string;
  sn?: number;
  title: string;
  url?: string;
  issn?: string;
  eissn?: string;
  startYear?: string;
  formerTitle?: string;
  subCategory?: string;
}

export interface DepartmentCatalog {
  id: string;
  name: string;
  note?: string;
  journals: JournalEntry[];
}

export interface FacultyCatalog {
  id: string;
  name: string;
  shortName: string;
  description: string;
  departments: DepartmentCatalog[];
}
