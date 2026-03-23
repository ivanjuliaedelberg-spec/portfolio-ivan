#!/usr/bin/env node
/**
 * One-time migration script.
 * Reads projects-data.js, copies WebP images to standardised paths,
 * and writes data/projects.json.
 *
 * Run from project root: npm run migrate
 */

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

// ── Load PROJECTS from projects-data.js via vm sandbox ──────────────────────
const jsSource = fs.readFileSync(path.join(__dirname, '../js/projects-data.js'), 'utf8');
// Wrap the source so the const/let/var PROJECTS is exposed via the sandbox getter
const wrappedSource = jsSource + '\ntypeof PROJECTS !== "undefined" && (sandbox_out.PROJECTS = PROJECTS);';
const sandbox  = { sandbox_out: {} };
vm.runInNewContext(wrappedSource, sandbox);
const PROJECTS = sandbox.sandbox_out.PROJECTS;

if (!PROJECTS) {
  console.error('ERROR: Could not parse PROJECTS from projects-data.js');
  process.exit(1);
}

// ── Category slug map ────────────────────────────────────────────────────────
const CATEGORY_SLUG = {
  'Music Video': 'music-videos',
  'Commercial':  'commercials',
  'Narrative':   'narrative',
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Resolve a stills path from projects-data.js (relative to projects/ dir)
 * to an absolute path on disk.
 */
function resolveStillPath(rawPath) {
  // paths in projects-data.js start with '../assets/...'
  const relative = rawPath.replace(/^\.\.\//, '');
  return path.join(__dirname, '..', relative);
}

// ── Main migration ───────────────────────────────────────────────────────────
const outputProjects = [];
const dataDir = path.join(__dirname, '../data');
ensureDir(dataDir);

for (const [id, project] of Object.entries(PROJECTS)) {
  console.log(`\nMigrating: ${id}`);

  const destDir = path.join(__dirname, '../assets/images', id);
  ensureDir(destDir);

  const newStills = [];

  project.stills.forEach((rawPath, i) => {
    const n        = i + 1;
    const hqSrc    = resolveStillPath(rawPath);
    const lqSrc    = hqSrc.replace('.webp', '-lq.webp');
    const hqDest   = path.join(destDir, `still-${n}.webp`);
    const lqDest   = path.join(destDir, `still-${n}-lq.webp`);

    if (!fs.existsSync(hqSrc)) {
      console.warn(`  WARN: HQ not found: ${hqSrc}`);
    } else {
      fs.copyFileSync(hqSrc, hqDest);
      console.log(`  ✓ still-${n}.webp`);
    }

    if (!fs.existsSync(lqSrc)) {
      console.warn(`  WARN: LQ not found: ${lqSrc}`);
    } else {
      fs.copyFileSync(lqSrc, lqDest);
      console.log(`  ✓ still-${n}-lq.webp`);
    }

    newStills.push(`/assets/images/${id}/still-${n}.webp`);
  });

  outputProjects.push({
    id,
    title:         project.title         || '',
    categoryLabel: project.categoryLabel || '',
    category:      CATEGORY_SLUG[project.categoryLabel] || 'music-videos',
    director:      project.director      || '',
    producer:      project.producer      || '',
    dop:           project.dop           || '',
    secdirector:   project.secdirector   || '',
    secdop:        project.secdop        || '',
    year:          project.year          || '',
    videoUrl:      project.videoUrl      || '',
    stills:        newStills,
  });
}

fs.writeFileSync(
  path.join(dataDir, 'projects.json'),
  JSON.stringify(outputProjects, null, 2),
  'utf8'
);

console.log(`\n✅ Migration complete. ${outputProjects.length} projects written to data/projects.json`);
