import plugin from '../plugin.json';
import icons from './file_icons.json';
import folder_icons from './folder_icons.json';

const Url = acode.require('Url');
const helpers = acode.require('helpers');

const icon_style = icons.map(({
  name }) => create_styles(`.file.file_type_${name}`, name)).join('\n');

const folder_icon_style = [

  create_styles(`.list.collapsible.hidden > div[data-type="root"] > .icon.folder`, 'folder-root'),

  create_styles(`.list.collapsible > div[data-type="root"] > .icon.folder`, 'folder-root-open'),

  create_styles(`.list.collapsible.hidden > div.tile[data-name][data-type="dir"] > .icon.folder`, 'folder'),

  create_styles(`.list.collapsible > div.tile[data-name][data-type="dir"] > .icon.folder`, 'folder-open'),

  create_styles(`#file-browser > ul > li.tile[type="dir"]  > .icon.folder`, 'folder'),

  create_styles(`#file-browser > ul > li.tile[type="directory"]  > .icon.folder`, 'folder'),

  folder_icons
  .map(({
    name, folder_name
  }) => {
    let css = folder_name.map(val => {

      return [

        create_styles(`#file-browser > ul > li.tile[type="directory"][name="${val}"] > .icon.folder`, name),

        create_styles(`#file-browser > ul > li.tile[type="dir"][name="${val}"] > .icon.folder`, name),

        create_styles(
          `.list.collapsible > div.tile[data-name="${val}"][data-type="dir"] > span.icon.folder`,
          `${name}-open`,
        ),

        create_styles(
          `.list.collapsible.hidden > div.tile[data-name="${val}"][data-type="dir"] > .icon.folder`, name),

      ].join('');
    });
    return css;
  })
  .join('\n'),
]
.flat()
.join('\n');

function create_styles(className, name) {
  return `${className}::before {
  display: inline-block;
  content: '' !important;
  background-image: url(${plugin.url + name}.svg) !important;
  background-size: contain;
  background-repeat: no-repeat;
  height: 1em;
  width: 1em;
  }`;
}

function get_type_file(filename) {
  let names = filename.split('.');
  names.shift();

  let extension = names.join('.');

  const _icon = icons.find((x, i) => {
    if (x.file_name) {
      if (x.file_name.includes(filename.toLowerCase())) return x;
    }
  });

  if (_icon) return _icon.name;

  const icon_ext = icons.find((x, i) => {
    if (x.file_extensions) {
      if (x.file_extensions.includes(extension)) return x;
    }
  });

  if (icon_ext) return icon_ext.name;

  return Url.extname(filename).substring(1);
}

helpers.getIconForFile = filename => {
  const {
    getModeForPath
  } = ace.require('ace/ext/modelist');

  const type = get_type_file(filename);
  const {
    name
  } = getModeForPath(filename);

  const icon_mode = `file_type_${name}`;
  const icon_type = `file_type_${type}`;

  return `file file_type_default ${icon_mode} ${icon_type}`;
};

class material {

  async init() {
    this.icon_style = <style textContent={icon_style}>
    </style>;

    this.folder_icon_style = <style textContent={folder_icon_style}>
    </style>;

    document.head.append(this.icon_style, this.folder_icon_style);
  };

  async destroy() {
    this.icon_style.remove();
    this.folder_icon_style.remove();
  };

};

if (window.acode) {
  acode.setPluginInit(plugin.id, () => new material().init());

  acode.setPluginUnmount(plugin.id, () => new material().destroy());
};