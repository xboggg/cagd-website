<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://cagd.gov.gh');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Configuration ──────────────────────────────────────────────────
// JWT secret used by Supabase to sign tokens.
// To set: create /home/terrdnjk/.cagd_upload_secret containing ONLY the secret string.
// Retrieve from VPS: ssh root@38.242.195.0 "grep JWT_SECRET /opt/supabase/docker/.env"
$SECRET_FILE = '/home/terrdnjk/.cagd_upload_secret';
$JWT_SECRET = file_exists($SECRET_FILE) ? trim(file_get_contents($SECRET_FILE)) : '';

if (empty($JWT_SECRET)) {
    http_response_code(500);
    echo json_encode(['error' => 'Server misconfigured — JWT secret not set']);
    exit;
}

// ── Rate limiting (10 uploads/min per IP) ──────────────────────────
$rateLimitDir = sys_get_temp_dir() . '/cagd_upload_rate/';
if (!is_dir($rateLimitDir)) mkdir($rateLimitDir, 0700, true);
$ipHash = md5($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$rateLimitFile = $rateLimitDir . $ipHash . '.json';
$now = time();
$timestamps = [];
if (file_exists($rateLimitFile)) {
    $timestamps = json_decode(file_get_contents($rateLimitFile), true) ?: [];
    $timestamps = array_filter($timestamps, fn($t) => $t > ($now - 60));
}
if (count($timestamps) >= 10) {
    http_response_code(429);
    echo json_encode(['error' => 'Rate limit exceeded. Try again in a minute.']);
    exit;
}
$timestamps[] = $now;
file_put_contents($rateLimitFile, json_encode(array_values($timestamps)));

// ── JWT Authentication ─────────────────────────────────────────────
function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
}

function verify_supabase_jwt($token, $secret) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    [$header, $payload, $signature] = $parts;

    // Verify HMAC-SHA256 signature
    $expected = hash_hmac('sha256', "$header.$payload", $secret, true);
    $actual = base64url_decode($signature);
    if (!hash_equals($expected, $actual)) return false;

    // Decode and validate payload
    $claims = json_decode(base64url_decode($payload), true);
    if (!$claims) return false;

    // Check expiration
    if (isset($claims['exp']) && $claims['exp'] < time()) return false;

    // Must be an authenticated user (not anon)
    if (empty($claims['sub'])) return false;
    if (isset($claims['role']) && $claims['role'] === 'anon') return false;

    return $claims;
}

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Missing or invalid Authorization header']);
    exit;
}

$claims = verify_supabase_jwt($matches[1], $JWT_SECRET);
if (!$claims) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid or expired token']);
    exit;
}

// ── File upload validation ─────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

$file = $_FILES['file'];

// Size limit: 5 MB
if ($file['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large (max 5MB)']);
    exit;
}

// Extension whitelist
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$isPdf = ($ext === 'pdf');
$allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'];
if (!in_array($ext, $allowedExts)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file extension. Only jpg, jpeg, png, webp, gif, pdf allowed.']);
    exit;
}

// Server-side MIME detection (not client-provided)
$finfo = new finfo(FILEINFO_MIME_TYPE);
$detectedMime = $finfo->file($file['tmp_name']);
$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
if (!in_array($detectedMime, $allowedMimes)) {
    http_response_code(400);
    echo json_encode(['error' => 'File content does not match an allowed type.']);
    exit;
}

// Magic bytes validation
$header = file_get_contents($file['tmp_name'], false, null, 0, 12);
$validMagic = false;
if (substr($header, 0, 3) === "\xFF\xD8\xFF") $validMagic = true;               // JPEG
elseif (substr($header, 0, 4) === "\x89PNG") $validMagic = true;                 // PNG
elseif (substr($header, 0, 4) === "RIFF" && substr($header, 8, 4) === "WEBP") $validMagic = true; // WebP
elseif (substr($header, 0, 6) === "GIF87a" || substr($header, 0, 6) === "GIF89a") $validMagic = true; // GIF
elseif (substr($header, 0, 4) === "%PDF") $validMagic = true;                    // PDF

if (!$validMagic) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file (magic bytes mismatch).']);
    exit;
}

// Reject files containing PHP tags (images only — skip for PDF)
if (!$isPdf) {
    $contents = file_get_contents($file['tmp_name']);
    if (preg_match('/<\?php|<\?=/i', $contents)) {
        http_response_code(400);
        echo json_encode(['error' => 'File contains disallowed content.']);
        exit;
    }
}

// Folder whitelist
$allowedFolders = ['directors', 'staff', 'gallery', 'news', 'hero', 'events', 'reports'];
$folder = isset($_GET['folder']) ? preg_replace('/[^a-z0-9\-]/', '', strtolower($_GET['folder'])) : 'directors';
if (!in_array($folder, $allowedFolders)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid upload folder.']);
    exit;
}

$baseDir = dirname(__DIR__) . '/images/' . $folder . '/';
if (!is_dir($baseDir)) {
    mkdir($baseDir, 0755, true);
}

// Safe filename
$safeName = preg_replace('/[^a-z0-9\-]/', '-', strtolower(pathinfo($file['name'], PATHINFO_FILENAME)));
$safeName = preg_replace('/-+/', '-', trim($safeName, '-'));
$fileName = $safeName . '-' . time() . '.' . $ext;
$targetPath = $baseDir . $fileName;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    echo json_encode([
        'success' => true,
        'url' => '/images/' . $folder . '/' . $fileName,
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Upload failed']);
}
