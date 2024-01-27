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
			path: path.resolve('./', 'build'),
			filename: '[name].js',
			chunkFilename: '[name].js',
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
