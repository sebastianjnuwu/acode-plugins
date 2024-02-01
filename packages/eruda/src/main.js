import plugin from '../plugin.json';
import eruda from 'eruda';
const app = acode.require('settings');

class Eruda {
  
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
    
   if (this.settings.enable) return eruda.init();
   
  };

   get setting() {
   return {
    list: [{
     key: 'enable',
     text: 'Eruda enable?',
     checkbox: this.settings.enable,
     info: `If this item is checked, "eruda" enabled`,
   }],
   cb: (key, value) => {
     this.settings[key] = value;
     app.update();
     if (this.settings.enable) {
       eruda.init();
     } else {
       eruda.destroy();
     }
    }
   }
 };
    
  get settings() {
    return app.value[plugin.id];
  };

  async destroy() {
     eruda.destroy();
     delete app.value[plugin.id]
     app.update(false);
  };

 };

if (window.acode) {
  
  acode.setPluginInit(plugin.id, () => new Eruda().init(), new Eruda().setting);
  
  acode.setPluginUnmount(plugin.id, () => new Eruda().destroy());
};