import plugin from '../plugin.json';
import iconMap from './generated/icon-map.json';

const fs = acode.require('fs');
const Url = acode.require('Url');

let fileIcons = null;
try {
	fileIcons = acode.require('fileIcons');
} catch {
	// API (< 1012): stays inert
	fileIcons = null;
}

let registration;
let styleSheet;

const icons = {};
for (const [id, className] of Object.entries(iconMap)) {
	icons[id] = { className };
}

function mapsFromPack(files, folders) {
	const fileNames = {};
	const fileExtensions = {};
	const folderNames = {};
	const folderNamesExpanded = {};

	for (const entry of files) {
		for (const name of entry.file_name || []) {
			fileNames[name] = entry.name;
		}
		for (const ext of entry.file_extensions || []) {
			if (ext.startsWith('.')) fileNames[ext] = entry.name;
			else fileExtensions[ext.toLowerCase()] = entry.name;
		}
	}

	for (const entry of folders) {
		for (const name of entry.folder_name || []) {
			folderNames[name] = entry.name;
			// Expanded variant only when its asset exists; otherwise Acode
			// reuses the closed icon (no broken references).
			if (iconMap[`${entry.name}-open`]) {
				folderNamesExpanded[name] = `${entry.name}-open`;
			}
		}
	}

	// VS Code matches dotfiles by extension (`.env` -> `env`). Acode does
	// not, so mirror that here: `.X` resolves like extension `X`, unless a
	// filename mapping already covers it (exact or case-insensitive).
	const seenNames = new Set(Object.keys(fileNames).map(k => k.toLowerCase()));
	for (const [ext, icon] of Object.entries(fileExtensions)) {
		if (ext.includes('.') || ext.length < 2) continue;
		const dot = `.${ext}`;
		if (!fileNames[dot] && !seenNames.has(dot)) {
			fileNames[dot] = icon;
			seenNames.add(dot);
		}
	}

	return { fileNames, fileExtensions, folderNames, folderNamesExpanded };
}

acode.setPluginInit(plugin.id, async baseUrl => {
	if (!fileIcons?.register) {
		// Running on an older Acode build — skip pack registration
		return;
	}

	styleSheet = document.createElement('link');
	styleSheet.rel = 'stylesheet';
	styleSheet.href = Url.join(baseUrl, 'icons.css');
	document.head.append(styleSheet);

	const root = Url.join(PLUGIN_DIR, plugin.id);
	const files = await fs(Url.join(root, 'file_icons.json')).readFile('json');
	const folders = await fs(Url.join(root, 'folder_icons.json')).readFile(
		'json',
	);

	registration = fileIcons.register({
		id: plugin.id,
		name: 'Material Icons',
		icons,
		...mapsFromPack(files, folders),
		file: 'document',
		folder: 'folder',
		folderExpanded: 'folder-open',
		rootFolder: 'folder-root',
		rootFolderExpanded: 'folder-root-open',
	});
});

acode.setPluginUnmount(plugin.id, () => {
	registration?.dispose();
	registration = undefined;
	styleSheet?.remove();
	styleSheet = undefined;
});
