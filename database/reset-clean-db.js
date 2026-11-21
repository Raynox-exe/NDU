import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'library_db.json');

const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);

const cleanData = {
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
  links: [], // will preserve existing legitimate links from server/db.js
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
  journal_overrides: {},
};

// Copy links from existing library_db.json
if (fs.existsSync(DB_FILE)) {
  try {
    const prev = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (prev.links && prev.links.length > 0) {
      cleanData.links = prev.links;
    }
  } catch (e) {}
}

// 1. Write clean library_db.json
fs.writeFileSync(DB_FILE, JSON.stringify(cleanData, null, 2), 'utf8');
console.log('✅ Clean data written to data/library_db.json');

// 2. Clean MySQL database if reachable
try {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ndu_library',
  });

  // Remove dummy submissions
  await conn.query('DELETE FROM submissions');
  console.log('✅ Cleared all dummy submissions from MySQL');

  // Remove dummy notifications
  await conn.query('DELETE FROM notifications');
  console.log('✅ Cleared all dummy notifications from MySQL');

  // Remove dummy test users (keep only admin)
  await conn.query("DELETE FROM users WHERE role != 'admin'");
  console.log('✅ Cleared non-admin dummy users from MySQL');

  // Ensure admin user exists in MySQL
  await conn.execute(
    `INSERT INTO users (id, full_name, email, password, role, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password = VALUES(password)`,
    [
      'u-admin-1',
      'University Library Administrator',
      'admin@ndu.edu.ng',
      adminPasswordHash,
      'admin',
      'active',
      '2026-01-01 08:00:00',
    ]
  );
  console.log('✅ Verified admin@ndu.edu.ng in MySQL');

  // Reset news in MySQL
  await conn.query('DELETE FROM news');
  for (const n of cleanData.news) {
    await conn.execute(
      `INSERT INTO news (id, title, category, date_tag, venue, summary, full_content, pdf_path, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [n.id, n.title, n.category, n.date, n.venue, n.summary, n.content, null, 1, n.created_at]
    );
  }
  console.log('✅ Synced 4 official news announcements into MySQL');

  await conn.end();
} catch (err) {
  console.log('⚠️ MySQL cleanup skipped or error:', err.message);
}
