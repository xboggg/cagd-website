-- CAGD Website Seed Data (Fixed for actual schema)
-- Generated: February 20, 2026

-- ============================================
-- CLEAR EXISTING DATA
-- ============================================
DELETE FROM cagd_news WHERE 1=1;
DELETE FROM cagd_management_profiles WHERE 1=1;
DELETE FROM cagd_divisions WHERE 1=1;
DELETE FROM cagd_projects WHERE 1=1;
DELETE FROM cagd_regional_offices WHERE 1=1;
DELETE FROM cagd_reports WHERE 1=1;
DELETE FROM cagd_events WHERE 1=1;
DELETE FROM cagd_gallery_albums WHERE 1=1;

-- ============================================
-- NEWS ARTICLES
-- ============================================

INSERT INTO cagd_news (title, slug, excerpt, content, category, status, publish_date, featured_image, tags) VALUES

-- 2026 Articles
('Update of Details of Ghana Card on the Government Payroll System',
 'update-of-details-of-ghana-card-on-the-government-payroll-system',
 'The Controller and Accountant-General''s Department (CAGD) wishes to remind all Government employees of Covered Entities to update the details of their Ghana Card on the Government of Ghana Payroll System.',
 'The Controller and Accountant-General''s Department (CAGD) wishes to remind all Government employees of Covered Entities to update the details of their Ghana Card on the Government of Ghana Payroll System. This is part of ongoing efforts to strengthen the payroll administration system and ensure accurate salary payments.',
 'Announcements', 'published', '2026-02-13',
 '/images/news/ghana-card-update-2026.webp',
 ARRAY['ghanacard', 'payroll', 'payslip']),

('Press Release: Roll-Out of Upgraded Government of Ghana Pay-Slip System',
 'press-release-roll-out-of-upgraded-government-of-ghana-pay-slip-system',
 'The Controller and Accountant-General''s Department has deployed an upgraded pay-slip system for all Government of Ghana employees on the National Payroll.',
 'The Controller and Accountant-General''s Department has deployed an upgraded pay-slip system for all Government of Ghana employees on the National Payroll. This initiative aims to provide enhanced, secure access to payroll information for government workers across the country.',
 'Press Release', 'published', '2026-02-11',
 '/images/news/payroll-upgrade-2026.webp',
 ARRAY['ghanacard', 'payroll', 'payslip']),

-- 2024 Articles
('Leadership Transition at CAGD: Meet the New Head',
 'leadership-transition-at-cagd-meet-the-new-head',
 'The President, His Excellency, Nana Addo-Dankwa Akuffo-Addo, has appointed a new Acting Controller and Accountant-General following the resignation of the previous officeholder.',
 'The President, His Excellency, Nana Addo-Dankwa Akuffo-Addo, has appointed Mr. Kwasi Agyei as the new Acting Controller and Accountant-General. Mr. Kwasi Agyei assumed office on Monday, 15th April, 2024, following the resignation of Mr. Kwasi Kwaning-Bosompem. The appointment was made to lead the Controller and Accountant-General''s Department during this leadership transition period.',
 'Announcements', 'published', '2024-04-17',
 '/images/news/acting-cag-kwasi-agyei.webp',
 ARRAY['leadership', 'cag', 'appointment']),

('Appreciating Excellence in Public Service: A First-Time Encounter with Acting Controller and Accountant General',
 'appreciating-excellence-in-public-service',
 'In an era where encounters with public officials often leave citizens with mixed feelings, the professional excellence demonstrated by the Acting Controller and Accountant General stands out.',
 'In an era where encounters with public officials often leave citizens with mixed feelings, the professional excellence demonstrated by the Acting Controller and Accountant General, Mr. Kwasi Agyei, stands out as a beacon of effective public service delivery. This article highlights the positive impact of competent leadership in government institutions.',
 'General', 'published', '2024-06-05',
 '/images/news/acting-cag-kwasi-agyei.webp',
 ARRAY['leadership', 'public-service']),

