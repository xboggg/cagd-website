-- Complete data update for CAGD website
-- All data scraped from cagd.gov.gh

-- =============================================
-- UPDATE MANAGEMENT PROFILES (Add missing ones)
-- =============================================

-- First, update the existing CAG profile with full bio
UPDATE cagd_management_profiles SET
  bio = 'Mr. Kwasi Agyei assumed office on Monday, April 15, 2024. He is a Chartered Accountant and a member of the Institute of Chartered Accountants, Ghana, with over 20 years of experience in the public sector. He holds an MSc in Accounting and Finance, an International Master of Business Administration (MBA), and a BA (Hons) in Accounting and Economics. Prior to his appointment, he was the Deputy Controller and Accountant-General in charge of Treasury. He previously served as Director of Finance at the Ministry of Energy, Director of Accounts at the Ministry of Petroleum, Head of Finance at the Food and Drugs Authority, and Chief Treasury Officer at the Ministry of Finance. He has served on various boards including the Ministerial Advisory Board of the Ministry of Finance, the Ghana Road Fund Management Board, and the Railway Development Fund Committee.',
  photo = 'https://www.cagd.gov.gh/wp-content/uploads/2024/04/Untitled-design-1-e1713359983745.png'
WHERE name = 'Mr. Kwasi Agyei';

-- Update Mrs. Emelia Osei Derkyi with full bio
UPDATE cagd_management_profiles SET
  bio = 'Mrs. Emelia Boatemah Osei Derkyi is a finance professional with an illustrious career spanning over 26 years in the Controller and Accountant-General''s Department (CAGD). She was appointed to the Acting position of Deputy Controller responsible for Finance and Administration on 1st June 2021 and became substantive in June 2022. She is a Chartered Global Management Accountant (CGMA). Her extensive expertise and commitment have driven impactful financial management reforms within Ghana''s public sector.',
  photo = 'https://www.cagd.gov.gh/wp-content/uploads/2017/12/Emelia.jpg'
WHERE name = 'Mrs. Emelia Osei Derkyi';

-- Delete the placeholder DCAG Treasury entry
DELETE FROM cagd_management_profiles WHERE name = 'Deputy Controller and Accountant-General (Treasury)';

-- Insert missing DCAGs
INSERT INTO cagd_management_profiles (name, title, profile_type, bio, photo, display_order) VALUES
('Dr. Edward Akuamoah-Boateng', 'Deputy Controller and Accountant-General (Financial Management Services & Training)', 'DCAG',
'Dr. Edward Akuamoah-Boateng is a seasoned Chartered Accountant with 19 years post-qualification experience and a total of 28 years'' experience in Public Sector Accounting. He has been Deputy Controller & Accountant General since 2019. He oversees Financial Management Services and Training, coordinating and providing strategic input to three crucial directorates: National Accounts, Financial Monitoring, and Public Financial Management Reform, Research, and Development. He holds a Doctor of Business Administration (DBA) from Walden University, USA (April 2016), and an MBA from Edinburgh Napier University, UK (July 2005). He achieved Fellowship status as a Chartered Certified Accountant (FCCA) from ACCA in September 2006 and became a member of the Institute of Chartered Accountants Ghana in May 2007.',
'https://www.cagd.gov.gh/wp-content/uploads/2017/12/Edward.jpg', 3),

('Dr. Gilbert Nyaledzigbor', 'Deputy Controller and Accountant-General (Treasury & ICT Management)', 'DCAG',
'Dr. Gilbert Nyaledzigbor is a Chartered Accountant with 23 years of post-qualification experience in the private and public sectors. He holds a PhD in Public Policy and Administration with a specialization in Law and Public Policy from Walden University, USA. His doctoral dissertation focused on payroll fraud, specifically examining the impact of ghost names on Ghana''s government wage bill. He also holds an MBA from University of Ghana Business School (2009) and a BSc from University of Ghana Business School (1994).',
'https://www.cagd.gov.gh/wp-content/uploads/2021/03/Gilbert.jpg', 4),

