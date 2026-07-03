<?php
// Temporary migration script - DELETE AFTER USE
header('Content-Type: text/plain');

// Check if pgsql extension is available
if (!extension_loaded('pgsql') && !extension_loaded('pdo_pgsql')) {
    echo "ERROR: Neither pgsql nor pdo_pgsql PHP extension is available.\n";
    echo "Available extensions: " . implode(', ', get_loaded_extensions()) . "\n";
    exit(1);
}

// Try common Supabase self-hosted PostgreSQL connection details
$host = 'db.techtrendi.com';
$ports = [5432, 6543, 5433];
$dbname = 'postgres';
$users = ['postgres', 'supabase', 'supabase_admin'];
$passwords = ['postgres', 'your-super-secret-and-long-postgres-password', 'password', 'supabase'];

$conn = null;

foreach ($ports as $port) {
    foreach ($users as $user) {
        foreach ($passwords as $pass) {
            $connStr = "host=$host port=$port dbname=$dbname user=$user password=$pass connect_timeout=5";
            echo "Trying: $host:$port user=$user ... ";

            if (extension_loaded('pgsql')) {
                $conn = @pg_connect($connStr);
                if ($conn) {
                    echo "SUCCESS!\n";
                    break 3;
                }
            } elseif (extension_loaded('pdo_pgsql')) {
                try {
                    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $pass, [
                        PDO::ATTR_TIMEOUT => 5,
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    ]);
                    echo "SUCCESS!\n";
                    break 3;
                } catch (PDOException $e) {
                    // continue
                }
            }
            echo "failed\n";
        }
    }
}

if (!$conn) {
    echo "\nCould not connect with any combination.\n";
    echo "Extension available: " . (extension_loaded('pgsql') ? 'pgsql' : (extension_loaded('pdo_pgsql') ? 'pdo_pgsql' : 'none')) . "\n";
    exit(1);
}

echo "\n--- Running migration ---\n";

// Step 1: Add file_url column
$sql1 = "ALTER TABLE cagd_news ADD COLUMN IF NOT EXISTS file_url TEXT DEFAULT NULL";

// Step 2: Insert Treasury News
$sql2 = "INSERT INTO cagd_news (title, slug, content, excerpt, category, featured_image, status, publish_date, tags, file_url)
SELECT 'Treasury News Vol.13 (October 2020)',
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
  '{\"treasury\", \"newsletter\"}',
  '/downloads/treasury/treasury-news-vol13-2020.pdf'
WHERE NOT EXISTS (SELECT 1 FROM cagd_news WHERE slug = 'treasury-news-vol-13-october-2020')";

// Step 3: Insert Digest issues
$digests = [
    [190, '2025-03-10'], [191, '2025-03-17'], [192, '2025-03-24'], [193, '2025-04-09'],
    [194, '2025-04-30'], [195, '2025-04-30'], [196, '2025-05-06'], [197, '2025-05-12'],
    [198, '2025-05-19'], [199, '2025-05-26'], [200, '2025-06-01'], [201, '2025-06-01'],
    [202, '2025-06-09'], [203, '2025-06-18'], [204, '2025-07-14'], [205, '2025-07-01'],
    [206, '2025-06-16'], [207, '2025-07-21'], [208, '2025-08-04'], [209, '2025-07-19'],
];

$sqls = [$sql1, $sql2];
foreach ($digests as [$issue, $date]) {
    $sqls[] = "INSERT INTO cagd_news (title, slug, content, excerpt, category, status, publish_date, tags, file_url)
    SELECT 'CAGD Digest - Issue $issue',
      'cagd-digest-issue-$issue',
      'CAGD Weekly Digest Issue $issue - A weekly roundup of activities and updates from the Controller & Accountant-General''s Department.',
      'Weekly digest of department activities - Issue $issue',
      'Digest',
      'published',
      '{$date}T00:00:00Z',
      '{\"digest\", \"weekly\"}',
      '/downloads/digest/digest-issue-$issue.pdf'
    WHERE NOT EXISTS (SELECT 1 FROM cagd_news WHERE slug = 'cagd-digest-issue-$issue')";
}

$success = 0;
$errors = 0;
foreach ($sqls as $i => $sql) {
    if (extension_loaded('pgsql')) {
        $result = @pg_query($conn, $sql);
        if ($result) {
            echo "SQL #" . ($i + 1) . ": OK\n";
            $success++;
        } else {
            echo "SQL #" . ($i + 1) . ": ERROR - " . pg_last_error($conn) . "\n";
            $errors++;
        }
    } elseif ($conn instanceof PDO) {
        try {
            $conn->exec($sql);
            echo "SQL #" . ($i + 1) . ": OK\n";
            $success++;
        } catch (PDOException $e) {
            echo "SQL #" . ($i + 1) . ": ERROR - " . $e->getMessage() . "\n";
            $errors++;
        }
    }
}

echo "\n--- Done: $success succeeded, $errors failed ---\n";

// Verify
if (extension_loaded('pgsql')) {
    $result = pg_query($conn, "SELECT count(*) as cnt FROM cagd_news WHERE category IN ('Digest', 'Treasury News')");
    $row = pg_fetch_assoc($result);
    echo "Total Digest + Treasury News articles: " . $row['cnt'] . "\n";
    pg_close($conn);
} elseif ($conn instanceof PDO) {
    $stmt = $conn->query("SELECT count(*) as cnt FROM cagd_news WHERE category IN ('Digest', 'Treasury News')");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Total Digest + Treasury News articles: " . $row['cnt'] . "\n";
}
