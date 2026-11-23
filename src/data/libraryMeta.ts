export interface LibraryServiceItem {
  id: string;
  name: string;
  category: 'Core Services' | 'Research & Digital' | 'Collections & Facilities';
  summary: string;
  location: string;
  hours: string;
  actionType: 'digital-library' | 'journals' | 'detail' | 'external';
  url?: string;
}

export interface DatabaseResource {
  id: string;
  name: string;
  group: 'Subscribed Databases' | 'Legal & Medical' | 'NDU Digital Collections' | 'Services & Catalogues';
  description: string;
  accessNote: string;
  url?: string;
  username?: string;
  password?: string;
  internalRoute?: 'journals' | 'services' | 'digital-computers';
}

export interface CampusLibrary {
  id: string;
  name: string;
  facultyId: string;
  location: string;
  focus: string;
}

export interface LibraryNewsEvent {
  id: string;
  date: string;
  category: string;
  title: string;
  summary: string;
  venue: string;
}

export const LIBRARY_SERVICES: LibraryServiceItem[] = [
  {
    id: 'circulation',
    name: 'Circulation Services',
    category: 'Core Services',
    summary: 'Registration of library users, borrowing and returning of print books, renewals, and clearance for graduating students and staff.',
    location: 'Ground Floor, Main University Library',
    hours: 'Mon – Fri · 8:00am – 4:00pm',
    actionType: 'detail',
  },
  {
    id: 'reference',
    name: 'Reference Services',
    category: 'Core Services',
    summary: 'Specialized assistance with encyclopedias, dictionaries, abstracts, indexes, bibliographic verification, and research guidance.',
    location: 'Reference Desk, First Floor',
    hours: 'Mon – Fri · 8:00am – 4:00pm',
    actionType: 'detail',
  },
  {
    id: 'serial',
    name: 'Serial Services',
    category: 'Collections & Facilities',
    summary: 'Access to current and back-issue print periodicals, academic journals, bulletins, and scholarly magazines.',
    location: 'Serials Section, Main Library',
    hours: 'Mon – Fri · 8:00am – 4:00pm',
    actionType: 'detail',
  },
  {
    id: 'reading-rooms',
    name: 'Reading Rooms',
    category: 'Collections & Facilities',
    summary: 'Quiet, climate-controlled individual and collaborative study spaces designed for focused reading and examination preparation.',
    location: 'Main & Faculty Libraries (Extended Hours)',
    hours: 'Mon – Fri · 8:00am – 5:00pm',
    actionType: 'detail',
  },
  {
    id: 'research-scholarly',
    name: 'Research and Scholarly',
    category: 'Research & Digital',
    summary: 'Literature search support, citation management guidance, thesis formatting review, and scholarly publishing advisory for faculty and postgraduates.',
    location: 'Research Support Unit & Digital Library',
    hours: 'Mon – Fri · 8:00am – 4:00pm',
    actionType: 'detail',
  },
  {
    id: 'repository',
    name: 'Repository Services',
    category: 'Research & Digital',
    summary: 'Digital preservation and open-access archiving of NDU theses, dissertations, faculty publications, and conference papers.',
    location: 'NDU Institutional Repository Unit',
    hours: 'Online 24/7 · Desk 8:00am – 4:00pm',
    actionType: 'digital-library',
  },
  {
    id: 'seminars',
    name: 'Seminars, Conferences and Workshops',
    category: 'Research & Digital',
    summary: 'Academic seminars, ZOOM research conferences, information literacy workshops, and database training hosted with faculties.',
    location: 'Digital Library Conference Hall & ZOOM',
    hours: 'Scheduled Academic Sessions',
    actionType: 'detail',
  },
  {
    id: 'training',
    name: 'Training/Lecturing',
    category: 'Core Services',
    summary: 'Use of Library and Study Skills instruction for undergraduates alongside specialized database discovery training for researchers.',
    location: 'Library Instruction Room',
    hours: 'Mon – Fri · 8:00am – 4:00pm',
    actionType: 'detail',
  },
  {
    id: 'bindery',
    name: 'Bindery Services',
    category: 'Collections & Facilities',
    summary: 'Hardcover binding of final-year projects, theses, dissertations, journals, and repair of damaged library volumes.',
    location: 'Bindery Unit, Library Annex',
    hours: 'Mon – Fri · 8:00am – 4:00pm',
    actionType: 'detail',
  },
  {
    id: 'printing',
    name: 'Printing and Photocopying Services',
    category: 'Collections & Facilities',
    summary: 'Reprographic support for academic materials, journal articles, and approved research documents within copyright guidelines.',
    location: 'Ground & Second Floor Reprography Desk',
    hours: 'Mon – Fri · 8:00am – 4:00pm',
    actionType: 'detail',
  },
  {
    id: 'digital-library-services',
    name: 'Digital Library Resources and Services',
    category: 'Research & Digital',
    summary: 'Gateway to subscribed electronic databases, e-books, second-floor computer workstations, and departmental open access e-journals.',
    location: 'Second Floor, New Campus Digital Library',
    hours: 'Mon – Fri · 8:00am – 5:00pm',
    actionType: 'digital-library',
  },
  {
    id: 'opac',
    name: 'Online Public Access Catalogue (OPAC)',
    category: 'Research & Digital',
    summary: 'Search NDU Library print holdings, call numbers, shelf availability, and catalogued electronic items across campus libraries.',
    location: 'Web & Library Kiosks',
    hours: 'Online 24/7',
    actionType: 'digital-library',
  },
  {
    id: 'koha',
    name: 'Koha',
    category: 'Research & Digital',
    summary: 'Integrated Library Management System powering NDU cataloguing, circulation records, and patron account lookup.',
    location: 'Library Systems & OPAC Terminal',
    hours: 'Online 24/7',
    actionType: 'digital-library',
  },
  {
    id: 'faculty-library-services',
    name: 'Faculty Library Services',
    category: 'Core Services',
    summary: 'Dedicated subject librarians and discipline-specific collections stationed across all 13 NDU faculties and institutes.',
    location: 'Campus Faculty Libraries',
    hours: 'Mon – Fri · 8:00am – 4:00pm',
    actionType: 'detail',
  },
  {
    id: 'ndu-journals',
    name: 'NDU Journal',
    category: 'Research & Digital',
    summary: 'Official Niger Delta University academic and research journals',
    location: 'Digital Library E-Journals Portal',
    hours: 'Online 24/7',
    actionType: 'external',
    url: 'https://www.ndu.edu.ng/journals',
  },
  {
    id: 'ndu-bulletin',
    name: 'NDU Bulletin',
    category: 'Research & Digital',
    summary: 'Weekly official bulletins, university announcements, and circulars',
    location: 'University Publications & Serials Section',
    hours: 'Online 24/7',
    actionType: 'external',
    url: 'https://www.ndu.edu.ng/weekly-bulettin',
  },
  {
    id: 'inaugural-lectures',
    name: 'Inaugural Lecture Series',
    category: 'Collections & Facilities',
    summary: 'Distinguished professorial inaugural lectures & academic addresses',
    location: 'Special Collections & Institutional Repository',
    hours: 'Online 24/7 · Mon – Fri · 8:00am – 4:00pm',
    actionType: 'external',
    url: 'https://www.ndu.edu.ng/lecture-series',
  },
  {
    id: 'newspapers',
    name: 'Newspapers',
    category: 'Collections & Facilities',
    summary: 'Daily national and regional Nigerian newspapers archived for current affairs, historical research, and legal reference.',
    location: 'Serials & Newspapers Reading Bay',
    hours: 'Mon – Fri · 8:00am – 4:00pm',
    actionType: 'detail',
  },
];

