const { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const root = process.cwd();
const dist = join(root, 'dist');
const pages = join(root, 'src', 'pages');
const rootDeployArtifacts = ['index.html', 'assets', 'login', 'register', 'admin', '_redirects', '.nojekyll'];

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

for (const artifact of rootDeployArtifacts) {
  const target = join(root, artifact);
  rmSync(target, { recursive: true, force: true });
  cpSync(join(dist, artifact), target, { recursive: true });
}

console.log('Built static site into dist/ and refreshed root deploy files.');
