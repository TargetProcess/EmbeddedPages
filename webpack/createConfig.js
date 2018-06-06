const path = require('path');

const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

const TargetprocessMashupPlugin = require('targetprocess-mashup-webpack-plugin');

const pkg = require('../package.json');

const createConfig = (options_) => {

    const options = Object.assign({
        mashupName: pkg.name,
        production: false,
        mashupManager: false
    }, options_);

    const mashupName = options.mashupName;

    const config = {
        context: path.resolve(__dirname, '../src'),
        entry: {
            index: [
                './index.js',
                // `!!targetprocess-mashup-webpack-plugin/config-loader?libraryTarget=${mashupName}&outputFile=./mashup.config.js!./config.json`
                '!!file?name=./mashup.config.js!./config.js'
            ].concat(options.mashupManager ? [] : [
                '!!targetprocess-mashup-webpack-plugin/manifest-loader!./manifest.json'
            ])
        }
    };

    config.output = {
        filename: '[name].js',
        path: 'build',
        chunkFilename: 'chunks/[id].[name].[hash].js',
        pathinfo: !options.production,
        jsonpFunction: `webpackJsonp_mashup_${mashupName.replace(/-/g, '_')}`
    };

    const localIdentName = options.production ? '[hash:base64]' : '[name]---[local]---[hash:base64:5]';

    config.module = {
        loaders: [{
            test: /\.js$/,
            loader: 'babel',
            exclude: /node_modules/
        }, {
            test: /\.css$/,
            loaders: [
                'style',
                `css?modules&importLoaders=1&localIdentName=${localIdentName}`,
                'postcss'
            ]
        }]
    };

    config.postcss = [autoprefixer];

    if (!options.production) {

        config.debug = true;
        config.devtool = 'eval-source-map';

    }

    config.plugins = [
        new TargetprocessMashupPlugin(mashupName, {
            useConfig: true,
            foldersToIgnore: options.mashupManager ? [] : ['chunks']
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        }),
        new webpack.BannerPlugin(`v${pkg.version} Build ${new Date().toUTCString()}`, {
            entryOnly: true
        })
    ];

    if (options.mashupManager) {

        config.plugins = config.plugins.concat(new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        }));

    }

    if (options.production) {

        config.plugins = config.plugins.concat(new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                properties: false
            },
            output: {
                keep_quoted_props: true,
            }
        }));

    }

    config.externals = [
        'jQuery',
        {jquery: 'jQuery'},
        'Underscore',
        {underscore: 'Underscore'},
        /^tp3\//,
        /^tau\//,
        /^tp\//
    ];

    return config;

};

module.exports = createConfig;
