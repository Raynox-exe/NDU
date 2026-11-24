import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'library_db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache + file persistence with atomic writing
let dbData = null;

function getInitialData() {
  const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);

  return {
    users: [
      {
        id: 'u-admin-1',
        full_name: 'University Library Administrator',
        email: 'admin@ndu.edu.ng',
        password: adminPasswordHash,
        role: 'admin',
        status: 'active',
        created_at: new Date('2026-01-01T08:00:00Z').toISOString(),
      },
    ],
    journals: [
      {
        id: 'j-vol12-iss1',
        name: 'Volume 12, Issue 1 (June 2017)',
        volume_no: 12,
        issue_no: 1,
        publication_year: 2017,
        status: 'published',
        is_visible: true,
        created_at: new Date('2017-06-01T12:00:00Z').toISOString(),
      },
      {
        id: 'j-vol13-iss1',
        name: 'Volume 13, Issue 1 (August 2024)',
        volume_no: 13,
        issue_no: 1,
        publication_year: 2024,
        status: 'published',
        is_visible: true,
        created_at: new Date('2024-08-20T12:00:00Z').toISOString(),
      },
      {
        id: 'j-vol14-iss1',
        name: 'Volume 14, Issue 1 (Current Issue - 2026)',
        volume_no: 14,
        issue_no: 1,
        publication_year: 2026,
        status: 'draft',
        is_visible: true,
        created_at: new Date('2026-01-10T12:00:00Z').toISOString(),
      },
    ],
    articles: [
      {
        id: 'art-1',
        journal_id: 'j-vol12-iss1',
        submission_id: null,
        title: 'The Information Needs of Librarians in Niger Delta University, Bayelsa State.',
        authors: 'Joyce Chinyere Oyadonghan Ph.D, Dime Ishioma Angela, and Victor O. Idiedo',
        abstract: 'Librarians are custodians of information and as such examining the information needs of librarians is paramount. The study was conducted to find out librarians’ information needs, access points to such information needs, the types of information needed by Librarians that are available in Niger Delta University (NDU) and the problems encountered while searching for information. 21 professional librarians were purposely sampled for the study based on availability.',
        content: 'Full published text archived in official institutional repository.',
        page_range: '1 - 14',
        file_path: '6Vd8PaS7.pdf',
        download_enabled: true,
        is_visible: true,
        status: 'published',
        views: 342,
        published_at: new Date('2017-06-01T10:00:00Z').toISOString(),
        created_at: new Date('2017-06-01T10:00:00Z').toISOString(),
      },
      {
        id: 'art-2',
        journal_id: 'j-vol12-iss1',
        submission_id: null,
        title: 'The Ibibio Union and Educational Development of Ibibioland: 1928-1966',
        authors: 'Uwem Jonah Akpan, PhD',
        abstract: 'The Ibibio Union was established by the Ibibio people in 1928 as an instrument of development and social mobilisation. Although the Union recorded landmark achievements in many areas of national life, this study is concerned with its contributions to the educational development of Ibibioland.',
        content: 'Full published text archived in official institutional repository.',
        page_range: '15 - 29',
        file_path: '9Ue95WZb.pdf',
        download_enabled: true,
        is_visible: true,
        status: 'published',
        views: 289,
        published_at: new Date('2017-06-01T10:00:00Z').toISOString(),
        created_at: new Date('2017-06-01T10:00:00Z').toISOString(),
      },
      {
        id: 'art-3',
        journal_id: 'j-vol13-iss1',
        submission_id: null,
        title: 'Niger Delta and the Poetics of Power',
        authors: 'Bernard Otonye Stephen, Ibiwari Ikiriko, G. Ebinyo, and Obari Gomba',
        abstract: 'The poetry of Ikiriko, Ogbowei and Gomba in various ways versifies the socio-economic, political and environmental concerns bedevilling Nigeria’s Niger Delta. These poets belong to a third generation of writers involved in capturing, through poetry, the changing fortunes of the crude-oil rich region.',
        content: 'Full published text archived in official institutional repository.',
        page_range: '30 - 45',
        file_path: 'JxLN35Fs.pdf',
        download_enabled: true,
        is_visible: true,
        status: 'published',
        views: 412,
        published_at: new Date('2024-08-20T10:00:00Z').toISOString(),
        created_at: new Date('2024-08-20T10:00:00Z').toISOString(),
      },
      {
        id: 'art-4',
        journal_id: 'j-vol12-iss1',
        submission_id: null,
        title: 'The National Inland Waterways Authority and its Contributions to Inland Waterways in Nigeria, 1997-2014',
        authors: 'Fidelis Achoba and Muhammed Lawal Shuaibu',
        abstract: 'Inland Waterways were the major highways in the pre-colonial and colonial eras. In the Niger-Delta, they are still the major highways in the socio-political and economic activities of the area. This work focuses on the history of the administrative authorities that had serially managed Nigerian inland waterways.',
        content: 'Full published text archived in official institutional repository.',
        page_range: '46 - 61',
        file_path: 'MRmaQ35T.pdf',
        download_enabled: true,
        is_visible: true,
        status: 'published',
        views: 198,
        published_at: new Date('2017-06-01T10:00:00Z').toISOString(),
        created_at: new Date('2017-06-01T10:00:00Z').toISOString(),
      },
      {
        id: 'art-5',
        journal_id: 'j-vol12-iss1',
        submission_id: null,
        title: 'The Consequences of Ethnic Conflicts and Disunity on the Civic Education of Youths in the Niger Delta',
        authors: 'Henchard B. Erezene, PhD',
        abstract: 'The Niger Delta, like many other parts of Nigeria, has become a region of unending conflicts in recent times. These conflicts which are mainly caused by bad governance policies and exploitative activities of multinational oil companies have introduced discord between communities.',
        content: 'Full published text archived in official institutional repository.',
        page_range: '62 - 78',
        file_path: 'r2wUBcGt.pdf',
        download_enabled: true,
        is_visible: true,
        status: 'published',
        views: 265,
        published_at: new Date('2017-06-01T10:00:00Z').toISOString(),
        created_at: new Date('2017-06-01T10:00:00Z').toISOString(),
      },
    ],
    submissions: [],
    notifications: [],
    sections: [
      {
        id: 'sec-services',
        title: 'Our Library Services',
        type: 'dropdown',
        target_nav: 'header_dropdown',
        order: 1,
        is_active: true,
        description: 'Comprehensive directory of circulation, reference, digital, and faculty library services.',
      },
      {
        id: 'sec-publications',
        title: 'NDU Publications',
        type: 'dropdown',
        target_nav: 'header_dropdown',
        order: 2,
        is_active: true,
        description: 'Official university publications, weekly bulletins, and inaugural lecture series.',
      },
      {
        id: 'sec-databases',
        title: 'Subscribed Databases & Repositories',
        type: 'section',
        target_nav: 'digital_library',
        order: 3,
        is_active: true,
        description: 'Electronic subscribed research portals and open access repositories.',
      },
      {
        id: 'sec-quick-links',
        title: 'Academic Portals & External Sources',
        type: 'section',
        target_nav: 'homepage',
        order: 4,
        is_active: true,
        description: 'Direct access links to national and international scholarly institutions.',
      },
    ],
    links: [
      // 19 Library Services
      {
        id: 'svc-circulation',
        section_id: 'sec-services',
        name: 'Circulation Services',
        url: '',
        description: 'Registration of library users, borrowing and returning of print books, renewals, and clearance for graduating students and staff.',
        category: 'Core Services',
        badge: 'Core',
        action_type: 'detail',
        order: 1,
        is_active: true,
      },
      {
        id: 'svc-reference',
        section_id: 'sec-services',
        name: 'Reference Services',
        url: '',
        description: 'Specialized assistance with encyclopedias, dictionaries, abstracts, indexes, bibliographic verification, and research guidance.',
        category: 'Core Services',
        badge: 'Core',
        action_type: 'detail',
        order: 2,
        is_active: true,
      },
      {
        id: 'svc-serial',
        section_id: 'sec-services',
        name: 'Serial Services',
        url: '',
        description: 'Access to current and back-issue print periodicals, academic journals, bulletins, and scholarly magazines.',
        category: 'Collections & Facilities',
        badge: 'Serials',
        action_type: 'detail',
        order: 3,
        is_active: true,
      },
      {
        id: 'svc-reading-rooms',
        section_id: 'sec-services',
        name: 'Reading Rooms',
        url: '',
        description: 'Quiet, climate-controlled individual and collaborative study spaces designed for focused reading and examination preparation.',
        category: 'Collections & Facilities',
        badge: 'Facility',
        action_type: 'detail',
        order: 4,
        is_active: true,
      },
      {
        id: 'svc-research-scholarly',
        section_id: 'sec-services',
        name: 'Research and Scholarly',
        url: '',
        description: 'Literature search support, citation management guidance, thesis formatting review, and scholarly publishing advisory.',
        category: 'Research & Digital',
        badge: 'Scholarly',
        action_type: 'detail',
        order: 5,
        is_active: true,
      },
      {
        id: 'svc-repository',
        section_id: 'sec-services',
        name: 'Repository Services',
        url: '',
        description: 'Digital preservation and open-access archiving of NDU theses, dissertations, faculty publications, and conference papers.',
        category: 'Research & Digital',
        badge: 'Institutional',
        action_type: 'digital-library',
        order: 6,
        is_active: true,
      },
      {
        id: 'svc-seminars',
        section_id: 'sec-services',
        name: 'Seminars, Conferences and Workshops',
        url: '',
        description: 'Academic seminars, ZOOM research conferences, information literacy workshops, and database training hosted with faculties.',
        category: 'Research & Digital',
        badge: 'Conferences',
        action_type: 'detail',
        order: 7,
        is_active: true,
      },
      {
        id: 'svc-training',
        section_id: 'sec-services',
        name: 'Training/Lecturing',
        url: '',
        description: 'Use of Library and Study Skills instruction for undergraduates alongside specialized database discovery training.',
        category: 'Core Services',
        badge: 'Instruction',
        action_type: 'detail',
        order: 8,
        is_active: true,
      },
      {
        id: 'svc-bindery',
        section_id: 'sec-services',
        name: 'Bindery Services',
        url: '',
        description: 'Hardcover binding of final-year projects, theses, dissertations, journals, and repair of damaged library volumes.',
        category: 'Collections & Facilities',
        badge: 'Bindery',
        action_type: 'detail',
        order: 9,
        is_active: true,
      },
      {
        id: 'svc-printing',
        section_id: 'sec-services',
        name: 'Printing and Photocopying Services',
        url: '',
        description: 'Reprographic support for academic materials, journal articles, and approved research documents within copyright guidelines.',
        category: 'Collections & Facilities',
        badge: 'Reprography',
        action_type: 'detail',
        order: 10,
        is_active: true,
      },
      {
        id: 'svc-digital-library',
        section_id: 'sec-services',
        name: 'Digital Library Resources and Services',
        url: '',
        description: 'Gateway to subscribed electronic databases, e-books, second-floor computer workstations, and departmental open access e-journals.',
        category: 'Research & Digital',
        badge: 'E-Library',
        action_type: 'digital-library',
        order: 11,
        is_active: true,
      },
      {
        id: 'svc-opac',
        section_id: 'sec-services',
        name: 'Online Public Access Catalogue (OPAC)',
        url: '',
        description: 'Search NDU Library print holdings, call numbers, shelf availability, and catalogued electronic items across campus libraries.',
        category: 'Research & Digital',
        badge: 'OPAC',
        action_type: 'digital-library',
        order: 12,
        is_active: true,
      },
      {
        id: 'svc-koha',
        section_id: 'sec-services',
        name: 'Koha',
        url: '',
        description: 'Integrated Library Management System powering NDU cataloguing, circulation records, and patron account lookup.',
        category: 'Research & Digital',
        badge: 'System',
        action_type: 'digital-library',
        order: 13,
        is_active: true,
      },
      {
        id: 'svc-faculty-lib',
        section_id: 'sec-services',
        name: 'Faculty Library Services',
        url: '',
        description: 'Dedicated subject librarians and discipline-specific collections stationed across all 13 NDU faculties and institutes.',
        category: 'Core Services',
        badge: 'Faculties',
        action_type: 'detail',
        order: 14,
        is_active: true,
      },
      {
        id: 'svc-ndu-journals-link',
        section_id: 'sec-services',
        name: 'NDU Journal',
        url: 'https://www.ndu.edu.ng/journals',
        description: 'Official Niger Delta University academic and research journals.',
        category: 'Research & Digital',
        badge: 'External',
        action_type: 'external',
        order: 15,
        is_active: true,
      },
      {
        id: 'svc-ndu-bulletin-link',
        section_id: 'sec-services',
        name: 'NDU Bulletin',
        url: 'https://www.ndu.edu.ng/weekly-bulettin',
        description: 'Weekly official bulletins, university announcements, and circulars.',
        category: 'Research & Digital',
        badge: 'Weekly',
        action_type: 'external',
        order: 16,
        is_active: true,
      },
      {
        id: 'svc-inaugural-lectures-link',
        section_id: 'sec-services',
        name: 'Inaugural Lecture Series',
        url: 'https://www.ndu.edu.ng/lecture-series',
        description: 'Distinguished professorial inaugural lectures & academic addresses.',
        category: 'Collections & Facilities',
        badge: 'Lectures',
        action_type: 'external',
        order: 17,
        is_active: true,
      },
      {
        id: 'svc-newspapers',
        section_id: 'sec-services',
        name: 'Newspapers',
        url: '',
        description: 'Daily national and regional Nigerian newspapers archived for current affairs, historical research, and legal reference.',
        category: 'Collections & Facilities',
        badge: 'News',
        action_type: 'detail',
        order: 18,
        is_active: true,
      },
      {
        id: 'svc-special-collections',
        section_id: 'sec-services',
        name: 'Special Collections / Niger Delta Archives',
        url: '',
        description: 'Unique manuscripts, government gazettes, oral histories, and environmental documentation regarding the Niger Delta region.',
        category: 'Collections & Facilities',
        badge: 'Archives',
        action_type: 'detail',
        order: 19,
        is_active: true,
      },

      // NDU Publications dropdown links
      {
        id: 'pub-ndu-journal',
        section_id: 'sec-publications',
        name: 'NDU Journal',
        url: 'https://www.ndu.edu.ng/journals',
        description: 'Official Niger Delta University academic and research journals',
        category: 'University Publications',
        badge: 'Journals',
        action_type: 'external',
        order: 1,
        is_active: true,
      },
      {
        id: 'pub-ndu-bulletin',
        section_id: 'sec-publications',
        name: 'NDU Bulletin',
        url: 'https://www.ndu.edu.ng/weekly-bulettin',
        description: 'Weekly official bulletins, university announcements, and circulars',
        category: 'University Publications',
        badge: 'Weekly',
        action_type: 'external',
        order: 2,
        is_active: true,
      },
      {
        id: 'pub-inaugural-lectures',
        section_id: 'sec-publications',
        name: 'Inaugural Lecture Series',
        url: 'https://www.ndu.edu.ng/lecture-series',
        description: 'Distinguished professorial inaugural lectures & academic addresses',
        category: 'University Publications',
        badge: 'Lectures',
        action_type: 'external',
        order: 3,
        is_active: true,
      },

      // Subscribed Databases
      {
        id: 'db-ebscohost',
        section_id: 'sec-databases',
        name: 'EBSCOHost Databases (by TETFund)',
        url: 'https://search.ebscohost.com',
        description: 'Multidisciplinary full-text academic journals, e-books, and research indices sponsored through TETFund. (User: wlcmichigan | Pass: WoodlandsLC2026!)',
        category: 'Subscribed Databases',
        badge: 'wlcmichigan',
        action_type: 'external',
        order: 1,
        is_active: true,
      },
      {
        id: 'db-research4life',
        section_id: 'sec-databases',
        name: 'Research4Life',
        url: 'https://www.ndu.cblibrary.ng/',
        description: 'WHO-led biomedical, health, agriculture, and environment collections on NDU central library portal.',
        category: 'Subscribed Databases',
        badge: 'Central Portal',
        action_type: 'external',
        order: 2,
        is_active: true,
      },
      {
        id: 'db-taylor-francis',
        section_id: 'sec-databases',
        name: 'Taylor & Francis Collection',
        url: 'https://www.ndu.cblibrary.ng/',
        description: 'Peer-reviewed journals across humanities, social sciences, STEM, and medicine on NDU central portal.',
        category: 'Subscribed Databases',
        badge: 'Central Portal',
        action_type: 'external',
        order: 3,
        is_active: true,
      },
      {
        id: 'db-oxford-press',
        section_id: 'sec-databases',
        name: 'Oxford University Press',
        url: 'https://academic.oup.com/journals/pages/journals_a_to_z',
        description: 'Premier collection of peer-reviewed journals published by Oxford University Press. (User: Rabdan | Pass: Rabdan2022)',
        category: 'Subscribed Databases',
        badge: 'Rabdan',
        action_type: 'external',
        order: 4,
        is_active: true,
      },
      {
        id: 'db-heinonline',
        section_id: 'sec-databases',
        name: 'Hein Online',
        url: 'https://access.heinonline.com/HOL/login-hol',
        description: 'Premier legal research database housing law journals, treaties, and constitutional documents. (User: botetourtva | Pass: b324c3b)',
        category: 'Legal & Medical',
        badge: 'botetourtva',
        action_type: 'external',
        order: 5,
        is_active: true,
      },
      {
        id: 'db-lexisnexis',
        section_id: 'sec-databases',
        name: 'LexisNexis',
        url: 'https://www.mylexisnexis.co.za/auth/SignOn.aspx',
        description: 'Comprehensive global legal, regulatory, and business intelligence database. (User: UKZN | Pass: 773111)',
        category: 'Legal & Medical',
        badge: 'UKZN',
        action_type: 'external',
        order: 6,
        is_active: true,
      },
      {
        id: 'db-legalpedia',
        section_id: 'sec-databases',
        name: 'Legalpedia',
        url: 'https://legalpediaonline.com/',
        description: 'Nigerian Supreme Court, Court of Appeal judgments, Laws of the Federation, and rules of court.',
        category: 'Legal & Medical',
        badge: 'Faculty of Law',
        action_type: 'external',
        order: 7,
        is_active: true,
      },
      {
        id: 'db-law-pavilion',
        section_id: 'sec-databases',
        name: 'Law Pavilion',
        url: 'https://lawpavilion.com/',
        description: 'Electronic Nigerian law reports, judicial authorities, and statutory citation analytics.',
        category: 'Legal & Medical',
        badge: 'Faculty of Law',
        action_type: 'external',
        order: 8,
        is_active: true,
      },
      {
        id: 'db-proquest',
        section_id: 'sec-databases',
        name: 'ProQuest',
        url: 'https://www.ndu.cblibrary.ng/',
        description: 'Comprehensive multidisciplinary academic research databases and dissertations via NDU library portal.',
        category: 'Subscribed Databases',
        badge: 'Central Portal',
        action_type: 'external',
        order: 9,
        is_active: true,
      },
      {
        id: 'db-pubmed',
        section_id: 'sec-databases',
        name: 'PubMed',
        url: 'https://pubmed.ncbi.nlm.nih.gov/',
        description: 'Free biomedical and life sciences citation database from the U.S. National Library of Medicine.',
        category: 'Legal & Medical',
        badge: 'Open Access',
        action_type: 'external',
        order: 10,
        is_active: true,
      },
      {
        id: 'db-proquest-direct',
        section_id: 'sec-databases',
        name: 'ProQuest Direct',
        url: 'https://search.proquest.com',
        description: 'Direct global search portal for ProQuest databases, dissertations, and scholarly journals.',
        category: 'Subscribed Databases',
        badge: 'Direct Search',
        action_type: 'external',
        order: 11,
        is_active: true,
      },
      {
        id: 'db-cinahl',
        section_id: 'sec-databases',
        name: 'CINAHL Ultimate/Complete',
        url: 'https://search.ebscohost.com',
        description: 'The definitive research tool for nursing and allied health literature. (User: baphealth | Pass: baptist2026*)',
        category: 'Legal & Medical',
        badge: 'baphealth',
        action_type: 'external',
        order: 12,
        is_active: true,
      },
      {
        id: 'db-medline',
        section_id: 'sec-databases',
        name: 'Medline Complete/Plus',
        url: 'https://search.ebscohost.com',
        description: 'Comprehensive biomedical and health database providing full-text medical journals. (User: baphealth | Pass: baptist2026*)',
        category: 'Legal & Medical',
        badge: 'baphealth',
        action_type: 'external',
        order: 13,
        is_active: true,
      },
      {
        id: 'db-jstor',
        section_id: 'sec-databases',
        name: 'JStor',
        url: 'https://jstor.org',
        description: 'Digital archive of academic journals, books, and primary sources. (User: regentsoa | Pass: library)',
        category: 'Subscribed Databases',
        badge: 'regentsoa',
        action_type: 'external',
        order: 14,
        is_active: true,
      },
      {
        id: 'db-lirn',
        section_id: 'sec-databases',
        name: 'LIRN (Library & Information Resource Network)',
        url: 'https://www.lirn.net/',
        description: 'Library and Information Resources Network digital collections and academic resources consortium.',
        category: 'Subscribed Databases',
        badge: 'Consortium',
        action_type: 'external',
        order: 15,
        is_active: true,
      },
    ],
    news: [
      {
        id: 'evt-1',
        title: 'Second Floor Digital Library Workstations & Auto-Clean Policy',
        category: 'Digital Library Notice',
        date: 'Academic Session 2026',
        venue: 'Second Floor, New Campus Digital Library',
        summary: 'Students and faculty have access to internet-connected workstations on the Second Floor for academic research, online classes, slide preparation, and ZOOM seminars. Remember to save personal files to external drives or cloud storage, as workstations automatically clear local downloads on session reset.',
        content: 'Students and faculty have access to internet-connected workstations on the Second Floor for academic research, online classes, slide preparation, and ZOOM seminars. Remember to save personal files to external drives or cloud storage, as workstations automatically clear local downloads on session reset.',
        file_path: '',
        image_url: '',
        is_active: true,
        created_at: new Date('2026-11-01T08:00:00Z').toISOString(),
      },
      {
        id: 'evt-2',
        title: 'Open Access E-Journals & TETFund EBSCOHost Discovery Clinic',
        category: 'ZOOM Conferences & Seminars',
        date: 'Weekly · Wednesdays 10:00am',
        venue: 'Digital Library Seminar Hall & ZOOM',
        summary: 'Hands-on orientation led by the Systems Librarian covering departmental open access e-journals, HINARI, PubMed, and citation workflows across all 13 NDU faculties.',
        content: 'Hands-on orientation led by the Systems Librarian covering departmental open access e-journals, HINARI, PubMed, and citation workflows across all 13 NDU faculties.',
        file_path: '',
        image_url: '',
        is_active: true,
        created_at: new Date('2026-11-05T09:00:00Z').toISOString(),
      },
      {
        id: 'evt-3',
        title: 'Library Clearance, Koha OPAC Accounts & Faculty Library Access',
        category: 'User Services',
        date: 'Ongoing Registration',
        venue: 'Circulation Desk, Main University Library',
        summary: 'Fresh and returning students are invited to activate their Koha patron accounts at the Circulation Desk to access physical holdings across the Main and Faculty Libraries.',
        content: 'Fresh and returning students are invited to activate their Koha patron accounts at the Circulation Desk to access physical holdings across the Main and Faculty Libraries.',
        file_path: '',
        image_url: '',
        is_active: true,
        created_at: new Date('2026-11-10T10:00:00Z').toISOString(),
      },
      {
        id: 'evt-4',
        title: 'NDU Repository Thesis Submission & Inaugural Lecture Archive',
        category: 'Scholarly Publishing',
        date: 'By Scheduled Appointment',
        venue: 'University Librarian Office & Repository Unit',
        summary: 'Postgraduate candidates and academic staff may schedule appointments with the Repository Unit for thesis archiving, ISSN/journal inquiries, and inaugural lecture digitization.',
        content: 'Postgraduate candidates and academic staff may schedule appointments with the Repository Unit for thesis archiving, ISSN/journal inquiries, and inaugural lecture digitization.',
        file_path: '',
        image_url: '',
        is_active: true,
        created_at: new Date('2026-11-15T11:00:00Z').toISOString(),
      },
    ],
    newspapers: [
      {
        id: 'news-thisday-2026-11-21',
        title: 'ThisDay',
        edition: 'The Saturday Newspaper · Vol. 31, No. 11549',
        date: 'Saturday 21 November, 2026',
        publisher: 'Leaders & Company Limited',
        summary: 'Makinde Unveils Bold Plan to Give States, Communities Greater Control of Mineral Resources; Peter Obi Campaign Shuts Down Onitsha in Show of Strength; Bayelsa Boat Tragedy: Four Dead, 100 Feared Missing; Tinubu Takes Re-election Campaign to South-west.',
        file_path: 'thisday_nov_21_2026.pdf',
        cover_image: '/uploads/resources/thisday_nov_21_2026_cover.jpg',
        url: '/uploads/resources/thisday_nov_21_2026.pdf',
        file_size: '5.5 MB',
        page_count: 40,
        is_active: true,
        created_at: new Date('2026-11-21T06:00:00Z').toISOString(),
      },
    ],
    journal_overrides: {},
  };
}

