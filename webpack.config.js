import { exec } from 'node:child_process';
import postcss from './postcss.config.js'
import path from 'node:path';

const build = (bash) => {
 bash.hooks.afterDone.tap('build', () => {
  exec('node .acode/build.js', (err, ok) => {
    if (!err) return console.log(ok);
  });
 });
};

const main = (env, options) => {

  return {
    target: 'node',
    mode: options.mode || 'development',
    entry: { main: './src/main.js' },
    output: {
      path: path.resolve('./', 'dist'),
      filename: '[name].js',
      chunkFilename: '[name].js',
    },
    module: {
      rules: [{
        test: /\.m?js$/,
        use: [
          'html-tag-js/jsx/tag-loader.js',
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
      {
      test: /\.css$/,
      use: [{
          loader: 'postcss-loader',
          options: {
            postcssOptions: postcss,
          },
        },
      ],
    },
      
      ],
    },
    plugins: [
      {
        apply: build,
      }
    ],
  };
};

export default main;