('Mr. Wisdom Komlan Messan', 'Deputy Controller and Accountant-General (Audit & Investigations and Payroll Management)', 'DCAG',
'Mr. Wisdom Komlan Messan joined the Controller and Accountant-General''s Department 31+ years ago in 1989 and rose through the ranks to become Deputy Controller and Accountant-General (DCAG) in charge of Audit & Investigations. Since 2019, he has doubled as deputy controller overseeing both the Payroll Division and the Audit and Investigation Division, supervising over 250 staff. He holds an Executive Master of Business Administration Degree with a major in International Management from Swiss Business School, graduating with honors as the overall best student. He also holds a Post Graduate Certificate in Business Creation from Nobel International Business School. He is a Fellow member of the Chartered Association of Certified Accountants.',
NULL, 5),

('Mr. Jacob Yeboa', 'Deputy Controller and Accountant-General (ICT Management)', 'DCAG',
'As Deputy Controller Accountant General (ICTM), Mr. Jacob Yeboa is responsible for the management of all the CAGD''s Information and Communications Technology resources. He is an Oracle Certified Professional with over 20 years of ERP experience.',
NULL, 6),

('Mr. Sylvester Acquah', 'Acting Deputy Controller and Accountant-General (Payroll Management)', 'DCAG',
'Mr. Sylvester Acquah is a chartered accountant and a member of the Institute of Chartered Accountants (Ghana), with over twenty years of professional experience. Before being elevated to the position of Acting Deputy Controller and Accountant-General in charge of Payroll Management, Mr. Acquah was the Director of Administration of the Department. For about a decade, he was the Head of Accounts of the Ministry of Defence, and for about half a decade, he served as the Director in charge of Treasury at the Permanent Mission of Ghana to the United Nations.',
NULL, 7);

-- Update Regional Directors with full bios
UPDATE cagd_management_profiles SET
  bio = 'Mr. Patrick Peprah Appiagyei is a Chartered Accountant who joined the CAGD in 2000. He currently serves as the Regional Director of the Greater Accra Regional Directorate.',
  photo = 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/sample-img-team.jpg'
WHERE name = 'Mr. Patrick Peprah Appiagyei';

UPDATE cagd_management_profiles SET
  bio = 'Victoria Affum is the Ashanti Regional Director of the CAGD. She has 26+ years of public sector experience and is a KNUST degree holder. She is married and a devoted Christian.',
  photo = 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/ashanti-regional-director.jpg'
WHERE name = 'Victoria Affum';

UPDATE cagd_management_profiles SET
  bio = 'Kumah-Abrefa C.K. is a fifty-eight (58) year old Regional Director of the Ahafo Region with twenty-nine (29) years of experience.',
  photo = 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/ahafo-regional-profile.jpg'
WHERE name = 'Kumah-Abrefa C.K.';

UPDATE cagd_management_profiles SET
  bio = 'Mr. Richard A. Akolgo is a Chartered Accountant with 14 years post-qualification experience working at various institutions.',
  photo = 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/bono-east-region.jpg'
WHERE name = 'Mr. Richard A. Akolgo';

UPDATE cagd_management_profiles SET
  bio = 'Bennett Akantoa is the CAGD Regional Director for the Bono Region. He is a Chartered Accountant who started as a Departmental Accountant at the Ministry of Agriculture (1990-1991).',
  photo = 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/bono-regional-director.jpg'
WHERE name = 'Bennett Akantoa';

UPDATE cagd_management_profiles SET
  bio = 'Ignatius Kwame Otoo joined the Controller and Accountant-General''s Department some 28 years ago as an Accountant. He is a Takoradi Polytechnic alumnus.',
  photo = 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/central-regional-director.jpg'
WHERE name = 'Ignatius Kwame Otoo';

UPDATE cagd_management_profiles SET
  bio = 'Mustapha Ayornu is a product of the Institute of Professional Studies. He joined the Department in 1990 and was promoted to Assistant CAG in 2012.',
  photo = 'https://www.cagd.gov.gh/wp-content/uploads/2021/09/sample-img-team.jpg'
