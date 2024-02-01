import plugin from '../plugin.json';
import style from './styles/style.scss';

const settings = acode.require('settings');
const { editor } = editorManager;
const name_theme = 'tokyo-night';

ace.define(`ace/theme/${name_theme}.css`, ['require', 'exports', 'module'], function (require, exports, module) {
  module.exports = style;
});

ace.define(`ace/theme/${name_theme}`, ['require', 'exports', 'module', `ace/theme/${name_theme}.css`, 'ace/lib/dom'], function (require, exports, module) {
  exports.isDark = true;
  exports.cssClass = `ace-${name_theme}`;
  exports.cssText = require(`./${name_theme}.css`);
  const dom = require('../lib/dom');
  dom.importCssString(exports.cssText, exports.cssClass, false);
});

class Editor {
  async init() {
    
    ace.require('ace/ext/themelist').themes.push({
      caption: name_theme.split('-').map(name => name[0].toUpperCase() + name.slice(1)).join(' '),
      theme: `ace/theme/${name_theme}`,
      isDark: true
    })
    
    if (settings.get('editorTheme') === name_theme) {
      editor.setTheme(`ace/theme/${name_theme}`);
    };
    
    settings.on('update', this.check);
    
  };

  async destroy() {
    settings.off('update', this.check);
    if (settings.get('editorTheme') === name_theme) {
      editor.setTheme('ace/theme/nord_dark');
      settings.update({ editorTheme: 'ace/theme/nord_dark' });
    };
  };

  check(value) {
    if (value === `ace/theme/${name_theme}`) {
      editor.setTheme(`ace/theme/${name_theme}`);
      settings.update({ editorTheme: name_theme });
    };
  };
 };

if (window.acode) {
  
  acode.setPluginInit(plugin.id, () => new Editor().init());
  
  acode.setPluginUnmount(plugin.id, () => new Editor().destroy());
  
};