('CAGD''s Directive: Government Workers Urged to Submit Ghana Card Numbers for IPPD Payroll Inclusion',
 'cagds-directive-government-workers-urged-to-submit-ghana-card-numbers',
 'This is an important message for all Ghanaian government employees! The Controller and Accountant-General''s Department requires all workers to submit Ghana Card numbers for IPPD payroll integration.',
 'This is an important message for all Ghanaian government employees! The Controller and Accountant-General''s Department requires all government workers to submit their Ghana Card numbers for inclusion in the Integrated Personnel and Payroll Database (IPPD) system. This initiative aims to streamline public sector payroll management and ensure accurate identification of all government employees.',
 'Payroll', 'published', '2024-01-17',
 '/images/news/ippd-payroll-integration.webp',
 ARRAY['ghanacard', 'ippd', 'payroll']),

('Strengthening Accountability: NIA-CAGD Integration Ensures Accuracy in Government Payroll',
 'strengthening-accountability-nia-cagd-integration',
 'Effective March 2024, salaries of government employees will be processed through an integrated system linking the National Identification Authority with CAGD.',
 'Effective March 2024, salaries of government employees will be processed through an integrated system linking the National Identification Authority (NIA) with the Controller and Accountant-General''s Department (CAGD). This integration ensures accuracy in government payroll by verifying employee identities through the Ghana Card system, eliminating ghost workers and fraudulent payroll claims.',
 'Payroll', 'published', '2024-01-17',
 '/images/news/nia-cagd-integration.webp',
 ARRAY['nia', 'payroll', 'accountability']),

-- 2023 Articles
('RE-PRODUCTION OF 2022 ANNUAL NATIONAL ACCOUNTS OF GHANA: DATA VALIDATION ON GIFMIS',
 're-production-of-2022-annual-national-accounts-data-validation-gifmis',
 'The Controller and Accountant-General''s Department announces the re-production of 2022 Annual National Accounts through data validation on GIFMIS.',
 'The Controller and Accountant-General''s Department (CAGD) is undertaking the re-production of the 2022 Annual National Accounts of Ghana through comprehensive data validation on the Government Integrated Financial Management System (GIFMIS). This exercise ensures accuracy and integrity of national financial reporting.',
 'GIFMIS', 'published', '2023-01-26',
 NULL,
 ARRAY['gifmis', 'national-accounts', 'validation']),

('2022 Annual Thanksgiving Service and Nine Lessons and Carols',
 '2022-annual-thanksgiving-service-nine-lessons-carols',
 'The 2022 Annual Thanksgiving Service and Nine Lessons and Carols has been held at the Treasury Head Office in Accra.',
 'The Controller and Accountant-General''s Department held its 2022 Annual Thanksgiving Service and Nine Lessons and Carols celebration at the Treasury Head Office in Accra. Mrs. Emelia Osei Derkyi, Deputy Controller and Accountant-General (Finance and Administration), delivered opening remarks expressing management''s appreciation for staff contributions throughout the year.',
 'Events', 'published', '2023-01-06',
 '/images/news/thanksgiving-2022.webp',
 ARRAY['thanksgiving', 'carols', 'staff']),

('PRESS RELEASE – CLOSAG TIER 3 DEDUCTIONS',
 'press-release-closag-tier-3-deductions',
 'Press release regarding CLOSAG (Civil Service) Tier 3 pension deductions and related matters.',
 'The Controller and Accountant-General''s Department issues this press release regarding the implementation of CLOSAG (Civil and Local Government Staff Association of Ghana) Tier 3 pension deductions for civil servants across the country.',
 'Press Release', 'published', '2023-02-26',
 NULL,
 ARRAY['closag', 'tier3', 'pension']),

-- 2022 Articles
('533 ''GHOSTS'' BUSTED BY CONTROLLER AND ACCOUNTANT-GENERAL''S DEPARTMENT – DR. BAWUMIA REVEALS',
 '533-ghosts-busted-by-cagd-dr-bawumia-reveals',
 'Vice President Dr. Mahamudu Bawumia has announced that government has uncovered hundreds of ghost workers through the CAGD''s verification efforts.',
 'Vice President Dr. Mahamudu Bawumia has revealed that the Controller and Accountant-General''s Department (CAGD) has successfully identified and removed 533 "ghost" employees from the government payroll. These "ghosts" refer to individuals fraudulently placed on the payroll who do not actually work or exist in official records.',
 'General', 'published', '2022-08-17',
 NULL,
 ARRAY['ghost-workers', 'payroll', 'fraud']),

