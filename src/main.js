import plugin from '../plugin.json';
import * as setup from './themes/themes.js';

class theme {
  
	async init() {
	  
	 setup.theme_purple_dark('Theme Visual Studio');

	 setup.theme_dracula('Visual Studio Dracula');

	 setup.theme_standard('Visual Studio Standard');

 	 setup.theme_cobalt('Visual Studio Cobalt');
	
	 setup.theme_night_owl('Visual Studio Night Owl');
		
	};

	async destroy() {};
	
};

// eslint-disable-next-line no-undef
if (window.acode) {
	// eslint-disable-next-line no-undef
	acode.setPluginInit(plugin.id, async (url) => {
		if (!url.endsWith('/')) return (url += '/');
		
		new theme().url = url;
		new theme().init();
		
	});

	// eslint-disable-next-line no-undef
	acode.setPluginUnmount(plugin.id, () => new theme().destroy());
	
};