function loadDb() {
  if (dbData) return dbData;

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      dbData = JSON.parse(content);
      // Ensure all root collections exist
      const initial = getInitialData();
      for (const key of Object.keys(initial)) {
        if (!dbData[key]) {
          dbData[key] = initial[key];
        }
      }
      return dbData;
    } catch (err) {
      console.error('[DB] Error reading existing database file, reinitializing:', err);
    }
  }

  dbData = getInitialData();
  saveDb();
  return dbData;
}

function saveDb() {
  if (!dbData) return;
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(dbData, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('[DB] Error saving database file:', err);
  }
}

export const db = {
  // Users
  users: {
    findByEmail(email) {
      const data = loadDb();
      return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    },
    findById(id) {
      const data = loadDb();
      return data.users.find((u) => String(u.id) === String(id));
    },
    list() {
      const data = loadDb();
      return data.users.map(({ password, ...rest }) => rest);
    },
    create(userData) {
      const data = loadDb();
      const newUser = {
        id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        status: 'active',
        created_at: new Date().toISOString(),
        ...userData,
      };
      data.users.push(newUser);
      saveDb();
      const { password, ...safeUser } = newUser;
      return safeUser;
    },
    update(id, updates) {
      const data = loadDb();
      const index = data.users.findIndex((u) => String(u.id) === String(id));
      if (index === -1) return null;
      data.users[index] = { ...data.users[index], ...updates };
      saveDb();
      const { password, ...safeUser } = data.users[index];
      return safeUser;
    },
    delete(id) {
      const data = loadDb();
      const index = data.users.findIndex((u) => String(u.id) === String(id));
      if (index === -1) return false;
      data.users.splice(index, 1);
      saveDb();
      return true;
    },
  },

  // Submissions (Journal transmission pipeline)
  submissions: {
    list() {
      const data = loadDb();
      return data.submissions.slice().sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    },
    getByUserId(userId) {
      const data = loadDb();
      return data.submissions
        .filter((s) => String(s.user_id) === String(userId))
        .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    },
    findById(id) {
      const data = loadDb();
      return data.submissions.find((s) => String(s.id) === String(id));
    },
    create(subData) {
      const data = loadDb();
      const newSub = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        status: 'pending',
        admin_feedback: '',
        submitted_at: new Date().toISOString(),
        ...subData,
      };
      data.submissions.unshift(newSub);
      saveDb();
      return newSub;
    },
    update(id, updates) {
      const data = loadDb();
      const index = data.submissions.findIndex((s) => String(s.id) === String(id));
      if (index === -1) return null;
      data.submissions[index] = { ...data.submissions[index], ...updates };
      saveDb();
      return data.submissions[index];
    },
  },

  // Notifications
  notifications: {
    getByUserId(userId) {
      const data = loadDb();
      return data.notifications
        .filter((n) => String(n.user_id) === String(userId))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    create(notifData) {
      const data = loadDb();
      const newNotif = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        is_read: false,
        created_at: new Date().toISOString(),
        ...notifData,
      };
      data.notifications.unshift(newNotif);
      saveDb();
      return newNotif;
    },
    markAllRead(userId) {
      const data = loadDb();
      data.notifications.forEach((n) => {
        if (String(n.user_id) === String(userId)) {
          n.is_read = true;
        }
      });
      saveDb();
      return true;
    },
  },

  // Journal Volumes / Issues
  journals: {
    list(includeDrafts = true) {
      const data = loadDb();
      let list = data.journals;
      if (!includeDrafts) {
        list = list.filter((j) => j.status === 'published' && j.is_visible !== false);
      }
      return list.slice().sort((a, b) => b.publication_year - a.publication_year || b.volume_no - a.volume_no || b.issue_no - a.issue_no);
    },
    findById(id) {
      const data = loadDb();
      return data.journals.find((j) => String(j.id) === String(id));
    },
    create(journalData) {
      const data = loadDb();
      const newJournal = {
        id: `j-vol${journalData.volume_no}-iss${journalData.issue_no}-${Date.now().toString(36)}`,
        status: 'draft',
        is_visible: true,
        created_at: new Date().toISOString(),
        ...journalData,
      };
      data.journals.unshift(newJournal);
      saveDb();
      return newJournal;
    },
    update(id, updates) {
      const data = loadDb();
      const index = data.journals.findIndex((j) => String(j.id) === String(id));
      if (index === -1) return null;
      data.journals[index] = { ...data.journals[index], ...updates };
      saveDb();
      return data.journals[index];
    },
    deploy(id) {
      return this.update(id, { status: 'published', is_visible: true });
    },
    delete(id) {
      const data = loadDb();
      const initialLen = data.journals.length;
      data.journals = data.journals.filter((j) => String(j.id) !== String(id));
      if (data.journals.length !== initialLen) {
        saveDb();
        return true;
      }
      return false;
    },
  },

  // Published Articles
  articles: {
    list(includeHidden = true) {
      const data = loadDb();
      let list = data.articles;
      if (!includeHidden) {
        list = list.filter((a) => a.is_visible !== false && a.status === 'published');
      }
      return list.slice().sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
    },
    getByJournal(journalId, includeHidden = false) {
      const data = loadDb();
      let list = data.articles.filter((a) => String(a.journal_id) === String(journalId));
      if (!includeHidden) {
        list = list.filter((a) => a.is_visible !== false && a.status === 'published');
      }
      return list;
    },
    findById(id) {
      const data = loadDb();
      return data.articles.find((a) => String(a.id) === String(id));
    },
    create(articleData) {
      const data = loadDb();
      const newArticle = {
        id: `art-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        views: 0,
        download_enabled: true,
        is_visible: true,
        status: 'published',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        ...articleData,
      };
      data.articles.unshift(newArticle);
      saveDb();
      return newArticle;
    },
    update(id, updates) {
      const data = loadDb();
      const index = data.articles.findIndex((a) => String(a.id) === String(id));
      if (index === -1) return null;
      data.articles[index] = { ...data.articles[index], ...updates };
      saveDb();
      return data.articles[index];
    },
    delete(id) {
      const data = loadDb();
      const initialLen = data.articles.length;
      data.articles = data.articles.filter((a) => String(a.id) !== String(id));
      if (data.articles.length !== initialLen) {
        saveDb();
        return true;
      }
      return false;
    },
  },

  // Dynamic Sections & Dropdowns
  sections: {
    list(includeInactive = true) {
      const data = loadDb();
      let list = data.sections;
      if (!includeInactive) {
        list = list.filter((s) => s.is_active !== false);
      }
      return list.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    },
    findById(id) {
      const data = loadDb();
      return data.sections.find((s) => String(s.id) === String(id));
    },
    create(sectionData) {
      const data = loadDb();
      const newSection = {
        id: sectionData.id || `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        order: data.sections.length + 1,
        is_active: true,
        ...sectionData,
      };
      data.sections.push(newSection);
      saveDb();
      return newSection;
    },
    update(id, updates) {
      const data = loadDb();
      const index = data.sections.findIndex((s) => String(s.id) === String(id));
      if (index === -1) return null;
      data.sections[index] = { ...data.sections[index], ...updates };
      saveDb();
      return data.sections[index];
    },
    toggleActive(id, isActive) {
      return this.update(id, { is_active: Boolean(isActive) });
    },
    delete(id) {
      const data = loadDb();
      const initialLen = data.sections.length;
      data.sections = data.sections.filter((s) => String(s.id) !== String(id));
      // Also remove or unlink associated links
      data.links = data.links.filter((l) => String(l.section_id) !== String(id));
      if (data.sections.length !== initialLen) {
        saveDb();
        return true;
      }
      return false;
    },
  },

  // Dynamic Links & Resources (every single link has disable and update!)
  links: {
    list(includeInactive = true) {
      const data = loadDb();
      let list = data.links;
      if (!includeInactive) {
        list = list.filter((l) => l.is_active !== false);
      }
      return list.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    },
    getBySection(sectionId, includeInactive = false) {
      const data = loadDb();
      let list = data.links.filter((l) => String(l.section_id) === String(sectionId));
      if (!includeInactive) {
        list = list.filter((l) => l.is_active !== false);
      }
      return list.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    },
    findById(id) {
      const data = loadDb();
      return data.links.find((l) => String(l.id) === String(id));
    },
    create(linkData) {
      const data = loadDb();
      const newLink = {
        id: linkData.id || `lnk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        order: data.links.length + 1,
        is_active: true,
        updated_at: new Date().toISOString(),
        ...linkData,
      };
      data.links.push(newLink);
      saveDb();
      return newLink;
    },
    update(id, updates) {
      const data = loadDb();
      const index = data.links.findIndex((l) => String(l.id) === String(id));
      if (index === -1) return null;
      data.links[index] = { ...data.links[index], ...updates, updated_at: new Date().toISOString() };
      saveDb();
      return data.links[index];
    },
    toggleActive(id, isActive) {
      return this.update(id, { is_active: Boolean(isActive) });
    },
    delete(id) {
      const data = loadDb();
      const initialLen = data.links.length;
      data.links = data.links.filter((l) => String(l.id) !== String(id));
      if (data.links.length !== initialLen) {
        saveDb();
        return true;
      }
      return false;
    },
  },

  // Dynamic News & Events
  news: {
    list(includeInactive = true) {
      const data = loadDb();
      let list = data.news;
      if (!includeInactive) {
        list = list.filter((n) => n.is_active !== false);
      }
      return list.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    findById(id) {
      const data = loadDb();
      return data.news.find((n) => String(n.id) === String(id));
    },
    create(newsData) {
      const data = loadDb();
      const newNews = {
        id: `news-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        is_active: true,
        created_at: new Date().toISOString(),
        ...newsData,
      };
      data.news.unshift(newNews);
      saveDb();
      return newNews;
    },
    update(id, updates) {
      const data = loadDb();
      const index = data.news.findIndex((n) => String(n.id) === String(id));
      if (index === -1) return null;
      data.news[index] = { ...data.news[index], ...updates };
      saveDb();
      return data.news[index];
    },
    toggleActive(id, isActive) {
      return this.update(id, { is_active: Boolean(isActive) });
    },
    delete(id) {
      const data = loadDb();
      const initialLen = data.news.length;
      data.news = data.news.filter((n) => String(n.id) !== String(id));
      if (data.news.length !== initialLen) {
        saveDb();
        return true;
      }
      return false;
    },
  },

  // E-Journal Overrides (enable/disable or update any individual e-journal in catalog)
  journalOverrides: {
    getAll() {
      const data = loadDb();
      return data.journal_overrides || {};
    },
    set(journalId, overrideData) {
      const data = loadDb();
      if (!data.journal_overrides) data.journal_overrides = {};
      data.journal_overrides[journalId] = {
        ...data.journal_overrides[journalId],
        ...overrideData,
        updated_at: new Date().toISOString(),
      };
      saveDb();
      return data.journal_overrides[journalId];
    },
    toggle(journalId, isActive) {
      return this.set(journalId, { is_active: Boolean(isActive) });
    },
    delete(journalId) {
      const data = loadDb();
      if (data.journal_overrides && data.journal_overrides[journalId]) {
        delete data.journal_overrides[journalId];
        saveDb();
        return true;
      }
      return false;
    },
  },

  // Dynamic Newspapers
  newspapers: {
    list(includeInactive = true) {
      const data = loadDb();
      let list = data.newspapers || [];
      if (!includeInactive) {
        list = list.filter((n) => n.is_active !== false);
      }
      return list.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    findById(id) {
      const data = loadDb();
      return (data.newspapers || []).find((n) => String(n.id) === String(id));
    },
    create(newspaperData) {
      const data = loadDb();
      if (!data.newspapers) data.newspapers = [];
      const newPaper = {
        id: `np-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        is_active: true,
        created_at: new Date().toISOString(),
        ...newspaperData,
      };
      data.newspapers.unshift(newPaper);
      saveDb();
      return newPaper;
    },
    update(id, updates) {
      const data = loadDb();
      if (!data.newspapers) return null;
      const index = data.newspapers.findIndex((n) => String(n.id) === String(id));
      if (index === -1) return null;
      data.newspapers[index] = { ...data.newspapers[index], ...updates };
      saveDb();
      return data.newspapers[index];
    },
    toggleActive(id, isActive) {
      return this.update(id, { is_active: Boolean(isActive) });
    },
    delete(id) {
      const data = loadDb();
      if (!data.newspapers) return false;
      const initialLen = data.newspapers.length;
      data.newspapers = data.newspapers.filter((n) => String(n.id) !== String(id));
      if (data.newspapers.length !== initialLen) {
        saveDb();
        return true;
      }
      return false;
    },
  },
};
