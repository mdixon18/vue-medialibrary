const path = require('path');
const merge = require('webpack-merge');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const autoprefixer = require('autoprefixer');
const precss = require('precss');

module.exports = merge(require('./webpack.base'), {
    context: __dirname,

    entry: './src/index.js',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: {
            root: 'VueMediaLibrary',
            amd: 'vue-medialibrary',
            commonjs: 'vue-medialibrary'
        },
        libraryTarget: 'umd',
    },

    module: {
        loaders: [
            {
            test: /\.(scss|sass)$/,
            loader: ExtractTextPlugin.extract('style-loader', ['css-loader', 'postcss-loader', 'sass-loader'])}
        ]
    },

    externals: {
        vue: 'vue',
    },
});
