const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const required = [
  'dist/index.html',
  'dist/login/index.html',
  'dist/register/index.html',
  'dist/assets/styles.css',
  'dist/assets/app.js',
  'dist/assets/logo.svg'
];

const missing = required.filter((file) => !existsSync(join(process.cwd(), file)));
if (missing.length) {
  console.error(`Missing build files: ${missing.join(', ')}`);
  process.exit(1);
}

const pages = ['dist/index.html', 'dist/login/index.html', 'dist/register/index.html'];
for (const page of pages) {
  const html = readFileSync(join(process.cwd(), page), 'utf8');
  if (!html.includes('/assets/styles.css') || !html.includes('/assets/app.js')) {
    console.error(`${page} does not include the shared CSS and JS assets.`);
    process.exit(1);
  }
}

console.log('Static site checks passed.');
