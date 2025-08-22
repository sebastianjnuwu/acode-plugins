import path from "node:path";
import colors from "colors";
import fs from "node:fs";
import jszip from "jszip";
import { performance } from "node:perf_hooks";

const zip = new jszip();

/**
 * Paths
 */
const ChangePath = path.join("./changelogs.md");
const iconPath = path.join("./icon.png");
const jsonPath = path.join("./plugin.json");
const buildFolder = path.join("./.acode/build");
const zipOutput = path.join("./.acode/plugin.zip");
let readmePath = path.join("./readme.md");

if (!fs.existsSync(readmePath)) {
  readmePath = path.join("./README.md");
}

/**
 * Adiciona arquivos essenciais ao ZIP.
 */
try {
  zip.file("changelogs.md", fs.readFileSync(ChangePath));
  zip.file("icon.png", fs.readFileSync(iconPath));
  zip.file("plugin.json", fs.readFileSync(jsonPath));
  zip.file("readme.md", fs.readFileSync(readmePath));
  console.log(colors.green("• Essential files added to the ZIP."));
} catch (err) {
  console.error(colors.red(`• Error adding essential files: ${err.message}`));
  process.exit(1);
}

/**
 * Lê arquivos do diretório build.
 */
async function loadFile(root, folder) {
  if (!fs.existsSync(folder)) {
    console.error(colors.red(`• Build folder does not exist: ${folder}`));
    process.exit(1);
  }

  try {
    const distFiles = fs.readdirSync(folder);
    console.log(colors.cyan(`• Reading files from folder: ${folder}`));

    for (const file of distFiles) {
      const filePath = path.join(folder, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        zip.folder(file);
        await loadFile(path.join(root, file), filePath);
        continue;
      }

      zip.file(path.join(root, file), fs.readFileSync(filePath));
      console.log(colors.green(`• File added: ${filePath} (${stat.size} bytes)`));
    }
  } catch (err) {
    console.error(colors.red(`• Error reading files: ${err.message}`));
    process.exit(1);
  }
}

/**
 * Gera o arquivo ZIP.
 */
(async () => {
  console.time("Total process time");
  const startTime = performance.now();

  try {
    console.log(colors.blue("• Starting to load files..."));
    await loadFile("", buildFolder);

    zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(fs.createWriteStream(zipOutput))
      .on("finish", () => {
        const endTime = performance.now();
        console.log(colors.brightGreen(`• ZIP file created at: ${zipOutput}`));
        console.log(colors.green(`• Total time: ${(endTime - startTime) / 1000} seconds.`));
        console.timeEnd("Total process time");
      })
      .on("error", (err) => {
        console.error(colors.red(`• Error writing ZIP: ${err.message}`));
      });
  } catch (err) {
    console.error(colors.red(`• Unexpected error: ${err.message}`));
    process.exit(1);
  }
})();
