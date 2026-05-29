const { cpSync, mkdirSync, rmSync } = require('node:fs');
const { join } = require('node:path');

const root = process.cwd();
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(join(root, 'src'), dist, { recursive: true });
cpSync(join(root, 'src', 'pages', 'login'), join(dist, 'login'), { recursive: true });
cpSync(join(root, 'src', 'pages', 'register'), join(dist, 'register'), { recursive: true });
rmSync(join(dist, 'pages'), { recursive: true, force: true });
console.log('Built static site into dist/');
