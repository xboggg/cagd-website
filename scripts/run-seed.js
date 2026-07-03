/**
 * CAGD Database Seed Runner
 *
 * This script imports seed data into the Supabase database.
 * Usage: node scripts/run-seed.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://db.techtrendi.com';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_KEY or VITE_SUPABASE_ANON_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read the seed file
const seedFilePath = path.join(__dirname, '..', 'supabase', 'seed_data.sql');

async function clearExistingData() {
  console.log('Clearing existing data...');

  // Delete in reverse order of dependencies
  const tables = [
    'cagd_faq',
    'cagd_gallery_images',
    'cagd_gallery_albums',
    'cagd_events',
    'cagd_reports',
    'cagd_regional_offices',
    'cagd_projects',
    'cagd_divisions',
    'cagd_leadership',
    'cagd_news'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error && !error.message.includes('does not exist')) {
      console.log(`  Warning clearing ${table}: ${error.message}`);
    } else {
      console.log(`  Cleared ${table}`);
    }
  }
}

async function runSeed() {
  console.log('CAGD Database Seed Runner');
  console.log('=========================\n');
  console.log(`Database: ${supabaseUrl}`);
  console.log(`Seed file: ${seedFilePath}\n`);

  // First, clear existing data
  await clearExistingData();
  console.log('');

  // Read the SQL file
  const sqlContent = fs.readFileSync(seedFilePath, 'utf8');

  // Parse and execute INSERT statements
  const insertRegex = /INSERT INTO (\w+)\s*\(([^)]+)\)\s*VALUES\s*([\s\S]*?)(?=INSERT INTO|-- ====|$)/gi;
  let match;
  let totalInserts = 0;
  let successfulInserts = 0;

  while ((match = insertRegex.exec(sqlContent)) !== null) {
    const tableName = match[1];
    const columns = match[2].split(',').map(c => c.trim());
    const valuesBlock = match[3].trim();

    console.log(`Processing table: ${tableName}`);

    // Parse individual value rows
    const rows = parseValueRows(valuesBlock, columns);

    if (rows.length > 0) {
      // Insert in batches
      const batchSize = 50;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const { data, error } = await supabase.from(tableName).insert(batch);

        if (error) {
          console.log(`  Error inserting into ${tableName}: ${error.message}`);
        } else {
          successfulInserts += batch.length;
          console.log(`  Inserted ${batch.length} rows (${i + batch.length}/${rows.length})`);
        }
        totalInserts += batch.length;
      }
    }
  }

  console.log('\n=========================');
  console.log(`Total rows processed: ${totalInserts}`);
  console.log(`Successful inserts: ${successfulInserts}`);
  console.log('Seed completed!');
}

function parseValueRows(valuesBlock, columns) {
  const rows = [];

  // Remove trailing semicolon and commas
  let cleanBlock = valuesBlock.replace(/;\s*$/, '').trim();

  // Split by row patterns (each row starts with '(' )
  const rowPattern = /\(([^)]*(?:\([^)]*\)[^)]*)*)\)/g;
  let rowMatch;

  while ((rowMatch = rowPattern.exec(cleanBlock)) !== null) {
    const rowContent = rowMatch[1];
    const values = parseRowValues(rowContent);

    if (values.length === columns.length) {
      const row = {};
      columns.forEach((col, i) => {
        row[col] = values[i];
      });
      rows.push(row);
    }
  }

  return rows;
}

function parseRowValues(rowContent) {
  const values = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let depth = 0;

  for (let i = 0; i < rowContent.length; i++) {
    const char = rowContent[i];
    const nextChar = rowContent[i + 1];

    if (!inString && (char === "'" || char === '"')) {
      inString = true;
      stringChar = char;
      current += char;
    } else if (inString && char === stringChar) {
      if (nextChar === stringChar) {
        // Escaped quote
        current += char + nextChar;
        i++;
      } else {
        inString = false;
        current += char;
      }
    } else if (!inString && char === '(') {
      depth++;
      current += char;
    } else if (!inString && char === ')') {
      depth--;
      current += char;
    } else if (!inString && char === ',' && depth === 0) {
      values.push(parseValue(current.trim()));
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    values.push(parseValue(current.trim()));
  }

  return values;
}

function parseValue(value) {
  if (value === 'NULL' || value === 'null') {
    return null;
  }

  if (value === 'true') return true;
  if (value === 'false') return false;

  // Number
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return parseFloat(value);
  }

  // String (remove quotes)
  if ((value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))) {
    return value.slice(1, -1).replace(/''/g, "'").replace(/""/g, '"');
  }

  // ARRAY
  if (value.startsWith('ARRAY[')) {
    const arrayContent = value.slice(6, -1);
    return arrayContent.split(',').map(item => {
      const trimmed = item.trim();
      if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
        return trimmed.slice(1, -1);
      }
      return trimmed;
    });
  }

  return value;
}

// Run the seed
runSeed().catch(console.error);
