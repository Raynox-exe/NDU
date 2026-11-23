export interface NewspaperItem {
  id: string;
  title: string;
  edition: string;
  date: string;
  publisher?: string;
  summary: string;
  file_path?: string;
  url?: string;
  file_size?: string;
  page_count?: number;
  is_active: boolean;
  created_at: string;
}

export const INITIAL_NEWSPAPERS: NewspaperItem[] = [
  {
    id: 'news-thisday-2026-11-21',
    title: 'ThisDay',
    edition: 'The Saturday Newspaper · Vol. 31, No. 11549',
    date: 'Saturday 21 November, 2026',
    publisher: 'Leaders & Company Limited',
    summary: 'Makinde Unveils Bold Plan to Give States, Communities Greater Control of Mineral Resources; Peter Obi Campaign Shuts Down Onitsha in Show of Strength; Bayelsa Boat Tragedy: Four Dead, 100 Feared Missing; Tinubu Takes Re-election Campaign to South-west.',
    file_path: 'thisday_nov_21_2026.pdf',
    url: '/uploads/resources/thisday_nov_21_2026.pdf',
    file_size: '5.5 MB',
    page_count: 40,
    is_active: true,
    created_at: '2026-11-21T06:00:00Z',
  },
  {
    id: 'news-guardian-2026-11-23',
    title: 'The Guardian',
    edition: 'National Daily Edition · Vol. 42, No. 15,920',
    date: 'Monday, November 23, 2026',
    publisher: 'Guardian Newspapers Limited',
    summary: 'Focus on higher education funding, Niger Delta ecological transition policies, global energy markets, and federal infrastructure developments.',
    file_path: 'guardian_nov_23_2026.pdf',
    url: 'https://guardian.ng/',
    file_size: '4.8 MB',
    page_count: 48,
    is_active: true,
    created_at: '2026-11-23T06:00:00Z',
  },
  {
    id: 'news-punch-2026-11-23',
    title: 'The Punch',
    edition: 'National Daily · Vol. 48, No. 23,410',
    date: 'Monday, November 23, 2026',
    publisher: 'Punch Nigeria Limited',
    summary: 'Lead stories on university research grants, national economic reforms, legal and constitutional reviews, and sports review.',
    file_path: 'punch_nov_23_2026.pdf',
    url: 'https://punchng.com/',
    file_size: '5.2 MB',
    page_count: 52,
    is_active: true,
    created_at: '2026-11-23T06:15:00Z',
  },
  {
    id: 'news-vanguard-2026-11-23',
    title: 'Vanguard',
    edition: 'Daily Edition · Vol. 39, No. 14,208',
    date: 'Monday, November 23, 2026',
    publisher: 'Vanguard Media Limited',
    summary: 'Comprehensive coverage of Niger Delta community development, marine resources, judicial pronouncements, and tertiary education updates.',
    file_path: 'vanguard_nov_23_2026.pdf',
    url: 'https://www.vanguardngr.com/',
    file_size: '4.5 MB',
    page_count: 44,
    is_active: true,
    created_at: '2026-11-23T06:30:00Z',
  },
  {
    id: 'news-thisday-2026-11-22',
    title: 'ThisDay',
    edition: 'Sunday Edition · Vol. 30, No. 10,845',
    date: 'Sunday, November 22, 2026',
    publisher: 'Leaders & Company Limited',
    summary: 'Special Sunday analysis on fiscal policies, university innovation hubs, capital markets, and national political affairs.',
    file_path: 'thisday_nov_22_2026.pdf',
    url: 'https://www.thisdaylive.com/',
    file_size: '6.1 MB',
    page_count: 64,
    is_active: true,
    created_at: '2026-11-22T08:00:00Z',
  },
  {
    id: 'news-dailytrust-2026-11-22',
    title: 'Daily Trust',
    edition: 'Weekend National Edition',
    date: 'Sunday, November 22, 2026',
    publisher: 'Media Trust Limited',
    summary: 'In-depth investigative reports, agricultural developments, academic research highlights, and international news roundup.',
    file_path: 'dailytrust_nov_22_2026.pdf',
    url: 'https://dailytrust.com/',
    file_size: '4.2 MB',
    page_count: 40,
    is_active: true,
    created_at: '2026-11-22T08:30:00Z',
  },
  {
    id: 'news-businessday-2026-11-20',
    title: 'BusinessDay',
    edition: 'Financial Markets & Corporate Daily',
    date: 'Friday, November 20, 2026',
    publisher: 'BusinessDay Media Limited',
    summary: 'Petroleum economics, monetary policy committee briefings, tech startup ecosystems, and business intelligence indicators.',
    file_path: 'businessday_nov_20_2026.pdf',
    url: 'https://businessday.ng/',
    file_size: '3.9 MB',
    page_count: 36,
    is_active: true,
    created_at: '2026-11-20T07:00:00Z',
  },
];
