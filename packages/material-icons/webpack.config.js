import { exec } from 'node:child_process';
import copy from 'copy-webpack-plugin';
import path from 'node:path';

const build = bash => {
	bash.hooks.afterDone.tap('build', async () => {
		await exec('node .acode/build.js', (err, ok) => {
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
			path: path.resolve("./.acode", "build"),
			filename: '[name].js',
			chunkFilename: '[name].js',
			clean: true,
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
					test: /\.(svg|png)$/,
					loader: 'file-loader',
				},
			],
		},
		plugins: [
			{
				apply: build,
			},
		new copy({
			patterns: [
				{
					from: 'src/generated/icons.css',
					to: 'icons.css',
				},
				{
					from: 'src/file_icons.json',
					to: 'file_icons.json',
				},
				{
					from: 'src/folder_icons.json',
					to: 'folder_icons.json',
				},
			],
		}),
		],
	};
};

export default main;
