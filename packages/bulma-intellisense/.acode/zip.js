import { readdirSync, readFileSync, statSync, createWriteStream } from 'node:fs';
import { join } from 'node:path';
import jszip from 'jszip';
const zip = new jszip();

const plugin = join('plugin.json');
const readme = join('readme.md');
const license = join('LICENSE');
const icon = join('icon.png');
const folder = join('build');
const file = join('plugin.zip');

zip.file('icon.png', readFileSync(icon));
zip.file('plugin.json', readFileSync(plugin));
zip.file('readme.md', readFileSync(readme));
zip.file('LICENSE', readFileSync(license));

loadFile('', folder);

zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
.pipe(createWriteStream(file));

function loadFile(root, folder) {
  const distFiles = readdirSync(folder);
  distFiles.forEach((file) => {

    const stat = statSync(join(folder, file));

    if (stat.isDirectory()) {
      zip.folder(file);
      loadFile(join(root, file), join(folder, file));
      return;
    }

    if (!/LICENSE.txt/.test(file)) {
      zip.file(join(root, file), readFileSync(join(folder, file)));
    }
  });
}