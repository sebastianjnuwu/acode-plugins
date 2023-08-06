/* 
 to add a new icon with an extension it is necessary to send it to the "icons" folder and add it to the "$icons" variable in the "src/file/style.scss" file 
*/

const regex = {
  astro: /\.astro$/i,
  babel: /(^\.babelrc$)|(^babel\.config\.json$)|(^\.babelrc\.js$)|(^\.babelrc\.json$)/i,
  dependabot: /^(\.dependabot|dependabot\.yml)$/i,
  docker: /\.docker(file|ignore)$/i,
  eslint: /(^\.eslintrc(\.(json5|yaml|toml))?$|eslint\.config\.(js|json)$|\.eslintignore)/i,
  git: /(^\.gitignore$)|(^\.gitmodules$)|(^\.gitattributes)/i,
  jsconfig: /^jsconfig\.json$/i,
  image: /\.(png|jpg|jpeg|gif|bmp|ico|webp)$/i,
  jsx: /\.jsx$/i,
  license: /^(license|LICENSE|License)$/i,
  nix: /\.nix$/i,
  npm: /(^package\.json$)|(^package-lock\.json$)|(^\.npmrc$)/i,
  pandaconfig: /panda\.config\.(js|ts)$/i,
  pawn: /\.(pwn|amx)$/i,
  prettier: /(^\.prettierrc(\.(json5|yaml|toml))?$|prettier\.config\.(js|json)$)/i,
  postcssconfig: /(^\.postcssrc(\.(json5|yaml|toml))?$|postcss\.config\.(js|json)$)/i,
  readme: /^README\.(md|MD)$/i,
  renovate: /^renovate\.json$/i,
  replit: /^\.replit$/i,
  procfile: /^Procfile$/i, 
  robots: /^robots\.txt$/i,
  stan: /\.stan$/i,
  tsconfig: /^tsconfig(\.json|\.json5|\.yaml|\.yml)?$/i,
  tsx: /\.tsx$/i,
  webpack: /^webpack\.config\.js$/i,
  yarn: /^yarn\.lock$/i,
  yaml: /\.(yaml|yml)$/i,
};

export default regex;
