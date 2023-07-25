import plugin from '../plugin.json';
import * as setup from './themes/themes.js';

class theme {

  async init() {

  setup.theme_purple_dark('Theme Visual Studio');
  
  setup.theme_dracula('Visual Studio Dracula');
  
  setup.theme_standard('Visual Studio Standard');
  
  setup.theme_cobalt('Visual Studio Cobalt');

 };

  async destroy() {};
  
}

if (window.acode) {
  
  const theme_ = new theme();
  acode.setPluginInit(plugin.id, async (url, page, { cacheFileUrl, cacheFile }) => {
 
  if (!url.endsWith('/')) return url += '/';
   
  theme_.url = url;
  await theme_.init(page, cacheFile, cacheFileUrl);

 });
  
  acode.setPluginUnmount(plugin.id, () => theme_.destroy());
  
}