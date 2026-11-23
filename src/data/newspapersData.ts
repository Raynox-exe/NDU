export interface NewspaperItem {
  id: string;
  title: string;
  edition: string;
  date: string;
  publisher?: string;
  summary: string;
  file_path?: string;
  cover_image?: string;
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
    cover_image: '/uploads/resources/thisday_nov_21_2026_cover.jpg',
    url: '/uploads/resources/thisday_nov_21_2026.pdf',
    file_size: '5.5 MB',
    page_count: 40,
    is_active: true,
    created_at: '2026-11-21T06:00:00Z',
  },
];
