import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';

const SRC_DIR  = 'C:/Users/CYBERA~1/AppData/Local/Temp/cagd-images-opt';
const DEST_DIR = './public/images';

function getAllImages(dir, base = dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...getAllImages(full, base));
    } else {
      const ext = extname(entry).toLowerCase();
      if (['.webp', '.jpg', '.jpeg', '.png'].includes(ext)) {
        const rel = full.slice(base.length + 1).replace(/\\/g, '/');
        results.push({ src: full, rel });
      }
    }
  }
  return results;
}

const images = getAllImages(SRC_DIR);
console.log(`Found ${images.length} images\n`);

let totalBefore = 0, totalAfter = 0;

for (const { src, rel } of images) {
  const dest = join(DEST_DIR, rel);
  const before = statSync(src).size;
  totalBefore += before;
  const ext = extname(src).toLowerCase();
  const name = basename(src);

  try {
    let buffer;
    if (ext === '.webp') {
      buffer = await sharp(src).webp({ quality: 72 }).toBuffer();
    } else if (ext === '.jpg' || ext === '.jpeg') {
      buffer = await sharp(src).jpeg({ quality: 82, progressive: true }).toBuffer();
    } else if (ext === '.png') {
      if (before > 500 * 1024) {
        // Large PNGs → create small WebP alongside (keep PNG for DB compat)
        const webpDest = dest.replace(/\.png$/i, '.webp');
        const webpBuf = await sharp(src).webp({ quality: 80 }).toBuffer();
        writeFileSync(webpDest, webpBuf);
        console.log(`✓ ${name.padEnd(45)} ${(before/1024).toFixed(0)}KB → WebP ${(webpBuf.length/1024).toFixed(0)}KB (-${((before-webpBuf.length)/before*100).toFixed(0)}%)`);
        totalAfter += before;
        continue;
      }
      buffer = await sharp(src).png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
    }

    writeFileSync(dest, buffer);
    totalAfter += buffer.length;

    if (buffer.length < before) {
      console.log(`✓ ${name.padEnd(45)} ${(before/1024).toFixed(0)}KB → ${(buffer.length/1024).toFixed(0)}KB (-${((before-buffer.length)/before*100).toFixed(0)}%)`);
    } else {
      console.log(`= ${name.padEnd(45)} ${(before/1024).toFixed(0)}KB`);
      totalAfter += before - buffer.length; // adjust back
    }
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`);
    totalAfter += before;
  }
}

console.log(`\n──────────────────────────────────────`);
console.log(`Before: ${(totalBefore/1024/1024).toFixed(2)} MB`);
console.log(`After:  ${(totalAfter/1024/1024).toFixed(2)} MB`);
console.log(`Saved:  ${((totalBefore-totalAfter)/1024/1024).toFixed(2)} MB (${((totalBefore-totalAfter)/totalBefore*100).toFixed(0)}%)`);