('CAGD DELIVERS ON PROMISE TO PROVIDE COMPREHENSIVE NATIONAL ACCOUNTS',
 'cagd-delivers-comprehensive-national-accounts',
 'The Controller and Accountant-General Department in 2020 made history when for the first time it delivered comprehensive national accounts.',
 'The Controller and Accountant-General Department (CAGD) made history in 2020 by delivering comprehensive national accounts for the first time, covering the entire scope of public funds across all three levels of government: Central Government, Local Government, and Public Corporations/State-Owned Enterprises.',
 'IPSAS', 'published', '2022-08-01',
 '/images/news/national-accounts-2022.webp',
 ARRAY['national-accounts', 'ipsas', 'financial-reporting']),

('CAGD WELFARE SCHEME HOLDS AGM AT EASTERN PREMIER HOTEL - KOFORIDUA, EASTERN REGION',
 'cagd-welfare-scheme-agm-koforidua',
 'The 2022 Annual General Meeting of the Controller and Accountant-General''s Department Welfare Scheme was held at Eastern Premier Hotel.',
 'The 2022 Annual General Meeting of the Controller and Accountant-General''s Department (CAGD) Welfare Scheme was successfully held at the Eastern Premier Hotel in Koforidua, Eastern Region.',
 'Events', 'published', '2022-07-15',
 NULL,
 ARRAY['welfare', 'agm', 'staff']),

('PRESS RELEASE – GOVERNMENT PAYS COST OF LIVING ALLOWANCE (COLA)',
 'press-release-government-pays-cola',
 'Press release announcing the government''s payment of Cost of Living Allowance (COLA) to public sector workers.',
 'The Controller and Accountant-General''s Department announces that the Government of Ghana has commenced payment of the Cost of Living Allowance (COLA) to all eligible public sector workers.',
 'Press Release', 'published', '2022-08-15',
 NULL,
 ARRAY['cola', 'allowance', 'payroll']),

-- 2021 Articles
('PUBLIC NOTICE',
 'public-notice-october-2021',
 'As part of Government of Ghana''s efforts to deliver speedy, secured and verified payroll services, this public notice is issued.',
 'As part of Government of Ghana''s efforts to deliver speedy, secured and verified payroll services to all government employees, the Controller and Accountant-General''s Department issues this public notice regarding important changes to the payroll system.',
 'Announcements', 'published', '2021-10-13',
 '/images/news/public-notice-2021.webp',
 ARRAY['notice', 'payroll']),

('NIA COMMUNICATION',
 'nia-communication',
 'Official communication from the National Identification Authority regarding Ghana Card and government payroll integration.',
 'The Controller and Accountant-General''s Department shares this official communication from the National Identification Authority (NIA) regarding the integration of Ghana Card with government payroll systems.',
 'General', 'published', '2021-10-25',
 NULL,
 ARRAY['nia', 'ghanacard']),

('FORMER CAG GOES HOME',
 'former-cag-goes-home',
 'The memorial, burial and funeral rites for Mr. Eugene Asante Ofosuhene, former Controller and Accountant-General, has been held.',
 'The memorial, burial and funeral rites for Mr. Eugene Asante Ofosuhene, the immediate past Controller and Accountant-General, was held in his hometown Kwabeng in the Eastern Region on July 3, 2021. Mr. Ofosuhene served as CAG from May 2017 to April 2019.',
 'General', 'published', '2021-07-12',
 NULL,
 ARRAY['obituary', 'cag', 'memorial']),

('CAGD SETS DATES FOR NATIONWIDE SENSITIZATION EXERCISE ON THE NEW TPRS',
 'cagd-sets-dates-nationwide-sensitization-tprs',
 'Management of the Controller and Accountant-General''s Department has scheduled dates to organize a nationwide sensitization exercise on the new TPRS.',
 'Management of the Controller and Accountant-General''s Department has scheduled dates to organize a nationwide sensitization exercise on the new Treasury and Public Receivables System (TPRS).',
 'Announcements', 'published', '2021-05-17',
 NULL,
 ARRAY['tprs', 'sensitization', 'treasury']),

