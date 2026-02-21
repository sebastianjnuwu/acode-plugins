import plugin from '../plugin.json';
import { PurpleTheme } from './lib/theme.js';

if (window.acode) { 
  
  const Instance = new PurpleTheme();
  
  acode.setPluginInit(plugin.id, () => Instance.init());

  acode.setPluginUnmount(plugin.id, () => Instance.destroy());
 
};