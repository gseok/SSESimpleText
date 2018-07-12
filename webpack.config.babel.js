const path = require('path');
const webpack = require('webpack');

module.exports = [{
    mode: 'development',
    watch: true,
    entry: {
        'api.js': [
            'babel-polyfill',
            path.resolve(__dirname, 'api.js')
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'api-build-result.js',
    },
    devServer: {
        contentBase: path.join(__dirname),
        compress: true,
        open: 'http://localhost:4200',
        host: '0.0.0.0',
        port: 4200,
        disableHostCheck: true,
    },
    performance: {
        hints: false
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['env', 'stage-2']
                }
            }]
        }]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    devtool: 'source-map'
}];
