/**
 * CAGD Image Downloader and WebP Converter
 *
 * This script downloads all images from the old CAGD website
 * and converts them to WebP format for the new site.
 *
 * Usage: node scripts/download-images.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic import for sharp
let sharp;
try {
  const sharpModule = await import('sharp');
  sharp = sharpModule.default;
} catch (e) {
  console.log('Sharp not installed. Install with: npm install sharp');
  console.log('Images will be downloaded but not converted to WebP.');
  sharp = null;
}

// Image URLs from CAGD website to download
const imageUrls = [
  // 2026 Images
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2026/02/CAGD-Ghana-Card-Update.png', filename: 'ghana-card-update-2026' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2026/02/Payroll-Upgrade.png', filename: 'payroll-upgrade-2026' },

  // 2024 Images
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2024/04/2-CAG-small-1024x729-1.jpg', filename: 'acting-cag-kwasi-agyei' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2024/01/IPPD-Payroll-Integration.png', filename: 'ippd-payroll-integration' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2024/02/Payroll-643x406-1.jpg', filename: 'nia-cagd-integration' },

  // 2023 Images
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2023/01/039-scaled.jpg', filename: 'thanksgiving-2022' },

  // 2022 Images
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2022/08/WhatsApp-Image-2022-08-30-at-9.08.09-AM-1.jpg', filename: 'gifmis-validation-2022' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2022/08/299480757_605899427563826_8366287148407192052_n.jpg', filename: 'ghost-workers-bust-2022' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2022/04/IMG_5027-scaled.jpg', filename: 'national-accounts-2022' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2022/07/2-scaled.jpg', filename: 'welfare-agm-2022' },

  // 2021 Images
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2021/11/RE-SAD-NEWS-FOR-GH-TEACHERS-scaled.jpg', filename: 'teachers-notice-2021' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2021/10/NIA-COMM-2.jpg', filename: 'nia-communication-2021' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2021/10/cagd-notice131021.jpg', filename: 'public-notice-2021' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2021/07/IMG-20210709-WA0004.jpg', filename: 'former-cag-funeral-2021' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2021/05/system-upgrade.jpg', filename: 'tprs-sensitization-2021' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2021/04/WhatsApp-Image-2021-04-14-at-11.46.22-AM.jpeg', filename: 'cds-courtesy-call-2021' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2021/04/IMG_5055-scaled.jpg', filename: 'national-accounts-2021' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2021/01/cagd-060121.png', filename: 'council-of-state-visit-2021' },

  // 2020 Images
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2020/12/WhatsApp-Image-2020-12-22-at-19.34.53-1.jpeg', filename: 'carols-service-2020' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2020/12/finance.jpg', filename: 'finance-generic' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2020/09/32-1.jpg', filename: 'conference-2020' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2020/08/esign-college-of-public-health-donates-to-cagd.jpg', filename: 'covid-donation-2020' },
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2020/08/controller-and-accountant-general-wins-prestigious-leadership-award.jpg', filename: 'leadership-award-2020' },

  // Logo and branding
  { url: 'https://www.cagd.gov.gh/wp-content/uploads/2020/01/cagd-logo.png', filename: 'cagd-logo' },
];

// Output directory
const outputDir = path.join(__dirname, '..', 'public', 'images', 'news');

// Ensure output directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Download a file
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        console.log(`  Redirecting to: ${redirectUrl}`);
        downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(destPath);
      });

      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {}); // Delete partial file
        reject(err);
      });
    });

    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Convert image to WebP
async function convertToWebP(inputPath, outputPath) {
  if (!sharp) {
    console.log('  Skipping WebP conversion (sharp not installed)');
    return inputPath;
  }

  try {
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);

    // Delete original file after successful conversion
    fs.unlinkSync(inputPath);

    return outputPath;
  } catch (error) {
    console.error(`  WebP conversion failed: ${error.message}`);
    return inputPath;
  }
}

// Main function
async function main() {
  console.log('CAGD Image Downloader and WebP Converter');
  console.log('=========================================\n');

  ensureDir(outputDir);

  let successCount = 0;
  let failCount = 0;

  for (const image of imageUrls) {
    const ext = path.extname(image.url).toLowerCase() || '.jpg';
    const tempPath = path.join(outputDir, `${image.filename}${ext}`);
    const webpPath = path.join(outputDir, `${image.filename}.webp`);

    console.log(`Processing: ${image.filename}`);
    console.log(`  URL: ${image.url}`);

    try {
      // Download the image
      await downloadFile(image.url, tempPath);
      console.log(`  Downloaded: ${tempPath}`);

      // Convert to WebP
      const finalPath = await convertToWebP(tempPath, webpPath);
      console.log(`  Converted: ${finalPath}`);

      successCount++;
    } catch (error) {
      console.error(`  Error: ${error.message}`);
      failCount++;
    }

    console.log('');
  }

  console.log('=========================================');
  console.log(`Completed: ${successCount} successful, ${failCount} failed`);
  console.log(`Images saved to: ${outputDir}`);
}

// Run the script
main().catch(console.error);
