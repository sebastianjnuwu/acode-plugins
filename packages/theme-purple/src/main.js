import plugin from '../plugin.json';
const themes = acode.require('themes');
const ThemeBuilder = acode.require('themeBuilder');

class theme {
  
  async init() {
      
    const purple_dark = new ThemeBuilder('Acode Purple', 'dark', 'free');

    purple_dark.primaryColor = '#191D24';
    purple_dark.popupBackgroundColor = '#24292e';
    purple_dark.darkenedPrimaryColor = '#191D24';
    purple_dark.primaryTextColor = '#ffffff';
    purple_dark.secondaryColor = '#24292eff';
    purple_dark.secondaryTextColor = '#ffffff';
    purple_dark.activeColor = '#c306ffbb';
    purple_dark.activeIconColor = '#9313f6';
    purple_dark.linkTextColor = '#9313f6';
    purple_dark.errorTextColor = '#f97583';
    purple_dark.scrollbarColor = '#30363d';
    purple_dark.borderColor = '#30363d';
    purple_dark.popupBorderColor = '#30363d';
    purple_dark.borderRadius = '4px';
    purple_dark.popupBorderRadius = '4px';
    purple_dark.popupIconColor = '#ffffff';
    purple_dark.popupTextColor = '#ffffff';
    purple_dark.popupActiveColor = '#e6fa10';
    purple_dark.boxShadowColor = '#00000033';
    purple_dark.buttonActiveColor = '#9313f6';
    purple_dark.buttonBackgroundColor = '#9313f6';
    purple_dark.buttonTextColor = '#ffffff';

    themes.add(purple_dark);
    themes.apply(name);
        
  };
    
};

if (window.acode) {

  acode.setPluginInit(plugin.id, () => new theme().init());

  acode.setPluginUnmount(plugin.id, () => {});
 
};