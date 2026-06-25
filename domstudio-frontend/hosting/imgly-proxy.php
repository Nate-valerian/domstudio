<?php
// imgly-proxy.php — proxy for @imgly/background-removal CDN files
//
// DEPLOY: upload to public_html/ alongside your built SPA files.
// REQUIRES: .htaccess RewriteRule to route /imgly/* here (see hosting/.htaccess).
//
// What it does:
//   Browser requests /imgly/resources.json or /imgly/<hash>
//   → .htaccess routes to this script as ?file=resources.json or ?file=<hash>
//   → script fetches from staticimgly.com CDN
//   → returns file with Access-Control-Allow-Origin: * header
//   → iOS Safari is happy (same origin + CORS header)

$file = $_GET['file'] ?? '';

// Only allow: resources.json or hex hash filenames (SHA-256 style)
if (!preg_match('/^([a-f0-9]{32,64}|resources\.json)$/', $file)) {
    http_response_code(400);
    exit;
}

$base = 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/';
$url  = $base . $file;

$ctx = stream_context_create(['http' => [
    'method'  => 'GET',
    'timeout' => 60,
    'header'  => "User-Agent: DomStudio-Proxy/1.0\r\n",
]]);

$body = @file_get_contents($url, false, $ctx);

if ($body === false) {
    http_response_code(502);
    exit;
}

$contentType = 'application/octet-stream';
foreach ($http_response_header as $h) {
    if (stripos($h, 'content-type:') === 0) {
        $contentType = trim(substr($h, 13));
        break;
    }
}

header('Access-Control-Allow-Origin: *');
header('Content-Type: ' . $contentType);
header('Cache-Control: public, max-age=31536000, immutable');
echo $body;