('CDS PAYS COURTESY CALL ON CAG',
 'cds-pays-courtesy-call-on-cag',
 'Vice Admiral Seth Amoama, the newly appointed Chief of Defence Staff (CDS) has paid a courtesy call on the Acting Controller and Accountant-General.',
 'Vice Admiral Seth Amoama, the newly appointed Chief of Defence Staff (CDS), paid a courtesy call on the Acting Controller and Accountant-General on March 18, 2021.',
 'Events', 'published', '2021-04-21',
 '/images/news/cds-courtesy-call-2021.webp',
 ARRAY['cds', 'military', 'courtesy-call']),

('Acting Controller and Accountant-General Pays a Courtesy Call on the Council of State',
 'acting-cag-pays-courtesy-call-on-council-of-state',
 'The Ag. Controller and Accountant-General, Mr. Kwesi Kwaning-Bosompem, paid a courtesy call on the Council of State.',
 'The Acting Controller and Accountant-General, Mr. Kwesi Kwaning-Bosompem, paid a courtesy call on the Council of State to discuss matters of mutual interest regarding public financial management and governance in Ghana.',
 'Events', 'published', '2021-01-06',
 '/images/news/council-of-state-visit-2021.webp',
 ARRAY['council-of-state', 'courtesy-call']),

-- 2020 Articles
('CAGD Carols Service',
 'cagd-carols-service-2020',
 'The acting Controller and Accountant General has cautioned Ministries, Departments, Agencies against underutilizing GIFMIS.',
 'During the CAGD Carols Service, the acting Controller and Accountant General, Mr. Kwasi Kwaning-Bosompem, cautioned government agencies against underutilizing the GIFMIS platform.',
 'Events', 'published', '2020-12-23',
 '/images/news/carols-service-2020.webp',
 ARRAY['carols', 'gifmis', 'staff']),

('Payment of Salaries and Wages – Year 2021',
 'payment-of-salaries-and-wages-year-2021',
 'Notice is hereby given that the year 2021 Salaries and Wages of Civil Servants will be paid according to the schedule.',
 'The Controller and Accountant-General''s Department issues notice regarding the 2021 salary payment schedule for civil servants, Ghana Education Service staff, and other public sector employees.',
 'Announcements', 'published', '2020-12-09',
 NULL,
 ARRAY['salaries', 'payroll', 'schedule']),

('Ensign College of Public Health Donates to CAGD',
 'ensign-college-of-public-health-donates-to-cagd',
 'The Ensign College of Public Health and its partners, Engage Now Africa and Health 2 GO have donated items to CAGD.',
 'Ensign College of Public Health, alongside Engage Now Africa and Health 2 GO, presented donations to the Controller and Accountant-General''s Department to support COVID-19 relief efforts in Ghana.',
 'General', 'published', '2020-08-27',
 '/images/news/covid-donation-2020.webp',
 ARRAY['covid-19', 'donation', 'csr']),

('Controller and Accountant General Wins Prestigious Leadership Award',
 'controller-and-accountant-general-wins-leadership-award',
 'The acting Controller and Accountant General, Mr Kwasi Kwaning Bosompem, has been adjudged winner of a prestigious leadership award.',
 'The acting Controller and Accountant General, Mr Kwasi Kwaning Bosompem, has been recognized with a prestigious leadership award in recognition of his outstanding contributions to public financial management.',
 'General', 'published', '2020-08-13',
 '/images/news/leadership-award-2020.webp',
 ARRAY['award', 'leadership', 'recognition']),

('Press Release: COVID-19 Response Measures',
 'press-release-covid-19-response-measures',
 'As part of Government efforts to deal with the COVID-19 pandemic, several financial measures have been implemented.',
 'The President pledged three months of salary to the COVID-19 National Trust Fund, with the Vice President making an identical commitment. Senior government officials contributed 50% of three months basic salary beginning April 2020.',
 'Press Release', 'published', '2020-05-22',
 NULL,
 ARRAY['covid-19', 'relief', 'tax']),

