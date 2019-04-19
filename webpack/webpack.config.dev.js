const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: [
        path.resolve(__dirname, '../src/draft/index.js')
    ],
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'renderer.bundle.js'
    },
    devServer: {  //这里配置webpack-dev-server
        publicPath: '../dist/'
        //这里还可以加入其它你需要的参数
    },
    module: {
        rules: [
            {
                test: /\.(jsx|js|mjs)$/,
                include: [
                    path.resolve(__dirname, '../src')
                ],
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        babelrc: false,
                        "presets": [
                            ["@babel/preset-env", {
                                "loose": true,
                            }],
                            "@babel/preset-react"
                        ],
                        plugins: [
                            // "react-hot-loader/babel",
                            ["import", {libraryName: "antd", style: "css"}],
                            ["@babel/plugin-proposal-class-properties", { "loose": true }]
                        ]
                    }
                }],
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: "css-loader"
                }),
            },
            {test: /\.(jpg|png|svg|pdf)$/, loader: 'file-loader'},
            {test: /\.svg$/, loader: 'svg-inline-loader'}
        ]
    },
    resolve: {
        extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx']
    },
    plugins: [
        new ExtractTextPlugin({
            filename: 'style.css',
            allChunks: true,
        })
        // new webpack.optimize.UglifyJsPlugin(),
        // new HtmlWebpackPlugin({template: '../dist/index.html'})
    ],
    externals: [
        (function() {
            const IGNORES = ['electron'];
            return function (context, request, callback) {
                if (IGNORES.indexOf(request) >= 0 ) {
                    return callback(null, `require('${request}')`);
                }
                return callback();
            }
        })()
    ]
}