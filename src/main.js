// importing necessary files
import plugin from '../plugin.json';
import style from './file/style.scss';
import regex from './file/regex.js';

const Url = acode.require("Url");
const helpers = acode.require("helpers");
const app = acode.require('settings');

function get_type_file(filename) {
  const _type = Object.keys(regex).find((type) => regex[type].test(filename));
  
  if (_type) return _type;

  return Url.extname(filename).substring(1);
};

helpers.getIconForFile = (filename) => {
  const { getModeForPath } = ace.require('ace/ext/modelist');
  
  const type = get_type_file(filename);
  const { name } = getModeForPath(filename);

  const icon_mode = `file_type_${name}`;
  const icon_type = `file_type_${type}`;

  return `file file_type_default ${icon_mode} ${icon_type}`;
};

class icons {
  
  constructor() {
    this.isenable = true;
    if (!app.value[plugin.id]) {
      app.value[plugin.id] = {
        enable: this.isenable,
      };
      app.update(false);
    };
  };

  async init() {
    
  try {
     
   this.style = <style textContent={style}></style>;
   document.head.append(this.style);

  if (!this.settings.enable) return this.style.remove();
   
   } catch(err) {
     acode.alert("Error", err.mesage);
    };
   };
    
  get setting() {
   return {
    list: [{
     key: 'enable',
     text: 'Enable the icons',
     checkbox: this.settings.enable,
     info: `Remember if you enable plugin icons some icons may be missing!`,
   }],
   cb: (key, value) => {
     this.settings[key] = value;
     app.update();
     if (this.settings.enable) {
        document.head.append(this.style);
     } else {
       this.style.remove();
     };
    }
   }
 };
    
  get settings() {
    return app.value[plugin.id];
  };

  async destroy() {
    this.style.remove();
    delete app.value[plugin.id]
    app.update(false);
  };
};

if (window.acode) {
   
  acode.setPluginInit(plugin.id, (url) => {
    if (!url.endsWith('/')) return url += '/';
    new icons().url = url;
    new icons().init();
 }, new icons().setting);
 
  acode.setPluginUnmount(plugin.id, () => new icons().destroy());
  
};