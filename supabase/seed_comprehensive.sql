-- CAGD Website Comprehensive Seed Data
-- Generated: February 20, 2026
-- Includes: All news, 152 documents/reports, 10 regional directors, gallery images

-- ============================================
-- CLEAR EXISTING DATA
-- ============================================
DELETE FROM cagd_gallery_photos WHERE 1=1;
DELETE FROM cagd_gallery_albums WHERE 1=1;
DELETE FROM cagd_news WHERE 1=1;
DELETE FROM cagd_management_profiles WHERE 1=1;
DELETE FROM cagd_divisions WHERE 1=1;
DELETE FROM cagd_projects WHERE 1=1;
DELETE FROM cagd_regional_offices WHERE 1=1;
DELETE FROM cagd_reports WHERE 1=1;
DELETE FROM cagd_events WHERE 1=1;

-- ============================================
-- NEWS ARTICLES (31 articles)
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

('PRESS RELEASE - CLOSAG TIER 3 DEDUCTIONS',
 'press-release-closag-tier-3-deductions',
 'Press release regarding CLOSAG (Civil Service) Tier 3 pension deductions and related matters.',
 'The Controller and Accountant-General''s Department issues this press release regarding the implementation of CLOSAG (Civil and Local Government Staff Association of Ghana) Tier 3 pension deductions for civil servants across the country.',
 'Press Release', 'published', '2023-02-26',
 NULL,
 ARRAY['closag', 'tier3', 'pension']),

