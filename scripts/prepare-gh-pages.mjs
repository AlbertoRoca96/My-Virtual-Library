import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const basePath = process.env.GH_PAGES_BASE_PATH || '/My-Virtual-Bookshelf';
const normalizedBasePath = basePath.startsWith('/') ? basePath : `/${basePath}`;
const cleanBasePath = normalizedBasePath.endsWith('/') ? normalizedBasePath.slice(0, -1) : normalizedBasePath;
const textExtensions = new Set(['.html', '.js', '.css', '.json', '.txt']);

function rewriteContent(content) {
  return content
    .replaceAll('href="/', `href="${cleanBasePath}/`)
    .replaceAll('src="/', `src="${cleanBasePath}/`)
    .replaceAll('content="/', `content="${cleanBasePath}/`)
    .replaceAll("url(/", `url(${cleanBasePath}/`)
    .replaceAll("='/", `='${cleanBasePath}/`)
    .replaceAll("\"/_expo/", `\"${cleanBasePath}/_expo/`)
    .replaceAll("'/_expo/", `'${cleanBasePath}/_expo/`);
}

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!textExtensions.has(path.extname(entry.name))) {
      continue;
    }

    const original = fs.readFileSync(fullPath, 'utf8');
    const updated = rewriteContent(original);
    if (updated !== original) {
      fs.writeFileSync(fullPath, updated, 'utf8');
    }
  }
}

if (!fs.existsSync(distDir)) {
  throw new Error('dist directory not found. Run expo export first.');
}

walk(distDir);

const indexHtmlPath = path.join(distDir, 'index.html');
const notFoundHtmlPath = path.join(distDir, '404.html');
if (fs.existsSync(indexHtmlPath)) {
  fs.copyFileSync(indexHtmlPath, notFoundHtmlPath);
}

fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
console.log(`Prepared dist for GitHub Pages under ${cleanBasePath}`);
