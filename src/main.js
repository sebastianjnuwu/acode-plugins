import plugin from "../plugin.json";
import icons from "./fileIcons.json";
import folderIcons from "./folderIcons.json";

const Url = acode.require("Url");
const helpers = acode.require("helpers");

const icon_style = icons
  .map(({ name }) => {
    // using create_styles function to get a string which can be used as css text content
    return create_styles(`.file.file_type_${name}`, name);
  })
  .join("\n");

// if you feel like below array is not clean, then feel free to change it later
const folderIconStyles = [
  // below two items are for root folder icon in file tree view of sidebar
  // style for closed root folder
  create_styles(
    `.list.collapsible.hidden > div[data-type="root"] > .icon.folder`,
    "folder-root"
  ),
  // style for opened roor folder
  create_styles(
    `.list.collapsible > div[data-type="root"] > .icon.folder`,
    "folder-root-open"
  ),
  // below are icon styles for other folder names which are not present in our icons
  create_styles(
    `.list.collapsible.hidden > div.tile[data-name][data-type="dir"] > .icon.folder`,
    "folder"
  ),
  create_styles(
    `.list.collapsible > div.tile[data-name][data-type="dir"] > .icon.folder`,
    "folder-open"
  ),
  // below item is style for folder icon in fileBrowser
  create_styles(
    `#file-browser > ul > li.tile[type="dir"]  > .icon.folder`,
    "folder"
  ),
  // we do not have acces to some helper function like get_type_file to get fodler icon.
  // so need to iterate over each item in folderIcons and again loop over every possible folderName and set its styling
  folderIcons
    .map(({ name, folderNames }) => {
      let css = folderNames.map((val) => {
        // getting styles for opened folder, closed folder, and folder icon for fileBrowser
        return [
          create_styles(
            `#file-browser > ul > li.tile[type="dir"][name="${val}"] > .icon.folder`,
            name
          ),
          create_styles(
            `.list.collapsible > div.tile[data-name="${val}"][data-type="dir"] > span.icon.folder`,
            `${name}-open`
          ),
          create_styles(
            `.list.collapsible.hidden > div.tile[data-name="${val}"][data-type="dir"] > .icon.folder`,
            name
          ),
        ].join("");
      });
      return css;
    }).join("\n"),
]
  .flat()
  .join("\n");
// using flat method above to make sure array doesn't have any nested array, and then join method to turn it into a js string

// created one single function to use every whenever need css styles as string
// styling is same for every type of icon, we just needed different selectors
function create_styles(className, name) {
  return `${className}::before {
  display: inline-block;
  content: '' !important;
  background-image: url(${plugin.url + name}.svg) !important;
  background-size: contain;
  background-repeat: no-repeat;
  height: 1em;
  width: 1em;
  }
  `;
}

function get_type_file(filename) {
  let names = filename.split(".");
  names.shift();

  let extension = names.join(".");

  const _icon = icons.find((x, i) => {
    if (x.fileNames) {
      if (x.fileNames.includes(filename.toLowerCase())) return x;
    }
  });

  if (_icon) return _icon.name;

  const icon_ext = icons.find((x, i) => {
    if (x.fileExtensions) {
      if (x.fileExtensions.includes(extension)) return x;
    }
  });

  if (icon_ext) return icon_ext.name;

  // there was a bug in previous return statement here
  return Url.extname(filename).substring(1);
}

helpers.getIconForFile = (filename) => {
  const { getModeForPath } = ace.require("ace/ext/modelist");

  const type = get_type_file(filename);
  const { name } = getModeForPath(filename);

  const icon_mode = `file_type_${name}`;
  const icon_type = `file_type_${type}`;

  return `file file_type_default ${icon_mode} ${icon_type}`;
};

class material {
  async init() {
    this.icon_style = <style textContent={icon_style}></style>;
    // idk why i felt like using another style tag for folder styling. you may use folderIconStyles in this.icon_style also, do it if you'd like have a single variable holding styles for files and folder icons
    this.folder_icon_style = <style textContent={folderIconStyles}></style>;

    document.head.append(this.icon_style);
    document.head.append(this.folder_icon_style);
  }

  async destroy() {
    this.icon_style.remove();
    this.folder_icon_style.remove();
  }
}

if (window.acode) {
  acode.setPluginInit(plugin.id, () => new material().init());

  acode.setPluginUnmount(plugin.id, () => new material().destroy());
}