WHERE name = 'Mustapha Ayornu';

UPDATE cagd_management_profiles SET
  bio = 'Mrs. Genevieve T. Fuseini is a Chartered Accountant with 11 years post-qualification experience.'
WHERE name = 'Genevieve T. Fuseini';

UPDATE cagd_management_profiles SET
  bio = 'Seidu Yussif is a Chartered Accountant with 11 years post-qualification experience. He worked as a Metropolitan and District Finance Officer for 8 years.'
WHERE name = 'Seidu Yussif';

UPDATE cagd_management_profiles SET
  bio = 'Mr. Joseph Kweku Agyei has 25+ years of civil service experience and was formerly a Municipal Finance Officer.'
WHERE name = 'Mr. Joseph Kweku Agyei';

-- =============================================
-- UPDATE DIVISIONS with full descriptions
-- =============================================

UPDATE cagd_divisions SET
  description = 'This division provides the Human, Financial, Physical and Information resources for the Department by facilitating the development of structures, setting up systems and designing business processes. It leads, organizes, plans, formulates and controls the resources of the Controller and Accountant-General''s Department.',
  functions = '["Human Resource Management", "Financial management of the department", "Administration and logistics", "Policy Planning, Budgeting, Monitoring & Evaluation", "Risk Management", "Procurement & Contract Management", "Training & Development"]'
WHERE name ILIKE '%Finance and Administration%';

UPDATE cagd_divisions SET
  description = 'Ensures the control, measurement, analysis and classification of the financial flows of Government. Manages all treasury-related activities including regional treasury operations across Ghana''s 16 regions.',
  functions = '["Managing all treasury-related activities", "Controlling and analyzing financial flows of government", "Regional treasury operations (16 Regional Treasuries)", "Revenue management", "Public debt and investment management", "Fund disbursement for government projects"]'
WHERE name ILIKE '%Treasury%';

UPDATE cagd_divisions SET
  description = 'Responsible for development, implementation and review of policies and guidelines for processing Government of Ghana (GoG) payroll. Handles payment and accounting for salaries and pensions, and assignment of deduction codes for third party transactions.',
  functions = '["Payment and accounting for salaries and pensions", "Assignment of deduction codes for third party transactions", "Processing government payroll", "Payroll policy development and implementation", "Payroll validation and verification", "Managing active employee payroll", "Managing pension payroll"]'
WHERE name ILIKE '%Payroll%';

UPDATE cagd_divisions SET
  description = 'Responsible for facilitating the development and implementation of efficient/sound Financial Management systems for budget implementation, accounting and reporting on Public funds. Manages GIFMIS usage, standing imprest, loans and advances, and 3rd party deposits.',
  functions = '["Facilitation of GIFMIS usage by covered entities", "Management of standing imprest for covered entities", "Management of loans and advances granted to GoG staff", "Management of 3rd party deposits for payroll deduction codes", "Budget implementation support", "Accounting and reporting on public funds", "Financial monitoring at covered entities"]'
WHERE name ILIKE '%Financial Management%';

UPDATE cagd_divisions SET
  description = 'Responsible for the management of all the CAGD''s Information and Communications Technology resources. Provides an integrated IT environment that advances the core mission of the Department.',
  functions = '["Providing an integrated IT environment", "Ensuring provision, maintenance and upgrade of ICT resources", "Advising management on new developments in ICT", "Designing and implementing ICT disaster recovery plans", "Managing ICT infrastructure", "System administration and maintenance", "Application management and interfaces"]'
WHERE name ILIKE '%Information%' OR name ILIKE '%ICT%';