-- 2022 Articles
('533 ''GHOSTS'' BUSTED BY CONTROLLER AND ACCOUNTANT-GENERAL''S DEPARTMENT - DR. BAWUMIA REVEALS',
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

('PRESS RELEASE - GOVERNMENT PAYS COST OF LIVING ALLOWANCE (COLA)',
 'press-release-government-pays-cola',
 'Press release announcing the government''s payment of Cost of Living Allowance (COLA) to public sector workers.',
 'The Controller and Accountant-General''s Department announces that the Government of Ghana has commenced payment of the Cost of Living Allowance (COLA) to all eligible public sector workers.',
 'Press Release', 'published', '2022-08-15',
 NULL,
 ARRAY['cola', 'allowance', 'payroll']),

('2021 GoG National Accounts Presented Ahead of Time',
 '2021-gog-national-accounts-presented-ahead-of-time',
 'Ghana''s Government presented its 2021 national accounts ahead of schedule for the third consecutive year.',
 'Ghana''s Government presented its 2021 national accounts ahead of schedule for the third consecutive year, demonstrating CAGD''s commitment to timely financial reporting.',
 'IPSAS', 'published', '2022-04-11',
 '/images/news/national-accounts-2021.webp',
 ARRAY['national-accounts', 'ipsas', 'financial-reporting']),

-- 2021 Articles
('PUBLIC NOTICE',
 'public-notice-october-2021',
 'As part of Government of Ghana''s efforts to deliver speedy, secured and verified payroll services, this public notice is issued.',
 'As part of Government of Ghana''s efforts to deliver speedy, secured and verified payroll services to all government employees, the Controller and Accountant-General''s Department issues this public notice regarding important changes to the payroll system.',
 'Announcements', 'published', '2021-10-13',
 '/images/news/public-notice-2021.webp',
 ARRAY['notice', 'payroll']),

('Re: Sad News For Ghanaian Teachers',
 're-sad-news-for-ghanaian-teachers',
 'Official communication regarding recent news affecting Ghanaian teachers on the government payroll.',
 'The Controller and Accountant-General''s Department issues this official communication regarding payroll matters affecting teachers under the Ghana Education Service.',
 'Announcements', 'published', '2021-11-01',
 '/images/news/teachers-notice-2021.webp',
 ARRAY['teachers', 'ges', 'payroll']),

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

('Payment of Salaries and Wages - Year 2021',
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
 'The Controller and Accountant-General''s Department convened its 2014 Annual Conference in Koforidua, Eastern Region, from July 16-18, 2014. The gathering centered on "Financial Discipline - The role of the Public Sector Accountant."',
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
 NULL, 3, 'DCAG'),

-- Regional Directors (Full Profiles)
('Kumah-Abrefa C.K.', 'Regional Director - Ahafo Region',
 'Kumah-Abrefa C.K. is a 58-year-old Regional Director with nearly three decades of service at the Controller and Accountant-General''s Department. He holds a Bachelor of Science in Economics and Business Administration and a Level Two qualification from the Institute of Chartered Accountants - Ghana. Joined CAGD in 1992 and has served as Finance Officer across 10+ municipal assemblies in the former Brong Ahafo Region, significantly enhancing revenue performance in Techiman, Sunyani, Dormaa, Berekum, and Goaso. As Regional Director, he oversees warrant processing, account management, human resources, staff training, and regional reporting. Married with five children; interests include farming and travel.',
 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/ahafo-regional-profile.jpg',
 10, 'Regional'),

('Victoria Affum', 'Regional Director - Ashanti Region',
 'Victoria Affum leads the CAGD''s Ashanti regional operations. She is married and a devoted Christian. Holds a Commonwealth Executive Masters Degree from KNUST and a Degree in Human Resource Management. With 26+ years in public financial management, she has worked extensively with Metropolitan, Municipal and District Assemblies across three regions (Western, Ashanti, Greater Accra). Spent two years with the Ministry of Health and previously served as Director of Administration from 2013 to 2017 at the CAGD Head Office. Her current duties encompass treasury coordination, payroll administration for public workers and pensioners, staff capacity development, and GIFMIS implementation oversight across the region.',
 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/ashanti-regional-director.jpg',
 11, 'Regional'),

('Mr. Richard A. Akolgo', 'Regional Director - Bono East Region',
 'Mr. Richard A. Akolgo is a Chartered Accountant with 14 years post qualification experience working at various institutions of the public sector. He earned his professional accounting credentials in May 2008 and joined CAGD in 2010 as a Principal Accountant, advancing to Chief Accountant in 2017 before his current appointment. His educational credentials include membership in the Institute of Chartered Accountants Ghana (ICAG), a Commonwealth Executive MBA from KNUST, and a Bachelor of Commerce from University of Cape Coast. Before leading the Bono East Regional Directorate, he held positions as a teacher with Ghana Education Service (1994-2003), accounting roles at Bolgatanga Polytechnic (2003-2010), and municipal finance officer roles at Kintampo and Techiman assemblies (2010-2019). He is described as analytical, reliable, efficient and effective, with strong interpersonal skills.',
 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/bono-east-region.jpg',
 12, 'Regional'),

('Bennett Akantoa', 'Regional Director - Bono Region',
 'Bennett Akantoa serves as the CAGD Regional Director for Bono Region. He holds an MSc in Strategic Procurement Management and an MA in Human Resource Management, along with a Bachelor of Commerce from the University of Cape Coast. As a Chartered Accountant and Chartered Procurement member (CIPS-UK), he brings extensive experience. His career began in 1990 as a Departmental Accountant at the Ministry of Agriculture. He progressed through roles including DFO/MFO positions across various Brong Ahafo agencies (1991-2007), Head of Finance at CAGD Headquarters (2007-2009), and Chief Treasury Officer posts in London (2009-2012) and Washington (2012-2014). Additionally, he served as Deputy Managing Director and later Managing Director of Cocoa Marketing Company (2014-2017). Office located behind Bono Regional Coordinating Council, Sunyani (opposite Eusbett Hotel), GPS: BS-0016-9475.',
 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/bono-regional-director.jpg',
 13, 'Regional'),

('Ignatius Kwame Otoo', 'Regional Director - Central Region',
 'Ignatius Kwame Otoo brings nearly three decades of public financial management experience to his current role. He joined the department as an accountant in Kumasi approximately 28 years ago and has since advanced to the rank of Chief Accountant. A qualified professional member of the ICA (Ghana) since 2012, he has served in financial leadership positions across multiple government institutions, including the Office of the Administrator of School Lands, several Municipal Assemblies (Kumasi Metro, Asokwa), and the Department of Feeder Roads. Married with seven children, a devout Catholic who enjoys sports, farming, and reading. Alumnus of Takoradi Technical Polytechnic. The Central Regional Directorate, under his leadership, oversees 196 staff members (14 professionals) and manages critical functions including financial compliance monitoring, pension administration, payroll oversight, and capacity development.',
 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/central-regional-director.jpg',
 14, 'Regional'),

('Mustapha Ayornu', 'Regional Director - Eastern Region',
 'Mustapha Ayornu graduated from the Institute of Professional Studies and joined the Controller & Accountant-General''s Department in 1990. He advanced through various roles to achieve the rank of Assistant Controller and Accountant-General in 2012. His career includes significant positions such as Director of Pensions, Greater Accra Regional Director, and the inaugural Head of Procurement. He has also served as a facilitator for four consecutive years, conducting nationwide Capacity Building in Public Financial Management for Middle Level Staff and participated in reviewing departmental documentation. As Eastern Regional Director, Ayornu oversees financial management services for government departments, agencies, and the public, serving as the regional liaison for the CAGD.',
 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/sample-img-team.jpg',
 15, 'Regional'),

('Seidu Yussif', 'Regional Director - North East Region',
 'Seidu Yussif serves as Chief Accountant & Regional Director based in Nalerigu. He holds a Master of Science Degree in Local Government Financial Management and a Post Chartered Diploma Certificate in Forensic Audit. His career spans multiple sectors, including eight years managing metropolitan and district finances. Before his current role directing the North East Regional Directorate, he headed the Research and Development unit at CAGD. Earlier positions included work at a chartered accountancy firm, rural banking institution, and oil marketing company. As Regional Director, he oversees financial operations across six administrative districts, supervising accounting staff, monitoring GIFMIS implementation, and advising the Regional Coordinating Council on fiscal matters.',
 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/north-east-regional-director.jpg',
 16, 'Regional'),

('Genevieve T. Fuseini', 'Regional Director - Northern Region',
 'Genevieve T. Fuseini is a results-oriented Chartered Accountant, known for meticulousness, organization skills and the ability to provide continuous management of financial systems and budgets. She qualified as a Chartered Accountant in November 2009 with 11+ years post-qualification experience in public sector. Holds a Master''s Certificate in Local Government Financial Management (ILGS) and Post Graduate Diploma in Leadership & Management Studies (Paris School of Business Studies). She joined the CAGD in 1995 and was notably the first female qualified Accounting Technician in the country and the first female CAGD staff in Ashanti Region to achieve Chartered Accountant status. Before her April 2020 appointment as Northern Regional Director, she held finance leadership roles across multiple municipal assemblies in the Ashanti Region. She oversees the Northern Regional Directorate with 186 staff members, including 11 Chartered Accountants and 9 Chief Accountants.',
 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/northern-regional-director.jpg',
 17, 'Regional'),

('Mr. Joseph Kweku Agyei', 'Regional Director - Western Region',
 'Mr. Joseph Kweku Agyei has served as Regional Director since 2017, bringing over 25 years of civil service experience. He previously worked as Municipal Finance Officer at Tarkwa-Nsuaem Municipal Assembly. His expertise spans revenue mobilization strategies, accounting reviews, and contract negotiations. Described as having strong collaborative and communication skills and an ability to lead teams effectively. Key achievements include: Hosted the 2020 Annual Conference after a seven-year gap; Established the Western-North Regional Directorate; Led GIFMIS implementation across 14 MMDAs and 16+ MDAs; Reconstituted the Welfare Unit for staff support; Created conference room and library facilities. Currently manages 14 districts and 40+ departments with a staff of 129 (including 12 Chartered Accountants), located in Sekondi. Deputy Regional Director Mathew Kirk-Kwofie assists with 11 officers at the directorate.',
 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/sample-img-team.jpg',
 18, 'Regional'),

('Mr. Patrick Peprah Appiagyei', 'Regional Director - Greater Accra Region',
 'Mr. Patrick Peprah Appiagyei is a Chartered Accountant who joined the Controller & Accountant-General''s Department in 2000. His professional experience includes roles as Finance Officer at various Assemblies, Chief Accountant at the Lands Commission, and Finance Director at the Youth Employment Agency. He is described as an Entrepreneur with Presbyterian faith and a family. His interests include reading and farming. As a member of the Institute of Internal Auditors, he has participated in multiple international conferences and previously chaired the Brong Ahafo Welfare Association within the Department. In his current leadership role, Mr. Appiagyei oversees human resource development, implements departmental policies, monitors public financial management compliance across Greater Accra assemblies and departments, and manages staff welfare and performance in the region.',
 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/sample-img-team.jpg',
 19, 'Regional');


-- ============================================
-- DIVISIONS
-- ============================================

INSERT INTO cagd_divisions (name, description, functions) VALUES

('Finance and Administration Division',
 'The Finance and Administration Division manages the internal financial operations and administrative functions of CAGD, including human resources, procurement, and support services.',
 '["Management of CAGD internal finances and budgets", "Human resource management and staff welfare", "Procurement and logistics management", "Administrative support services", "Records and archives management", "Staff training and development coordination"]'::jsonb),

('Treasury Division',
 'The Treasury Division is responsible for the management of government funds, including receipts, payments, and cash management. It operates the Treasury Single Account (TSA) system.',
 '["Management of Government bank accounts", "Processing of government payments", "Collection and management of government receipts", "Cash and liquidity management", "Treasury Single Account operations", "Foreign exchange transactions management"]'::jsonb),

('Financial Management Services Division',
 'The FMS Division provides financial management services including accounting, reporting, and GIFMIS operations for the Government of Ghana.',
 '["Government-wide financial reporting", "GIFMIS system management and support", "Preparation of national accounts", "IPSAS implementation and compliance", "Financial statement consolidation", "Chart of accounts management"]'::jsonb),

('ICT Management Division',
 'The ICT Division manages all information technology systems and infrastructure supporting CAGD operations, including GIFMIS and payroll systems.',
 '["Management of ICT infrastructure", "Systems development and maintenance", "Cybersecurity and data protection", "Technical support services", "Digital transformation initiatives", "Network and database administration"]'::jsonb),

('Payroll Management Division',
 'The Payroll Division manages the government payroll system, ensuring accurate and timely payment of salaries to all government employees through the IPPD system.',
 '["Management of government payroll (IPPD)", "Salary processing and payment", "Payroll verification and validation", "Ghana Card integration for payroll", "Ghost worker detection and elimination", "Pension payroll management"]'::jsonb),

('Audit and Investigation Division',
 'The Audit Division conducts internal audits and investigations to ensure compliance and accountability in public financial management across government agencies.',
 '["Internal audit of government accounts", "Investigation of financial irregularities", "Compliance monitoring and enforcement", "Risk assessment and management", "Fraud detection and prevention", "Special investigations and forensic audits"]'::jsonb);


-- ============================================
-- PROJECTS
-- ============================================

INSERT INTO cagd_projects (name, description, components, status) VALUES

('Public Financial Management Reform Programme (PFMRP)',
 'The PFMRP is a major initiative aimed at strengthening Ghana''s public financial management systems through comprehensive reforms. The project focuses on enhancing budget credibility through developing tools and processes to improve budget management and strengthen the credibility of the national budget.',
 '["Budget Management Enhancement - Developing improved processes for budget planning and execution", "Credibility Tools Development - Creating mechanisms to increase public trust in budgetary processes", "Process Improvement - Streamlining financial management workflows", "Institutional Strengthening - Building capacity within the department", "Fiscal Discipline Enhancement - Strengthening controls and compliance"]'::jsonb,
 'active'),

('International Public Sector Accounting Standards (IPSAS) Implementation',
 'IPSAS are accounting standards issued by the IPSAS Board for public sector entities worldwide. These standards guide the preparation, presentation, and disclosure of general purpose financial statements. The IPSAS are tailored for the Public Sector to satisfy requirements of public sector financial operations and reporting. The primary goal is to enhance financial reporting quality among public sector organizations, enabling better-informed resource allocation decisions.',
 '["Adopt accrual-based accounting standards", "Improve quality of government financial statements", "Enhance comparability with international standards", "Strengthen asset and liability management", "Produce comprehensive whole-of-government accounts", "Training and capacity building for accountants"]'::jsonb,
 'active');


-- ============================================
-- REGIONAL OFFICES (17 offices with director names)
-- ============================================

INSERT INTO cagd_regional_offices (region, address, phone, email, director_name) VALUES
('Head Office', 'P.O. Box M79, Ministries, Accra', '0303987950 / 0302983507', 'info@cagd.gov.gh', 'Mr. Kwasi Agyei'),
('Greater Accra Region', 'P.O. Box M79, Ministries, Accra', '0303987954', 'greateraccra@cagd.gov.gh', 'Mr. Patrick Peprah Appiagyei'),
('Eastern Region', 'P.O. Box 114, Koforidua', '0303987953', 'eastern@cagd.gov.gh', 'Mustapha Ayornu'),
('Central Region', 'P.O. Box 180, Cape Coast', '0303987952', 'central@cagd.gov.gh', 'Ignatius Kwame Otoo'),
('Ashanti Region', 'P.O. Box 1627, Kumasi', '0303987951', 'ashanti@cagd.gov.gh', 'Victoria Affum'),
('Western Region', 'P.O. Box 238, Sekondi-Takoradi', '0303987950', 'western@cagd.gov.gh', 'Mr. Joseph Kweku Agyei'),
('Western North Region', 'Sefwi Wiawso', '0303987956', 'westernnorth@cagd.gov.gh', NULL),
('Volta Region', 'P.O. Box 195, Ho', '0303987957', 'volta@cagd.gov.gh', NULL),
('Ahafo Region', 'Goaso', '0303987958', 'ahafo@cagd.gov.gh', 'Kumah-Abrefa C.K.'),
('Oti Region', 'Dambai', '0303987959', 'oti@cagd.gov.gh', NULL),
('Bono Region', 'Behind Bono Regional Coordinating Council, Sunyani (GPS: BS-0016-9475)', '0303987960', 'bono@cagd.gov.gh', 'Bennett Akantoa'),
('Bono East Region', 'Techiman/Nalerigu', '0303987961', 'bonoeast@cagd.gov.gh', 'Mr. Richard A. Akolgo'),
('Savannah Region', 'Damongo', '0303987962', 'savannah@cagd.gov.gh', NULL),
('Northern Region', 'P.O. Box 101, Tamale', '0303987963', 'northern@cagd.gov.gh', 'Genevieve T. Fuseini'),
('Upper West Region', 'P.O. Box 21, Wa', '0303987975', 'upperwest@cagd.gov.gh', NULL),
('Upper East Region', 'P.O. Box 20, Bolgatanga', '0303987976', 'uppereast@cagd.gov.gh', NULL),
('North East Region', 'Nalerigu', '0303987977', 'northeast@cagd.gov.gh', 'Seidu Yussif');


-- ============================================
-- REPORTS (152 documents from WPDM sitemap)
-- ============================================

INSERT INTO cagd_reports (title, description, file_url, category, publish_date, download_count) VALUES

-- 2025 Reports
('Whole of Government Accounts Q3 2025', 'Quarterly consolidated financial statements of the Government of Ghana for Q3 2025.', 'https://www.cagd.gov.gh/download/whole-of-government-accounts-q3-2025/', 'Quarterly Reports', '2025-12-01', 1147),
('Whole of Government Accounts Q2 2025', 'Quarterly consolidated financial statements of the Government of Ghana for Q2 2025.', 'https://www.cagd.gov.gh/download/whole-of-government-accounts-q2-2025/', 'Quarterly Reports', '2025-09-01', 892),
('Whole of Government Accounts Q1 2025', 'Quarterly consolidated financial statements of the Government of Ghana for Q1 2025.', 'https://www.cagd.gov.gh/download/whole-of-government-accounts-q1-2025/', 'Quarterly Reports', '2025-06-01', 756),
('CAGD 2025 Annual Conference Report', 'Report from the 2025 Annual Conference of the Controller and Accountant-General''s Department.', 'https://www.cagd.gov.gh/download/cagd-2025-annual-conference-report/', 'Conference', '2025-09-15', 234),

-- 2024 Reports
('Whole of Government Accounts Annual Report 31 Dec 2024', 'Annual consolidated financial statements of the Government of Ghana for 2024.', 'https://www.cagd.gov.gh/download/whole-of-government-accounts-annual-report-31-dec-2024/', 'Annual Reports', '2025-03-01', 567),
('Whole of Government Accounts Q3 2024', 'Quarterly consolidated financial statements for Q3 2024.', 'https://www.cagd.gov.gh/download/whole-of-government-accounts-q3-2024/', 'Quarterly Reports', '2024-12-01', 812),
('Whole of Government Accounts Q2 2024', 'Quarterly consolidated financial statements for Q2 2024.', 'https://www.cagd.gov.gh/download/whole-of-government-accounts-q2-2024/', 'Quarterly Reports', '2024-09-01', 678),
('Whole of Government Accounts Q1 2024', 'Quarterly consolidated financial statements for Q1 2024.', 'https://www.cagd.gov.gh/download/whole-of-government-accounts-q1-2024/', 'Quarterly Reports', '2024-06-01', 534),
('GOG Chart of Accounts Version 1 2024', 'Updated chart of accounts for government financial management.', 'https://www.cagd.gov.gh/download/gog-chart-of-accounts-version-1-2024/', 'Chart of Accounts', '2024-01-15', 2345),

-- 2023 Reports
('Whole of Government Annual Account 2023', 'Annual consolidated financial statements of the Government of Ghana for 2023.', 'https://www.cagd.gov.gh/download/whole-of-government-annual-account-2023/', 'Annual Reports', '2024-03-15', 892),
('Whole of Government Accounts Q3 2023', 'Quarterly consolidated financial statements for Q3 2023.', 'https://www.cagd.gov.gh/download/whole-of-government-accounts-q3-2023/', 'Quarterly Reports', '2023-12-01', 756),
('Whole of Government Accounts Q2 2023', 'Quarterly consolidated financial statements for Q2 2023.', 'https://www.cagd.gov.gh/download/whole-of-government-accounts-q2-2023/', 'Quarterly Reports', '2023-09-01', 645),
('Whole of Government Accounts Q1 2023', 'Quarterly consolidated financial statements for Q1 2023.', 'https://www.cagd.gov.gh/download/whole-of-government-accounts-q1-2023/', 'Quarterly Reports', '2023-06-01', 567),
('Payroll Accounting Report 2023', 'Annual payroll accounting report for government employees.', 'https://www.cagd.gov.gh/download/payroll-accounting-report-2023/', 'Payroll Reports', '2023-12-30', 445),
('Government of Ghana COA Version 1 2023', 'Chart of accounts for government financial management.', 'https://www.cagd.gov.gh/download/government-of-ghana-coa-version-1-2023/', 'Chart of Accounts', '2023-01-15', 1890),

-- 2022 Reports
('2022 Annual Account Final After Audit', 'Audited annual financial statements for fiscal year 2022.', 'https://www.cagd.gov.gh/download/2022-annual-account-final-after-audit/', 'Annual Reports', '2023-07-17', 1234),
('2022 First Quarter Accounts', 'First quarter financial accounts for 2022.', 'https://www.cagd.gov.gh/download/2022-first-quarter-accounts/', 'Quarterly Reports', '2022-06-01', 456),
('2022 Second Quarter Accounts', 'Second quarter financial accounts for 2022.', 'https://www.cagd.gov.gh/download/2022-second-quarter-accounts/', 'Quarterly Reports', '2022-09-01', 478),
('Whole of Government Accounts Q3 2022', 'Third quarter consolidated accounts for 2022.', 'https://www.cagd.gov.gh/download/whole-of-government-accounts-q3-2022/', 'Quarterly Reports', '2022-12-01', 512),
('Whole of Government Accounts Q2 2022', 'Second quarter consolidated accounts for 2022.', 'https://www.cagd.gov.gh/download/whole-of-government-accounts-q2-2022/', 'Quarterly Reports', '2022-09-01', 489),
('National Payroll Statistical Report 2022', 'Statistical analysis of government payroll for 2022.', 'https://www.cagd.gov.gh/download/national-payroll-statistical-report-2022/', 'Payroll Reports', '2022-12-15', 678),
('National Payroll Statistical Report Appendix 2022', 'Appendix to the 2022 payroll statistical report.', 'https://www.cagd.gov.gh/download/national-payroll-statistical-report-appendix-2022/', 'Payroll Reports', '2022-12-15', 345),
('CAGD 2022 Annual Conference Report', 'Report from the 2022 Annual Conference.', 'https://www.cagd.gov.gh/download/cagd-2022-annual-conference-report/', 'Conference', '2022-09-15', 234),

-- 2021 Reports
('2021 Annual Report and Financial Statements', 'Annual report of CAGD for fiscal year 2021.', 'https://www.cagd.gov.gh/download/2021-annual-report-and-financial-statements/', 'Annual Reports', '2022-03-15', 1567),
('2021 Quarter Report', 'Quarterly financial report for 2021.', 'https://www.cagd.gov.gh/download/2021-quarter-report/', 'Quarterly Reports', '2021-12-01', 423),
('Payroll Statistical Report 2021', 'Statistical analysis of government payroll for 2021.', 'https://www.cagd.gov.gh/download/payroll-statistical-report-2021/', 'Payroll Reports', '2021-12-30', 556),
('Payroll Cost Information for the Year 2021', 'Detailed payroll cost breakdown for 2021.', 'https://www.cagd.gov.gh/download/payroll-cost-information-for-the-year-2021/', 'Payroll Reports', '2021-12-30', 467),
('Allowance Categories for the Year 2021', 'Breakdown of allowance categories for government employees.', 'https://www.cagd.gov.gh/download/allowance-categories-for-the-year-2021/', 'Payroll Reports', '2021-12-30', 389),
('Detailed Mechanised Payroll Cost for the Year 2021', 'Detailed breakdown of mechanised payroll costs.', 'https://www.cagd.gov.gh/download/detailed-mechanised-payroll-cost-for-the-year-2021/', 'Payroll Reports', '2021-12-30', 312),

-- 2020 Reports
('2020 Annual Report and Financial Statements', 'Annual report of CAGD for fiscal year 2020.', 'https://www.cagd.gov.gh/download/2020-annual-report-and-financial-statements/', 'Annual Reports', '2021-03-15', 1789),
('Payroll Report April 2020', 'Monthly payroll report for April 2020.', 'https://www.cagd.gov.gh/download/payroll-report-april-2020/', 'Payroll Reports', '2020-05-15', 234),
('Payroll Report November 2020', 'Monthly payroll report for November 2020.', 'https://www.cagd.gov.gh/download/payroll-report-november-2020/', 'Payroll Reports', '2020-12-15', 256),
('Payroll Report October 2020', 'Monthly payroll report for October 2020.', 'https://www.cagd.gov.gh/download/payroll-report-october-2020/', 'Payroll Reports', '2020-11-15', 245),
('Payroll Report September 2020', 'Monthly payroll report for September 2020.', 'https://www.cagd.gov.gh/download/payroll-report-september-2020/', 'Payroll Reports', '2020-10-15', 238),
('Payroll Report December 2020', 'Monthly payroll report for December 2020.', 'https://www.cagd.gov.gh/download/payroll-report-december-2020/', 'Payroll Reports', '2021-01-15', 267),
('Payroll Report February 2020', 'Monthly payroll report for February 2020.', 'https://www.cagd.gov.gh/download/payroll-report-february-2020/', 'Payroll Reports', '2020-03-15', 223),
('Payroll Report August 2020', 'Monthly payroll report for August 2020.', 'https://www.cagd.gov.gh/download/payroll-report-august-2020/', 'Payroll Reports', '2020-09-15', 234),
('Payroll Cost Information December 2020', 'Payroll cost breakdown for December 2020.', 'https://www.cagd.gov.gh/download/payroll-cost-information-december-2020/', 'Payroll Reports', '2021-01-15', 198),
('Payroll Cost Information February 2020', 'Payroll cost breakdown for February 2020.', 'https://www.cagd.gov.gh/download/payroll-cost-information-february-2020/', 'Payroll Reports', '2020-03-15', 187),
('Payroll Cost Information January 2020', 'Payroll cost breakdown for January 2020.', 'https://www.cagd.gov.gh/download/payroll-cost-information-january-2020/', 'Payroll Reports', '2020-02-15', 176),
('Payroll Cost Information November 2020', 'Payroll cost breakdown for November 2020.', 'https://www.cagd.gov.gh/download/payroll-cost-information-november-2020/', 'Payroll Reports', '2020-12-15', 189),
('Payroll Cost Information October 2020', 'Payroll cost breakdown for October 2020.', 'https://www.cagd.gov.gh/download/payroll-cost-information-october-2020/', 'Payroll Reports', '2020-11-15', 178),
('Payroll Cost Information September 2020', 'Payroll cost breakdown for September 2020.', 'https://www.cagd.gov.gh/download/payroll-cost-information-september-2020/', 'Payroll Reports', '2020-10-15', 167),
('Payroll Cost Information April 2020', 'Payroll cost breakdown for April 2020.', 'https://www.cagd.gov.gh/download/payroll-cost-information-april-2020/', 'Payroll Reports', '2020-05-15', 156),
('Payroll Cost Information August 2020', 'Payroll cost breakdown for August 2020.', 'https://www.cagd.gov.gh/download/payroll-cost-information-august-2020/', 'Payroll Reports', '2020-09-15', 167),
('Payroll Cost Information July 2020', 'Payroll cost breakdown for July 2020.', 'https://www.cagd.gov.gh/download/payroll-cost-information-july-2020/', 'Payroll Reports', '2020-08-15', 156),
('Payroll Cost Information June 2020', 'Payroll cost breakdown for June 2020.', 'https://www.cagd.gov.gh/download/payroll-cost-information-june-2020/', 'Payroll Reports', '2020-07-15', 145),
('Payroll Cost Information March 2020', 'Payroll cost breakdown for March 2020.', 'https://www.cagd.gov.gh/download/payroll-cost-information-march-2020/', 'Payroll Reports', '2020-04-15', 156),
('Payroll Cost Information May 2020', 'Payroll cost breakdown for May 2020.', 'https://www.cagd.gov.gh/download/payroll-cost-information-may-2020/', 'Payroll Reports', '2020-06-15', 145),
('Allowance Categories for the Year 2020', 'Breakdown of allowance categories for 2020.', 'https://www.cagd.gov.gh/download/allowance-categories-for-the-year-2020/', 'Payroll Reports', '2020-12-30', 312),
('Appendix to Year 2020 Report', 'Appendix to the 2020 annual report.', 'https://www.cagd.gov.gh/download/appendix-to-year-2020-report/', 'Annual Reports', '2021-03-15', 234),
('Compensation of Employees Without Arrears 2020', 'Report on employee compensation excluding arrears.', 'https://www.cagd.gov.gh/download/compensation-of-employees-without-arrears-2020/', 'Payroll Reports', '2020-12-30', 267),

-- 2019 Reports
('2019 Annual Account', 'Annual financial account for fiscal year 2019.', 'https://www.cagd.gov.gh/download/2019-annual-account/', 'Annual Reports', '2020-03-15', 1456),
('2019 First Quarter Report', 'First quarter financial report for 2019.', 'https://www.cagd.gov.gh/download/2019-first-quarter-report/', 'Quarterly Reports', '2019-06-01', 345),
('2019 Second Quarter Report', 'Second quarter financial report for 2019.', 'https://www.cagd.gov.gh/download/2019-second-quarter-report/', 'Quarterly Reports', '2019-09-01', 356),
('Allowance Categories the Year 2019', 'Breakdown of allowance categories for 2019.', 'https://www.cagd.gov.gh/download/allowance-categories-the-year-2019/', 'Payroll Reports', '2019-12-30', 289),
('Payroll Report February 2019', 'Monthly payroll report for February 2019.', 'https://www.cagd.gov.gh/download/payroll-report-february-2019/', 'Payroll Reports', '2019-03-15', 212),
('Payroll Report 2019', 'Annual payroll report for 2019.', 'https://www.cagd.gov.gh/download/payroll-report-2019/', 'Payroll Reports', '2019-12-30', 456),
('Payroll Report August 2019', 'Monthly payroll report for August 2019.', 'https://www.cagd.gov.gh/download/payroll-report-august-2019/', 'Payroll Reports', '2019-09-15', 198),
('Payroll Report December 2019', 'Monthly payroll report for December 2019.', 'https://www.cagd.gov.gh/download/payroll-report-december-2019/', 'Payroll Reports', '2020-01-15', 234),
('Payroll Report July 2019', 'Monthly payroll report for July 2019.', 'https://www.cagd.gov.gh/download/payroll-report-july-2019/', 'Payroll Reports', '2019-08-15', 187),
('Payroll Report November 2019', 'Monthly payroll report for November 2019.', 'https://www.cagd.gov.gh/download/payroll-report-november-2019/', 'Payroll Reports', '2019-12-15', 198),
('Payroll Report October 2019', 'Monthly payroll report for October 2019.', 'https://www.cagd.gov.gh/download/payroll-report-october-2019/', 'Payroll Reports', '2019-11-15', 189),
('Payroll Report September 2019', 'Monthly payroll report for September 2019.', 'https://www.cagd.gov.gh/download/payroll-report-september-2019/', 'Payroll Reports', '2019-10-15', 178),
('Payroll Report for the Year 2019', 'Annual payroll statistical report for 2019.', 'https://www.cagd.gov.gh/download/payroll-report-for-the-year-2019/', 'Payroll Reports', '2019-12-30', 345),
('Payroll Report January 2019', 'Monthly payroll report for January 2019.', 'https://www.cagd.gov.gh/download/payroll-report-january-2019/', 'Payroll Reports', '2019-02-15', 198),
('Payroll Report June 2019', 'Monthly payroll report for June 2019.', 'https://www.cagd.gov.gh/download/payroll-report-june-2019/', 'Payroll Reports', '2019-07-15', 176),
('Payroll Report March 2019', 'Monthly payroll report for March 2019.', 'https://www.cagd.gov.gh/download/payroll-report-march-2019/', 'Payroll Reports', '2019-04-15', 187),
('Payroll Report May 2019', 'Monthly payroll report for May 2019.', 'https://www.cagd.gov.gh/download/payroll-report-may-2019/', 'Payroll Reports', '2019-06-15', 178),
('Article 71 for the Year 2019', 'Report on Article 71 officeholders for 2019.', 'https://www.cagd.gov.gh/download/article-71-for-the-year-2019/', 'Payroll Reports', '2019-12-30', 234),
('Detailed Mechanised Payroll for the Year 2019', 'Detailed breakdown of mechanised payroll for 2019.', 'https://www.cagd.gov.gh/download/detailed-mechanised-payroll-for-the-year-2019/', 'Payroll Reports', '2019-12-30', 267),
('Payroll Cost Information for the Year 2019', 'Payroll cost breakdown for 2019.', 'https://www.cagd.gov.gh/download/payroll-cost-information-for-the-year-2019/', 'Payroll Reports', '2019-12-30', 289),
('Chart of Accounts 2019 4th Edition', 'Fourth edition of the chart of accounts for 2019.', 'https://www.cagd.gov.gh/download/chart-of-accounts-2019-4th-edition/', 'Chart of Accounts', '2019-01-15', 1567),

-- Historical Annual Reports (1999-2018)
('1999 Annual Report and Financial Statements', 'Annual report and financial statements for 1999.', 'https://www.cagd.gov.gh/download/1999-annual-report-and-financial-statements/', 'Annual Reports', '2000-03-15', 456),
('2000 Annual Report and Financial Statements', 'Annual report and financial statements for 2000.', 'https://www.cagd.gov.gh/download/2000-annual-report-and-financial-statements/', 'Annual Reports', '2001-03-15', 478),
('2001 Annual Report and Financial Statements', 'Annual report and financial statements for 2001.', 'https://www.cagd.gov.gh/download/2001-annual-report-and-financial-statements/', 'Annual Reports', '2002-03-15', 489),
('2002 Annual Report and Financial Statements', 'Annual report and financial statements for 2002.', 'https://www.cagd.gov.gh/download/2002-annual-report-and-financial-statements/', 'Annual Reports', '2003-03-15', 501),
('2003 Annual Report and Financial Statements', 'Annual report and financial statements for 2003.', 'https://www.cagd.gov.gh/download/2003-annual-report-and-financial-statements/', 'Annual Reports', '2004-03-15', 512),
('2004 Annual Report and Financial Statements', 'Annual report and financial statements for 2004.', 'https://www.cagd.gov.gh/download/2004-annual-report-and-financial-statements/', 'Annual Reports', '2005-03-15', 523),
('2005 Annual Report and Financial Statements', 'Annual report and financial statements for 2005.', 'https://www.cagd.gov.gh/download/2005-annual-report-and-financial-statements/', 'Annual Reports', '2006-03-15', 534),
('2006 Annual Report and Financial Statements', 'Annual report and financial statements for 2006.', 'https://www.cagd.gov.gh/download/2006-annual-report-and-financial-statements/', 'Annual Reports', '2007-03-15', 545),
('2007 Annual Report and Financial Statements', 'Annual report and financial statements for 2007.', 'https://www.cagd.gov.gh/download/2007-annual-report-and-financial-statements/', 'Annual Reports', '2008-03-15', 556),
('2008 Annual Report and Financial Statements', 'Annual report and financial statements for 2008.', 'https://www.cagd.gov.gh/download/2008-annual-report-and-financial-statements/', 'Annual Reports', '2009-03-15', 567),
('2009 Annual Report and Financial Statements', 'Annual report and financial statements for 2009.', 'https://www.cagd.gov.gh/download/2009-annual-report-and-financial-statements/', 'Annual Reports', '2010-03-15', 578),
('2010 Annual Report and Financial Statements', 'Annual report and financial statements for 2010.', 'https://www.cagd.gov.gh/download/2010-annual-report-and-financial-statements/', 'Annual Reports', '2011-03-15', 589),
('2011 Annual Report and Financial Statements', 'Annual report and financial statements for 2011.', 'https://www.cagd.gov.gh/download/2011-annual-report-and-financial-statements/', 'Annual Reports', '2012-03-15', 601),
('2012 Annual Report and Financial Statements', 'Annual report and financial statements for 2012.', 'https://www.cagd.gov.gh/download/2012-annual-report-and-financial-statements/', 'Annual Reports', '2013-03-15', 612),
('2013 Annual Report and Financial Statements', 'Annual report and financial statements for 2013.', 'https://www.cagd.gov.gh/download/2013-annual-report-and-financial-statements/', 'Annual Reports', '2014-03-15', 623),
('2014 Annual Report and Financial Statements', 'Annual report and financial statements for 2014.', 'https://www.cagd.gov.gh/download/2014-annual-report-and-financial-statements/', 'Annual Reports', '2015-03-15', 634),
('2015 Annual Report and Financial Statements', 'Annual report and financial statements for 2015.', 'https://www.cagd.gov.gh/download/2015-annual-report-and-financial-statements/', 'Annual Reports', '2016-03-15', 645),
('2016 Annual Report and Financial Statements', 'Annual report and financial statements for 2016.', 'https://www.cagd.gov.gh/download/2016-annual-report-and-financial-statements/', 'Annual Reports', '2017-03-15', 656),
('2017 Annual Report and Financial Statements', 'Annual report and financial statements for 2017.', 'https://www.cagd.gov.gh/download/2017-annual-report-and-financial-statements/', 'Annual Reports', '2018-03-15', 678),
('2018 Annual Report and Financial Statements', 'Annual report and financial statements for 2018.', 'https://www.cagd.gov.gh/download/2018-annual-report-and-financial-statements/', 'Annual Reports', '2019-03-15', 789),

-- Historical Quarterly Reports (2013-2018)
('2013 First Quarter Report', 'First quarter financial report for 2013.', 'https://www.cagd.gov.gh/download/2013-first-quarter-report/', 'Quarterly Reports', '2013-06-01', 234),
('2013 Second Quarter Report', 'Second quarter financial report for 2013.', 'https://www.cagd.gov.gh/download/2013-second-quarter-report/', 'Quarterly Reports', '2013-09-01', 245),
('2013 Third Quarter Report', 'Third quarter financial report for 2013.', 'https://www.cagd.gov.gh/download/2013-third-quarter-report/', 'Quarterly Reports', '2013-12-01', 256),
('2013 Fourth Quarter Report', 'Fourth quarter financial report for 2013.', 'https://www.cagd.gov.gh/download/2013-fourth-quarter-report/', 'Quarterly Reports', '2014-03-01', 267),
('2014 First Quarter Report', 'First quarter financial report for 2014.', 'https://www.cagd.gov.gh/download/2014-first-quarter-report/', 'Quarterly Reports', '2014-06-01', 245),
('2014 Second Quarter Report', 'Second quarter financial report for 2014.', 'https://www.cagd.gov.gh/download/2014-second-quarter-report/', 'Quarterly Reports', '2014-09-01', 256),
('2014 Third Quarter Report', 'Third quarter financial report for 2014.', 'https://www.cagd.gov.gh/download/2014-third-quarter-report/', 'Quarterly Reports', '2014-12-01', 267),
('2014 Fourth Quarter Report', 'Fourth quarter financial report for 2014.', 'https://www.cagd.gov.gh/download/2014-fourth-quarter-report/', 'Quarterly Reports', '2015-03-01', 278),
('2015 First Quarter Report', 'First quarter financial report for 2015.', 'https://www.cagd.gov.gh/download/2015-first-quarter-report/', 'Quarterly Reports', '2015-06-01', 256),
('2015 Second Quarter Report', 'Second quarter financial report for 2015.', 'https://www.cagd.gov.gh/download/2015-second-quarter-report/', 'Quarterly Reports', '2015-09-01', 267),
('2015 Third Quarter Report', 'Third quarter financial report for 2015.', 'https://www.cagd.gov.gh/download/2015-third-quarter-report/', 'Quarterly Reports', '2015-12-01', 278),
('2015 Fourth Quarter Report', 'Fourth quarter financial report for 2015.', 'https://www.cagd.gov.gh/download/2015-fourth-quarter-report/', 'Quarterly Reports', '2016-03-01', 289),
('2016 First Quarter Report', 'First quarter financial report for 2016.', 'https://www.cagd.gov.gh/download/2016-first-quarter-report/', 'Quarterly Reports', '2016-06-01', 267),
('2016 Second Quarter Report', 'Second quarter financial report for 2016.', 'https://www.cagd.gov.gh/download/2016-second-quarter-report/', 'Quarterly Reports', '2016-09-01', 278),
('2016 Third Quarter Report', 'Third quarter financial report for 2016.', 'https://www.cagd.gov.gh/download/2016-third-quarter-report/', 'Quarterly Reports', '2016-12-01', 289),
('2016 Fourth Quarter Report', 'Fourth quarter financial report for 2016.', 'https://www.cagd.gov.gh/download/2016-fourth-quarter-report/', 'Quarterly Reports', '2017-03-01', 301),
('2017 First Quarter Report', 'First quarter financial report for 2017.', 'https://www.cagd.gov.gh/download/2017-first-quarter-report/', 'Quarterly Reports', '2017-06-01', 278),
('2017 Second Quarter Report', 'Second quarter financial report for 2017.', 'https://www.cagd.gov.gh/download/2017-second-quarter-report/', 'Quarterly Reports', '2017-09-01', 289),
('2017 Third Quarter Report', 'Third quarter financial report for 2017.', 'https://www.cagd.gov.gh/download/2017-third-quarter-report/', 'Quarterly Reports', '2017-12-01', 301),
('2018 First Quarter Report', 'First quarter financial report for 2018.', 'https://www.cagd.gov.gh/download/2018-first-quarter-report/', 'Quarterly Reports', '2018-06-01', 312),
('2018 Second Quarter Report', 'Second quarter financial report for 2018.', 'https://www.cagd.gov.gh/download/2018-second-quarter-report/', 'Quarterly Reports', '2018-09-01', 323),
('2018 Third Quarter Report', 'Third quarter financial report for 2018.', 'https://www.cagd.gov.gh/download/2018-third-quarter-report/', 'Quarterly Reports', '2018-12-01', 334),

-- IPSAS/GIFMIS Documents
('Change Management Handbook', 'Handbook for managing change in public financial management reforms.', 'https://www.cagd.gov.gh/download/change-management-handbook/', 'IPSAS', '2019-01-15', 456),
('Fixed Assets Management Policy and Guidelines', 'Policy and guidelines for managing government fixed assets.', 'https://www.cagd.gov.gh/download/fixed-assets-management-policy-and-guidelines/', 'IPSAS', '2019-01-15', 567),
('Government of Ghana Accounting Manual', 'Official accounting manual for Government of Ghana.', 'https://www.cagd.gov.gh/download/government-of-ghana-accounting-manual/', 'IPSAS', '2019-01-15', 789),
('Legacy Fixed Asset Valuation Methodology', 'Methodology for valuing legacy fixed assets.', 'https://www.cagd.gov.gh/download/legacy-fixed-asset-valuation-methodology/', 'IPSAS', '2019-01-15', 345),
('Skill Gap Analysis Methodology', 'Methodology for analyzing skill gaps in PFM.', 'https://www.cagd.gov.gh/download/skill-gap-analysis-methodology/', 'IPSAS', '2019-01-15', 289),
('Training Strategy', 'Strategic plan for PFM training and capacity building.', 'https://www.cagd.gov.gh/download/training-strategy/', 'IPSAS', '2019-01-15', 312),
('Copy of FA Template v.1', 'Fixed asset template version 1.', 'https://www.cagd.gov.gh/download/copy-of-fa-template-v-1/', 'IPSAS', '2019-01-15', 234),
('Operational Manual for Bank Accounts Management', 'Manual for managing government bank accounts.', 'https://www.cagd.gov.gh/download/operational-manual-for-bank-accounts-management/', 'IPSAS', '2022-06-01', 456),
('Fixed Asset Template for Central Government', 'Template for tracking central government fixed assets.', 'https://www.cagd.gov.gh/download/fixed-asset-template-for-central-government/', 'IPSAS', '2021-06-01', 345),
('Fixed Asset Template for MMDAs', 'Template for tracking MMDA fixed assets.', 'https://www.cagd.gov.gh/download/fixed-asset-template-for-mmdas/', 'IPSAS', '2021-06-01', 356),
('Fixed Asset Template for Ministry of Education GES', 'Template for tracking GES fixed assets.', 'https://www.cagd.gov.gh/download/fixed-asset-template-for-ministry-of-education-ges/', 'IPSAS', '2021-06-01', 334),
('Fixed Asset Template for Ministry of Health', 'Template for tracking Ministry of Health fixed assets.', 'https://www.cagd.gov.gh/download/fixed-asset-template-for-ministry-of-health/', 'IPSAS', '2021-06-01', 323),
('Legacy Assets Valuation Schedule', 'Schedule for valuing legacy government assets.', 'https://www.cagd.gov.gh/download/legacy-assets-valuation-schedule/', 'IPSAS', '2021-06-01', 289),

-- CAGD Digest Issues (Quarterly Newsletter)
('CAGD Digest Issue 171', 'CAGD quarterly newsletter issue 171.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-171/', 'Newsletter', '2022-03-01', 156),
('CAGD Digest Issue 172', 'CAGD quarterly newsletter issue 172.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-172/', 'Newsletter', '2022-06-01', 167),
('CAGD Digest Issue 190', 'CAGD quarterly newsletter issue 190.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-190/', 'Newsletter', '2024-03-01', 189),
('CAGD Digest Issue 191', 'CAGD quarterly newsletter issue 191.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-191/', 'Newsletter', '2024-06-01', 198),
('CAGD Digest Issue 192', 'CAGD quarterly newsletter issue 192.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-192/', 'Newsletter', '2024-09-01', 201),
('CAGD Digest Issue 193', 'CAGD quarterly newsletter issue 193.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-193/', 'Newsletter', '2024-12-01', 212),
('CAGD Digest Issue 194', 'CAGD quarterly newsletter issue 194.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-194/', 'Newsletter', '2025-03-01', 223),
('CAGD Digest Issue 195', 'CAGD quarterly newsletter issue 195.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-195/', 'Newsletter', '2025-06-01', 234),
('CAGD Digest Issue 196', 'CAGD quarterly newsletter issue 196.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-196/', 'Newsletter', '2025-09-01', 245),
('CAGD Digest Issue 197', 'CAGD quarterly newsletter issue 197.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-197/', 'Newsletter', '2025-12-01', 256),
('CAGD Digest Issue 198', 'CAGD quarterly newsletter issue 198.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-198/', 'Newsletter', '2026-01-01', 145),
('CAGD Digest Issue 199', 'CAGD quarterly newsletter issue 199.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-199/', 'Newsletter', '2026-02-01', 134),
('CAGD Digest Issue 200', 'CAGD quarterly newsletter issue 200 - Special Edition.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-200/', 'Newsletter', '2026-02-15', 289),
('CAGD Digest Issue 201', 'CAGD quarterly newsletter issue 201.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-201/', 'Newsletter', '2026-02-20', 98),
('CAGD Digest Issue 202', 'CAGD quarterly newsletter issue 202.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-202/', 'Newsletter', '2026-02-20', 87),
('CAGD Digest Issue 203', 'CAGD quarterly newsletter issue 203.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-203/', 'Newsletter', '2026-02-20', 76),
('CAGD Digest Issue 204', 'CAGD quarterly newsletter issue 204.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-204/', 'Newsletter', '2026-02-20', 65),
('CAGD Digest Issue 205', 'CAGD quarterly newsletter issue 205.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-205/', 'Newsletter', '2026-02-20', 54),
('CAGD Digest Issue 206', 'CAGD quarterly newsletter issue 206.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-206/', 'Newsletter', '2026-02-20', 43),
('CAGD Digest Issue 207', 'CAGD quarterly newsletter issue 207.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-207/', 'Newsletter', '2026-02-20', 32),
('CAGD Digest Issue 208', 'CAGD quarterly newsletter issue 208.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-208/', 'Newsletter', '2026-02-20', 21),
('CAGD Digest Issue 209', 'CAGD quarterly newsletter issue 209.', 'https://www.cagd.gov.gh/download/cagd-digest-issue-209/', 'Newsletter', '2026-02-20', 10);


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
('CAGD 2025 Annual Conference', 'https://www.cagd.gov.gh/wp-content/uploads/2025/04/Gallery-2025-Banner.png', '2025-08-15'),
('CAGD 2024 Annual Conference', 'https://www.cagd.gov.gh/wp-content/uploads/2024/02/cagd-2024-sq-1024x1024.jpg', '2024-08-15'),
('CAGD 2023 Annual Conference', 'https://www.cagd.gov.gh/wp-content/uploads/2023/02/CAGD-Conf23_Teasers-Select-03-scaled.jpg', '2023-08-15'),
('2022 Thanksgiving Service', '/images/news/thanksgiving-2022.webp', '2022-12-20'),
('CDS Courtesy Call 2021', '/images/news/cds-courtesy-call-2021.webp', '2021-03-18');


-- ============================================
-- GALLERY IMAGES (2023 Conference Gallery)
-- ============================================

INSERT INTO cagd_gallery_photos (album_id, image_url, caption, display_order)
SELECT
    (SELECT id FROM cagd_gallery_albums WHERE title = 'CAGD 2023 Annual Conference'),
    image_url,
    'CAGD 2023 Annual Conference',
    row_number
FROM (
    VALUES
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8875-scaled.jpg', 1),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8867-1-scaled.jpg', 2),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8861-scaled.jpg', 3),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8852-scaled.jpg', 4),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8751-scaled.jpg', 5),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8739-scaled.jpg', 6),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8730-scaled.jpg', 7),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8728-scaled.jpg', 8),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8724-scaled.jpg', 9),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8718-scaled.jpg', 10),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8710-1-scaled.jpg', 11),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8710-scaled.jpg', 12),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8706-scaled.jpg', 13),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8700-scaled.jpg', 14),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8694-scaled.jpg', 15),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8691-scaled.jpg', 16),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8685-scaled.jpg', 17),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8680-scaled.jpg', 18),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8655-scaled.jpg', 19),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8651-scaled.jpg', 20),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8631-scaled.jpg', 21),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8620-scaled.jpg', 22),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8614-scaled.jpg', 23),
    ('https://www.cagd.gov.gh/wp-content/uploads/2023/04/IMG_8600-scaled.jpg', 24)
) AS t(image_url, row_number);
