/**
 * Generates the icon assets for the fileIcons pack:
 *  - src/generated/icon-map.json : { "<iconId>": "mi mi-<class>" }
 *  - src/generated/icons.css      : single stylesheet with all SVGs as data-URIs
 *
 * Instead of ~800 individual SVG requests to Acode's local file server
 * (slow: the server throttles parallel requests), the pack ships ONE css
 * file and registers `className` icon definitions. Acode then resolves
 * icons synchronously without probing any image URL.
 *
 * SVGs with identical content share a single CSS class.
 * Run: `node scripts/gen-icon-assets.js` (also runs automatically as `prebuild`).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = path.join(root, 'icons');
const outDir = path.join(root, 'src', 'generated');

const files = JSON.parse(
	fs.readFileSync(path.join(root, 'src', 'file_icons.json'), 'utf8'),
);
const folders = JSON.parse(
	fs.readFileSync(path.join(root, 'src', 'folder_icons.json'), 'utf8'),
);

// Every icon id referenced by the pack (associations + defaults).
const referenced = new Set([
	'folder',
	'folder-open',
	'folder-root',
	'folder-root-open',
]);
for (const entry of files) referenced.add(entry.name);
for (const entry of folders) {
	referenced.add(entry.name);
	referenced.add(`${entry.name}-open`);
}

const missing = [...referenced].filter(
	id => !fs.existsSync(path.join(iconsDir, `${id}.svg`)),
);
if (missing.length) {
	console.error(`Missing SVGs for: ${missing.join(', ')}`);
	process.exit(1);
}

const encodeSvg = svg =>
	encodeURIComponent(svg.replace(/\r?\n/g, ' ').replace(/\s{2,}/g, ' ').trim());

// Group ids by identical SVG content so duplicates share one CSS class.
const byHash = new Map();
for (const id of [...referenced].sort()) {
	const svg = fs.readFileSync(path.join(iconsDir, `${id}.svg`), 'utf8');
	const hash = crypto.createHash('sha256').update(svg).digest('hex');
	if (!byHash.has(hash)) byHash.set(hash, { className: id, svg, ids: [] });
	byHash.get(hash).ids.push(id);
}

const iconMap = {};
const rules = [
	// Base box: keeps the icon centered and unsquishable in any row.
	'.mi { display: inline-flex; align-items: center; justify-content: center; flex: none; vertical-align: middle; }',
	// Container-level fix (no per-icon exceptions): Acode rows (.tile) are
	// `display: flex; align-items: center`, but some render paths replace the
	// whole lead class with icon(resource), dropping Acode's structural sizing.
	// This restores a uniform box + gap for every icon. Specificity (0,3,0)
	// beats Acode's base `.tile .icon` (0,2,0); the file-browser ID rule keeps
	// winning there (24px, same as the builtin pack) while the gap still applies.
	'.tile > .mi:first-child { display: inline-flex; align-items: center; justify-content: center; flex: none; width: 1em; height: 1em; margin-right: .25em; font-size: 1em; }',
];
for (const { className, svg, ids } of byHash.values()) {
	const uri = `data:image/svg+xml,${encodeSvg(svg)}`;
	rules.push(
		`.mi.mi-${className}::before{content:'';display:block;width:1em;height:1em;background:url("${uri}") no-repeat center/contain;}`,
	);
	for (const id of ids) iconMap[id] = `icon mi mi-${className}`;
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
	path.join(outDir, 'icon-map.json'),
	`${JSON.stringify(iconMap, null, 1)}\n`,
);
fs.writeFileSync(path.join(outDir, 'icons.css'), `${rules.join('\n')}\n`);

const cssSize = fs.statSync(path.join(outDir, 'icons.css')).size;
console.log(
	`gen-icon-assets: ${Object.keys(iconMap).length} ids, ${byHash.size} unique SVGs, icons.css ${(cssSize / 1024).toFixed(0)} KB`,
);
