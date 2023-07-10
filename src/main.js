import plugin from '../plugin.json';
const themes = acode.require('themes');
const ThemeBuilder = acode.require('themeBuilder');

class theme {

  async init() {

  const theme = new ThemeBuilder('Theme Visual Studio', 'dark', 'free');

  theme.primaryColor = '#191D24';
  theme.popupBackgroundColor = '#24292e';
  theme.darkenedPrimaryColor = '#191D24';
  theme.primaryTextColor = '#ffffff';
  theme.secondaryColor = '#24292eff';
  theme.secondaryTextColor = '#ffffff';
  theme.activeColor = '#c306ffbb';
  theme.activeIconColor = '#9313f6';
  theme.linkTextColor = '#9313f6';
  theme.errorTextColor = '#f97583';
  theme.scrollbarColor = '#30363d';
  theme.borderColor = '#30363d';
  theme.popupBorderColor = '#30363d';
  theme.borderRadius = '6px';
  theme.popupBorderRadius = '6px';
  theme.popupIconColor = '#ffffff';
  theme.popupTextColor = '#ffffff';
  theme.popupActiveColor = '#e6fa10';
  theme.boxShadowColor = '#00000033';
  theme.buttonActiveColor = '#9313f6';
  theme.buttonBackgroundColor = '#9313f6';
  theme.buttonTextColor = '#ffffff';
   
  themes.add(theme);
  themes.apply("Theme Visual Studio");

 };

  async destroy() {};
  
}

if (window.acode) {
    const _theme = new theme();
    acode.setPluginInit(plugin.id, (baseUrl, $page, {
        cacheFileUrl, cacheFile
    }) => {
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }
        _theme.baseUrl = baseUrl;
        _theme.init($page, cacheFile, cacheFileUrl);
    });
    acode.setPluginUnmount(plugin.id, () => {
        _theme.destroy();
    });
}