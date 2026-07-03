<?php
/**
 * Dynamic Open Graph Meta Tags for CAGD Website
 *
 * This script intercepts crawler/bot requests for event and news pages,
 * fetches the relevant data from Supabase, and serves HTML with proper
 * OG meta tags so that WhatsApp, Telegram, Twitter, Facebook etc.
 * show the correct title, description, and image in link previews.
 *
 * For normal browser requests, .htaccess routes them to index.html (SPA).
 * Only crawler user agents are routed here.
 */

// ── Configuration ──────────────────────────────────────────────
define('SUPABASE_URL', 'https://db.techtrendi.com');
define('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjQxNzY5MjAwLCJleHAiOjE3OTk1MzU2MDB9.lbPqMemEL_VFnCma2zeuJ1MfFLNQ7_VXRgaacXeeReQ');
define('SITE_URL', 'https://cagd.gov.gh');
define('DEFAULT_OG_IMAGE', 'https://cagd.gov.gh/images/og-image.jpg');
define('SITE_NAME', 'CAGD Ghana');
define('DEFAULT_TITLE', 'CAGD — Controller & Accountant-General\'s Department');
define('DEFAULT_DESC', 'Ghana\'s premier public financial management institution since 1885. Managing government finances across 703+ MDAs nationwide.');

// ── Parse the request URI ──────────────────────────────────────
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');

// Determine page type and ID/slug
$pageType = null;
$identifier = null;

if (preg_match('#^/events/([a-f0-9\-]+)$#i', $uri, $m)) {
    $pageType = 'event';
    $identifier = $m[1];
} elseif (preg_match('#^/news/([a-zA-Z0-9\-_]+)$#i', $uri, $m)) {
    $pageType = 'news';
    $identifier = $m[1];
}

// If not an event or news page, serve default OG tags
if (!$pageType || !$identifier) {
    renderPage(DEFAULT_TITLE, DEFAULT_DESC, DEFAULT_OG_IMAGE, SITE_URL . $uri);
    exit;
}

// ── Fetch data from Supabase ───────────────────────────────────
$data = null;

if ($pageType === 'event') {
    $data = supabaseGet('cagd_events', 'id', $identifier, 'id,title,description,venue,event_date,featured_image,images');
} elseif ($pageType === 'news') {
    $data = supabaseGet('cagd_news', 'slug', $identifier, 'id,title,excerpt,featured_image,publish_date,category');
}

// If no data found, fall back to defaults
if (!$data) {
    renderPage(DEFAULT_TITLE, DEFAULT_DESC, DEFAULT_OG_IMAGE, SITE_URL . $uri);
    exit;
}

// ── Build OG tags ──────────────────────────────────────────────
$title = '';
$description = '';
$image = DEFAULT_OG_IMAGE;
$url = SITE_URL . $uri;

if ($pageType === 'event') {
    $title = htmlspecialchars($data['title'] ?? 'Event', ENT_QUOTES, 'UTF-8');

    // Build description from event details
    $desc_parts = [];
    if (!empty($data['description'])) {
        $desc_parts[] = mb_substr(strip_tags($data['description']), 0, 200);
    }
    if (!empty($data['venue'])) {
        $desc_parts[] = 'Venue: ' . $data['venue'];
    }
    if (!empty($data['event_date'])) {
        $date = date('F j, Y', strtotime($data['event_date']));
        $desc_parts[] = 'Date: ' . $date;
    }
    $description = htmlspecialchars(implode(' | ', $desc_parts) ?: DEFAULT_DESC, ENT_QUOTES, 'UTF-8');

    // Get event image: prefer featured_image, then first image in images array
    if (!empty($data['featured_image'])) {
        $image = resolveImageUrl($data['featured_image']);
    } elseif (!empty($data['images'])) {
        $images = $data['images'];
        // images is stored as a Postgres array, returned as JSON string or array
        if (is_string($images)) {
            $images = json_decode($images, true);
        }
        if (is_array($images) && count($images) > 0) {
            $image = resolveImageUrl($images[0]);
        }
    }

} elseif ($pageType === 'news') {
    $title = htmlspecialchars($data['title'] ?? 'News', ENT_QUOTES, 'UTF-8');
    $description = htmlspecialchars(
        mb_substr(strip_tags($data['excerpt'] ?? ''), 0, 200) ?: DEFAULT_DESC,
        ENT_QUOTES, 'UTF-8'
    );

    if (!empty($data['featured_image'])) {
        $image = resolveImageUrl($data['featured_image']);
    }
}

renderPage($title . ' | ' . SITE_NAME, $description, $image, $url, $pageType);

// ── Functions ──────────────────────────────────────────────────

/**
 * Fetch a single row from a Supabase table.
 */