export const DATABASE_RESOURCES: DatabaseResource[] = [
  {
    id: 'ebscohost',
    name: 'EBSCOHost Databases (by TETFund)',
    group: 'Subscribed Databases',
    description: 'Multidisciplinary full-text academic journals, e-books, and research indices sponsored through TETFund for Nigerian universities.',
    accessNote: 'TETFund Subscribed Database Portal',
    url: 'https://search.ebscohost.com',
  },
  {
    id: 'hinari',
    name: 'Research4Life',
    group: 'Subscribed Databases',
    description: 'WHO-led biomedical, agricultural, environmental, and health sciences collection providing peer-reviewed journals.',
    accessNote: 'NDU Central E-Library Portal',
    url: 'https://www.ndu.cblibrary.ng/',
  },
  {
    id: 'taylor-francis',
    name: 'Taylor & Francis Collection',
    group: 'Subscribed Databases',
    description: 'Peer-reviewed journals across humanities, social sciences, science, technology, engineering, and medicine.',
    accessNote: 'NDU Central E-Library Portal',
    url: 'https://www.ndu.cblibrary.ng/',
  },
  {
    id: 'oxford-press',
    name: 'Oxford University Press',
    group: 'Subscribed Databases',
    description: 'Premier academic collection of high-impact peer-reviewed journals published by Oxford University Press across all major disciplines.',
    accessNote: 'Subscribed Academic Collection',
    url: 'https://academic.oup.com/journals/pages/journals_a_to_z',
  },
  {
    id: 'heinonline',
    name: 'Hein Online',
    group: 'Legal & Medical',
    description: 'Premier legal research database housing law journals, treaties, constitutional documents, and international law archives.',
    accessNote: 'Subscribed Legal Research Database',
    url: 'https://access.heinonline.com/HOL/login-hol',
  },
  {
    id: 'lexisnexis',
    name: 'LexisNexis',
    group: 'Legal & Medical',
    description: 'Comprehensive global legal, regulatory, and business intelligence database for case law and statutory research.',
    accessNote: 'Subscribed Legal & Regulatory Intelligence',
    url: 'https://www.mylexisnexis.co.za/auth/SignOn.aspx',
  },
  {
    id: 'legalpedia',
    name: 'Legalpedia',
    group: 'Legal & Medical',
    description: 'Nigerian Supreme Court, Court of Appeal judgments, Laws of the Federation, and rules of court.',
    accessNote: 'Law Library Terminal & Online Access',
    url: 'https://legalpediaonline.com/',
  },
  {
    id: 'law-pavilion',
    name: 'Law Pavilion',
    group: 'Legal & Medical',
    description: 'Electronic Nigerian law reports, judicial authorities, and statutory citation analytics.',
    accessNote: 'Law Library Terminal & Online Access',
    url: 'https://lawpavilion.com/',
  },
  {
    id: 'proquest',
    name: 'ProQuest',
    group: 'Subscribed Databases',
    description: 'Comprehensive multidisciplinary academic research databases, dissertations, theses, and primary source collections.',
    accessNote: 'NDU Central E-Library Portal',
    url: 'https://www.ndu.cblibrary.ng/',
  },
  {
    id: 'pubmed',
    name: 'PubMed',
    group: 'Legal & Medical',
    description: 'Free biomedical and life sciences citation database from the U.S. National Library of Medicine (MEDLINE).',
    accessNote: 'Open Access biomedical & clinical research',
    url: 'https://pubmed.ncbi.nlm.nih.gov/',
  },
  {
    id: 'proquest-direct',
    name: 'ProQuest Direct',
    group: 'Subscribed Databases',
    description: 'Direct search portal for ProQuest international academic databases, journals, and dissertations.',
    accessNote: 'Direct Database Search',
    url: 'https://search.proquest.com',
  },
  {
    id: 'cinahl',
    name: 'CINAHL Ultimate/Complete',
    group: 'Legal & Medical',
    description: 'The definitive research tool for nursing and allied health literature, providing full text for hundreds of top nursing journals.',
    accessNote: 'Subscribed Nursing & Allied Health Database',
    url: 'https://search.ebscohost.com',
  },
  {
    id: 'medline-complete',
    name: 'Medline Complete/Plus',
    group: 'Legal & Medical',
    description: 'Comprehensive biomedical and health database providing full-text medical journals and clinical research literature.',
    accessNote: 'Subscribed Biomedical & Health Database',
    url: 'https://search.ebscohost.com',
  },
  {
    id: 'open-access-databases',
    name: 'Open Access Databases',
    group: 'NDU Digital Collections',
    description: 'Curated index of open access scientific, health, and humanities research databases worldwide.',
    accessNote: 'Open Access Portals',
    internalRoute: 'digital-computers',
    url: 'https://doaj.org/',
  },
  {
    id: 'ebooks',
    name: 'E-books',
    group: 'NDU Digital Collections',
    description: 'Electronic textbooks and academic monographs accessible across smartphones, tablets, and digital library workstations.',
    accessNote: 'Open & Subscribed Access',
    url: 'https://www.doabooks.org/',
  },
  {
    id: 'ejournals',
    name: 'E-journals',
    group: 'NDU Digital Collections',
    description: 'Directory of peer-reviewed open access e-journals compiled by the University Library across all NDU faculties and departments.',
    accessNote: 'Open Access by Department',
    internalRoute: 'journals',
  },
  {
    id: 'ndu-bulletin',
    name: 'NDU bulletin',
    group: 'NDU Digital Collections',
    description: 'Official Niger Delta University weekly information bulletins, announcements, and university circulars.',
    accessNote: 'Official University Publication',
    url: 'https://www.ndu.edu.ng/weekly-bulettin',
  },
  {
    id: 'ndu-repository',
    name: 'NDU repository',
    group: 'NDU Digital Collections',
    description: 'Institutional digital archive for NDU theses, dissertations, inaugural lectures, and scholarly outputs.',
    accessNote: 'Institutional Archive',
    internalRoute: 'services',
  },
  {
    id: 'ndu-journals',
    name: 'NDU journals',
    group: 'NDU Digital Collections',
    description: 'Official Niger Delta University academic and research journals published across faculties and departments.',
    accessNote: 'Official University Journals Portal',
    url: 'https://www.ndu.edu.ng/journals',
  },
  {
    id: 'newspapers-db',
    name: 'Newspapers.',
    group: 'Services & Catalogues',
    description: 'Daily Nigerian press archives and digital news links curated for research and current awareness.',
    accessNote: 'Serials Division',
    internalRoute: 'newspapers',
  },
  {
    id: 'jstor',
    name: 'JStor',
    group: 'Subscribed Databases',
    description: 'Digital archive of academic journals, books, and primary sources across humanities, social sciences, and sciences.',
    accessNote: 'Subscribed Academic Digital Archive',
    url: 'https://jstor.org',
  },
  {
    id: 'lirn',
    name: 'LIRN (Library & Information Resource Network)',
    group: 'Subscribed Databases',
    description: 'Library and Information Resources Network providing students and researchers with digital library resources and scholarly collections.',
    accessNote: 'LIRN Consortium Portal',
    url: 'https://www.lirn.net/',
  },
  {
    id: 'databases-index',
    name: 'Databases Directory',
    group: 'NDU Digital Collections',
    description: 'Central index of all subscribed and open electronic research databases managed by the NDU Systems Librarian.',
    accessNote: 'Digital Library Portal',
    internalRoute: 'digital-computers',
  },
  {
    id: 'research-capacity',
    name: 'Research Capacity Resources',
    group: 'Subscribed Databases',
    description: 'Curated guides, methodology toolkits, and international research support networks for academic writing and grant preparation.',
    accessNote: 'Open Academic Access',
    url: 'https://www.inasp.info/',
  },
  {
    id: 'subject-guides',
    name: 'Subject Guides',
    group: 'NDU Digital Collections',
    description: 'Curated faculty and departmental research pathfinders linking students to essential reference works.',
    accessNote: 'Faculty Librarians',
    internalRoute: 'journals',
  },
  {
    id: 'thesis-dissertation',
    name: 'Thesis / Dissertation',
    group: 'NDU Digital Collections',
    description: 'Postgraduate theses and undergraduate research projects preserved for reference and citation.',
    accessNote: 'Repository & Special Collections',
    internalRoute: 'services',
  },
  {
    id: 'opac-db',
    name: 'Online Public Access Catalogue (OPAC)',
    group: 'Services & Catalogues',
    description: 'Search physical books, monographs, and indexed periodicals across the Main and Faculty Libraries.',
    accessNote: '24/7 Catalogue Lookup',
    internalRoute: 'services',
  },
  {
    id: 'koha-db',
    name: 'Koha',
    group: 'Services & Catalogues',
    description: 'Koha Library Automation portal for circulation status, MARC records, and user library accounts.',
    accessNote: 'Library Automation System',
    url: 'https://koha-community.org/',
  },
  {
    id: 'printing-db',
    name: 'Printing and Photocopying Services',
    group: 'Services & Catalogues',
    description: 'Reprographic and document printing support inside the Main and Digital Library.',
    accessNote: 'On-Campus Service',
    internalRoute: 'services',
  },
  {
    id: 'zoom-conferences',
    name: 'ZOOM Conferences and Seminars',
    group: 'Services & Catalogues',
    description: 'Virtual academic conferences, library orientation sessions, and inter-university research webinars.',
    accessNote: 'Scheduled Sessions',
    internalRoute: 'services',
  },
];