('CAGD Annual Conference in Takoradi',
 'cagd-annual-conference-takoradi-2020',
 'The Controller and Accountant General''s Department (CAGD) has officially opened its annual conference in Takoradi.',
 'The Controller and Accountant General''s Department (CAGD) held its annual conference in Takoradi, bringing together staff and stakeholders to discuss departmental achievements and strategic priorities.',
 'Events', 'published', '2020-01-24',
 '/images/news/finance-generic.webp',
 ARRAY['conference', 'takoradi', 'annual']),

-- 2019 and Earlier Articles
('2014 Annual Conference Communique',
 '2014-annual-conference-communique',
 'The Controller and Accountant General''s Department has held its 2014 Annual Conference in Koforidua.',
 'The Controller and Accountant-General''s Department convened its 2014 Annual Conference in Koforidua, Eastern Region, from July 16-18, 2014. The gathering centered on "Financial Discipline – The role of the Public Sector Accountant."',
 'Events', 'published', '2019-12-17',
 NULL,
 ARRAY['conference', 'koforidua', 'communique']),

('Payroll Clean-up Plan Published By The Inter-Ministerial Committee On Payroll',
 'payroll-clean-up-plan-published',
 'In line with government''s commitment of addressing the payroll and Human Resource (HR) challenges.',
 'In line with government''s commitment to addressing payroll and Human Resource (HR) challenges, the Inter-Ministerial Committee on Payroll has published a comprehensive payroll clean-up plan.',
 'Payroll', 'published', '2016-06-15',
 NULL,
 ARRAY['payroll', 'cleanup', 'ghost-workers']),

('2021 GoG National Accounts Presented Ahead of Time',
 '2021-gog-national-accounts-presented-ahead-of-time',
 'Ghana''s Government presented its 2021 national accounts ahead of schedule for the third consecutive year.',
 'Ghana''s Government presented its 2021 national accounts ahead of schedule for the third consecutive year, demonstrating CAGD''s commitment to timely financial reporting.',
 'IPSAS', 'published', '2022-04-11',
 '/images/news/national-accounts-2021.webp',
 ARRAY['national-accounts', 'ipsas', 'financial-reporting']),

('Re: Sad News For Ghanaian Teachers',
 're-sad-news-for-ghanaian-teachers',
 'Official communication regarding recent news affecting Ghanaian teachers on the government payroll.',
 'The Controller and Accountant-General''s Department issues this official communication regarding payroll matters affecting teachers under the Ghana Education Service.',
 'Announcements', 'published', '2021-11-01',
 '/images/news/teachers-notice-2021.webp',
 ARRAY['teachers', 'ges', 'payroll']),

('No Manual Cheque Payments By IGF Institutions From April 2018',
 'no-manual-cheque-payments-igf-institutions-april-2018',
 'With effect from April 2, 2018, payments to contractors and suppliers will be processed through Electronic Fund Transfers.',
 'With effect from April 2, 2018, payment to contractors, consultants, and suppliers transacting with state institutions operating GIFMIS will be processed through Electronic Fund Transfers (EFT).',
 'Announcements', 'published', '2019-12-17',
 '/images/news/finance-generic.webp',
 ARRAY['igf', 'gifmis', 'electronic-payments']),

('CAGD Sensitizes Chief Directors Of MDAs On IPSAS',
 'cagd-sensitizes-chief-directors-mdas-ipsas',
 'CAGD conducted an awareness session targeting Chief Directors regarding International Public Sector Accounting Standards.',
 'The Controller and Accountant General''s Department (CAGD) conducted an awareness session targeting Chief Directors from various Ministries, Departments and Agencies (MDAs) regarding IPSAS.',
 'IPSAS', 'published', '2019-12-17',
 '/images/news/finance-generic.webp',
 ARRAY['ipsas', 'mdas', 'training']);


-- ============================================
-- MANAGEMENT PROFILES (Leadership)
-- ============================================