UPDATE cagd_divisions SET
  description = 'Responsible for appraisal and reporting on the soundness and application of systems of controls within the CAGD. Evaluates the effectiveness of risk management and governance processes, and provides assurance on efficiency, effectiveness and economy in administration.',
  functions = '["Appraisal and reporting on systems of controls", "Evaluation of risk management and governance", "Provision of assurance on efficiency and effectiveness", "Evaluation of compliance with policies and procedures", "Keeping CAGD informed about problems and deficiencies", "Prevention and detection of fraud, abuse and waste"]'
WHERE name ILIKE '%Audit%';

-- =============================================
-- ADD SITE SETTINGS (About content)
-- =============================================

INSERT INTO cagd_site_settings (setting_key, setting_value) VALUES
('mission', 'We exist to provide Public Financial Management Services to the Government and the general public through efficient, skilled, well-motivated and dedicated staff, using the most appropriate technology.'),
('vision', 'A public service with positive culture, client-focused and result oriented, constantly seeking ways to improve the delivery of Financial Management Services.'),
('history', 'The Controller and Accountant-General''s Department was established in 1885 during the pre-independence era of the Gold Coast. It was originally known as the "Treasury". In 1937, it was renamed the "Accountant-General''s Department". In 1967, it acquired its current designation: Controller and Accountant-General''s Department, reflecting expanded responsibilities in financial control and budget execution. The CAGD operates under the Civil Service Act, 1960 (CA. 5) and represents the Accounting Class of the Civil Service. It functions as a department within the Ministry of Finance.'),
('core_values', '["Putting Customers First - Addressing the needs and aspirations of Government and citizens", "Serving the Whole Country - Delivering services to customers with diverse interests", "Acting with Integrity - Demonstrating honesty, openness, and transparency in duty execution", "Valuing People - Fostering a culture celebrating excellent service", "Continuous Improvements and Innovation - Enhancing customer satisfaction through ongoing development"]'),
('mandate', 'Per the Public Financial Management Act, 2016 (Act 921), the CAGD is responsible for: Receiving all public and trust monies payable into the Consolidated Fund; Maintaining and publishing monthly and annual financial statements on Ghana''s Consolidated Fund within three months of fiscal year end; Securing public and trust monies with Ministry of Finance and Bank of Ghana support; Processing government disbursements, including employee salaries and pension payments; Developing efficient accounting systems across government departments; Approving accounting instructions for departments; Managing bank accounts and value books; Providing accounting officers to covered entities.'),
('address', 'Ministries, Accra, Ghana'),
('postal_address', 'P.O. BOX M79, Ministries, Accra, Ghana'),
('digital_address', 'GA-110-7376'),
('phone', '0302-983507, 0302-298502, 0302-983499'),
('email', 'info@cagd.gov.gh'),
('working_hours', 'Monday - Friday: 8:00 AM - 5:00 PM')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- =============================================
-- ADD SERVICES TABLE AND DATA
-- =============================================

CREATE TABLE IF NOT EXISTS cagd_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  how_to_access TEXT,
  requirements TEXT[],
  category VARCHAR(100),
  icon VARCHAR(50),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cagd_services ENABLE ROW LEVEL SECURITY;

-- Create policy for public read
DROP POLICY IF EXISTS "Public can view services" ON cagd_services;
CREATE POLICY "Public can view services" ON cagd_services FOR SELECT USING (is_active = true);

-- Insert services
INSERT INTO cagd_services (name, description, how_to_access, requirements, category, display_order) VALUES
('Salary Payment Services', 'Processing and disbursement of monthly salaries, wages, and allowances to all Government of Ghana employees on the national payroll.', 'New employees are enrolled onto the payroll through their respective MDAs (Ministries, Departments, and Agencies). Employees must have a valid staff/employee ID number and Ghana Card details linked to the payroll system.', ARRAY['Valid Ghana Card', 'Employment letter/appointment letter', 'Bank account details', 'Staff ID/Employee Number'], 'Payroll', 1),