export const OUR_LIBRARIES: CampusLibrary[] = [
  {
    id: 'chs',
    name: 'College of Health Sciences Library',
    facultyId: 'basic-medical-sciences',
    location: 'College of Health Sciences Complex, Amassoma',
    focus: 'Clinical medicine, anatomy, physiology, medical laboratory science, and pathology.',
  },
  {
    id: 'agri',
    name: 'Faculty of Agriculture Library',
    facultyId: 'agriculture',
    location: 'Faculty of Agriculture Building',
    focus: 'Agricultural economics, fisheries, animal science, crop science, and soil science.',
  },
  {
    id: 'arts',
    name: 'Faculty of Arts Library',
    facultyId: 'arts',
    location: 'Faculty of Arts Wing',
    focus: 'English & literary studies, history & diplomacy, philosophy, religious studies, and theatre arts.',
  },
  {
    id: 'edu',
    name: 'Faculty of Education Library',
    facultyId: 'education',
    location: 'Faculty of Education Complex',
    focus: 'Teacher education, library & information science, vocational & technical education.',
  },
  {
    id: 'eng',
    name: 'Faculty of Engineering Library',
    facultyId: 'engineering',
    location: 'Faculty of Engineering Complex',
    focus: 'Chemical, civil, electrical/electronic, marine, mechanical, and petroleum engineering.',
  },
  {
    id: 'env',
    name: 'Faculty of Environmental Science Library',
    facultyId: 'environmental-sciences',
    location: 'Environmental Sciences Wing',
    focus: 'Architecture, building, environmental management, fine & applied arts, and urban planning.',
  },
  {
    id: 'law',
    name: 'Faculty of Law Library',
    facultyId: 'law',
    location: 'Faculty of Law Complex (Chambers & E-Law Wing)',
    focus: 'Nigerian statutes, Law Pavilion, Legalpedia, HeinOnline, LexisNexis, and jurisprudence.',
  },
  {
    id: 'mgmt',
    name: 'Faculty of Management Sciences Library',
    facultyId: 'management-sciences',
    location: 'Management Sciences Block',
    focus: 'Accounting, banking & finance, insurance, management, marketing, and office management.',
  },
  {
    id: 'pharm',
    name: 'Faculty of Pharmacy Library',
    facultyId: 'pharmacy',
    location: 'Faculty of Pharmacy Building',
    focus: 'Pharmaceutics, pharmacology, pharmacognosy, clinical pharmacy, and pharmaceutical chemistry.',
  },
  {
    id: 'sci',
    name: 'Faculty of Science Library',
    facultyId: 'science',
    location: 'Faculty of Science Complex',
    focus: 'Biological science, chemical sciences, computer science, geology, mathematics, microbiology, physics.',
  },
  {
    id: 'soc',
    name: 'Faculty of Social Science Library',
    facultyId: 'social-sciences',
    location: 'Social Sciences Building',
    focus: 'Economics, geography & environmental management, mass communication, political science, sociology.',
  },
  {
    id: 'nurs',
    name: 'Faculty of Nursing Sciences Library',
    facultyId: 'nursing-sciences',
    location: 'Nursing Sciences Pavilion',
    focus: 'Clinical nursing, maternal & child health, community health, and nursing informatics.',
  },
  {
    id: 'inds',
    name: 'Institute for Niger Delta Studies Library',
    facultyId: 'niger-delta-studies',
    location: 'INDS Research Centre, Wilberforce Island',
    focus: 'Niger Delta history, ecology, coastal sustainability, cultural heritage, and regional policy.',
  },
];

