import path from 'node:path';
import colors from 'colors';
import fs from 'node:fs';
import jszip from 'jszip';
const zip = new jszip();

const icon = path.join('./icon.png');
const plugin = path.join('./plugin.json');
const readme = path.join('./readme.md');
const license = path.join('./license');
const build = path.join('./build');

for (const file of [icon, plugin, readme, license, build]) {
  if (!file) {
    console.log(`The item "${file}" not found, it is required!`);
  };
}

zip.file('icon.png', fs.readFileSync(icon));
zip.file('plugin.json', fs.readFileSync(json));
zip.file('readme.md', fs.readFileSync(readme));
zip.file('LICENSE', fs.readFileSync(license));

loadFile('', folder);

zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true }).pipe(fs.createWriteStream(path.join('./plugin.zip'))).on('finish', () => console.log(colors.brightGreen('• ') + `Plugin successfully compiled for Acode.`));

function loadFile(root, folder) {
  const distFiles = fs.readdirSync(folder);
  distFiles.forEach((file) => {

    const stat = fs.statSync(path.join(folder, file));

    if (stat.isDirectory()) {
      zip.folder(file);
      loadFile(path.join(root, file), path.join(folder, file));
      return;
    }

    if (!/LICENSE.txt/.test(file)) {
      zip.file(path.join(root, file), fs.readFileSync(path.join(folder, file)));
    }
  });
};