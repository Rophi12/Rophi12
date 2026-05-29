const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const required = [
  'dist/index.html',
  'dist/login/index.html',
  'dist/register/index.html',
  'dist/admin/index.html',
  'dist/.nojekyll',
  'dist/_redirects',
  'dist/assets/styles.css',
  'dist/assets/app.js',
  'dist/assets/logo.svg',
  'index.html',
  'login/index.html',
  'register/index.html',
  'admin/index.html',
  '.nojekyll',
  '_redirects',
  'assets/styles.css',
  'assets/app.js',
  'assets/logo.svg'
];

const missing = required.filter((file) => !existsSync(join(process.cwd(), file)));
if (missing.length) {
  console.error(`Missing build files: ${missing.join(', ')}`);
  process.exit(1);
}

const pages = ['dist/index.html', 'dist/login/index.html', 'dist/register/index.html', 'dist/admin/index.html', 'index.html', 'login/index.html', 'register/index.html', 'admin/index.html'];
for (const page of pages) {
  const html = readFileSync(join(process.cwd(), page), 'utf8');
  if (!html.includes('assets/styles.css') || !html.includes('assets/app.js')) {
    console.error(`${page} does not include the shared CSS and JS assets.`);
    process.exit(1);
  }
}

const linkExpectations = {
  'dist/index.html': ['login/index.html', 'register/index.html', 'admin/index.html'],
  'dist/login/index.html': ['../index.html', '../register/index.html'],
  'dist/register/index.html': ['../index.html', '../login/index.html'],
  'dist/admin/index.html': ['../index.html', '../login/index.html', '../register/index.html'],
  'index.html': ['login/index.html', 'register/index.html', 'admin/index.html'],
  'login/index.html': ['../index.html', '../register/index.html'],
  'register/index.html': ['../index.html', '../login/index.html'],
  'admin/index.html': ['../index.html', '../login/index.html', '../register/index.html']
};
for (const [page, links] of Object.entries(linkExpectations)) {
  const html = readFileSync(join(process.cwd(), page), 'utf8');
  for (const link of links) {
    if (!html.includes(`href="${link}"`)) {
      console.error(`${page} is missing a static-host-safe link to ${link}.`);
      process.exit(1);
    }
  }
}

const authPages = ['dist/login/index.html', 'dist/register/index.html', 'dist/admin/index.html', 'login/index.html', 'register/index.html', 'admin/index.html'];
for (const page of authPages) {
  const html = readFileSync(join(process.cwd(), page), 'utf8');
  if (html.includes('data-netlify')) {
    console.error(`${page} must not enable Netlify Forms for authentication flows.`);
    process.exit(1);
  }

  const netlifyPasswordForm = /<form[^>]*data-netlify[^>]*>[\s\S]*?<input[^>]*type=["']password["'][^>]*>/i.test(html);
  if (netlifyPasswordForm) {
    console.error(`${page} contains a Netlify form with password fields.`);
    process.exit(1);
  }
}


for (const redirectsFile of ['dist/_redirects', '_redirects']) {
  const redirects = readFileSync(join(process.cwd(), redirectsFile), 'utf8');
  for (const route of ['/login', '/register', '/admin', '/*']) {
    if (!redirects.includes(route)) {
      console.error(`${redirectsFile} is missing the Netlify route ${route}.`);
      process.exit(1);
    }
  }
}

for (const [builtFile, rootFile] of Object.entries({
  'dist/index.html': 'index.html',
  'dist/login/index.html': 'login/index.html',
  'dist/register/index.html': 'register/index.html',
  'dist/admin/index.html': 'admin/index.html',
  'dist/assets/app.js': 'assets/app.js',
  'dist/assets/styles.css': 'assets/styles.css',
  'dist/_redirects': '_redirects'
})) {
  if (readFileSync(join(process.cwd(), builtFile), 'utf8') !== readFileSync(join(process.cwd(), rootFile), 'utf8')) {
    console.error(`${rootFile} must match ${builtFile} so root-folder deploys open the same pages.`);
    process.exit(1);
  }
}

const app = readFileSync(join(process.cwd(), 'dist/assets/app.js'), 'utf8');
if (/ADMIN_PASSWORD\s*=/.test(app)) {
  console.error('Admin password must not be stored in plaintext in built assets.');
  process.exit(1);
}


for (const snippet of ['const loginUser = async', 'const registerUser = async', 'passwordHash: await digest']) {
  if (!app.includes(snippet)) {
    console.error(`Built app.js is missing working auth behavior: ${snippet}`);
    process.exit(1);
  }
}


console.log('Static site checks passed.');