export const LIBRARY_NEWS_EVENTS: LibraryNewsEvent[] = [
  {
    id: 'evt-1',
    date: 'Academic Session 2026',
    category: 'Digital Library Notice',
    title: 'Second Floor Digital Library Workstations & Auto-Clean Policy',
    summary:
      'Students and faculty have access to internet-connected workstations on the Second Floor for academic research, online classes, slide preparation, and ZOOM seminars. Remember to save personal files to external drives or cloud storage, as workstations automatically clear local downloads on session reset.',
    venue: 'Second Floor, New Campus Digital Library',
  },
  {
    id: 'evt-2',
    date: 'Weekly · Wednesdays 10:00am',
    category: 'ZOOM Conferences & Seminars',
    title: 'Open Access E-Journals & TETFund EBSCOHost Discovery Clinic',
    summary:
      'Hands-on orientation led by the Systems Librarian covering departmental open access e-journals, HINARI, PubMed, and citation workflows across all 13 NDU faculties.',
    venue: 'Digital Library Seminar Hall & ZOOM',
  },
  {
    id: 'evt-3',
    date: 'Ongoing Registration',
    category: 'User Services',
    title: 'Library Clearance, Koha OPAC Accounts & Faculty Library Access',
    summary:
      'Fresh and returning students are invited to activate their Koha patron accounts at the Circulation Desk to access physical holdings across the Main and Faculty Libraries.',
    venue: 'Circulation Desk, Main University Library',
  },
  {
    id: 'evt-4',
    date: 'By Scheduled Appointment',
    category: 'Scholarly Publishing',
    title: 'NDU Repository Thesis Submission & Inaugural Lecture Archive',
    summary:
      'Postgraduate candidates and academic staff may schedule appointments with the Repository Unit for thesis archiving, ISSN/journal inquiries, and inaugural lecture digitization.',
    venue: 'University Librarian Office & Repository Unit',
  },
];