INSERT INTO cagd_management_profiles (name, title, bio, photo, display_order, profile_type) VALUES

('Mr. Kwasi Agyei', 'Acting Controller and Accountant-General',
 'Mr. Kwasi Agyei was appointed Acting Controller and Accountant-General by President Nana Addo-Dankwa Akuffo-Addo on Monday, 15th April, 2024, following the resignation of Mr. Kwasi Kwaning-Bosompem. He brings extensive experience in public financial management to this critical leadership role.',
 '/images/news/acting-cag-kwasi-agyei.webp',
 1, 'CAG'),

('Mrs. Emelia Osei Derkyi', 'Deputy Controller and Accountant-General (Finance & Administration)',
 'Mrs. Emelia Osei Derkyi serves as Deputy Controller and Accountant-General overseeing Finance and Administration. She plays a key role in managing the department''s internal operations and administrative functions.',
 NULL, 2, 'DCAG'),

('Deputy Controller and Accountant-General (Treasury)', 'Deputy Controller and Accountant-General (Treasury)',
 'The Deputy Controller and Accountant-General (Treasury) is responsible for managing all treasury operations of the Government of Ghana, including payment processing, cash management, and government receipts.',
 NULL, 3, 'DCAG');


-- ============================================
-- DIVISIONS
-- ============================================

INSERT INTO cagd_divisions (name, description, functions) VALUES

('Finance and Administration Division',
 'The Finance and Administration Division manages the internal financial operations and administrative functions of CAGD.',
 '["Management of CAGD internal finances and budgets", "Human resource management and staff welfare", "Procurement and logistics management", "Administrative support services", "Records and archives management"]'::jsonb),

('Treasury Division',
 'The Treasury Division is responsible for the management of government funds, including receipts, payments, and cash management.',
 '["Management of Government bank accounts", "Processing of government payments", "Collection and management of government receipts", "Cash and liquidity management", "Treasury Single Account operations"]'::jsonb),

('Financial Management Services Division',
 'The FMS Division provides financial management services including accounting, reporting, and GIFMIS operations.',
 '["Government-wide financial reporting", "GIFMIS system management and support", "Preparation of national accounts", "IPSAS implementation and compliance", "Financial statement consolidation"]'::jsonb),

('ICT Management Division',
 'The ICT Division manages all information technology systems and infrastructure supporting CAGD operations.',
 '["Management of ICT infrastructure", "Systems development and maintenance", "Cybersecurity and data protection", "Technical support services", "Digital transformation initiatives"]'::jsonb),

('Payroll Management Division',
 'The Payroll Division manages the government payroll system, ensuring accurate and timely payment of salaries to all government employees.',
 '["Management of government payroll (IPPD)", "Salary processing and payment", "Payroll verification and validation", "Ghana Card integration for payroll", "Ghost worker detection and elimination"]'::jsonb),

('Audit and Investigation Division',
 'The Audit Division conducts internal audits and investigations to ensure compliance and accountability in public financial management.',
 '["Internal audit of government accounts", "Investigation of financial irregularities", "Compliance monitoring and enforcement", "Risk assessment and management", "Fraud detection and prevention"]'::jsonb);


-- ============================================
-- PROJECTS
-- ============================================

INSERT INTO cagd_projects (name, description, components, status) VALUES

('Public Financial Management Reform Programme (PFMRP)',
 'The PFMRP aims to strengthen Ghana''s public financial management systems through comprehensive reforms and capacity building.',
 '["Strengthen fiscal discipline and budget credibility", "Improve allocation of resources to priority areas", "Enhance operational efficiency in service delivery", "Promote transparency and accountability", "Build institutional capacity for PFM"]'::jsonb,
 'active'),

('International Public Sector Accounting Standards (IPSAS) Implementation',
 'The IPSAS Implementation Project aims to adopt international accounting standards for Ghana''s public sector to improve financial reporting quality.',
 '["Adopt accrual-based accounting standards", "Improve quality of government financial statements", "Enhance comparability with international standards", "Strengthen asset and liability management", "Produce comprehensive whole-of-government accounts"]'::jsonb,
 'active');