function supabaseGet(string $table, string $filterCol, string $filterVal, string $select): ?array {
    $url = SUPABASE_URL . '/rest/v1/' . $table
        . '?select=' . urlencode($select)
        . '&' . $filterCol . '=eq.' . urlencode($filterVal)
        . '&limit=1';

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . SUPABASE_ANON_KEY,
            'Authorization: Bearer ' . SUPABASE_ANON_KEY,
            'Content-Type: application/json',
        ],
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200 || !$response) {
        return null;
    }

    $rows = json_decode($response, true);
    if (!is_array($rows) || count($rows) === 0) {
        return null;
    }

    return $rows[0];
}

/**
 * Resolve an image path to a full URL.
 * For remote images (Supabase storage etc.), cache a local optimized copy
 * so WhatsApp/social crawlers can fetch quickly from the same domain.
 */
function resolveImageUrl(string $path): string {
    if (empty($path)) {
        return DEFAULT_OG_IMAGE;
    }
    if (str_starts_with($path, 'http')) {
        // Cache remote images locally for fast crawler access
        return cacheRemoteImage($path);
    }
    if (str_starts_with($path, '/')) {
        return SITE_URL . $path;
    }
    return SITE_URL . '/' . $path;
}

/**
 * Download a remote image, resize/compress it, and serve from local domain.
 * Returns the local URL. Falls back to remote URL on failure.
 */
function cacheRemoteImage(string $remoteUrl): string {
    $cacheDir = __DIR__ . '/images/og-cache';
    if (!is_dir($cacheDir)) {
        @mkdir($cacheDir, 0755, true);
    }

    $hash = md5($remoteUrl);
    $localFile = $cacheDir . '/' . $hash . '.jpg';
    $localUrl = SITE_URL . '/images/og-cache/' . $hash . '.jpg';

    // If cached file exists and is less than 24 hours old, use it
    if (file_exists($localFile) && (time() - filemtime($localFile)) < 86400) {
        return $localUrl;
    }

    // Download the remote image
    $imgData = @file_get_contents($remoteUrl, false, stream_context_create([
        'http' => ['timeout' => 5],
    ]));
    if (!$imgData) {
        return $remoteUrl; // fallback
    }

    $src = @imagecreatefromstring($imgData);
    if (!$src) {
        // Not a valid image or GD not available — save raw and return
        file_put_contents($localFile, $imgData);
        return $localUrl;
    }

    // Resize to 1200x630 (OG recommended)
    $dst = imagecreatetruecolor(1200, 630);
    $srcW = imagesx($src);
    $srcH = imagesy($src);

    // Crop-to-fill
    $srcRatio = $srcW / $srcH;
    $dstRatio = 1200 / 630;
    if ($srcRatio > $dstRatio) {
        $cropH = $srcH;
        $cropW = (int)($srcH * $dstRatio);
        $cropX = (int)(($srcW - $cropW) / 2);
        $cropY = 0;
    } else {
        $cropW = $srcW;
        $cropH = (int)($srcW / $dstRatio);
        $cropX = 0;
        $cropY = (int)(($srcH - $cropH) / 2);
    }

    imagecopyresampled($dst, $src, 0, 0, $cropX, $cropY, 1200, 630, $cropW, $cropH);
    imagejpeg($dst, $localFile, 85);
    imagedestroy($src);
    imagedestroy($dst);

    return $localUrl;
}

/**
 * Render minimal HTML page with OG meta tags.
 * Crawlers only read meta tags; they don't render the page.
 * We also include a JS redirect so if a real user somehow lands here,
 * they get sent to the SPA.
 */
function renderPage(string $title, string $description, string $image, string $url, string $type = 'website'): void {
    $ogType = ($type === 'news') ? 'article' : 'website';

    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: no-cache, no-store, must-revalidate');

    echo '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>' . $title . '</title>
<meta name="description" content="' . $description . '" />

<!-- Open Graph -->
<meta property="og:type" content="' . $ogType . '" />
<meta property="og:site_name" content="' . SITE_NAME . '" />
<meta property="og:title" content="' . $title . '" />
<meta property="og:description" content="' . $description . '" />
<meta property="og:image" content="' . htmlspecialchars($image, ENT_QUOTES, 'UTF-8') . '" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="' . htmlspecialchars($url, ENT_QUOTES, 'UTF-8') . '" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="' . $title . '" />
<meta name="twitter:description" content="' . $description . '" />
<meta name="twitter:image" content="' . htmlspecialchars($image, ENT_QUOTES, 'UTF-8') . '" />

<!-- Favicon -->
<link rel="icon" type="image/png" href="/favicon.png" />
</head>
<body>
<p>Redirecting...</p>
<script>window.location.replace(window.location.href);</script>
</body>
</html>';
}
