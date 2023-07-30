import plugin from '../plugin.json';
import style from './styles/style.scss';
const settings = acode.require('settings');
const { editor } = editorManager;

const theme = ['Night-Owl'];

class Editor {
	
	async init() {
		theme.forEach(name => {
		
  ace.define(`ace/theme/${name}.css`, ['require', 'exports', 'module'], function (require, exports, module) {	module.exports = style });

	ace.define(`ace/theme/${name}`, ['require', 'exports', 'module', `ace/theme/${name}.css`, 'ace/lib/dom'], function (require, exports, module) {
     exports.isDark = true;
     exports.cssClass = `ace-${name}`;
     exports.cssText = require(`./${name}.css`);
     const dom = require('../lib/dom');
     dom.importCssString(exports.cssText, exports.cssClass, false);
  });
  
  window.require([`ace/theme/${name}`], function (m) {
   if (typeof module == 'object' && typeof exports == 'object' && module) { module.exports = m };
  });

  ace.require('ace/ext/themelist').themes.push({
    caption: name.split('-').map(x => x[0].toUpperCase() + x.slice(1)).join(' '),
    theme: 'ace/theme/' + name,
    isDark: true,
			});
			
  const current = settings.get('editorTheme');
	if (current === name) {
	  editor.setTheme("ace/theme/" + name);
	}
	
	 settings.on("update", this.onThemeChange);
	 
		});
	};
	
  onThemeChange(value) {
    const change = value.split("/").pop()
    if (theme.includes(change)) {
      editor.setTheme("ace/theme/" + change);
      settings.update({ editorTheme: change });
    }
  }
  
	async destroy() {
	  settings.off("update", this.onThemeChange)
	  editor.setTheme('ace/theme/nord_dark');
		settings.update({ editorTheme: 'nord_dark' });
	}
}

if (window.acode) {

	acode.setPluginInit(plugin.id, async (url, page, { cacheFileUrl, cacheFile }) => {
		if (!url.endsWith('/')) return (url += '/');
		new Editor().url = url;
		new Editor().init(page, cacheFile, cacheFileUrl);
	});

	acode.setPluginUnmount(plugin.id, () => new Editor().destroy());
};