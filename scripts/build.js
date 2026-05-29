const { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const root = process.cwd();
const dist = join(root, 'dist');
const pages = join(root, 'src', 'pages');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(join(root, 'src'), dist, { recursive: true });

for (const entry of readdirSync(pages, { withFileTypes: true })) {
  if (entry.isDirectory()) {
    cpSync(join(pages, entry.name), join(dist, entry.name), { recursive: true });
  }
}

rmSync(join(dist, 'pages'), { recursive: true, force: true });
writeFileSync(join(dist, '.nojekyll'), '');
console.log('Built static site into dist/');
