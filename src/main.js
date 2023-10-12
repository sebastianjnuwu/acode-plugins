// importing necessary files
import plugin from "../plugin.json";
import fileIcons from "./fileIcons.json";

const Url = acode.require("Url");
const helpers = acode.require("helpers");
const app = acode.require("settings");

const fileIconStyles = fileIcons
  .map(({ name }) => {
    return `.file.file_type_${name}::before {
  display: inline-block;
  content: '';
  background-image: url(https://localhost/__cdvfile_files-external__/plugins/sebastianjnuwu.material.icons/icons/${name}.svg) !important;
  background-size: contain;
  background-repeat: no-repeat;
  height: 1em;
  width: 1em;
  }`;
  })
  .join("\n"); // string to be used as css styling

function get_type_file(filename) {
  let names = filename.split(".")
  names.shift()
  let extension = names.join(".") // get full extension, example: webpack.config.js -> config.js

  // finding an icon for file name by using find method two times, because sometimes fileExtensions icon is overriding fileNames icon, for example security.md fileName is getting overriden by .md
  // so finding in fileNames first, then fileExtensions
  const _nameIcon = fileIcons.find((currObj, i) => {
    // if current object from fileIcons array is having "fileNames" array, then check if it is having current filename in it
    if (currObj.fileNames) {
      if (currObj.fileNames.includes(filename.toLowerCase())) return currObj;
    }
  });
  if (_nameIcon) return _nameIcon.name;
  
  const _extIcon = fileIcons.find((currObj, i) => {
    // check if "fileExtensions" is having current file extension
    if (currObj.fileExtensions) {
      if (currObj.fileExtensions.includes(extension)) return currObj;
    }
  });
  if (_extIcon) return _extIcon.name;
  
  // nothing was found, just return extension
  return extension;
}

helpers.getIconForFile = (filename) => {
  const { getModeForPath } = ace.require("ace/ext/modelist");

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
    }
  }

  async init() {
    try {
      // replaced this.style to this.fileIconStyles, so we can add this.folderIconStyles in future
      this.fileIconStyles = <style textContent={fileIconStyles}></style>;
      document.head.append(this.fileIconStyles);

      // I dont understand why the below condition is removing style tag from the head, even when settings.enable is set to true
      // if (!this.settings.enable) return this.fileIconStyles.remove();
    } catch (err) {
      acode.alert("Error", err.mesage);
    }
  }

  get setting() {
    return {
      list: [
        {
          key: "enable",
          text: "Enable the icons",
          checkbox: this.settings.enable,
          info: `Remember if you enable plugin icons some icons may be missing!`,
        },
      ],
      cb: (key, value) => {
        this.settings[key] = value;
        app.update();
        if (this.settings.enable) {
          document.head.append(this.fileIconStyles);
        } else {
          this.fileIconStyles.remove();
        }
      },
    };
  }

  get settings() {
    return app.value[plugin.id];
  }

  async destroy() {
    this.fileIconStyles.remove();
    delete app.value[plugin.id];
    app.update(false);
  }
}

if (window.acode) {
  
  acode.setPluginInit(plugin.id, () => new icons().init(), new icons().setting);

  acode.setPluginUnmount(plugin.id, () => new icons().destroy());
}
