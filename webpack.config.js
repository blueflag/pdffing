const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = function() {
    const mode = process.env.RUN_LOCAL ? "development" : "production";
    const production = mode === 'production';

    const src = path.resolve('src');

    const JS_LOADER = {
        test: /\.(js|ts)$/,
        include: [src],
        use: {
            loader: 'babel-loader',
            options: {
                cacheDirectory: false
            }
        }
    };

    return {
        mode,
        cache: production,
        devtool: production ? 'source-map' : undefined,
        entry: {
            index: path.resolve(__dirname, './src/index.ts')
        },
        target: 'node',
        resolve: {
            alias: {
                ['pdffing/src']:  src
            },
            extensions: ['.mjs', '.js', '.ts']
        },
        output: {
            libraryTarget: 'commonjs2',
            path: path.resolve('dist'),
            filename: '[name].js'
        },
        plugins: [
            new CopyPlugin([
                {from: './version.json', to: '.'}
            ])
        ],
        module: {
            rules: [
                JS_LOADER
            ]
        },
        optimization: {
            minimize: false
        }
    };
}();
