var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var WebpackSynchronizableShellPlugin = require('webpack-synchronizable-shell-plugin');

module.exports = {
    entry: path.join(__dirname, 'src/app.ts'),
    output: {
        path: path.join(__dirname, 'www'),
        filename: 'game.js'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            pixi: path.join(__dirname, 'node_modules/phaser-ce/build/custom/pixi.js'),
            phaser: path.join(__dirname, 'node_modules/phaser-ce/build/custom/phaser-split.js'),
            p2: path.join(__dirname, 'node_modules/phaser-ce/build/custom/p2.js'),
            assets: path.join(__dirname, 'assets/')
        }
    },
    plugins: [
        new WebpackSynchronizableShellPlugin({
            onBuildStart: {
                scripts: [],
                blocking: true,
                parallel: false
            }
        }),
        new webpack.DefinePlugin({
            'DEBUG': true,
            'DEFAULT_GAME_WIDTH': 1024,
            'DEFAULT_GAME_HEIGHT': 768,
            'MAX_GAME_WIDTH': 1420,
            'MAX_GAME_HEIGHT': 960,
            'SCALE_MODE': JSON.stringify('USER_SCALE'),
            'GOOGLE_WEB_FONTS': JSON.stringify([
                'Barrio'
            ]),
            'SOUND_EXTENSIONS_PREFERENCE': JSON.stringify([
                'webm', 'ogg', 'm4a', 'mp3', 'aac', 'ac3', 'caf', 'flac', 'mp4', 'wav'
            ])
        }),
        new HtmlWebpackPlugin({
            title: 'DEV MODE: IFR Trainer',
            template: path.join(__dirname, 'templates/index.ejs')
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, 'www'),
        compress: true,
        port: 9000,
        inline: true,
        watchOptions: {
            aggregateTimeout: 300,
            poll: true,
            ignored: /node_modules/
        }
    },
    module: {
        rules: [
            { test: /\.ts$/, enforce: 'pre', loader: 'tslint-loader' },
            { test: /assets(\/|\\)/, loader: 'file-loader?name=assets/[hash].[ext]' },
            { test: /pixi\.js$/, loader: 'expose-loader?PIXI' },
            { test: /phaser-split\.js$/, loader: 'expose-loader?Phaser' },
            { test: /p2\.js$/, loader: 'expose-loader?p2' },
            { test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/' }
        ]
    },
    devtool: 'source-map'
};