-- ============================================
-- REGIONAL OFFICES (From CAGD Telephone Directory)
-- ============================================

INSERT INTO cagd_regional_offices (region, address, phone, email, director_name) VALUES
('Head Office', 'P.O. Box M79, Ministries, Accra', '0303987950 / 0302983507', 'info@cagd.gov.gh', NULL),
('Greater Accra Region', 'P.O. Box M79, Ministries, Accra', '0303987954', 'greateraccra@cagd.gov.gh', NULL),
('Eastern Region', 'P.O. Box 114, Koforidua', '0303987953', 'eastern@cagd.gov.gh', NULL),
('Central Region', 'P.O. Box 180, Cape Coast', '0303987952', 'central@cagd.gov.gh', NULL),
('Ashanti Region', 'P.O. Box 1627, Kumasi', '0303987951', 'ashanti@cagd.gov.gh', NULL),
('Western Region', 'P.O. Box 238, Sekondi-Takoradi', '0303987950', 'western@cagd.gov.gh', NULL),
('Western North Region', 'Sefwi Wiawso', '0303987956', 'westernnorth@cagd.gov.gh', NULL),
('Volta Region', 'P.O. Box 195, Ho', '0303987957', 'volta@cagd.gov.gh', NULL),
('Ahafo Region', 'Goaso', '0303987958', 'ahafo@cagd.gov.gh', NULL),
('Oti Region', 'Dambai', '0303987959', 'oti@cagd.gov.gh', NULL),
('Bono Region', 'P.O. Box 137, Sunyani', '0303987960', 'bono@cagd.gov.gh', NULL),
('Bono East Region', 'Techiman', '0303987961', 'bonoeast@cagd.gov.gh', NULL),
('Savannah Region', 'Damongo', '0303987962', 'savannah@cagd.gov.gh', NULL),
('Northern Region', 'P.O. Box 101, Tamale', '0303987963', 'northern@cagd.gov.gh', NULL),
('Upper West Region', 'P.O. Box 21, Wa', '0303987975', 'upperwest@cagd.gov.gh', NULL),
('Upper East Region', 'P.O. Box 20, Bolgatanga', '0303987976', 'uppereast@cagd.gov.gh', NULL),
('North East Region', 'Nalerigu', '0303987977', 'northeast@cagd.gov.gh', NULL);


-- ============================================
-- REPORTS
-- ============================================

INSERT INTO cagd_reports (title, description, file_url, category, publish_date, download_count) VALUES

-- 2025 Reports
('Whole of Government Accounts – Q3 2025', 'Quarterly consolidated financial statements of the Government of Ghana for Q3 2025.',
 NULL, 'Quarterly Reports', '2025-12-12', 1147),

('CAGD 2025 Annual Conference Report', 'Report from the 2025 Annual Conference of the Controller and Accountant-General''s Department.',
 NULL, 'Conference', '2025-09-15', 234),

('Whole of Government Accounts – Q2 2025', 'Quarterly consolidated financial statements of the Government of Ghana for Q2 2025.',
 NULL, 'Quarterly Reports', '2025-09-01', 892),

('Whole of Government Accounts – Q1 2025', 'Quarterly consolidated financial statements of the Government of Ghana for Q1 2025.',
 NULL, 'Quarterly Reports', '2025-06-01', 756),

-- 2024 Reports
('Annual Report 2024', 'Annual report of the Controller and Accountant-General''s Department for fiscal year 2024.',
 NULL, 'Annual Reports', '2025-03-01', 567),

('IPSAS Implementation Progress Report 2024', 'Progress report on the implementation of International Public Sector Accounting Standards.',
 NULL, 'IPSAS', '2024-12-15', 423),

('Whole of Government Accounts – Q4 2024', 'Quarterly consolidated financial statements of the Government of Ghana for Q4 2024.',
 NULL, 'Quarterly Reports', '2025-03-15', 678),

('Whole of Government Accounts – Q3 2024', 'Quarterly consolidated financial statements of the Government of Ghana for Q3 2024.',
 NULL, 'Quarterly Reports', '2024-12-01', 812),

