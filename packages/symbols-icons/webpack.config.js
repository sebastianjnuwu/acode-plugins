import { exec } from 'node:child_process';
import copy from 'copy-webpack-plugin';
import { resolve } from 'node:path';

const main = (env, options) => {
	return {
		target: 'node',
		mode: options.mode,
		entry: { main: './src/main.js' },
		output: {
			path: resolve('./', 'build'),
			filename: '[name].js',
			chunkFilename: '[name].js',
		},
		resolve: {
        extensions: [".ts", ".js"]
    },
		module: {
			rules: [
				{
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
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader',
    },
				{
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
				{
					test: /\.(svg|png)$/,
					loader: 'file-loader',
				},
			],
		},
		plugins: [
			{
				apply: (bash) => {
	bash.hooks.afterDone.tap('bash', async () => {
		await exec('node .acode/zip.js');
	});
},
			},
			new copy({
				patterns: [
					{
						from: 'icons/files',
						to: 'icons',
					},
					{
						from: 'icons/folders',
						to: 'icons',
					}
				],
			}),
		],
	};
};

export default main;