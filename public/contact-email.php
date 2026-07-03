<?php
/**
 * Contact Form Email Notification
 *
 * Receives contact form data via POST and sends an email to info@cagd.gov.gh.
 * Uses PHP mail() which is natively supported on cPanel hosting.
 */

// CORS headers for the SPA
header('Access-Control-Allow-Origin: https://cagd.gov.gh');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Rate limiting: max 5 emails per IP per 10 minutes
$rateFile = sys_get_temp_dir() . '/cagd_contact_rate_' . md5($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$now = time();
$window = 600; // 10 minutes
$maxRequests = 5;

if (file_exists($rateFile)) {
    $rateData = json_decode(file_get_contents($rateFile), true);
    // Clean old entries
    $rateData = array_filter($rateData, function($ts) use ($now, $window) {
        return ($now - $ts) < $window;
    });
    if (count($rateData) >= $maxRequests) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many requests. Please try again later.']);
        exit;
    }
    $rateData[] = $now;
    file_put_contents($rateFile, json_encode(array_values($rateData)));
} else {
    file_put_contents($rateFile, json_encode([$now]));
}

// Parse input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Validate required fields
$name    = trim($input['name'] ?? '');
$email   = trim($input['email'] ?? '');
$phone   = trim($input['phone'] ?? '');
$subject = trim($input['subject'] ?? '');
$message = trim($input['message'] ?? '');

if (empty($name) || empty($email) || empty($subject) || empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Sanitize for email headers (prevent header injection)
$name    = str_replace(["\r", "\n"], '', $name);
$email   = str_replace(["\r", "\n"], '', $email);
$subject = str_replace(["\r", "\n"], '', $subject);

// Build email
$to = 'info@cagd.gov.gh';
$emailSubject = '[CAGD Website Contact] ' . $subject;

$body = "New contact form submission from cagd.gov.gh\n";
$body .= "============================================\n\n";
$body .= "Name:    " . $name . "\n";
$body .= "Email:   " . $email . "\n";
$body .= "Phone:   " . ($phone ?: 'Not provided') . "\n";
$body .= "Subject: " . $subject . "\n\n";
$body .= "Message:\n";
$body .= "--------\n";
$body .= $message . "\n";
$body .= "--------\n\n";
$body .= "Submitted: " . date('Y-m-d H:i:s T') . "\n";
$body .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

$headers  = "From: CAGD Website <noreply@cagd.gov.gh>\r\n";
$headers .= "Reply-To: " . $name . " <" . $email . ">\r\n";
$headers .= "X-Mailer: CAGD-Website-Contact-Form\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Send
$sent = mail($to, $emailSubject, $body, $headers);

if ($sent) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email']);
}
