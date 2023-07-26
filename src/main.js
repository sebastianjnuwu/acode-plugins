// importing necessary files
import plugin from '../plugin.json';
import style from './styles/style.scss';

// main class
class icon {
	// function to start
	async init() {
		// eslint-disable-next-line no-undef
		this.style = tag('style', { textContent: style });
		// eslint-disable-next-line no-undef
		document.head.append(this.style);
	}

	// function to kill
	async destroy() {
		// removing applied style
		this.style.remove();
	}
}

// eslint-disable-next-line no-undef
if (window.acode) {
	// eslint-disable-next-line no-undef
	acode.setPluginInit(plugin.id, async (url, page, { cacheFileUrl, cacheFile }) => {
		if (!url.endsWith('/')) return (url += '/');

		// settings
		new icon().url = url;
		new icon().init(page, cacheFile, cacheFileUrl);
	});

	// eslint-disable-next-line no-undef
	acode.setPluginUnmount(plugin.id, () => new icon().destroy());
}
