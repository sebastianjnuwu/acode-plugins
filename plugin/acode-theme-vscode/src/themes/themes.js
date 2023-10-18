// eslint-disable-next-line no-undef
const themes = acode.require('themes');
// eslint-disable-next-line no-undef
const ThemeBuilder = acode.require('themeBuilder');

export function theme_purple_dark(name) {
	const purple_dark = new ThemeBuilder(name, 'dark', 'free');

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

export function theme_dracula(name) {
	const dracula = new ThemeBuilder(name, 'dark', 'free');

	dracula.primaryColor = '#282a36';
	dracula.popupBackgroundColor = '#282a36';
	dracula.darkenedPrimaryColor = '#282a36';
	dracula.primaryTextColor = '#f8f8f2';
	dracula.secondaryColor = '#44475a';
	dracula.secondaryTextColor = '#f8f8f2';
	dracula.activeColor = '#ff79c6';
	dracula.activeIconColor = '#6d0fe9c6';
	dracula.linkTextColor = '#8be9fd';
	dracula.errorTextColor = '#ff5555';
	dracula.scrollbarColor = '#6272a4';
	dracula.borderColor = '#6272a4';
	dracula.popupBorderColor = '#6272a4';
	dracula.borderRadius = '3px';
	dracula.popupBorderRadius = '3px';
	dracula.popupIconColor = '#bd93f9';
	dracula.popupTextColor = '#f8f8f2';
	dracula.popupActiveColor = '#f5ff28';
	dracula.boxShadowColor = '#00000033';
	dracula.buttonActiveColor = '#6d0fe992';
	dracula.buttonBackgroundColor = '#6d0fe9c6';
	dracula.buttonTextColor = '#f8f8f2';

	themes.add(dracula);
	themes.apply(name);
};

export function theme_standard(name) {
	const standard = new ThemeBuilder(name, 'dark', 'free');

	standard.primaryColor = '#282c34';
	standard.popupBackgroundColor = '#2d313a';
	standard.darkenedPrimaryColor = '#1e2128';
	standard.primaryTextColor = '#ffff';
	standard.secondaryColor = '#21252b';
	standard.secondaryTextColor = '#fff';
	standard.activeColor = '#61afef';
	standard.activeIconColor = '#61afef';
	standard.linkTextColor = '#007ee5ad';
	standard.errorTextColor = '#e06c75';
	standard.scrollbarColor = '#ffff';
	standard.borderColor = '#007ee5ad';
	standard.popupBorderColor = '#007ee5ad';
	standard.borderRadius = '4px';
	standard.popupBorderRadius = '4px';
	standard.popupIconColor = '#007ee5ad';
	standard.popupTextColor = '#ffff';
	standard.popupActiveColor = '#f9ff24';
	standard.boxShadowColor = '#00000033';
	standard.buttonActiveColor = '#61afefae';
	standard.buttonBackgroundColor = '#61afef';
	standard.buttonTextColor = '#282c34';

	themes.add(standard);
	themes.apply(name);
};

export function theme_cobalt(name) {
	const cobalt = new ThemeBuilder(name, 'dark', 'free');

	cobalt.primaryColor = '#002240';
	cobalt.popupBackgroundColor = '#002240';
	cobalt.darkenedPrimaryColor = '#002240';
	cobalt.primaryTextColor = '#ffffff';
	cobalt.secondaryColor = '#003660';
	cobalt.secondaryTextColor = '#ffffff';
	cobalt.activeColor = '#ff9500';
	cobalt.activeIconColor = '#ff9500';
	cobalt.linkTextColor = '#1577ff';
	cobalt.errorTextColor = '#ff0000';
	cobalt.scrollbarColor = '#808080';
	cobalt.borderColor = '#003660';
	cobalt.popupBorderColor = '#003660';
	cobalt.borderRadius = '3px';
	cobalt.popupBorderRadius = '3px';
	cobalt.popupIconColor = '#ffffff';
	cobalt.popupTextColor = '#ffffff';
	cobalt.popupActiveColor = '#e6ff15';
	cobalt.boxShadowColor = '#00000033';
	cobalt.buttonActiveColor = '#ff9500aa';
	cobalt.buttonBackgroundColor = '#ff9500';
	cobalt.buttonTextColor = '#fff';

	themes.add(cobalt);
	themes.apply(name);
};

export function theme_night_owl(name) {
    const night_owl = new ThemeBuilder(name, 'dark', 'free');

    night_owl.primaryColor = '#011627';
    night_owl.popupBackgroundColor = '#1d3b53';
    night_owl.darkenedPrimaryColor = '#011627';
    night_owl.primaryTextColor = '#d6deeb';
    night_owl.secondaryColor = '#1d3b53d4';
    night_owl.secondaryTextColor = '#d6deeb';
    night_owl.activeColor = '#2c2aff';
    night_owl.activeIconColor = '#2c2aff';
    night_owl.linkTextColor = '#2c2affe0';
    night_owl.errorTextColor = '#ef5350'; 
    night_owl.scrollbarColor = '#5a7b8cff';
    night_owl.borderColor = '#5a7b8cff';
    night_owl.popupBorderColor = '#5a7b8cff';
    night_owl.borderRadius = '6px';
    night_owl.popupBorderRadius = '6px';
    night_owl.popupIconColor = '#d6deeb';
    night_owl.popupTextColor = '#d6deeb';
    night_owl.popupActiveColor = '#e6ff15';
    night_owl.boxShadowColor = '#00000033';
    night_owl.buttonActiveColor = '#0016eda3';
    night_owl.buttonBackgroundColor = '#0016ed';
    night_owl.buttonTextColor = '#d6deeb';

    themes.add(night_owl);
    themes.apply(name);
}; 