('E-Payslip Services', 'Online portal (gogepayservices.com) allowing government employees to view, download, and print their monthly payslips electronically.', 'Visit gogepayservices.com, click "Forgot Password" for first-time registration, enter Employee Number and Ghana Card number, verify via OTP sent to registered phone, create password and security question.', ARRAY['Employee Number (Staff ID)', 'Ghana Card Number', 'Valid email address', 'Active mobile phone number for OTP'], 'Payroll', 2),

('Mandate Form Generation', 'Allows employees to generate mandate numbers and PINs required for salary deductions, loan applications, and other financial transactions.', 'Log into GOG ePay Services portal, navigate to "Mandate" option on dashboard, generate mandate number and PIN.', ARRAY['Registered e-Payslip account', 'Active employment status'], 'Payroll', 3),

('Affordability Check Service', 'Enables employees and financial institutions to verify an employee''s loan eligibility based on salary, current deductions, and financial standing.', 'Through the e-Payslip portal dashboard. Banks can verify via CAGD system.', ARRAY['Active payslip account', 'Current salary information on file'], 'Payroll', 4),

('Third Party Remittance System (TPRS)', 'System allowing Third Party Institutions (TPIs) to directly deduct loan repayments, insurance premiums, welfare contributions, and credit union deductions from government employee salaries at source.', 'Through authorized Third Party Institutions (banks, insurance companies, credit unions) or via the e-Payslip portal for monitoring deductions.', ARRAY['Valid employee number', 'Mandate number and PIN', 'Authorization from employee'], 'Payroll', 5),

('Pension Gratuity Processing', 'Processing and payment of pension gratuity (lump sum) for retiring civil servants under CAP 30 and other pension schemes.', 'Submit pension application through your MDA and complete Pension Form 1.', ARRAY['Completed pension application form', 'Pension Form 1', 'Valid Ghana Card', 'Service records', 'Letter of retirement/discharge'], 'Pension', 6),

('Monthly Pension Payment', 'Processing and disbursement of monthly pension payments to retired government employees.', 'Automatic after pension gratuity processing is complete. Payments made to registered bank account.', ARRAY['Approved pension gratuity', 'Valid bank account', 'Pension Advice document', 'Pension ID Card'], 'Pension', 7),

('Pensioner Verification Service', 'Biometric and Ghana Card verification exercise for CAP 30 pensioners to maintain accurate pension records and ensure payments go to legitimate beneficiaries.', 'In-person at CAGD head office or regional offices, pension association offices, MMDAs finance offices. For pensioners abroad: through respective Ghana missions.', ARRAY['Ghana Card (front and back copy)', 'Pension Advice document', 'Pension Form 1 OR Pension ID Card', 'Life Certificate (for pensioners abroad)'], 'Pension', 8),

('Treasury Single Account (TSA) Management', 'Unified government banking structure for consolidating all government receipts and payments through Bank of Ghana accounts.', 'Through MDAs and covered entities via GIFMIS system.', ARRAY['Authorized government entity status', 'GIFMIS registration'], 'Treasury', 9),

('GIFMIS Services', 'Centralized electronic platform for budget preparation, execution, asset management, human resource, and payroll management across all government entities.', 'Through authorized MDA access via CAGD training and registration.', ARRAY['Government entity status', 'Authorized user credentials', 'Training completion'], 'Financial Management', 10),

('Public Accounts and Financial Reporting', 'Preparation, rendering, and publication of financial statements on the Consolidated Fund of Ghana (monthly and annually).', 'Published reports available on CAGD website. Annual reports submitted to Parliament.', ARRAY['Public access - no requirements'], 'Financial Management', 11),

('Ghana Card Details Update', 'Service for employees to update or link their Ghana Card details to the government payroll system.', 'Through e-Payslip portal or through HR/validators at respective MDAs.', ARRAY['Valid Ghana Card', 'Employee Number'], 'Payroll', 12),

('Wrongful Deduction Reporting', 'Service allowing employees to report and dispute incorrect or unauthorized deductions from their salaries.', 'Through e-Payslip portal or contact CAGD helpline.', ARRAY['Registered e-Payslip account', 'Evidence of incorrect deduction'], 'Payroll', 13);
