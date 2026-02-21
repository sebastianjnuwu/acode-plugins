import path from "path";
import fs from "fs";
import { exec } from "child_process";

const outDir = path.resolve(".acode", "build");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const buildPlugin = (compiler) => {
  compiler.hooks.afterDone.tap("build", () => {
    exec("node .acode/build.js", (err, stdout, stderr) => {
      if (err) console.error(err);
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
    });
  });
};

export default (_, options) => ({
  target: "node",
  mode: options.mode || "production",
  entry: { main: "./src/main.js" },
  output: {
    path: outDir,
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: [
          "html-tag-js/jsx/tag-loader.js",
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
              plugins: ["@babel/plugin-transform-runtime"]
            }
          }
        ]
      }
    ]
  },
  plugins: [{ apply: buildPlugin }],
  stats: { all: false, errors: true, warnings: false }
});