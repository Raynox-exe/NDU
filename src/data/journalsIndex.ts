import { FACULTIES_PART_1 } from './journalsPart1';
import { FACULTIES_PART_2 } from './journalsPart2';
import type { FacultyCatalog } from './journalTypes';

export const FACULTY_CATALOGS: FacultyCatalog[] = [
  ...FACULTIES_PART_1,
  ...FACULTIES_PART_2,
];

export const TOTAL_JOURNAL_COUNT = FACULTY_CATALOGS.reduce(
  (sum, faculty) =>
    sum + faculty.departments.reduce((dSum, dept) => dSum + dept.journals.length, 0),
  0,
);

export const TOTAL_DEPARTMENT_COUNT = FACULTY_CATALOGS.reduce(
  (sum, faculty) => sum + faculty.departments.length,
  0,
);
