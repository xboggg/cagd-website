-- =====================================================
-- STEP 1: Add file_url column to cagd_news table
-- =====================================================
ALTER TABLE cagd_news ADD COLUMN IF NOT EXISTS file_url TEXT DEFAULT NULL;

-- =====================================================
-- STEP 2: Insert Treasury News article
-- =====================================================
INSERT INTO cagd_news (title, slug, content, excerpt, category, featured_image, status, publish_date, tags, file_url)
VALUES (
  'Treasury News Vol.13 (October 2020)',
  'treasury-news-vol-13-october-2020',
  'This edition of Treasury News highlights five major items:

1. 2020 Annual Conference
2. Regional Office Expansion - New regional offices were inaugurated alongside the distribution of new vehicles
3. Western Region Focus
4. Award Recognition - The Comptroller-General received a prestigious award
5. Leadership Profile

Download the full Treasury News PDF for detailed coverage of these stories and more updates from the Treasury division.',
  'This edition of Treasury News highlights the 2020 Annual Conference, Regional Office Expansion, and other key developments from the department.',
  'Treasury News',
  'https://www.cagd.gov.gh/wp-content/uploads/2020/11/treasury_news_2020-vol13-1.jpg',
  'published',
  '2020-11-28T00:00:00Z',
  '{"treasury", "newsletter"}',
  '/downloads/treasury/treasury-news-vol13-2020.pdf'
);

-- =====================================================
-- STEP 3: Insert all 20 CAGD Digest issues (190-209)
-- =====================================================
INSERT INTO cagd_news (title, slug, content, excerpt, category, status, publish_date, tags, file_url) VALUES
('CAGD Digest - Issue 190', 'cagd-digest-issue-190', 'CAGD Weekly Digest Issue 190 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 190', 'Digest', 'published', '2025-03-10T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-190.pdf'),
('CAGD Digest - Issue 191', 'cagd-digest-issue-191', 'CAGD Weekly Digest Issue 191 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 191', 'Digest', 'published', '2025-03-17T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-191.pdf'),
('CAGD Digest - Issue 192', 'cagd-digest-issue-192', 'CAGD Weekly Digest Issue 192 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 192', 'Digest', 'published', '2025-03-24T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-192.pdf'),
('CAGD Digest - Issue 193', 'cagd-digest-issue-193', 'CAGD Weekly Digest Issue 193 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 193', 'Digest', 'published', '2025-04-09T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-193.pdf'),
('CAGD Digest - Issue 194', 'cagd-digest-issue-194', 'CAGD Weekly Digest Issue 194 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 194', 'Digest', 'published', '2025-04-30T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-194.pdf'),
('CAGD Digest - Issue 195', 'cagd-digest-issue-195', 'CAGD Weekly Digest Issue 195 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 195', 'Digest', 'published', '2025-04-30T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-195.pdf'),
('CAGD Digest - Issue 196', 'cagd-digest-issue-196', 'CAGD Weekly Digest Issue 196 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 196', 'Digest', 'published', '2025-05-06T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-196.pdf'),
('CAGD Digest - Issue 197', 'cagd-digest-issue-197', 'CAGD Weekly Digest Issue 197 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 197', 'Digest', 'published', '2025-05-12T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-197.pdf'),
('CAGD Digest - Issue 198', 'cagd-digest-issue-198', 'CAGD Weekly Digest Issue 198 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 198', 'Digest', 'published', '2025-05-19T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-198.pdf'),
('CAGD Digest - Issue 199', 'cagd-digest-issue-199', 'CAGD Weekly Digest Issue 199 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 199', 'Digest', 'published', '2025-05-26T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-199.pdf'),
('CAGD Digest - Issue 200', 'cagd-digest-issue-200', 'CAGD Weekly Digest Issue 200 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 200', 'Digest', 'published', '2025-06-01T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-200.pdf'),
('CAGD Digest - Issue 201', 'cagd-digest-issue-201', 'CAGD Weekly Digest Issue 201 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 201', 'Digest', 'published', '2025-06-01T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-201.pdf'),
('CAGD Digest - Issue 202', 'cagd-digest-issue-202', 'CAGD Weekly Digest Issue 202 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 202', 'Digest', 'published', '2025-06-09T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-202.pdf'),
('CAGD Digest - Issue 203', 'cagd-digest-issue-203', 'CAGD Weekly Digest Issue 203 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 203', 'Digest', 'published', '2025-06-18T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-203.pdf'),
('CAGD Digest - Issue 204', 'cagd-digest-issue-204', 'CAGD Weekly Digest Issue 204 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 204', 'Digest', 'published', '2025-07-14T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-204.pdf'),
('CAGD Digest - Issue 205', 'cagd-digest-issue-205', 'CAGD Weekly Digest Issue 205 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 205', 'Digest', 'published', '2025-07-01T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-205.pdf'),
('CAGD Digest - Issue 206', 'cagd-digest-issue-206', 'CAGD Weekly Digest Issue 206 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 206', 'Digest', 'published', '2025-06-16T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-206.pdf'),
('CAGD Digest - Issue 207', 'cagd-digest-issue-207', 'CAGD Weekly Digest Issue 207 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 207', 'Digest', 'published', '2025-07-21T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-207.pdf'),
('CAGD Digest - Issue 208', 'cagd-digest-issue-208', 'CAGD Weekly Digest Issue 208 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 208', 'Digest', 'published', '2025-08-04T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-208.pdf'),
('CAGD Digest - Issue 209', 'cagd-digest-issue-209', 'CAGD Weekly Digest Issue 209 - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.', 'Weekly digest of department activities - Issue 209', 'Digest', 'published', '2025-07-19T00:00:00Z', '{"digest", "weekly"}', '/downloads/digest/digest-issue-209.pdf');
