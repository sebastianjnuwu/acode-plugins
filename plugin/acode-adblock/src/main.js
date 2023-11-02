import plugin from '../plugin.json';
const app = acode.require('settings');
const helpers = acode.require('helpers');

class Advertising {
  
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

    helpers.hideAd(true);
    localStorage.setItem('acode_pro', 'true');
    window.IS_FREE_VERSION = false;
    
   if (!this.settings.enable) {
       helpers.hideAd(false);
       localStorage.setItem('acode_pro', 'false');
       window.IS_FREE_VERSION = true;
   };
  
  };

   get setting() {
   return {
    list: [{
     key: 'enable',
     text: 'Block the ads?',
     checkbox: this.settings.enable,
     info: `If this item is checked, "Acode Pro" will be unlocked`,
   }],
   cb: (key, value) => {
     this.settings[key] = value;
     app.update();
     if (this.settings.enable) {
       helpers.hideAd(true);
       localStorage.setItem('acode_pro', 'true');
       window.IS_FREE_VERSION = false;
     } else {
       helpers.hideAd(false);
      localStorage.setItem('acode_pro', 'false');
      window.IS_FREE_VERSION = true;
     }
    }
   }
 };
    
  get settings() {
    return app.value[plugin.id];
  };

  async destroy() {
     helpers.hideAd(false);
     localStorage.setItem('acode_pro', 'false');
     window.IS_FREE_VERSION = true;
     delete app.value[plugin.id]
     app.update(false);
  };

 };

if (window.acode) {
  
  acode.setPluginInit(plugin.id, (url) => {
  
  if (!url.endsWith('/')) return url += '/';
    
  new Advertising().url = url;
  new Advertising().init();
 
 }, new Advertising().setting);
  
  acode.setPluginUnmount(plugin.id, () => new Advertising().destroy());
};