('Government Payroll Statistics 2024', 'Annual payroll statistics and analysis for government employees.',
 NULL, 'Payroll Reports', '2024-12-30', 445),

-- 2023 Reports
('Annual Report 2023', 'Annual report of the Controller and Accountant-General''s Department for fiscal year 2023.',
 NULL, 'Annual Reports', '2024-03-15', 892),

('Whole of Government Accounts – Q4 2023', 'Quarterly consolidated financial statements of the Government of Ghana for Q4 2023.',
 NULL, 'Quarterly Reports', '2024-03-01', 756),

('IPSAS Implementation Progress Report 2023', 'Progress report on the implementation of International Public Sector Accounting Standards for 2023.',
 NULL, 'IPSAS', '2023-12-20', 389),

-- 2022 Reports
('Annual Report 2022', 'Annual report of the Controller and Accountant-General''s Department for fiscal year 2022.',
 NULL, 'Annual Reports', '2023-03-15', 1234),

('Consolidated Fund Financial Statements 2022', 'Financial statements of the Consolidated Fund of Ghana for fiscal year 2022.',
 NULL, 'Financial Statements', '2023-04-01', 567),

('Payroll Clean-up Report 2022', 'Report on the government payroll clean-up exercise and ghost worker elimination.',
 NULL, 'Payroll Reports', '2022-12-15', 789),

-- 2021 Reports
('Annual Report 2021', 'Annual report of the Controller and Accountant-General''s Department for fiscal year 2021.',
 NULL, 'Annual Reports', '2022-03-15', 1567),

('Government National Accounts 2021', 'Comprehensive national accounts covering Central Government, Local Government, and State-Owned Enterprises.',
 NULL, 'Annual Reports', '2022-04-11', 923),

-- 2020 Reports
('Annual Report 2020', 'Annual report of the Controller and Accountant-General''s Department for fiscal year 2020.',
 NULL, 'Annual Reports', '2021-03-15', 1789),

('Government National Accounts 2020', 'First comprehensive national accounts covering all three levels of government.',
 NULL, 'Annual Reports', '2021-03-20', 1123),

-- Chart of Accounts
('Ghana Chart of Accounts 2024', 'Updated chart of accounts for government financial management.',
 NULL, 'Chart of Accounts', '2024-01-15', 2345),

('Ghana Chart of Accounts 2023', 'Chart of accounts for government financial management.',
 NULL, 'Chart of Accounts', '2023-01-15', 1890),

-- GIFMIS Reports
('GIFMIS User Guide 2024', 'User guide for the Government Integrated Financial Management Information System.',
 NULL, 'GIFMIS Reports', '2024-02-01', 3456);


-- ============================================
-- EVENTS
-- ============================================

INSERT INTO cagd_events (title, description, event_date, end_date, venue, status, featured) VALUES

('CAGD Annual Delegates Conference 2026',
 'The annual gathering of CAGD delegates from all regional offices to discuss strategic priorities and achievements.',
 '2026-08-15 09:00:00', '2026-08-17 17:00:00',
 'Accra International Conference Centre', 'published', true),

('IPSAS Training Workshop - Northern Zone',
 'Training workshop on IPSAS implementation for accountants in the Northern, Upper East, Upper West, Savannah and North East regions.',
 '2026-04-20 09:00:00', '2026-04-22 16:00:00',
 'Tamale', 'published', false),

('GIFMIS User Training - April 2026',
 'Monthly training session for new GIFMIS users and refresher training for existing users.',
 '2026-04-10 09:00:00', '2026-04-11 16:00:00',
 'Treasury Conference Room, Accra', 'published', false);


-- ============================================
-- GALLERY ALBUMS
-- ============================================

INSERT INTO cagd_gallery_albums (title, cover_image, album_date) VALUES
('CAGD Annual Conference 2024', NULL, '2024-08-15'),
('2022 Thanksgiving Service', '/images/news/thanksgiving-2022.webp', '2022-12-20'),
('CDS Courtesy Call 2021', '/images/news/cds-courtesy-call-2021.webp', '2021-03-18'),
('CAGD Welfare Scheme AGM 2022', NULL, '2022-07-15');
