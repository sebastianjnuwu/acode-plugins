import plugin from '../plugin.json';
import icons from './icons.json';

const Url = acode.require('Url');
const helpers = acode.require('helpers');

const icon_style = icons
	.map(({ name }) => {
		return `.file.file_type_${name}::before {
    display: inline-block;
    content: '';
    background-image: url(${plugin.url + name}.svg) !important;
    background-size: contain;
    background-repeat: no-repeat;
    height: 1em;
    width: 1em;
  }`;
	})
	.join('\n');

function get_type_file(filename) {
	let names = filename.split('.');
	names.shift();

	let extension = names.join('.');

	const _icon = icons.find((x, i) => {
		if (x.fileNames) {
			if (x.fileNames.includes(filename.toLowerCase())) return x;
		}
	});

	if (_icon) return _icon.name;

	const icon_ext = icons.find((x, i) => {
		if (x.fileExtensions) {
			if (x.fileExtensions.includes(extension)) return x;
		}
	});

	if (icon_ext) return icon_ext.name;

	return extension;
}

helpers.getIconForFile = filename => {
	const { getModeForPath } = ace.require('ace/ext/modelist');

	const type = get_type_file(filename);
	const { name } = getModeForPath(filename);

	const icon_mode = `file_type_${name}`;
	const icon_type = `file_type_${type}`;

	return `file file_type_default ${icon_mode} ${icon_type}`;
};

class material {

	async init() {
	  
		this.icon_style = <style textContent={icon_style}></style>;
		
		document.head.append(this.icon_style);

	};

	async destroy() {
		this.icon_style.remove();
	};
	
}

if (window.acode) {
	acode.setPluginInit(plugin.id, () => new material().init());

	acode.setPluginUnmount(plugin.id, () => new material().destroy());
}
